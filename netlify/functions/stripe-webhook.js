const { json, stripe, db, planForPrice, crypto } = require('./_billing');

function verify(event) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret?.startsWith('whsec_')) throw Error('Webhook secret missing');
  const signature = event.headers['stripe-signature'] || event.headers['Stripe-Signature'] || '';
  const timestamp = signature.match(/(?:^|,)t=(\d+)/)?.[1];
  const candidateSignatures = [...signature.matchAll(/(?:^|,)v1=([a-f0-9]+)/g)].map(match => match[1]);
  if (!timestamp || !candidateSignatures.length || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) {
    throw Error('Invalid webhook signature timestamp');
  }
  const body = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body || '';
  const expected = crypto.createHmac('sha256', secret).update(timestamp + '.' + body).digest('hex');
  const matched = candidateSignatures.some(value => value.length === expected.length && crypto.timingSafeEqual(Buffer.from(value), Buffer.from(expected)));
  if (!matched) throw Error('Invalid webhook signature');
  return JSON.parse(body);
}

function isoFromSeconds(seconds) {
  if (!Number.isFinite(Number(seconds)) || Number(seconds) <= 0) return null;
  return new Date(Number(seconds) * 1000).toISOString();
}

async function sync(sub) {
  const uid = sub.metadata?.user_id;
  if (!uid || !/^[-a-f0-9]{36}$/i.test(uid)) throw Error('Subscription missing validated user ID');
  const item = sub.items?.data?.[0];
  const plan = planForPrice(item?.price?.id);
  if (!plan) throw Error('Unrecognized Stripe price');

  // Stripe API versions may expose billing period fields on the subscription item
  // or on the subscription. Do not silently overwrite the DB with null periods.
  const periodStart = isoFromSeconds(item?.current_period_start ?? sub.current_period_start);
  const periodEnd = isoFromSeconds(item?.current_period_end ?? sub.current_period_end);
  if (!periodStart || !periodEnd) {
    console.error('Missing Stripe billing period', { subscriptionId: sub.id, hasStart: !!periodStart, hasEnd: !!periodEnd });
    throw Error('Stripe subscription missing current billing period; check API response and version');
  }
  if (new Date(periodStart) >= new Date(periodEnd)) throw Error('Invalid Stripe billing period');

  await db('pixelpilot_subscriptions?on_conflict=user_id', 'POST', {
    user_id: uid,
    stripe_customer_id: sub.customer,
    stripe_subscription_id: sub.id,
    plan,
    status: sub.status,
    current_period_start: periodStart,
    current_period_end: periodEnd,
    cancel_at_period_end: !!sub.cancel_at_period_end,
    updated_at: new Date().toISOString()
  });
}

exports.handler = async event => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  let e;
  try { e = verify(event); }
  catch (_) { return json(400, { error: 'Invalid Stripe signature' }); }
  try {
    if (e.type === 'checkout.session.completed' && e.data.object.subscription) {
      await sync(await stripe('subscriptions/' + e.data.object.subscription, {}, 'GET'));
    }
    if (['customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted'].includes(e.type)) {
      await sync(await stripe('subscriptions/' + e.data.object.id, {}, 'GET'));
    }
    return json(200, { received: true });
  } catch (err) {
    console.error('Stripe webhook', e.id, err.message);
    return json(500, { error: 'Webhook processing failed' });
  }
};

const {json,stripe,user,db,plans,origin}=require('./_billing');
exports.handler=async(event)=>{if(event.httpMethod!=='POST')return json(405,{error:'Method not allowed'});
try{const u=await user(event);if(!u)return json(401,{error:'Sign in before upgrading.'});const {plan}=JSON.parse(event.body||'{}');if(!Object.hasOwn(plans,plan)||!plans[plan])return json(400,{error:'Invalid subscription plan.'});
const existing=await db('pixelpilot_subscriptions?user_id=eq.'+encodeURIComponent(u.id)+'&select=stripe_customer_id,status&limit=1');
if(existing[0]&&['active','trialing','past_due'].includes(existing[0].status))return json(409,{error:'You already have a subscription. Use Manage Billing to change it.'});
const p={'mode':'subscription','line_items[0][price]':plans[plan],'line_items[0][quantity]':'1','success_url':origin+'/?checkout=success','cancel_url':origin+'/?checkout=cancel','client_reference_id':u.id,'metadata[user_id]':u.id,'subscription_data[metadata][user_id]':u.id,'allow_promotion_codes':'true'};
if(existing[0]?.stripe_customer_id)p.customer=existing[0].stripe_customer_id;else p.customer_email=u.email;
const session=await stripe('checkout/sessions',p);return json(200,{url:session.url});
}catch(e){console.error('Checkout',e.message);return json(503,{error:'Checkout is unavailable. Verify Stripe and Supabase server configuration.'});}};

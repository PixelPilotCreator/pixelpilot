const crypto=require('node:crypto');
const origin='https://pixelpilot2026.netlify.app';
const json=(statusCode,obj)=>({statusCode,headers:{'Content-Type':'application/json','Cache-Control':'no-store','Access-Control-Allow-Origin':origin},body:JSON.stringify(obj)});
async function stripe(path,params,method='POST'){
 if(!process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_'))throw Error('Sandbox Stripe secret key is missing');
 const r=await fetch('https://api.stripe.com/v1/'+path,{method,headers:{Authorization:'Bearer '+process.env.STRIPE_SECRET_KEY,...(method==='POST'?{'Content-Type':'application/x-www-form-urlencoded'}:{})},...(method==='POST'?{body:new URLSearchParams(params)}:{})});
 const j=await r.json();if(!r.ok)throw Error(j.error?.message||'Stripe request failed');return j;
}
async function user(event){const auth=event.headers.authorization||event.headers.Authorization||'';if(!auth.startsWith('Bearer '))return null;
 const token=auth.slice(7);if(token.length>4096)return null;const url=process.env.SUPABASE_URL,anon=process.env.SUPABASE_ANON_KEY;if(!url||!anon)return null;
 const r=await fetch(url.replace(/\/$/,'')+'/auth/v1/user',{headers:{apikey:anon,Authorization:'Bearer '+token}});if(!r.ok)return null;const u=await r.json();return typeof u.id==='string'?u:null;}
async function db(path,method='GET',body){const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)throw Error('Supabase service role is not configured');const r=await fetch(url.replace(/\/$/,'')+'/rest/v1/'+path,{method,headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',Prefer:method==='POST'?'resolution=merge-duplicates,return=representation':'return=representation'},...(body?{body:JSON.stringify(body)}:{})});if(!r.ok)throw Error('Subscription database request failed: '+r.status);return r.json();}
const plans={creator:process.env.STRIPE_PRICE_CREATOR,pro:process.env.STRIPE_PRICE_PRO,studio:process.env.STRIPE_PRICE_STUDIO};
const planForPrice=id=>Object.keys(plans).find(p=>plans[p]===id)||null;
module.exports={json,stripe,user,db,plans,planForPrice,origin,crypto};

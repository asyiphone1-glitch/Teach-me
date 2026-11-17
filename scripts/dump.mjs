import fs from 'node:fs'; import crypto from 'node:crypto';
const API_KEY='AIzaSyAkpMP6QkJZS67fOvVwP3yeuz-gMu1150Q';
const BASE='https://firestore.googleapis.com/v1/projects/teach-me-cd228/databases/(default)/documents/';
let TOKEN;
async function signInSA(sa){ const now=Math.floor(Date.now()/1000); const b=o=>Buffer.from(JSON.stringify(o)).toString('base64url');
  const head=b({alg:'RS256',typ:'JWT'}), body=b({iss:sa.client_email,scope:'https://www.googleapis.com/auth/datastore',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600});
  const sig=crypto.createSign('RSA-SHA256').update(head+'.'+body).sign(sa.private_key,'base64url');
  const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion='+head+'.'+body+'.'+sig});
  TOKEN=(await r.json()).access_token; }
if(process.env.FIREBASE_SA) await signInSA(JSON.parse(process.env.FIREBASE_SA));
if(!TOKEN){ const r=await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key='+API_KEY,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({returnSecureToken:true})}); TOKEN=(await r.json()).idToken; }
const H={authorization:'Bearer '+TOKEN};
fs.mkdirSync('out',{recursive:true});
for(const p of ['uploads/roni-hist1','uploads/hili-hist1','meta/examDates','meta/ended','meta/archived','meta/examNames']){
  const r=await fetch(BASE+p,{headers:H}); const d=await r.json();
  fs.writeFileSync('out/'+p.replace(/\//g,'_')+'.json', d.fields&&d.fields.j?d.fields.j.stringValue:JSON.stringify(d)); console.log(p,r.status);
}
/* push subscriptions: only who + count (no endpoints) */
const r=await fetch(BASE+'push?pageSize=300',{headers:H}); const j=await r.json();
fs.writeFileSync('out/push_who.json',JSON.stringify((j.documents||[]).map(d=>{try{return JSON.parse(d.fields.j.stringValue).who}catch(e){return null}})));
/* stats days ids last 10 days */
for(const pid of ['ziv','roni','hili','aviv']){ const r=await fetch(BASE+'stats/'+pid+'/days?pageSize=300&mask.fieldPaths=t',{headers:H}); const j=await r.json(); fs.writeFileSync('out/days_'+pid+'.json',JSON.stringify((j.documents||[]).map(d=>d.name.split('/').pop()))); }

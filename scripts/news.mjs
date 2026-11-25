// teach-me — 🔔 "יש לך חומר חדש!" (17.11.2026, אושר בישיבת צוות, עומר)
// כשנכנס חומר חדש לבחינה של ילדה — רק היא מקבלת התראה לטלפון (לא האחיות, לא ההורים).
// בודק: חומר שבתוך הקוד (TM_UP_BUILTIN ב-index.html) + חומר בענן (uploads/).
// זוכר מה כבר נשלח ב-meta/newsSent. בריצה הראשונה רק זוכר, לא שולח.
// לא שולח בין 21:00 ל-07:00 (שעון ישראל) — מחכה לבוקר. חומר ישן מ-3 ימים — רק נזכר, בלי התראה.
import webpush from 'web-push';
import { anonSignIn } from './auth.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';

const API_KEY='AIzaSyAkpMP6QkJZS67fOvVwP3yeuz-gMu1150Q';
const PROJECT='teach-me-cd228';
const VAPID_PUB='BAir7yGUBVlVC1zIl4vAuEKWfqRUzGUB85vECJYelmTey4F-zq8DifRc7Py_KSpz6fnOfD5MJfAG4bTe3u99pGU';
const VAPID_PRIV=(process.env.VAPID_PRIVATE||'').trim().replace(/^["']+|["']+$/g,'');
const APP='https://asyiphone1-glitch.github.io/Teach-me/';
const NM={aviv:'אביב',roni:'רוני',hili:'הילי',ziv:'זיו'};
const SUBJ={math:'חשבון',torah:'תורה',lit:'ספרות',eng:'אנגלית',heb:'עברית',hist:'היסטוריה',geo:'גיאוגרפיה',dict:'אנגלית'};
if(!VAPID_PRIV){ console.log('אין VAPID_PRIVATE'); process.exit(0); }
webpush.setVapidDetails(APP,VAPID_PUB,VAPID_PRIV);

const BASE='https://firestore.googleapis.com/v1/projects/'+PROJECT+'/databases/(default)/documents/';
let TOKEN=null;
async function signInSA(sa){
  const now=Math.floor(Date.now()/1000);
  const b=o=>Buffer.from(JSON.stringify(o)).toString('base64url');
  const head=b({alg:'RS256',typ:'JWT'}), body=b({iss:sa.client_email,scope:'https://www.googleapis.com/auth/datastore',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600});
  const sig=crypto.createSign('RSA-SHA256').update(head+'.'+body).sign(sa.private_key,'base64url');
  const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion='+head+'.'+body+'.'+sig});
  const j=await r.json(); if(!j.access_token) throw new Error('SA signIn failed'); TOKEN=j.access_token;
}
async function signIn(){
  if(process.env.FIREBASE_SA){ try{ await signInSA(JSON.parse(process.env.FIREBASE_SA)); return; }catch(e){ console.log('SA failed:',e.message); } }
  TOKEN=await anonSignIn(API_KEY,PROJECT);
}
const H=()=>({authorization:'Bearer '+TOKEN});
const val=d=>{ try{ return JSON.parse(d.fields.j.stringValue); }catch(e){ return null; } };
async function getDoc(path){ const r=await fetch(BASE+path,{headers:H()}); if(r.status===404) return undefined; const j=await r.json(); return val(j); }
async function putDoc(path,o){
  const r=await fetch(BASE+path,{method:'PATCH',headers:{...H(),'content-type':'application/json'},body:JSON.stringify({fields:{j:{stringValue:JSON.stringify(o)},t:{integerValue:String(Date.now())}}})});
  if(!r.ok) throw new Error('write '+path+' '+r.status);
}
async function listCol(path){
  const out=[]; let page='';
  do{ const r=await fetch(BASE+path+'?pageSize=300'+(page?'&pageToken='+page:''),{headers:H()}); const j=await r.json();
    (j.documents||[]).forEach(d=>out.push(val(d))); page=j.nextPageToken||''; }while(page);
  return out.filter(Boolean);
}
function builtin(){
  const out=[]; let src='';
  try{ src=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8'); }catch(e){ return out; }
  const pre='window.TM_UP_BUILTIN=(window.TM_UP_BUILTIN||[]).concat(';
  for(const line of src.split('\n')){
    const i=line.indexOf(pre); if(i<0) continue;
    let s=line.slice(i+pre.length).trim(); s=s.replace(/\);\s*$/,'');
    try{ JSON.parse(s).forEach(x=>out.push(x)); }catch(e){ console.log('builtin parse failed'); }
  }
  return out;
}
const hourIL=()=>+new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Jerusalem',hour:'2-digit',hour12:false}).format(new Date());

await signIn();
// 💝 חנות ההורים (24.11.2026, אושר): ילדה קנתה פרס → התראה לטלפון של ההורים (לא בין 21:00 ל-07:00). זוכר ב-meta/shopSent.
try{
  const reqs=(await listCol('shop')).filter(r=>r.kind==='req'&&r.st==='wait'&&NM[r.pid]);
  const ps=await getDoc('meta/shopSent'), ss=(ps&&ps.sent)||{};
  const nw=reqs.filter(r=>!ss[r.id]), h0=hourIL();
  if(nw.length&&h0>=7&&h0<21){
    const par=(await listCol('push')).filter(s=>s.sub&&s.sub.endpoint&&s.who==='parent');
    for(const r of nw){
      ss[r.id]=1;
      for(const s of par){
        try{ await webpush.sendNotification(s.sub,JSON.stringify({title:'💝 '+NM[r.pid]+' קנתה בחנות ההורים',body:((r.e||'')+' '+(r.n||'')).trim()+' · '+r.c+' 💎 — לאשר באפליקציה',url:APP,tag:'tm-shop-'+r.id})); }
        catch(e){ console.log('shop send error',e.statusCode||e.message); }
      }
    }
    await putDoc('meta/shopSent',{sent:ss});
    console.log('shop requests notified',nw.length);
  }
}catch(e){ console.log('shop check failed',e.message); }
const recs=new Map();
for(const r of [...await listCol('uploads'),...builtin()]){
  if(!r||!r.id||!NM[r.pid]||r.st!=='ready'||r.hide) continue;
  if(!r.mat||!(r.mat.topics||[]).length) continue;
  if(!recs.has(r.id)) recs.set(r.id,r);
}
const prev=await getDoc('meta/newsSent');
const sent=(prev&&prev.sent)||{};
if(prev===undefined){
  recs.forEach((r,id)=>sent[id]=1); await putDoc('meta/newsSent',{sent});
  console.log('first run — remembered',recs.size,'no messages'); process.exit(0);
}
const fresh=[...recs.values()].filter(r=>!sent[r.id]);
console.log('materials',recs.size,'new',fresh.length);
if(!fresh.length) process.exit(0);
const h=hourIL(); if(h<7||h>=21){ console.log('quiet hours',h,'— waiting'); process.exit(0); }

const subs=(await listCol('push')).filter(s=>s.sub&&s.sub.endpoint&&NM[s.who]);
let n=0;
for(const r of fresh){
  sent[r.id]=1;
  if(r.at&&Date.now()-r.at>3*864e5) continue;
  const sn=(r.newExam&&r.newExam.sn)||SUBJ[r.subj]||'';
  const title='📚 '+NM[r.pid]+', יש לך חומר חדש!';
  const body=(sn?'ב'+sn+': ':'')+((r.newExam&&r.newExam.title)||(r.mat&&r.mat.title)||'חומר לבחינה')+'. בואי נתחיל 💪';
  for(const s of subs.filter(s=>s.who===r.pid)){
    try{ await webpush.sendNotification(s.sub,JSON.stringify({title,body,url:APP,tag:'tm-news-'+r.id})); n++; }
    catch(e){ console.log('send error',e.statusCode||e.message); }
  }
}
await putDoc('meta/newsSent',{sent});
console.log('sent',n);

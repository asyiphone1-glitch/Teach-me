// teach-me — 📊 סיכום שבועי להורים (ישיבת צוות 17.11.2026 לילה, אושר, עומר)
// כל שישי ב-13:00 (שעון ישראל): התראה אחת רק לטלפונים של ההורים (who==='parent').
// כמה דקות כל ילדה למדה ב-7 הימים האחרונים + הבחינה הכי קרובה. לבנות לא נשלח.
// זמן לימוד = כמו ברבעים במסך הבית: סכום זמני התשובות, עד 90 שניות לשאלה.
// לא שולח פעמיים באותו יום (meta/weeklySent). FORCE=1 = שליחה עכשיו (לבדיקה ידנית).
import webpush from 'web-push';
import { anonSignIn } from './auth.mjs';
import crypto from 'node:crypto';

const API_KEY='AIzaSyAkpMP6QkJZS67fOvVwP3yeuz-gMu1150Q';
const PROJECT='teach-me-cd228';
const VAPID_PUB='BAir7yGUBVlVC1zIl4vAuEKWfqRUzGUB85vECJYelmTey4F-zq8DifRc7Py_KSpz6fnOfD5MJfAG4bTe3u99pGU';
const VAPID_PRIV=(process.env.VAPID_PRIVATE||'').trim().replace(/^["']+|["']+$/g,'');
const APP='https://asyiphone1-glitch.github.io/Teach-me/';
const KIDS=[['ziv','זיו'],['roni','רוני'],['hili','הילי'],['aviv','אביב']];
const NM=Object.fromEntries(KIDS);
const SUBJ={math:'חשבון',torah:'תורה',oral:'תושב״ע',lit:'ספרות',eng:'אנגלית',heb:'עברית',hist:'היסטוריה',geo:'גיאוגרפיה',dict:'הכתבה'};
const FORCE=process.env.FORCE==='1';
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
function israel(t=new Date()){
  const f=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jerusalem',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',weekday:'short',hour12:false});
  const p=Object.fromEntries(f.formatToParts(t).map(x=>[x.type,x.value]));
  return {day:p.year+'-'+p.month+'-'+p.day,hour:+p.hour%24,wd:p.weekday};
}
function addDays(day,n){ const d=new Date(day+'T12:00:00Z'); d.setUTCDate(d.getUTCDate()+n); return d.toISOString().slice(0,10); }
const minTxt=ms=>{ const m=Math.round(ms/60000); if(m<1) return ms>0?'פחות מדקה':'0 דק׳'; return m<60?m+' דק׳':(Math.floor(m/60)+' ש׳'+(m%60?' '+(m%60)+' דק׳':'')); };
const heDate=d=>{ const [y,m,dd]=d.split('-'); return (+dd)+'.'+(+m); };

const now=israel();
if(!FORCE&&!(now.wd==='Fri'&&(now.hour===13||now.hour===14))){ console.log('not Friday 13:00 in Israel',now); process.exit(0); }
await signIn();
const sentDoc=await getDoc('meta/weeklySent');
if(!FORCE&&sentDoc&&sentDoc.day===now.day){ console.log('already sent today'); process.exit(0); }

/* זמן לימוד — 7 ימים אחרונים (כולל היום) */
const from=addDays(now.day,-6), fromT=Date.now()-7*864e5;
const lines=[];
for(const [pid,name] of KIDS){
  const docs=(await listCol('stats/'+pid+'/days')).filter(d=>d&&d.day&&d.day>=from);
  const seen=new Set(); let ms=0;
  for(const d of docs) for(const e of (d.log||[])){
    const k=e.u||('L'+e.t+'-'+e.id); if(seen.has(k)) continue; seen.add(k);
    if(!e.t||e.t<fromT) continue; ms+=Math.min(e.ms||0,90000);
  }
  lines.push(name+' '+minTxt(ms));
}

/* הבחינה הכי קרובה (שלא הסתיימה ולא בארכיון) */
const dates=((await getDoc('meta/examDates'))||{}).dates||{};
const arch=((await getDoc('meta/archived'))||{}).arch||{};
const ended=((await getDoc('meta/ended'))||{}).ended||{};
const names=((await getDoc('meta/examNames'))||{}).map||{};
let next=null;
for(const [id,d] of Object.entries(dates)){
  if(!d||d<now.day||arch[id]===1||ended[id]) continue;
  const info=names[id]||{}; const pid=info.pid||id.replace(/^up-/,'').split('-')[0]; if(!NM[pid]) continue;
  const parts=id.replace(/^up-/,'').split('-'); if(/^up-(roni|hili|ziv)-torah1$/.test(id)) parts[1]='oral'; /* בחינות תושב״ע שנוספו לפני 25.11 */ const sn=info.n||SUBJ[parts[1]]||SUBJ[(parts[1]||'').replace(/\d+$/,'')]||'';
  if(!next||d<next.d) next={d,pid,sn};
}
const title='📊 השבוע ב-teach-me';
const body=lines.join(' · ')+'\n'+(next?'📅 הבחינה הקרובה: '+NM[next.pid]+(next.sn?' — '+next.sn:'')+' ב-'+heDate(next.d):'📅 אין בחינה קרובה ביומן');
/* 18.11.2026 (בדיקת אבטחה, אושר): המאגר ציבורי וה-log גלוי לכולם — לא מדפיסים את תוכן הסיכום */
console.log('summary ready,',lines.length,'lines');

const subs=(await listCol('push')).filter(s=>s.sub&&s.sub.endpoint&&s.who==='parent');
let n=0;
for(const s of subs){
  try{ await webpush.sendNotification(s.sub,JSON.stringify({title,body,url:APP,tag:'tm-weekly'})); n++; }
  catch(e){ console.log('send error',e.statusCode||e.message); }
}
if(!FORCE) await putDoc('meta/weeklySent',{day:now.day,n});
console.log('parents',subs.length,'sent',n);

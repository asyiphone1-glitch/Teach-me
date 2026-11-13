// teach-me — תזכורות לבחינות (10.11.2026)
// רץ ב-GitHub Actions: בבוקר (07:30) "בהצלחה היום", בערב (17:00) "מחר" ו"עוד יומיים".
// קורא מ-Firebase: meta/examDates, meta/archived, meta/examNames ואת כל המנויים ב-push/.
import webpush from 'web-push';

const API_KEY='AIzaSyAkpMP6QkJZS67fOvVwP3yeuz-gMu1150Q';
const PROJECT='teach-me-cd228';
const VAPID_PUB='BP2DfRuPoADshH2Pa1jkpdeTA0id0OvlMayYX1E7G5oDirf1hOK9jccPk7ttX0cQeiXWhYyNQU1ZcKcFlSo1hig';
const VAPID_PRIV=(process.env.VAPID_PRIVATE||'').trim().replace(/^["']+|["']+$/g,'');
const APP='https://asyiphone1-glitch.github.io/Teach-me/';
const NM={aviv:'אביב',roni:'רוני',hili:'הילי',ziv:'זיו'};
const SUBJ={math:'חשבון',torah:'תורה',lit:'ספרות',eng:'אנגלית',heb:'עברית',hist:'היסטוריה'};
if(!VAPID_PRIV){ console.log('אין VAPID_PRIVATE — צריך להוסיף אותו ב-Secrets של המאגר'); process.exit(0); }
webpush.setVapidDetails(APP,VAPID_PUB,VAPID_PRIV);

const BASE='https://firestore.googleapis.com/v1/projects/'+PROJECT+'/databases/(default)/documents/';
let TOKEN=null;
/* 11.11.2026 (אבטחה): אם יש מפתח שירות ב-Secrets (FIREBASE_SA) — נכנסים איתו.
   אחרת — כמו קודם, כניסה אנונימית. */
import crypto from 'node:crypto';
async function signInSA(sa){
  const now=Math.floor(Date.now()/1000);
  const b=o=>Buffer.from(JSON.stringify(o)).toString('base64url');
  const head=b({alg:'RS256',typ:'JWT'}), body=b({iss:sa.client_email,scope:'https://www.googleapis.com/auth/datastore',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600});
  const sig=crypto.createSign('RSA-SHA256').update(head+'.'+body).sign(sa.private_key,'base64url');
  const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion='+head+'.'+body+'.'+sig});
  const j=await r.json(); if(!j.access_token) throw new Error('SA signIn failed'); TOKEN=j.access_token;
}
async function signIn(){
  if(process.env.FIREBASE_SA){ try{ await signInSA(JSON.parse(process.env.FIREBASE_SA)); console.log('auth: service account'); return; }catch(e){ console.log('SA failed, falling back:',e.message); } }
  const r=await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key='+API_KEY,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({returnSecureToken:true})});
  const j=await r.json(); if(!j.idToken) throw new Error('signIn failed'); TOKEN=j.idToken; console.log('auth: anonymous');
}
const H=()=>({authorization:'Bearer '+TOKEN});
const val=d=>{ try{ return JSON.parse(d.fields.j.stringValue); }catch(e){ return null; } };
async function getDoc(path){ const r=await fetch(BASE+path,{headers:H()}); if(r.status===404) return null; const j=await r.json(); return val(j); }
async function listCol(path){
  const out=[]; let page='';
  do{ const r=await fetch(BASE+path+'?pageSize=300'+(page?'&pageToken='+page:''),{headers:H()}); const j=await r.json();
    (j.documents||[]).forEach(d=>out.push({name:d.name.split('/documents/')[1],v:val(d),t:+((d.fields&&d.fields.t&&(d.fields.t.integerValue||d.fields.t.doubleValue))||0),upd:Date.parse(d.updateTime||'')||0})); page=j.nextPageToken||''; }while(page);
  return out;
}

function israelNow(){
  const f=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jerusalem',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hour12:false});
  const p=Object.fromEntries(f.formatToParts(new Date()).map(x=>[x.type,x.value]));
  return {day:p.year+'-'+p.month+'-'+p.day,hour:+p.hour};
}
function addDays(day,n){ const d=new Date(day+'T12:00:00Z'); d.setUTCDate(d.getUTCDate()+n); return d.toISOString().slice(0,10); }

await signIn();
const {day,hour}=israelNow();
const mode=process.env.MODE||(hour<12?'morning':'evening');
const dates=((await getDoc('meta/examDates'))||{}).dates||{};
const arch=((await getDoc('meta/archived'))||{}).arch||{};
const names=((await getDoc('meta/examNames'))||{}).map||{};
const subs=(await listCol('push')).filter(s=>s.v&&s.v.sub&&s.v.sub.endpoint);
console.log('day',day,'mode',mode,'exams',Object.keys(dates).length,'subs',subs.length);

const msgs=[]; // {pid, title, body}
for(const [id,d] of Object.entries(dates)){
  if(!d||arch[id]===1) continue;
  const info=names[id]||{}; const pid=info.pid||id.replace(/^up-/,'').split('-')[0];
  if(!NM[pid]) continue;
  const parts=id.replace(/^up-/,'').split('-'); const sn=info.n||SUBJ[parts[1]]||SUBJ[(parts[1]||'').replace(/\d+$/,'')]||'';
  const what=sn?'בחינה ב'+sn:'בחינה';
  if(mode==='morning'&&d===day) msgs.push({pid,title:'🍀 בהצלחה '+NM[pid]+'!',body:'היום '+what+'. נושמות עמוק — את מוכנה!'});
  if(mode==='evening'&&d===addDays(day,1)) msgs.push({pid,title:'📚 מחר '+what,body:'עוד חזרה קטנה של 10 דקות?'});
  if(mode==='evening'&&d===addDays(day,2)) msgs.push({pid,title:'⏳ עוד יומיים '+what,body:'זה הזמן למבחן דמה 🎓'});
}
console.log('messages',msgs.length);
let sent=0, gone=0;
for(const s of subs){
  const who=s.v.who;
  const mine=who==='parent'?msgs.map(m=>({...m,title:NM[m.pid]+': '+m.title.replace(' '+NM[m.pid],'')})):msgs.filter(m=>m.pid===who);
  for(const m of mine){
    try{ await webpush.sendNotification(s.v.sub,JSON.stringify({title:m.title,body:m.body,url:APP,tag:'tm-'+m.pid+'-'+mode})); sent++; }
    catch(e){
      if(e.statusCode===404||e.statusCode===410){ gone++; await fetch(BASE+s.name,{method:'DELETE',headers:H()}).catch(()=>{}); break; }
      console.log('send error',e.statusCode||e.message);
    }
  }
}
console.log('sent',sent,'removed',gone);

/* 🧹 11.11.2026 (אבטחה, אושר): פעם ביום בבוקר — מוחקים מהענן צילומי מחברות, נוכחות ומכשירים
   שלא התעדכנו 30 יום. (תאריכי בחינות, תשובות ופודיום לא נמחקים.) */
if(mode==='morning'){
  const OLD=Date.now()-30*864e5; let del=0;
  for(const col of ['upimgs','presence','devices']){
    let L=[]; try{ L=await listCol(col); }catch(e){ console.log('list',col,'failed'); continue; }
    for(const d of L){ const at=d.t||d.upd; if(at&&at<OLD){ const r=await fetch(BASE+d.name,{method:'DELETE',headers:H()}).catch(()=>null); if(r&&r.ok) del++; } }
  }
  console.log('cleanup deleted',del);
}

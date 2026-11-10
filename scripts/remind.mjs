// teach-me — תזכורות לבחינות (10.11.2026)
// רץ ב-GitHub Actions: בבוקר (07:30) "בהצלחה היום", בערב (17:00) "מחר" ו"עוד יומיים".
// קורא מ-Firebase: meta/examDates, meta/archived, meta/examNames ואת כל המנויים ב-push/.
import webpush from 'web-push';

const API_KEY='AIzaSyAkpMP6QkJZS67fOvVwP3yeuz-gMu1150Q';
const PROJECT='teach-me-cd228';
const VAPID_PUB='BDNFkqbqJJVyrZhkyDFzoOGlOTDOo3f1fVQNhorq_d7wQkUpUzdMz_If7stfDjGYUDnQHNfnRofK_EW6bq4wWXg';
const VAPID_PRIV=process.env.VAPID_PRIVATE;
const APP='https://asyiphone1-glitch.github.io/Teach-me/';
const NM={aviv:'אביב',roni:'רוני',hili:'הילי',ziv:'זיו'};
const SUBJ={math:'חשבון',torah:'תורה',lit:'ספרות',eng:'אנגלית',heb:'עברית',hist:'היסטוריה'};
if(!VAPID_PRIV){ console.log('אין VAPID_PRIVATE — צריך להוסיף אותו ב-Secrets של המאגר'); process.exit(0); }
webpush.setVapidDetails(APP,VAPID_PUB,VAPID_PRIV);

const BASE='https://firestore.googleapis.com/v1/projects/'+PROJECT+'/databases/(default)/documents/';
let TOKEN=null;
async function signIn(){
  const r=await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key='+API_KEY,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({returnSecureToken:true})});
  const j=await r.json(); if(!j.idToken) throw new Error('signIn: '+JSON.stringify(j)); TOKEN=j.idToken;
}
const H=()=>({authorization:'Bearer '+TOKEN});
const val=d=>{ try{ return JSON.parse(d.fields.j.stringValue); }catch(e){ return null; } };
async function getDoc(path){ const r=await fetch(BASE+path,{headers:H()}); if(r.status===404) return null; const j=await r.json(); return val(j); }
async function listCol(path){
  const out=[]; let page='';
  do{ const r=await fetch(BASE+path+'?pageSize=300'+(page?'&pageToken='+page:''),{headers:H()}); const j=await r.json();
    (j.documents||[]).forEach(d=>out.push({name:d.name.split('/documents/')[1],v:val(d)})); page=j.nextPageToken||''; }while(page);
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

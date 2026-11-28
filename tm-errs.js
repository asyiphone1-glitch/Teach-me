/* ================================================================
   teach-me — 28.11.2026 (אושר ע״י ההורה): 📕 הטעויות של הבנות — אזור ההורים
   • לשונית לכל ילדה. הטעויות מסודרות לפי בחינה ונושא.
   • לכל שאלה: מה היא ענתה ❌, התשובה הנכונה ✅, כמה פעמים טעתה, והאם ענתה נכון אחר כך.
   • קודם קוראים בלבד (ההורה ביקש: "רק לצפות לפני ששולחים").
   • בנפרד, בסוף כל בחינה: "📌 לשלוח לה תרגול" — שאלה לאישור, ורק אז נשלח.
     נשלח כמשימה מההורה (pmis/<ילדה>, keys=[…]) — אצל הילדה: "📌 משימה מאבא ואמא".
   • אצל הבנות לא משתנה כלום. אין קריאות נוספות לענן (משתמש ב-TM_SMART.allLog).
   ================================================================ */
(function(){
  const $=id=>document.getElementById(id);
  const lg=k=>{ try{ return localStorage.getItem(k); }catch(e){ return null; } };
  const ls=(k,v)=>{ try{ localStorage.setItem(k,v); }catch(e){} };
  const E=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const KIDS=['ziv','roni','hili','aviv'];
  const COL={aviv:'#0B6F6B',roni:'#B8235A',hili:'#A34A0A',ziv:'#1F55B8'};
  const S=()=>window.TM_SMART||{};
  const NM=pid=>{ try{ return PROFILES[pid].name; }catch(e){ return pid; } };
  const dk=t=>{ const d=new Date(t||Date.now()); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };
  const tpShow=t=>String(t||'').replace(/^(תורה|הבעה|חשבון|עברית|תושב״ע) · /,'');
  const MAX_SEND=12;
  let CUR=lg('tm_errs_pid'); if(KIDS.indexOf(CUR)<0) CUR='ziv';
  let ONLY_OPEN=lg('tm_errs_open')==='1';
  let ASK=null;   /* בחינה שמחכה לאישור שליחה */

  const css=document.createElement('style');
  css.textContent=`
#errParOv{z-index:91;}
#errParOv.tmn-host{flex-direction:column;align-items:stretch;justify-content:flex-start;padding:var(--tmnav-h) 0 0;background:var(--bg,#F4F5FA);}
#errParOv.tmn-host .ov-box{margin:16px auto 30px;width:calc(100% - 32px);box-shadow:var(--shadow,0 4px 18px rgba(0,0,0,.08));flex-shrink:0;}
.er-tabs{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:4px 0 10px;}
.er-tabs button{font:inherit;font-weight:800;font-size:.95rem;min-height:44px;border-radius:12px;border:2px solid var(--c);background:var(--surface,#fff);color:var(--c);cursor:pointer;padding:4px 2px;}
.er-tabs button.on{background:var(--c);color:#fff;}
.er-tabs small{display:block;font-weight:600;font-size:.72rem;opacity:.85;}
.er-seg{display:flex;gap:6px;margin:0 0 8px;}
.er-seg button{flex:1;font:inherit;font-size:.85rem;font-weight:700;min-height:36px;border-radius:10px;border:1.5px solid var(--acc-fg,#2E5FD8);background:var(--surface,#fff);color:var(--acc-fg,#2E5FD8);cursor:pointer;}
.er-seg button.on{background:var(--acc,#2E5FD8);color:var(--on-acc,#fff);}
.er-sum{font-weight:700;margin:2px 0 6px;}
.er-ex{border:1.5px solid var(--line,#E3DED3);border-radius:14px;padding:10px 12px;margin:10px 0;background:var(--surface,#fff);}
.er-ex>h3{margin:0 0 2px;font-size:1.02rem;}
.er-ex>.d{font-size:.8rem;color:var(--muted,#6b5c48);margin-bottom:6px;}
.er-tp{font-weight:800;font-size:.88rem;margin:10px 0 4px;color:var(--muted,#6b5c48);}
.er-q{border-top:1px dashed var(--line,#E3DED3);padding:8px 0;}
.er-q:first-of-type{border-top:0;}
.er-q .q{font-weight:700;line-height:1.4;}
.er-q .w{color:#C0392B;margin-top:3px;line-height:1.35;}
.er-q .r{color:#1E8449;margin-top:2px;line-height:1.35;}
.er-q .m{font-size:.78rem;color:var(--muted,#6b5c48);margin-top:3px;}
.er-q.fixed{opacity:.7;}
.er-send{margin-top:10px;}
.er-send button{font:inherit;font-weight:800;font-size:.92rem;min-height:42px;border-radius:12px;cursor:pointer;padding:6px 12px;border:1.5px solid var(--acc-fg,#2E5FD8);background:var(--surface,#fff);color:var(--acc-fg,#2E5FD8);}
.er-send button.pri{background:var(--acc,#2E5FD8);color:var(--on-acc,#fff);border-color:var(--acc,#2E5FD8);}
.er-ask{background:#FFF8E1;border:1.5px solid #E2C46A;border-radius:12px;padding:10px;color:#3A2E22;}
.er-ask .ov-row{margin-top:8px;}
.er-st{font-size:.85rem;font-weight:700;margin-top:6px;}
details.er-old>summary{cursor:pointer;font-weight:800;margin:14px 0 4px;}
`;
  document.head.appendChild(css);

  /* ---------- הנתונים: כל השאלות שהילדה טעתה בהן ---------- */
  function exOf(pid,id){ try{ return (EXAMS[pid]||[]).find(x=>x.id===id)||null; }catch(e){ return null; } }
  function exTitle(ex){
    if(!ex) return '';
    let s=''; try{ const sj=SUBJ[ex.subj]; if(sj) s=sj.i+' '; }catch(e){}
    return s+(ex.title||(function(){ try{ return SUBJ[ex.subj].n; }catch(e){ return ex.id; } })());
  }
  function exDate(id){ try{ const v=DATES[id]; if(!v) return ''; const [y,m,d]=v.split('-'); return +d+'.'+(+m); }catch(e){ return ''; } }
  function ended(ex){ try{ if(isArch(ex)) return true; const END=JSON.parse(lg('tm_ended')||'{}')||{}; if(END[ex.id]) return true; const n=daysLeft(ex.id); return n!=null&&n<0; }catch(e){ return false; } }

  function collect(pid){
    let list=[]; try{ list=S().cards(pid).list||[]; }catch(e){}
    /* מה הייתה התשובה האחרונה על כל שאלה, ומתי טעתה לאחרונה */
    const last={}, lastWrong={};
    try{ (S().allLog(pid)||[]).forEach(e=>{ const k=e.rid||e.id; if(!k) return; last[k]=e.ok?1:0; if(!e.ok) lastWrong[k]=e.t; }); }catch(e){}
    return list.filter(c=>c.n>c.ok).map(c=>({c,key:c.key,q:c.q,right:c.c,wr:[...c.wr],bad:c.n-c.ok,n:c.n,
      fixed:last[c.key]===1, lw:lastWrong[c.key]||c.last, ex:c.ex||null, tp:tpShow(c.tp)||'שונות'}));
  }
  function groups(pid){
    const R=collect(pid), G=new Map();
    R.forEach(r=>{ const k=r.ex&&exOf(pid,r.ex)?r.ex:'_'; if(!G.has(k)) G.set(k,[]); G.get(k).push(r); });
    const out=[...G.entries()].map(([id,L])=>{ const ex=id==='_'?null:exOf(pid,id);
      return {id,ex,L,title:ex?exTitle(ex):'📚 תרגולים אחרים',date:ex?exDate(id):'',old:ex?ended(ex):true}; });
    const dv=g=>{ try{ return DATES[g.id]||'9999'; }catch(e){ return '9999'; } };
    out.sort((a,b)=>(a.old-b.old)||(a.old?(dv(b)<dv(a)?-1:1):(dv(a)<dv(b)?-1:1)));
    return {all:R,G:out};
  }

  /* ---------- משימה שנשלחה (נקרא מה-PM של אזור ההורים) ---------- */
  function pmOf(pid){ try{ const P=JSON.parse(lg('tm_pm')||'{}')||{}; const m=P[pid]; return m&&m.day===dk()&&Array.isArray(m.keys)?m:null; }catch(e){ return null; } }
  async function send(pid,g){
    const open=g.L.filter(r=>!r.fixed).sort((a,b)=>b.bad-a.bad||b.lw-a.lw).slice(0,MAX_SEND);
    if(!open.length) return false;
    const m={pid,ex:g.ex?g.ex.id:'',tp:'🔁 הטעויות שלי'+(g.ex?' · '+exTitle(g.ex).replace(/^\S+\s/,''):''),keys:open.map(r=>r.key),day:dk(),at:Date.now(),done:0};
    try{ const P=JSON.parse(lg('tm_pm')||'{}')||{}; P[pid]=m; ls('tm_pm',JSON.stringify(P)); }catch(e){}
    try{ const D=(typeof DB!=='undefined'&&DB)?DB:null; if(!D) return false; await D.doc('pmis/'+pid).set(m); return true; }catch(e){ return false; }
  }

  /* ---------- המסך ---------- */
  function qHtml(r){
    const w=r.wr.length?r.wr.map(E).join(' · '):'(לא נשמרה התשובה)';
    return '<div class="er-q'+(r.fixed?' fixed':'')+'"><div class="q">'+E(r.q)+'</div>'+
      '<div class="w">❌ ענתה: '+w+'</div><div class="r">✅ התשובה: '+E(r.right)+'</div>'+
      '<div class="m">טעתה '+(r.bad===1?'פעם אחת':r.bad+' פעמים')+' מתוך '+r.n+' · '+(r.fixed?'✓ אחר כך ענתה נכון':'⏳ עוד לא ענתה נכון')+'</div></div>';
  }
  function exHtml(pid,g,i){
    const L=g.L.filter(r=>!ONLY_OPEN||!r.fixed); if(!L.length) return '';
    const T=new Map(); L.forEach(r=>{ if(!T.has(r.tp)) T.set(r.tp,[]); T.get(r.tp).push(r); });
    const tps=[...T.entries()].sort((a,b)=>b[1].length-a[1].length);
    const open=g.L.filter(r=>!r.fixed).length;
    let h='<div class="er-ex"><h3>'+E(g.title)+'</h3><div class="d">'+(g.date?'📅 '+E(g.date)+' · ':'')+L.length+' שאלות'+(open?' · '+open+' עוד פתוחות':'')+'</div>'+
      tps.map(([tp,R])=>(tps.length>1||tp!=='שונות'?'<div class="er-tp">'+E(tp)+' ('+R.length+')</div>':'')+R.sort((a,b)=>(a.fixed-b.fixed)||b.bad-a.bad).map(qHtml).join('')).join('');
    /* שליחת תרגול — רק לבחינה פעילה, ורק אחרי אישור */
    if(g.ex&&!g.old&&open){
      const n=Math.min(MAX_SEND,open), m=pmOf(pid), sent=m&&m.ex===g.ex.id;
      h+='<div class="er-send">';
      if(sent) h+='<div class="er-st">📌 נשלח היום ('+m.keys.length+' שאלות) · '+(m.done?'✓ סיימה: '+(m.ok||0)+' נכונות מתוך '+(m.n||0):'⏳ עוד לא עשתה')+'</div>';
      if(ASK===pid+'|'+g.id) h+='<div class="er-ask">לשלוח ל'+E(NM(pid))+' תרגול של '+n+' שאלות שהיא עוד לא ענתה עליהן נכון?<br><small>היא תראה היום למעלה: "📌 משימה מאבא ואמא". אם כבר יש לה משימה להיום, זו מחליפה אותה.</small><div class="ov-row"><button type="button" class="pri" data-go="'+i+'">כן, לשלוח</button><button type="button" data-no="1">ביטול</button></div></div>';
      else h+='<button type="button" data-ask="'+i+'">📌 '+(sent?'לשלוח שוב':'לשלוח לה תרגול')+' ('+n+' שאלות)</button>';
      h+='</div>';
    }
    return h+'</div>';
  }
  function paint(){
    const B=$('errParBox'); if(!B) return;
    const D=groups(CUR), all=D.all, open=all.filter(r=>!r.fixed).length;
    const cnt=pid=>{ try{ return collect(pid).filter(r=>!r.fixed).length; }catch(e){ return 0; } };
    let h='<h2>📕 הטעויות של הבנות</h2><div class="er-tabs">'+KIDS.map(pid=>'<button type="button" data-pid="'+pid+'" style="--c:'+(COL[pid]||'#555')+'" class="'+(pid===CUR?'on':'')+'">'+E(NM(pid))+'<small>'+cnt(pid)+' פתוחות</small></button>').join('')+'</div>';
    if(!all.length){ h+='<p class="rp-note" style="font-size:1rem">עוד אין טעויות של '+E(NM(CUR))+' 🎉</p>'; }
    else{
      h+='<div class="er-sum">'+all.length+' שאלות שטעתה בהן · '+open+' עוד פתוחות</div>'+
        '<div class="er-seg"><button type="button" data-open="0" class="'+(ONLY_OPEN?'':'on')+'">הכול</button><button type="button" data-open="1" class="'+(ONLY_OPEN?'on':'')+'">רק מה שעוד פתוח</button></div>';
      const act=D.G.map((g,i)=>g.old?'':exHtml(CUR,g,i)).join(''), old=D.G.map((g,i)=>g.old?exHtml(CUR,g,i):'').join('');
      h+=act||(old?'':'<p class="rp-note">אין שאלות פתוחות 👏</p>');
      if(old) h+='<details class="er-old"><summary>🗄️ בחינות שהסתיימו ותרגולים אחרים</summary>'+old+'</details>';
    }
    h+='<div class="ov-row"><button type="button" id="errClose">סגירה</button></div>';
    const y=(B.closest('.ov')||{}).scrollTop;
    B.innerHTML=h;
    B.querySelectorAll('[data-pid]').forEach(b=>b.onclick=()=>{ CUR=b.dataset.pid; ls('tm_errs_pid',CUR); ASK=null; paint(); const o=$('errParOv'); if(o) o.scrollTop=0; });
    B.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>{ ONLY_OPEN=b.dataset.open==='1'; ls('tm_errs_open',ONLY_OPEN?'1':'0'); paint(); });
    B.querySelectorAll('[data-ask]').forEach(b=>b.onclick=()=>{ const g=D.G[+b.dataset.ask]; ASK=CUR+'|'+g.id; paint(); });
    B.querySelectorAll('[data-no]').forEach(b=>b.onclick=()=>{ ASK=null; paint(); });
    B.querySelectorAll('[data-go]').forEach(b=>b.onclick=async()=>{ b.disabled=true; const g=D.G[+b.dataset.go]; const ok=await send(CUR,g); ASK=null;
      try{ toast(ok?'📌 נשלח ל'+NM(CUR):'📌 נשמר בטלפון — יישלח כשיהיה חיבור'); }catch(e){} paint(); });
    $('errClose').onclick=()=>$('errParOv').classList.remove('show');
    if(y!=null&&B.closest('.ov')) B.closest('.ov').scrollTop=y;
  }
  function open(){
    let o=$('errParOv');
    if(!o){ o=document.createElement('div'); o.className='ov'; o.id='errParOv'; o.innerHTML='<div class="ov-box" id="errParBox"></div>'; o.addEventListener('click',e=>{ if(e.target===o) o.classList.remove('show'); }); document.body.appendChild(o); }
    ASK=null; o.classList.add('show'); paint(); o.scrollTop=0;
  }
  window.addEventListener('tm-live',()=>{ const o=$('errParOv'); if(o&&o.classList.contains('show')&&!ASK) paint(); });

  /* כפתור באזור ההורים (לוח הבנות) */
  (function parBtn(){
    if(typeof window.showDash!=='function') return;
    const _sd=window.showDash;
    window.showDash=function(){ const p=_sd.apply(this,arguments);
      const add=()=>{ const top=document.querySelector('#parentBox .dash-top'); if(top&&!$('dErrs')){ const b=document.createElement('button'); b.type='button'; b.id='dErrs'; b.textContent='📕 הטעויות של הבנות'; b.onclick=open; top.insertBefore(b,top.children[1]||null); } };
      add(); const bx=$('parentBox'); if(bx){ const mo=new MutationObserver(add); mo.observe(bx,{childList:true}); setTimeout(()=>mo.disconnect(),20000); }
      return p; };
  })();
  window.TM_ERRS={open,collect};
})();

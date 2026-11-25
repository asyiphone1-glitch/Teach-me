/* ================================================================
   teach-me — 24.11.2026: אושר מהמחקר העולמי ("איך לגרום לבנות לרצות להיות באפליקציה")
   שלב א׳ (אושר קודם, 20.11): 🃏 אלבום קלפים לכל בחינה · ⬆️ שיא אישי · 🔢 מספר על האייקון
   שלב ב׳ (24.11):          ⚡ קומבו · ⏰ שעה כפולה · 🔥 רצף (להבה במסך הפתיחה; 🌴 יום חופש ו-❄️ הקפאה — בתוך stInfo) · 🎁 תיבת הפתעה
   כל פרס בא רק מלמידה של חומר הבחינה. 💎 = היהלומים של "הדמות שלי". התחרות השבועית לא משתנה (היא סופרת שאלות, לא 💎).
   ================================================================ */
(function(){
  const $=id=>document.getElementById(id);
  const lg=k=>{ try{ return localStorage.getItem(k); }catch(e){ return null; } };
  const ls=(k,v)=>{ try{ if(v==null) localStorage.removeItem(k); else localStorage.setItem(k,v); }catch(e){} };
  const E=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const KIDS=['aviv','roni','hili','ziv'];
  const prof=()=>{ try{ return (typeof PROFILE!=='undefined'&&PROFILE)?PROFILE:null; }catch(e){ return null; } };
  const curPid=()=>{ const P=prof(); return P?P.id:null; };
  const S=()=>window.TM_SMART||{};
  const dk=t=>{ const d=new Date(t||Date.now()); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };
  const rnd=a=>a[Math.floor(Math.random()*a.length)];
  const shuf=a=>{ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
  const hubOpen=()=>{ const h=$('hub'); return !!h&&!h.classList.contains('hide'); };
  const ended=()=>{ try{ return JSON.parse(lg('tm_ended')||'{}')||{}; }catch(e){ return {}; } };
  function actEx(pid){ try{ const END=ended(); return (EXAMS[pid]||[]).filter(x=>!isArch(x)&&!END[x.id]); }catch(e){ return []; } }
  const subjOf=ex=>{ try{ return SUBJ[ex.subj]; }catch(e){ return null; } };
  const exName=ex=>{ const s=subjOf(ex); return s?s.i+' '+s.n:((ex&&ex.title)||''); };
  const lockPid=()=>{ let l=lg('tm_lock')||window.TM_LOCK||null; return KIDS.indexOf(l)>=0?l:null; };
  const confetti=()=>{ try{ mConfetti(); }catch(e){} };

  /* ---------------- CSS ---------------- */
  const css=document.createElement('style');
  css.textContent=`
#tmPlay{display:flex;flex-direction:column;gap:8px;margin:0 0 12px;}
#tmPlay:empty{display:none;}
.tp-chip{display:flex;align-items:center;gap:8px;width:100%;box-sizing:border-box;padding:10px 14px;border-radius:16px;font-family:'Heebo',sans-serif;font-weight:800;font-size:1rem;line-height:1.35;color:#3A2E22;border:2px solid #E2C46A;background:#FFF8E1;text-align:start;}
.tp-chip .i{font-size:1.4rem;flex-shrink:0;}
.tp-chip small{display:block;font-weight:600;font-size:.85rem;opacity:.8;}
.tp-chip.pb{border-color:#7DBA6E;background:#EAF6E6;}
.tp-chip.pb.go{border-color:#9BB7E6;background:#EEF4FF;}
.tp-chip.dh{border-color:#E08A2E;background:linear-gradient(135deg,#FFF1DC,#FFE0B8);}
.tp-chip.dh.now{border-color:#D9534F;background:linear-gradient(135deg,#FFE7D6,#FFD0BD);animation:tpGlow 1.6s ease-in-out infinite;}
@keyframes tpGlow{50%{box-shadow:0 0 0 5px rgba(217,83,79,.18);}}
#tmCombo{position:fixed;left:8px;bottom:calc(10px + env(safe-area-inset-bottom,0px));z-index:61;pointer-events:none;font-family:'Heebo',sans-serif;font-weight:900;font-size:1rem;color:#fff;background:linear-gradient(#FFB938,#F08A00);border-radius:999px;padding:6px 12px;box-shadow:0 3px 10px rgba(0,0,0,.25);opacity:0;transform:scale(.6);transition:opacity .25s,transform .25s;}
#tmCombo.show{opacity:1;transform:scale(1);}
#tmCombo.x3{background:linear-gradient(#FF6F61,#D6336C);}
#tmCombo.pop{animation:tpPop .45s ease;}
@keyframes tpPop{40%{transform:scale(1.35);}}
.tm-fl{display:inline-block;margin-inline-start:6px;font-size:.85em;font-weight:900;background:#FFF1DC;color:#B85A00;border-radius:999px;padding:1px 8px;vertical-align:middle;}
#tmChest{position:fixed;inset:0;z-index:91;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(20,14,40,.88);font-family:'Heebo',sans-serif;color:#fff;text-align:center;}
#tmChest .bx{max-width:420px;width:100%;}
#tmChest h2{font-family:'Secular One','Heebo',sans-serif;font-size:1.7rem;margin:0 0 6px;}
#tmChest p{margin:0 0 14px;font-size:1.05rem;}
#tmChest .row{display:flex;gap:12px;justify-content:center;margin:8px 0 16px;}
#tmChest .ch{flex:1;max-width:110px;aspect-ratio:1;border-radius:20px;border:3px solid #F3C24E;background:linear-gradient(#5B3FA8,#3A2678);font-size:3.2rem;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;animation:tpBob 1.8s ease-in-out infinite;touch-action:manipulation;}
#tmChest .ch:nth-child(2){animation-delay:.25s;} #tmChest .ch:nth-child(3){animation-delay:.5s;}
#tmChest .ch small{font-size:.8rem;font-weight:800;line-height:1.2;margin-top:4px;padding:0 4px;}
#tmChest .ch.open{animation:tpOpen .5s ease forwards;background:linear-gradient(#FFE07A,#F3B634);color:#2b2208;}
#tmChest .ch.dim{opacity:.45;animation:none;filter:grayscale(.4);}
#tmChest .ch:disabled{cursor:default;}
@keyframes tpBob{50%{transform:translateY(-6px) rotate(-3deg);}}
@keyframes tpOpen{0%{transform:scale(1);}40%{transform:scale(1.2) rotate(6deg);}100%{transform:scale(1.08);}}
#tmChest .res{min-height:2.6em;font-size:1.25rem;font-weight:900;margin:0 0 14px;}
#tmChest button.ok{font-family:'Heebo',sans-serif;font-weight:800;font-size:1.15rem;padding:12px 30px;border-radius:999px;border:none;background:linear-gradient(#F3C24E,#E2A72E);color:#2b2208;cursor:pointer;}
#tmToast{position:fixed;left:50%;top:calc(14px + env(safe-area-inset-top,0px));transform:translate(-50%,-20px);z-index:93;opacity:0;transition:opacity .3s,transform .3s;background:#fff;color:#2B2B33;border:3px solid #F3C24E;border-radius:18px;padding:10px 16px;font-family:'Heebo',sans-serif;font-weight:800;font-size:1.05rem;box-shadow:0 6px 20px rgba(0,0,0,.25);max-width:92vw;text-align:center;}
#tmToast.show{opacity:1;transform:translate(-50%,0);}
.al-ex{margin:14px 0 6px;font-weight:900;font-size:1.1rem;display:flex;justify-content:space-between;gap:8px;}
.al-ex small{font-weight:700;opacity:.75;}
.al-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
.al-c{aspect-ratio:3/4;border-radius:14px;border:2px solid #C9B8F0;background:linear-gradient(#F6F0FF,#E6DBFF);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:6px;text-align:center;font-family:'Heebo',sans-serif;font-weight:800;font-size:.78rem;line-height:1.25;color:#2E2450;}
.al-c .e{font-size:2rem;margin-bottom:4px;}
.al-c.lk{background:#F1F1F4;border-style:dashed;border-color:#C4C4CC;color:#8A8A96;}
.al-c.lk .e{filter:grayscale(1);opacity:.55;font-size:1.6rem;}
.al-c.rare{border-color:#E2A72E;background:linear-gradient(135deg,#FFF6D2,#FFD970);box-shadow:0 0 0 2px #FFF0B3 inset;}
.al-c.rare::after{content:'✨ נדיר';font-size:.7rem;color:#8A5A00;margin-top:3px;}
html.tm-dark .al-c,body.tm-dark .al-c{color:#2E2450;}
@media (prefers-reduced-motion: reduce){#tmChest .ch,.tp-chip.dh.now,#tmCombo.pop{animation:none;}}
`;
  document.head.appendChild(css);

  function toast(html,ms){
    let t=$('tmToast'); if(!t){ t=document.createElement('div'); t.id='tmToast'; t.setAttribute('role','status'); document.body.appendChild(t); }
    t.innerHTML=html; requestAnimationFrame(()=>t.classList.add('show'));
    clearTimeout(t._h); t._h=setTimeout(()=>t.classList.remove('show'),ms||3800);
  }

  /* =========================================================
     ⏰ שעה כפולה — ערב לפני בחינה, 18:00–19:00 (לא בשישי ושבת)
     ========================================================= */
  function dhExam(pid){
    if(!pid||pid==='dad') return null;
    const wd=new Date().getDay(); if(wd===5||wd===6) return null;
    return actEx(pid).find(x=>{ try{ return daysLeft(x.id)===1; }catch(e){ return false; } })||null;
  }
  function dhNow(pid){ const h=new Date().getHours(); return h===18&&!!dhExam(pid); }
  window.TM_DH={exam:dhExam,now:dhNow};

  /* =========================================================
     ⚡ קומבו — 3 נכונות ברצף = ×2 💎, 5 ברצף = ×3. מתגמל דיוק, לא מהירות.
     ========================================================= */
  const CB={pid:null,n:0,t:0};
  function comboEl(){ let c=$('tmCombo'); if(!c){ c=document.createElement('div'); c.id='tmCombo'; c.setAttribute('aria-live','polite'); document.body.appendChild(c); } return c; }
  function paintCombo(bump){
    const c=comboEl(), n=CB.n, dh=CB.pid&&dhNow(CB.pid);
    const m=n>=5?3:n>=3?2:1;
    if(n<2&&!dh){ c.classList.remove('show','x3'); return; }
    let t='';
    if(n>=2) t='⚡ '+n+' ברצף'+(m>1?' · ×'+m+' 💎':'');
    if(dh) t+=(t?' · ':'')+'⏰ ×2';
    c.textContent=t; c.classList.add('show'); c.classList.toggle('x3',m===3);
    if(bump){ c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); }
    clearTimeout(c._h); c._h=setTimeout(()=>c.classList.remove('show'),25000);
  }
  function comboOff(){ CB.n=0; const c=$('tmCombo'); if(c) c.classList.remove('show','x3'); }
  const _tr=window.tRec;
  if(typeof _tr==='function'){
    window.tRec=function(game,it,ok,chosen,right,ext){
      let bp=0;
      try{
        const pid=curPid(), now=Date.now();
        if(pid&&game!=='pre'){
          if(CB.pid!==pid||now-CB.t>4*60000) CB.n=0;
          CB.pid=pid; CB.t=now;
          if(ok){ CB.n++; const m=CB.n>=5?3:CB.n>=3?2:1, d=dhNow(pid)?2:1; bp=m*d-1; }
          else CB.n=0;
          paintCombo(!!ok&&(CB.n===3||CB.n===5||CB.n===2));
        }
      }catch(e){}
      if(bp>0) ext=Object.assign({},ext||{},{bp});
      return _tr.call(this,game,it,ok,chosen,right,ext);
    };
  }

  /* =========================================================
     🃏 אלבום קלפים — נושא שהילדה יודעת (🟢 ומעלה) וענתה עליו נכון ב-2 ימים שונים פותח קלף עם סמל הזיכרון שלו
     ========================================================= */
  const tpShow=t=>String(t||'').replace(/^(תורה|הבעה|חשבון|עברית) · /,'');
  function albumOf(pid){
    const out=[]; if(!window.TM_MAP||!TM_MAP.mastery) return out;
    const rare=new Set(((window.TM_AVX&&TM_AVX.avOf(pid).rare)||[]));
    actEx(pid).filter(x=>x.subj!=='dict').forEach(ex=>{
      let rows=[]; try{ rows=(TM_MAP.mastery(pid,ex).rows||[]).filter(r=>r.t&&r.t!=='כללי'); }catch(e){}
      if(!rows.length) return;
      let L=null; try{ L=window.TM_ICON?TM_ICON.list(ex.id):null; }catch(e){}
      const s=subjOf(ex);
      const cards=rows.map(r=>{
        let ic=null; try{ if(L) ic=TM_ICON.iconFor(r.t,L); }catch(e){}
        const key=ex.id+'|'+r.t;
        return {key,ex:ex.id,t:r.t,name:tpShow(r.t),e:(ic&&ic.e)||(s?s.i:'📘'),open:(r.lv||0)>=2&&(r.od||0)>=2,rare:rare.has(key)};
      });
      out.push({ex,cards});
    });
    return out;
  }
  function albumCount(pid){ let o=0,n=0; albumOf(pid).forEach(g=>g.cards.forEach(c=>{ n++; if(c.open) o++; })); return {o,n}; }
  function openAlbum(){
    const P=prof(); if(!P||!S().open) return; const pid=P.id;
    S().open(); const box=$('txIn'); if(!box) return; box.dataset.v='';
    const A=albumOf(pid);
    let h=S().bar('🃏 האלבום שלי')+'<div class="tx-card">'+
      '<p class="tx-note" style="text-align:center;margin:0">יודעת נושא גם למחרת? נפתח לך קלף 🃏</p>';
    if(!A.length) h+='<p style="text-align:center;margin:18px 0">עוד אין קלפים. בואי נתרגל! 💪</p>';
    A.forEach(g=>{
      const o=g.cards.filter(c=>c.open).length;
      h+='<div class="al-ex"><span>'+E(exName(g.ex))+'</span><small>'+o+' מתוך '+g.cards.length+'</small></div><div class="al-grid">'+
        g.cards.map(c=>'<div class="al-c'+(c.open?(c.rare?' rare':''):' lk')+'"><span class="e">'+(c.open?c.e:'🔒')+'</span>'+E(c.name.length>34?c.name.slice(0,32)+'…':c.name)+'</div>').join('')+'</div>';
    });
    h+='</div>';
    box.innerHTML=h; S().wireBar();
    ls('tm_al_seen_'+pid,JSON.stringify(seenNow(pid)));
  }
  function seenNow(pid){ const o=[]; albumOf(pid).forEach(g=>g.cards.forEach(c=>{ if(c.open) o.push(c.key); })); return o; }
  function albumNew(pid){
    let seen=null; try{ seen=JSON.parse(lg('tm_al_seen_'+pid)||'null'); }catch(e){}
    const now=seenNow(pid);
    if(!seen){ ls('tm_al_seen_'+pid,JSON.stringify(now)); return; }   /* פעם ראשונה בטלפון: בלי הודעה על הכול */
    const S0=new Set(seen), fresh=now.filter(k=>!S0.has(k));
    if(!fresh.length) return;
    ls('tm_al_seen_'+pid,JSON.stringify(now));
    let c=null; albumOf(pid).forEach(g=>g.cards.forEach(x=>{ if(!c&&x.key===fresh[0]) c=x; }));
    if(c) toast('🃏 קלף חדש באלבום!<br><span style="font-size:1.6rem">'+c.e+'</span> '+E(c.name)+(fresh.length>1?'<br><small>ועוד '+(fresh.length-1)+'</small>':''),4500);
  }
  function albumTile(){
    const row=$('hbMoreRow'), P=prof(); if(!row||!P||P.id==='dad') return;
    const {o,n}=albumCount(P.id); if(!n) { const x=$('tpAlb'); if(x) x.remove(); return; }
    let b=$('tpAlb');
    if(!b||!row.contains(b)){ b=document.createElement('button'); b.type='button'; b.className='tx-tile'; b.id='tpAlb'; b.onclick=openAlbum; row.appendChild(b); }
    const h='<span class="ic">🃏</span>האלבום שלי<small>'+o+' מתוך '+n+' קלפים</small>';
    if(b._h!==h){ b._h=h; b.innerHTML=h; }
  }

  /* =========================================================
     ⬆️ שיא אישי — השבוע מול השבוע שעבר של עצמה (התחרות לא משתנה)
     ========================================================= */
  function pbInfo(pid){
    const W=window.TM_WK; if(!W||!W.st||!W.ws||KIDS.indexOf(pid)<0) return null;
    const ws=W.ws(Date.now());
    const cur=(W.st(ws).find(r=>r.pid===pid)||{}).n||0;
    const last=(W.st(ws-7*864e5+3*36e5).find(r=>r.pid===pid)||{}).n||0;   /* +3 שעות — בטוח בשבוע הקודם גם במעבר שעון */
    if(!last) return null;
    return {cur,last,ws,beat:cur>last};
  }

  /* =========================================================
     פסים בראש מסך המקצועות: ⏰ שעה כפולה · ⬆️ שיא אישי
     ========================================================= */
  function hubChips(){
    const P=prof(); if(!P||!hubOpen()) return; const pid=P.id;
    const w=$('txTiles'); if(!w) return;
    let el=$('tmPlay');
    if(!el||el.parentNode!==w){ if(el) el.remove(); el=document.createElement('div'); el.id='tmPlay'; const sb=w.querySelector('.st-bar'); if(sb) sb.after(el); else w.prepend(el); }
    let h='';
    const dx=dhExam(pid), hr=new Date().getHours();
    if(dx&&hr<19){
      const nm=exName(dx);
      if(hr===18){ const left=60-new Date().getMinutes();
        h+='<div class="tp-chip dh now"><span class="i">⏰</span><span>עכשיו שעה כפולה! כל 💎 פי 2<small>עוד '+left+' דק׳ · מחר '+E(nm)+'</small></span></div>'; }
      else h+='<div class="tp-chip dh"><span class="i">⏰</span><span>היום ב-18:00 שעה כפולה!<small>18:00–19:00 כל 💎 פי 2 · מחר '+E(nm)+'</small></span></div>';
    }
    const pb=pbInfo(pid);
    if(pb){
      if(pb.beat) h+='<div class="tp-chip pb"><span class="i">⬆️</span><span>שיא אישי! '+pb.cur+' שאלות השבוע<small>יותר מכל השבוע שעבר ('+pb.last+')</small></span></div>';
      else h+='<div class="tp-chip pb go"><span class="i">⬆️</span><span>עוד '+(pb.last-pb.cur+1)+' שאלות לשיא אישי<small>השבוע שעבר: '+pb.last+' שאלות</small></span></div>';
      if(pb.beat&&lg('tm_pb_'+pid)!==String(pb.ws)){ ls('tm_pb_'+pid,String(pb.ws)); confetti(); toast('⬆️ שיא אישי חדש!<br><small>עקפת את השבוע שעבר של עצמך 💪</small>'); }
    }
    try{ if(chipsMore) h+=chipsMore(pid)||''; }catch(e){}
    if(el._h!==h){ el._h=h; el.innerHTML=h; }   /* משווים למה שכתבנו (לא ל-innerHTML) — כדי שלא תהיה לולאה עם ה-MutationObserver */
  }
  let chipsMore=null;

  let hubT=0;
  function hubTick(){ hubT=0; try{ hubChips(); }catch(e){} try{ albumTile(); }catch(e){} }
  (function watchHub(){ const hb=$('hubBox'); if(!hb){ setTimeout(watchHub,700); return; }
    new MutationObserver(()=>{ if(!hubT) hubT=setTimeout(hubTick,120); }).observe(hb,{childList:true,subtree:true}); })();
  if(typeof window.showHub==='function'){ const _sh=window.showHub; window.showHub=function(){ const r=_sh.apply(this,arguments); comboOff(); setTimeout(hubTick,150);
    setTimeout(()=>{ try{ const P=prof(); if(P&&P.id!=='dad') albumNew(P.id); }catch(e){} },1400); return r; }; }
  window.addEventListener('tm-live',()=>{ if(hubOpen()&&!hubT) hubT=setTimeout(hubTick,200); });
  setInterval(()=>{ if(hubOpen()) hubTick(); },60000);

  /* =========================================================
     🔥 להבה עם מספר הימים ברצף בריבוע של כל ילדה (מסך הפתיחה)
     ========================================================= */
  function gateFlames(){
    const gate=$('gate'); if(!gate||!S().stInfo) return;
    KIDS.forEach(pid=>{
      const n=gate.querySelector('.gate-btn[data-p="'+pid+'"] .gq-n'); if(!n) return;
      let run=0; try{ run=S().stInfo(pid).run||0; }catch(e){}
      let f=n.querySelector('.tm-fl');
      if(!run){ if(f) f.remove(); return; }
      if(!f){ f=document.createElement('span'); f.className='tm-fl'; n.appendChild(f); }
      const t='🔥'+run; if(f.textContent!==t){ f.textContent=t; f.title=run+' ימים ברצף'; }
    });
  }
  if(typeof window.renderGate==='function'){ const _rg=window.renderGate; window.renderGate=function(){ const r=_rg.apply(this,arguments); try{ gateFlames(); }catch(e){} return r; }; }
  setTimeout(gateFlames,1500); setInterval(gateFlames,30000);

  /* =========================================================
     🎁 תיבת הפתעה — אחרי סבב של 16+ נכונות (עד 3 ביום), אחרי החגיגה
     ========================================================= */
  const CHEST_MAX=3;
  function chestLeft(pid){ return CHEST_MAX-(+(lg('tm_chest_'+pid+'_'+dk())||0)); }
  function clothFor(pid){
    const X=window.TM_AVX; if(!X) return null; const A=X.avOf(pid), own=new Set(A.own||[]);
    const L=[]; X.shop().forEach(c=>{ if(X.isCloth(c.k)&&(!X.ward(pid)||(pid==='ziv'&&c.k==='pants'))) return;
      c.it.forEach(x=>{ if(!own.has(x[0])) L.push({id:x[0],e:x[1],n:x[2],cat:c.k,cn:c.n}); }); });
    return L.length?rnd(L):null;
  }
  function rareFor(pid){ const L=[]; albumOf(pid).forEach(g=>g.cards.forEach(c=>{ if(c.open&&!c.rare) L.push(c); })); return L.length?rnd(L):null; }
  function prizeRoll(pid){
    const r=Math.random();
    if(r<.30){ const c=clothFor(pid); if(c) return {k:'cloth',c}; }
    else if(r<.55){ const c=rareFor(pid); if(c) return {k:'rare',c}; }
    else if(r<.85) return {k:'dbl'};
    else return {k:'almost'};
    return {k:'dbl'};
  }
  function prizeFace(p,ok){
    if(p.k==='cloth') return {e:p.c.e||'👕',t:p.c.n};
    if(p.k==='rare') return {e:p.c.e,t:'קלף נדיר'};
    if(p.k==='dbl') return {e:'💎',t:'+'+ok+' 💎'};
    return {e:'💪',t:'כמעט!'};
  }
  async function applyPrize(pid,p,ok){
    const X=window.TM_AVX; if(!X) return;
    const A=X.avOf(pid); A.own=(A.own||[]).slice(); A.wear=Object.assign({},A.wear||{}); A.rare=(A.rare||[]).slice();
    if(p.k==='cloth'){ if(!A.own.includes(p.c.id)) A.own.push(p.c.id); A.wear[p.c.cat]=p.c.id; }
    else if(p.k==='rare'){ if(!A.rare.includes(p.c.key)) A.rare.push(p.c.key); }
    else if(p.k==='dbl'){ A.gift=(+A.gift||0)+ok; }
    else return;
    try{ await X.save(pid,A); }catch(e){}
  }
  function showChest(pid,ok){
    if($('tmChest')) return;
    const prizes=[prizeRoll(pid),prizeRoll(pid),prizeRoll(pid)];
    const o=document.createElement('div'); o.id='tmChest'; o.setAttribute('role','dialog'); o.setAttribute('aria-modal','true'); o.setAttribute('aria-label','תיבת הפתעה');
    o.innerHTML='<div class="bx"><h2>🎁 תיבת הפתעה!</h2><p>'+ok+' נכונות! בחרי תיבה אחת</p><div class="row">'+
      [0,1,2].map(i=>'<button type="button" class="ch" data-i="'+i+'" aria-label="תיבה '+(i+1)+'">🎁</button>').join('')+
      '</div><div class="res" id="tmChRes"></div><button type="button" class="ok" id="tmChOk" hidden>יש! 🎉</button></div>';
    document.body.appendChild(o);
    const close=()=>o.remove();
    o.querySelectorAll('.ch').forEach(b=>b.onclick=async()=>{
      const i=+b.dataset.i, p=prizes[i];
      o.querySelectorAll('.ch').forEach(x=>x.disabled=true);
      const f=prizeFace(p,ok); b.classList.add('open'); b.innerHTML=f.e+'<small>'+E(f.t)+'</small>';
      setTimeout(()=>{ o.querySelectorAll('.ch').forEach(x=>{ const j=+x.dataset.i; if(j===i) return; const g=prizeFace(prizes[j],ok); x.classList.add('dim'); x.innerHTML=g.e+'<small>'+E(g.t)+'</small>'; }); },700);
      const res=$('tmChRes');
      if(p.k==='cloth') res.innerHTML='👗 קיבלת: '+E(p.c.n)+'!<br><small style="font-size:.9rem">זה כבר על הדמות שלך</small>';
      else if(p.k==='rare') res.innerHTML='✨ קלף נדיר באלבום!<br><small style="font-size:.9rem">'+E(p.c.name)+'</small>';
      else if(p.k==='dbl') res.innerHTML='💎 נקודות כפולות! +'+ok+' 💎';
      else res.innerHTML='כמעט! 💪 בפעם הבאה';
      if(p.k!=='almost') confetti();
      await applyPrize(pid,p,ok);
      const okb=$('tmChOk'); okb.hidden=false; okb.onclick=close;
    });
  }
  function maybeChest(ok,n,pid){
    pid=pid||curPid(); if(KIDS.indexOf(pid)<0) return;
    if(!(ok>=16&&(!n||n>=ok))) return;
    if(chestLeft(pid)<=0) return;
    ls('tm_chest_'+pid+'_'+dk(),String(CHEST_MAX-chestLeft(pid)+1));
    let tries=0;
    (function wait(){ /* אחרי החגיגה ואחרי מסך "לכי לישון" */
      if(++tries>120) return;
      if($('tmCel')||$('tmSleep')||(tries<8)){ setTimeout(wait,500); return; }
      if(curPid()!==pid) return;
      showChest(pid,ok);
    })();
  }
  function scoreOf(el){
    const big=el.querySelector('.m-big'), h=el.querySelector('h3');
    const t=((big&&/\//.test(big.textContent)?big.textContent:'')+' '+(h?h.textContent:'')+' '+el.textContent).replace(/\s+/g,' ');
    const m=/(\d+)\s*\/\s*(\d+)/.exec(big?big.textContent:'')||/(\d+)\s*מתוך\s*(\d+)/.exec(t);
    return m?{ok:+m[1],n:+m[2]}:null;
  }
  let chT=0;
  function chScan(){
    chT=0;
    document.querySelectorAll('.tx-end,.m-res').forEach(el=>{
      if(el.dataset.tmChest||el.offsetParent===null) return; el.dataset.tmChest='1';
      comboOff();
      if(el.closest('#tmMorn')) return;
      const s=scoreOf(el); if(s) maybeChest(s.ok,s.n);
    });
  }
  new MutationObserver(()=>{ if(!chT) chT=setTimeout(chScan,300); }).observe(document.body,{childList:true,subtree:true});
  addEventListener('message',e=>{ const d=e&&e.data; if(d&&d.tm==='kefelDone'&&+d.first>=16) maybeChest(+d.first,20,d.pid||curPid()); });

  /* =========================================================
     🔢 מספר על אייקון האפליקציה — כמה שאלות מחכות לחזרה (רק בטלפון של ילדה)
     ========================================================= */
  function badge(){
    if(!('setAppBadge' in navigator)) return;
    const pid=lockPid();
    try{
      if(!pid){ navigator.clearAppBadge().catch(()=>{}); return; }
      const n=(S().srsInfo?S().srsInfo(pid).due:0)||0;
      if(n>0) navigator.setAppBadge(n).catch(()=>{}); else navigator.clearAppBadge().catch(()=>{});
    }catch(e){}
  }
  setTimeout(badge,5000); setInterval(badge,120000);
  document.addEventListener('visibilitychange',()=>{ if(document.hidden) badge(); });
  let bT=0; window.addEventListener('tm-live',()=>{ clearTimeout(bT); bT=setTimeout(badge,3000); });


  /* =========================================================
     ===== שלב ג׳ (24.11, אושר) =====
     🐣 ביצה של בחינה · 📣 מה קורה אצל האחיות · 🏰 מצב מגדל · 💝 חנות ההורים
     ========================================================= */
  const css2=document.createElement('style');
  css2.textContent=`
.tp-chip.egg{border-color:#E7C9A0;background:linear-gradient(135deg,#FFF9EF,#FCEBD3);cursor:pointer;font:inherit;font-family:'Heebo',sans-serif;font-weight:800;}
.tp-chip.sis{border-color:#C9B8F0;background:#F6F0FF;font-size:.95rem;}
.zo-egg{display:flex;align-items:center;gap:12px;margin:8px 0;padding:10px 12px;border-radius:14px;background:#FFF9EF;border:2px solid #E7C9A0;}
.zo-egg .e{font-size:2.2rem;}
.zo-egg .b{flex:1;font-weight:800;}
.zo-bar{height:12px;border-radius:99px;background:#F1E2CB;overflow:hidden;margin-top:6px;}
.zo-bar i{display:block;height:100%;background:linear-gradient(90deg,#F7B267,#F25C54);}
.zo-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px;}
.zo-an{border-radius:14px;border:2px solid #A8D5A2;background:#EFF9EC;text-align:center;padding:8px 4px;font-weight:800;font-size:.8rem;line-height:1.3;color:#24452A;}
.zo-an .e{display:block;font-size:2.4rem;}
#tmHatch{position:fixed;inset:0;z-index:91;display:flex;align-items:center;justify-content:center;background:rgba(20,14,40,.88);color:#fff;font-family:'Heebo',sans-serif;text-align:center;padding:20px;}
#tmHatch .e{font-size:5.5rem;animation:tpHatch 1.2s ease;}
#tmHatch h2{font-family:'Secular One','Heebo',sans-serif;font-size:1.7rem;margin:8px 0;}
#tmHatch button{margin-top:16px;font-family:'Heebo',sans-serif;font-weight:800;font-size:1.15rem;padding:12px 30px;border-radius:999px;border:none;background:linear-gradient(#F3C24E,#E2A72E);color:#2b2208;}
@keyframes tpHatch{0%{transform:scale(.3) rotate(-20deg);}50%{transform:scale(1.25) rotate(10deg);}100%{transform:scale(1);}}
#tmTower{position:fixed;left:8px;bottom:calc(52px + env(safe-area-inset-bottom,0px));z-index:61;pointer-events:none;width:58px;display:flex;flex-direction:column-reverse;align-items:center;gap:2px;opacity:0;transition:opacity .3s;}
#tmTower.show{opacity:1;}
#tmTower .fl{width:46px;height:9px;border-radius:3px;background:#B7A27A;border:1px solid #8E7A55;box-sizing:border-box;}
#tmTower .fl:nth-child(odd){background:#C9B48A;}
#tmTower .fl.new{animation:tpFl .35s ease;}
#tmTower.wob{animation:tpWob .6s ease;}
#tmTower .tp{font-size:1.5rem;line-height:1;}
#tmTower .cnt{font-family:'Heebo',sans-serif;font-weight:900;font-size:.8rem;color:#fff;background:#6B5A3A;border-radius:999px;padding:1px 8px;margin-top:3px;}
@keyframes tpFl{0%{transform:translateY(-14px);opacity:0;}100%{transform:none;opacity:1;}}
@keyframes tpWob{25%{transform:rotate(-7deg);}50%{transform:rotate(6deg);}75%{transform:rotate(-3deg);}}
.sh-it{display:flex;align-items:center;gap:10px;margin:8px 0;padding:10px 12px;border-radius:14px;background:#FFF;border:2px solid #F2C6D8;}
.sh-it .e{font-size:1.9rem;}
.sh-it .b{flex:1;font-weight:800;}
.sh-it .b small{display:block;font-weight:600;opacity:.75;}
.sh-it button{min-height:44px;padding:6px 14px;border-radius:12px;border:none;background:#E2557F;color:#fff;font:inherit;font-weight:800;cursor:pointer;}
.sh-it button:disabled{background:#C9C9D2;}
.sh-it button.sec{background:#fff;color:#2B2B33;border:1.5px solid #DFE3EE;}
.sh-row{display:flex;gap:6px;margin:6px 0;}
.sh-row input{min-height:44px;border-radius:12px;border:1.5px solid #DFE3EE;padding:6px 8px;font:inherit;box-sizing:border-box;}
.sh-row input.e{width:56px;text-align:center;} .sh-row input.n{flex:1;min-width:0;} .sh-row input.c{width:70px;}
.sh-row button{min-height:44px;min-width:44px;border-radius:12px;border:1.5px solid #DFE3EE;background:#fff;font:inherit;cursor:pointer;}
.gq-shop{display:block;width:100%;margin:0 0 10px;padding:10px 14px;border-radius:14px;border:2px solid #E2557F;background:#FFF0F5;color:#2B2B33;font-family:'Heebo',sans-serif;font-weight:800;font-size:1rem;text-align:start;cursor:pointer;}
`;
  document.head.appendChild(css2);
  const NMs=pid=>{ try{ return PROFILES[pid].name; }catch(e){ return pid; } };

  /* ---------------- 🐣 ביצה של בחינה ---------------- */
  const ANIMALS=[['🦊','שועלה'],['🐼','פנדה'],['🦄','חד־קרן'],['🐢','צב'],['🦉','ינשוף'],['🐬','דולפין'],['🦋','פרפר'],['🐨','קואלה'],['🦒','ג׳ירפה'],['🐧','פינגווין'],['🦁','אריה'],['🐰','ארנבון'],['🐙','תמנון'],['🦜','תוכי'],['🐘','פיל'],['🦔','קיפוד'],['🐳','לווייתן'],['🦩','פלמינגו']];
  const hash=t=>{ let h=0; for(const c of String(t)) h=(h*31+c.charCodeAt(0))|0; return Math.abs(h); };
  const zooOf=pid=>{ try{ return (window.TM_AVX&&TM_AVX.avOf(pid).zoo)||[]; }catch(e){ return []; } };
  function eggsOf(pid){
    if(!window.TM_READY) return [];
    const z=new Set(zooOf(pid).map(a=>a.ex));
    return actEx(pid).filter(x=>x.subj!=='dict'&&!z.has(x.id)).map(ex=>({ex,p:TM_READY.pct(pid,ex)})).filter(e=>e.p!=null);
  }
  const HATCH=80;   /* 25.11: ההורה ביקש להוריד מ-100% ל-80% מוכנות */
  const eggE=p=>p>=Math.round(HATCH*2/3)?'🐣':'🥚';
  function animalFor(pid,exId){
    const have=new Set(zooOf(pid).map(a=>a.a)); const L=ANIMALS.filter(a=>!have.has(a[0])); const P=L.length?L:ANIMALS;
    return P[hash(exId)%P.length];
  }
  let hatching=false;
  async function hatchCheck(pid){
    if(hatching||KIDS.indexOf(pid)<0||!window.TM_AVX||$('tmChest')||$('tmCel')) return;
    const e=eggsOf(pid).find(x=>x.p>=HATCH); if(!e) return;
    hatching=true;
    const an=animalFor(pid,e.ex.id);
    const A=TM_AVX.avOf(pid); A.own=(A.own||[]).slice(); A.wear=Object.assign({},A.wear||{});
    A.zoo=(A.zoo||[]).slice(); if(!A.zoo.some(z=>z.ex===e.ex.id)) A.zoo.push({ex:e.ex.id,a:an[0],n:an[1],s:exName(e.ex),t:Date.now()});
    try{ await TM_AVX.save(pid,A); }catch(x){}
    const o=document.createElement('div'); o.id='tmHatch'; o.setAttribute('role','dialog'); o.setAttribute('aria-modal','true');
    o.innerHTML='<div><div class="e">'+an[0]+'</div><h2>הביצה בקעה! 🐣</h2><p>יצא/ה לך '+E(an[1])+'!<br>את מוכנה ל'+E(exName(e.ex))+' 💪</p><button type="button">לגן החיות שלי 🐾</button></div>';
    document.body.appendChild(o); confetti();
    o.querySelector('button').onclick=()=>{ o.remove(); hatching=false; openZoo(); };
  }
  function openZoo(){
    const P=prof(); if(!P||!S().open) return; const pid=P.id;
    S().open(); const box=$('txIn'); if(!box) return; box.dataset.v='';
    const eg=eggsOf(pid), z=zooOf(pid);
    let h=S().bar('🐾 גן החיות שלי')+'<div class="tx-card"><p class="tx-note" style="text-align:center;margin:0">כל סבב מחמם את הביצה. ב-'+HATCH+'% מוכנה היא בוקעת! 🐣</p>';
    eg.forEach(e=>{ h+='<div class="zo-egg"><span class="e">'+eggE(e.p)+'</span><span class="b">'+E(exName(e.ex))+' · '+e.p+'%<div class="zo-bar"><i style="width:'+Math.min(100,Math.round(e.p*100/HATCH))+'%"></i></div></span></div>'; });
    if(z.length) h+='<div class="al-ex"><span>החיות שלי</span><small>'+z.length+'</small></div><div class="zo-grid">'+z.map(a=>'<div class="zo-an"><span class="e">'+a.a+'</span>'+E(a.n)+'<br><small>'+E(a.s||'')+'</small></div>').join('')+'</div>';
    else if(!eg.length) h+='<p style="text-align:center;margin:18px 0">כשתיפתח בחינה חדשה תקבלי ביצה 🥚</p>';
    box.innerHTML=h+'</div>'; S().wireBar();
  }

  /* ---------------- 📣 מה קורה אצל האחיות ---------------- */
  function sisNews(pid){
    const out=[];
    KIDS.filter(k=>k!==pid).forEach(k=>{
      const nm=NMs(k);
      const z=zooOf(k).filter(a=>Date.now()-(a.t||0)<3*864e5).pop();
      if(z) out.push('🐣 '+nm+' בקעה ביצה! '+z.a);
      let run=0; try{ run=S().stInfo?S().stInfo(k).run:0; }catch(e){}
      if(run>=3) out.push('🔥 '+nm+' '+run+' ימים ברצף');
      try{ const b=pbInfo(k); if(b&&b.beat) out.push('⬆️ '+nm+' בשיא אישי'); }catch(e){}
    });
    if(!out.length) return '';
    const d=new Date().getDate(), a=out[d%out.length], b=out.length>1?out[(d+1)%out.length]:null;
    return a+(b&&b!==a?' · '+b:'');
  }

  /* ---------------- 🏰 מצב מגדל ---------------- */
  const TW={armed:false,on:false,n:0,pid:null};
  function towEl(){ let t=$('tmTower'); if(!t){ t=document.createElement('div'); t.id='tmTower'; t.setAttribute('aria-hidden','true'); document.body.appendChild(t); } return t; }
  function paintTower(newFl){
    const t=towEl();
    if(!TW.on){ t.classList.remove('show'); return; }
    let h='<span class="cnt">'+TW.n+'/20</span>';
    for(let i=0;i<Math.min(20,TW.n);i++) h+='<span class="fl'+(newFl&&i===TW.n-1?' new':'')+'"></span>';
    h+='<span class="tp">'+(TW.n>=20?'🚩':'🏰')+'</span>';
    t.innerHTML=h; t.classList.add('show');
  }
  function towerArm(pid){ TW.armed=true; TW.on=false; TW.n=0; TW.pid=pid; toast('🏰 מצב מגדל! כל תשובה נכונה = קומה'); }
  function towerOff(){ TW.armed=false; TW.on=false; TW.n=0; paintTower(); }
  function towerAns(ok){
    if(!TW.armed&&!TW.on) return; if(curPid()!==TW.pid){ towerOff(); return; }
    TW.on=true; TW.armed=false;
    if(ok){ TW.n++; paintTower(true); if(TW.n===20){ confetti(); } }
    else { paintTower(); const t=towEl(); t.classList.remove('wob'); void t.offsetWidth; t.classList.add('wob'); }
  }
  function towerEnd(){
    if(!TW.on) return; const n=TW.n;
    toast(n>=20?'🚩 מגדל שלם! 20 קומות! 🏰':'🏰 בנית '+n+' קומות!'+(n>=15?' כמעט עד הדגל!':''),4500);
    if(n>=20) confetti();
    setTimeout(towerOff,4000); TW.on=false; TW.armed=false;
  }
  /* כפתור במסך החומר (בחינות מהצ׳אט) — ליד "✏️ לתרגל הכול" */
  function towerBtns(){
    const a=$('upAll'); if(a&&!$('tpTowUp')){ const b=document.createElement('button'); b.type='button'; b.className='tx-next sec'; b.id='tpTowUp'; b.textContent='🏰 מצב מגדל (אותן שאלות)';
      b.onclick=()=>{ towerArm(curPid()); a.click(); }; a.after(b); }
    /* בחינות חשבון/תורה הישנות: אריח בתוך "לתרגל" */
    document.querySelectorAll('.tm3').forEach(box=>{
      const tiles=box.parentNode&&box.parentNode.querySelector('.m-tiles'); if(!tiles||tiles.querySelector('.tp-tow')) return;
      const t=document.createElement('button'); t.type='button'; t.className='m-tile tp-tow'+(tiles.querySelector('.m-tile.tm3-hide')?' tm3-hide':''); t.dataset.tmg='practice';
      t.innerHTML='<span class="ic">🏰</span><b>מצב מגדל</b><span>בוחרות משחק — כל נכונה בונה קומה</span>';
      t.onclick=()=>towerArm(curPid()); tiles.appendChild(t);
    });
  }

  /* ---------------- 💝 חנות ההורים ---------------- */
  const SH_DEF=[{id:'movie',e:'🎬',n:'ערב סרט',c:150},{id:'fri',e:'🍕',n:'בוחרת את ארוחת שישי',c:120},{id:'scr',e:'📱',n:'חצי שעה זמן מסך',c:80},{id:'ice',e:'🍦',n:'גלידה',c:60}];
  let SH={items:null,req:{}}; try{ const x=JSON.parse(lg('tm_shop')||'null'); if(x) SH=x; }catch(e){}
  const shSave=()=>ls('tm_shop',JSON.stringify(SH));
  const dbx=()=>{ try{ return (typeof DB!=='undefined'&&DB)?DB:null; }catch(e){ return null; } };
  async function shPut(path,o){ const D=dbx(); if(!D) return false; try{ await D.doc(path).set(o); return true; }catch(e){ return false; } }
  (function shSub(n){ const D=dbx(); if(!D){ if(n<120) setTimeout(()=>shSub(n+1),1000); return; }
    try{ D.collection('shop').onSnapshot(s=>{ try{
      (s.docs||[]).map(d=>d.data&&d.data()).filter(Boolean).forEach(o=>{ if(o.kind==='items') SH.items=o.items||[]; else if(o.kind==='req'&&o.id) SH.req[o.id]=o; });
      shSave(); shRefresh(); }catch(e){} },()=>{}); }catch(e){} })(0);
  const shItems=()=>Array.isArray(SH.items)?SH.items:[];
  function shRefresh(){ try{ if($('tpShopG')) openShop(); }catch(e){} try{ if($('tpShopP')) openShopPar(); }catch(e){} try{ shGate(); }catch(e){} try{ if(hubOpen()) hubTick(); }catch(e){} }
  function openShop(){
    const P=prof(); if(!P||!S().open||!window.TM_AVX) return; const pid=P.id;
    if(!$('tpShopG')) S().open();
    const box=$('txIn'); if(!box) return; box.dataset.v='';
    const bal=TM_AVX.bal(pid), mine=Object.values(SH.req).filter(r=>r.pid===pid).sort((a,b)=>b.at-a.at).slice(0,6);
    let h=S().bar('💝 חנות ההורים')+'<div class="tx-card" id="tpShopG"><p class="tx-big" style="text-align:center;margin:0 0 6px">יש לך '+bal+' 💎</p>'+
      '<p class="tx-note" style="text-align:center;margin:0 0 6px">קונים פרס אמיתי — אבא ואמא מאשרים</p>';
    shItems().forEach(it=>{ h+='<div class="sh-it"><span class="e">'+E(it.e)+'</span><span class="b">'+E(it.n)+'<small>'+it.c+' 💎</small></span><button type="button" data-buy="'+E(it.id)+'"'+(bal<it.c?' disabled':'')+'>'+(bal<it.c?'עוד '+(it.c-bal)+' 💎':'לקנות')+'</button></div>'; });
    if(mine.length) h+='<div class="al-ex"><span>הקניות שלי</span></div>'+mine.map(r=>'<div class="sh-it"><span class="e">'+E(r.e)+'</span><span class="b">'+E(r.n)+'<small>'+(r.st==='ok'?'✅ אבא ואמא אישרו!':r.st==='no'?'↩️ לא הפעם — ה-💎 חזרו אלייך':'⏳ מחכה לאבא ואמא')+'</small></span></div>').join('');
    box.innerHTML=h+'</div>'; S().wireBar();
    box.querySelectorAll('[data-buy]').forEach(b=>b.onclick=async()=>{
      const it=shItems().find(x=>x.id===b.dataset.buy); if(!it) return;
      if(b.dataset.sure!=='1'){ b.dataset.sure='1'; b.textContent='בטוח? ✔'; return; }
      b.disabled=true;
      const A=TM_AVX.avOf(pid); if(TM_AVX.bal(pid)<it.c) return openShop();
      A.own=(A.own||[]).slice(); A.wear=Object.assign({},A.wear||{}); A.spent=(+A.spent||0)+it.c;
      await TM_AVX.save(pid,A);
      const r={kind:'req',id:pid+'_'+Date.now().toString(36),pid,iid:it.id,e:it.e,n:it.n,c:it.c,at:Date.now(),st:'wait'};
      SH.req[r.id]=r; shSave(); await shPut('shop/'+r.id,r);
      confetti(); toast('💝 שלחנו לאבא ואמא! ⏳'); openShop();
    });
  }
  function shopTile(){
    const row=$('hbMoreRow'), P=prof(); if(!row||!P||KIDS.indexOf(P.id)<0) return;
    let b=$('tpShop'); if(!shItems().length){ if(b) b.remove(); return; }
    if(!b||!row.contains(b)){ b=document.createElement('button'); b.type='button'; b.className='tx-tile'; b.id='tpShop'; b.onclick=openShop; row.appendChild(b); }
    const h='<span class="ic">💝</span>חנות ההורים<small>פרסים אמיתיים</small>'; if(b._h!==h){ b._h=h; b.innerHTML=h; }
  }
  function zooTile(){
    const row=$('hbMoreRow'), P=prof(); if(!row||!P||KIDS.indexOf(P.id)<0) return;
    let b=$('tpZoo'); if(!b||!row.contains(b)){ b=document.createElement('button'); b.type='button'; b.className='tx-tile'; b.id='tpZoo'; b.onclick=openZoo; row.appendChild(b); }
    const h='<span class="ic">🐾</span>גן החיות שלי<small>'+zooOf(P.id).length+' חיות</small>'; if(b._h!==h){ b._h=h; b.innerHTML=h; }
  }
  /* אזור ההורים */
  function openShopPar(){
    let o=$('tpShopOv');
    if(!o){ o=document.createElement('div'); o.className='ov'; o.id='tpShopOv'; o.innerHTML='<div class="ov-box" id="tpShopP"></div>'; o.addEventListener('click',e=>{ if(e.target===o) o.classList.remove('show'); }); document.body.appendChild(o); }
    o.classList.add('show');
    const B=$('tpShopP'); if(B.contains(document.activeElement)&&document.activeElement.tagName==='INPUT') return;
    const L=(shItems().length?shItems():SH_DEF).map(x=>Object.assign({},x));
    const wait=Object.values(SH.req).filter(r=>r.st==='wait').sort((a,b)=>a.at-b.at);
    const done=Object.values(SH.req).filter(r=>r.st!=='wait').sort((a,b)=>b.at-a.at).slice(0,8);
    B.innerHTML='<h2>💝 חנות ההורים</h2>'+
      (wait.length?'<div class="rp-sec">⏳ מחכה לאישור</div>'+wait.map(r=>'<div class="sh-it"><span class="e">'+E(r.e)+'</span><span class="b">'+E(NMs(r.pid))+': '+E(r.n)+'<small>'+r.c+' 💎</small></span><button type="button" data-ok="'+E(r.id)+'">✅</button><button type="button" class="sec" data-no="'+E(r.id)+'">❌</button></div>').join(''):'')+
      '<div class="rp-sec">🎁 הפרסים</div><p class="rp-note">סמל · שם · מחיר ב-💎 (כל תשובה נכונה = 1 💎)</p><div id="shL">'+
      L.map((x,i)=>'<div class="sh-row" data-i="'+i+'"><input class="e" maxlength="4" value="'+E(x.e)+'" aria-label="סמל"><input class="n" maxlength="30" value="'+E(x.n)+'" aria-label="שם"><input class="c" type="number" min="1" max="5000" value="'+(+x.c||50)+'" aria-label="מחיר"><button type="button" data-del="'+i+'" aria-label="מחיקה">🗑️</button></div>').join('')+
      '</div><div class="ov-row"><button type="button" id="shAdd">➕ פרס</button><button type="button" class="pri" id="shSv">💾 שמירה</button></div>'+
      (shItems().length?'':'<p class="rp-note">אלה הצעות. הבנות יראו את החנות רק אחרי שמירה.</p>')+
      (done.length?'<div class="rp-sec">אחרונים</div>'+done.map(r=>'<p class="rp-note">'+(r.st==='ok'?'✅':'❌')+' '+E(NMs(r.pid))+': '+E(r.e)+' '+E(r.n)+'</p>').join(''):'')+
      '<div class="ov-row"><button type="button" id="shClose">סגירה</button></div>';
    const read=()=>[...B.querySelectorAll('#shL .sh-row')].map((rw,i)=>{ const q=c=>rw.querySelector('input.'+c).value.trim();
      return {id:(L[i]&&L[i].id)||('i'+Date.now().toString(36)+i),e:q('e')||'🎁',n:q('n'),c:Math.max(1,Math.min(5000,Math.round(+q('c')||0)))}; }).filter(x=>x.n);
    B.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{ b.closest('.sh-row').remove(); });
    $('shAdd').onclick=()=>{ const d=document.createElement('div'); d.className='sh-row'; d.innerHTML='<input class="e" maxlength="4" value="🎁" aria-label="סמל"><input class="n" maxlength="30" placeholder="שם הפרס" aria-label="שם"><input class="c" type="number" min="1" max="5000" value="50" aria-label="מחיר"><button type="button" aria-label="מחיקה">🗑️</button>'; d.querySelector('button').onclick=()=>d.remove(); $('shL').appendChild(d); d.querySelector('input.n').focus(); };
    $('shSv').onclick=async()=>{ const items=read(); SH.items=items; shSave(); const ok=await shPut('shop/items',{kind:'items',items,at:Date.now()}); toast(ok?'💾 נשמר':'💾 נשמר בטלפון — יעלה לענן כשיהיה חיבור'); document.activeElement&&document.activeElement.blur&&document.activeElement.blur(); openShopPar(); };
    $('shClose').onclick=()=>o.classList.remove('show');
    const decide=async(id,ok)=>{ const r=SH.req[id]; if(!r||r.st!=='wait') return;
      if(!ok&&window.TM_AVX){ const A=TM_AVX.avOf(r.pid); A.own=(A.own||[]).slice(); A.wear=Object.assign({},A.wear||{}); A.spent=Math.max(0,(+A.spent||0)-r.c); await TM_AVX.save(r.pid,A); }
      const nr=Object.assign({},r,{st:ok?'ok':'no',at2:Date.now()}); SH.req[id]=nr; shSave(); await shPut('shop/'+id,nr); openShopPar(); shGate(); };
    B.querySelectorAll('[data-ok]').forEach(b=>b.onclick=()=>decide(b.dataset.ok,true));
    B.querySelectorAll('[data-no]').forEach(b=>b.onclick=()=>decide(b.dataset.no,false));
  }
  function shGate(){
    const gate=$('gate'); if(!gate||lockPid()) return;
    const wait=Object.values(SH.req).filter(r=>r.st==='wait');
    let b=$('gqShop');
    if(!wait.length){ if(b) b.remove(); return; }
    if(!b){ b=document.createElement('button'); b.type='button'; b.id='gqShop'; b.className='gq-shop'; b.onclick=openShopPar; const row=gate.querySelector('.gate-row'); if(row) row.before(b); else return; }
    const t='💝 '+wait.map(r=>NMs(r.pid)+' קנתה '+r.e+' '+r.n).join(' · ')+' — לאשר?'; if(b.textContent!==t) b.textContent=t;
  }
  (function parBtn(){
    if(typeof window.showDash!=='function'){ return; }
    const _sd=window.showDash;
    window.showDash=function(){ const p=_sd.apply(this,arguments);
      const add=()=>{ const top=document.querySelector('#parentBox .dash-top'); if(top&&!$('dShop')){ const b=document.createElement('button'); b.type='button'; b.id='dShop'; b.textContent='💝 חנות ההורים'; b.onclick=openShopPar; top.appendChild(b); } };
      add(); const bx=$('parentBox'); if(bx){ const mo=new MutationObserver(add); mo.observe(bx,{childList:true}); setTimeout(()=>mo.disconnect(),20000); }
      return p; };
  })();
  if(typeof window.renderGate==='function'){ const _rg2=window.renderGate; window.renderGate=function(){ const r=_rg2.apply(this,arguments); try{ shGate(); }catch(e){} return r; }; }
  setTimeout(shGate,2000);

  /* ---------------- חיבורים ---------------- */
  let sisC={k:'',t:0,v:''};
  chipsMore=function(pid){
    if(KIDS.indexOf(pid)<0) return '';
    let h='';
    const eg=eggsOf(pid);
    if(eg.length) h+='<button type="button" class="tp-chip egg" id="tpEgg"><span class="i">'+eggE(Math.max(...eg.map(e=>e.p)))+'</span><span>הביצים שלי · '+eg.map(e=>{ const s=subjOf(e.ex); return (s?s.i:'')+' '+e.p+'%'; }).join(' · ')+'<small>ב-'+HATCH+'% מוכנה הביצה בוקעת</small></span></button>';
    if(sisC.k!==pid||Date.now()-sisC.t>60000) sisC={k:pid,t:Date.now(),v:sisNews(pid)};
    if(sisC.v) h+='<div class="tp-chip sis"><span class="i">📣</span><span>'+E(sisC.v)+'</span></div>';
    setTimeout(()=>hatchCheck(pid),900);
    return h;
  };
  document.addEventListener('click',e=>{ if(e.target.closest&&e.target.closest('#tpEgg')) openZoo(); });
  const _albumTile=albumTile;
  albumTile=function(){ _albumTile(); try{ zooTile(); }catch(e){} try{ shopTile(); }catch(e){} };
  const _tr2=window.tRec;
  if(typeof _tr2==='function') window.tRec=function(game,it,ok){ try{ if(game!=='pre') towerAns(!!ok); }catch(e){} return _tr2.apply(this,arguments); };
  new MutationObserver(()=>{ try{ towerBtns(); }catch(e){}
    try{ const e2=[...document.querySelectorAll('.tx-end,.m-res')].find(x=>x.offsetParent!==null&&!x.dataset.tmTow); if(e2){ e2.dataset.tmTow='1'; towerEnd(); } }catch(e){} })
    .observe(document.body,{childList:true,subtree:true});
  if(typeof window.showHub==='function'){ const _sh2=window.showHub; window.showHub=function(){ towerOff(); return _sh2.apply(this,arguments); }; }

  window.TM_PLAY={openAlbum,albumOf,pbInfo,showChest,badge,combo:()=>Object.assign({},CB),openZoo,eggsOf,openShop,openShopPar,tower:()=>Object.assign({},TW)};
})();

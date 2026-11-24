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
    if(b.innerHTML!==h) b.innerHTML=h;
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
    if(el.innerHTML!==h) el.innerHTML=h;
  }

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

  window.TM_PLAY={openAlbum,albumOf,pbInfo,showChest,badge,combo:()=>Object.assign({},CB)};
})();

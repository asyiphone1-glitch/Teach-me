/* teach-me — 🧭 מסך בית עם סרגל לשוניות (27.11.2026, אושר ע״י ההורה)
   ישיבת צוות 27.11: במקום ~18 כרטיסים במסך אחד — 4 לשוניות למטה:
   📚 לומדת · 📅 בחינות · 🎁 אוצרות · 🏆 מתחרים
   - שום תכונה לא נמחקת: כל כרטיס קיים מקבל data-tt של הלשונית שלו, ו-CSS מסתיר את השאר.
   - "בואי נלמד" (#ttGo) = כפתור חכם אחד שמחליף את הספירה לאחור (.cd-ban), "להמשיך ללמוד" (#tmResume)
     ו"שאלות שחוזרות" (#txRev): אם יש שאלות שחוזרות היום והבחינה לא מחר/היום — מתחילים בהן (פעם ביום), אחרת לבחינה.
   - לא אצל אבא (המסך שלו נשאר כמו שהיה).
   28.11.2026 (ביקש ההורה): בלשונית "לומדת" אין יותר כפתור "בואי נלמד". למעלה מיד: המקצועות שיש להם בחינה,
     עם התאריך והספירה לאחור — לוחצים על מקצוע ונכנסים לתפריט של הבחינה. "שאלות שחוזרות" נשאר כאריח קטן מתחת.
   - משווים el._h ולא innerHTML — אחרת MutationObserver נכנס ללולאה. */
(function(){
  const $=id=>document.getElementById(id);
  const prof=()=>{ try{ return (typeof PROFILE!=='undefined'&&PROFILE)||null; }catch(e){ return null; } };
  const day=()=>{ const d=new Date(); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); };
  const lsG=k=>{ try{ return localStorage.getItem(k); }catch(e){ return null; } };
  const lsS=(k,v)=>{ try{ localStorage.setItem(k,v); }catch(e){} };
  const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const css=document.createElement('style'); css.id='tmTabsCss';
  css.textContent=
'body.tmT #hubBox{padding-bottom:104px;}'+
'body.tmT #hubBox [data-tt="x"]{display:none!important;}'+
'body.tmT[data-tt="learn"] #hubBox [data-tt]:not([data-tt~="learn"]):not([data-tt="all"]){display:none!important;}'+
'body.tmT[data-tt="exams"] #hubBox [data-tt]:not([data-tt~="exams"]):not([data-tt="all"]){display:none!important;}'+
'body.tmT[data-tt="treasures"] #hubBox [data-tt]:not([data-tt~="treasures"]):not([data-tt="all"]){display:none!important;}'+
'body.tmT[data-tt="compete"] #hubBox [data-tt]:not([data-tt~="compete"]):not([data-tt="all"]){display:none!important;}'+
'body.tmT #hbMore{display:block!important;animation:none!important;}'+
'#ttNav{display:none;}'+
'body.tmT #ttNav{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));position:fixed;left:0;right:0;bottom:0;z-index:5;'+
  'background:rgba(17,26,43,.97);border-top:1px solid #24314a;padding:6px 6px calc(8px + env(safe-area-inset-bottom,0px));direction:rtl;}'+
'#ttNav button{background:transparent;border:none;color:#9aa3b2;display:flex;flex-direction:column;align-items:center;gap:3px;'+
  'min-height:56px;padding:6px 0;font-family:"Heebo",sans-serif;font-weight:700;font-size:.9rem;cursor:pointer;-webkit-tap-highlight-color:transparent;}'+
'#ttNav button svg{width:26px;height:26px;}'+
'#ttNav button[aria-current="page"]{color:#8ecbff;}'+
'#ttGo{display:flex;flex-direction:column;align-items:center;gap:6px;width:100%;box-sizing:border-box;border:none;border-radius:26px;'+
  'background:#8ecbff;color:#0d2b52;padding:18px 16px 16px;margin:2px 0 14px;font-family:"Heebo",sans-serif;cursor:pointer;text-align:center;'+
  'box-shadow:0 6px 18px rgba(30,90,170,.25);}'+
'#ttGo .rg{width:76px;height:76px;border-radius:50%;display:flex;align-items:center;justify-content:center;}'+
'#ttGo .rg i{width:62px;height:62px;border-radius:50%;background:#8ecbff;display:flex;align-items:center;justify-content:center;font-style:normal;}'+
'#ttGo .rg svg{width:34px;height:34px;}'+
'#ttGo b{font-size:1.85rem;font-weight:800;line-height:1.1;}'+
'#ttGo small{display:block;font-size:1.02rem;font-weight:600;line-height:1.45;}'+
'#ttGo small.rv{font-weight:800;}'+
'#ttTitle{margin:6px 0 14px;font-family:"Heebo",sans-serif;font-size:1.7rem;font-weight:800;}'+
'@media (prefers-reduced-motion: reduce){#ttGo{box-shadow:none;}}'+
/* 28.11: בלשונית "לומדת" — המקצועות של הבחינות קודם, מיד אחרי "היי" */
'body.tmT[data-tt="learn"] #hubBox{display:flex;flex-direction:column;}'+
'body.tmT[data-tt="learn"] #hubBox > .sy-who{order:-6;}'+
'body.tmT[data-tt="learn"] #hubBox > .hub-nav{order:-5;}'+
'body.tmT[data-tt="learn"] #hubBox > .hub-hi{order:-4;}'+
'body.tmT[data-tt="learn"] #hubBox > #ttTitle{order:-3;margin:4px 0 10px;}'+
'body.tmT[data-tt="learn"] #hubBox > .hub-grid{order:-2;}'+
'body.tmT #ttGo{display:none!important;}'+
'.hub-sbtn .tt-dt{font-style:normal;font-size:.95rem;font-weight:700;opacity:.9;}';
  document.head.appendChild(css);

  const TABS=[
    {k:'learn',n:'לומדת',t:'📅 הבחינות שלי',svg:'<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>'},
    {k:'exams',n:'בחינות',t:'📅 הבחינות שלי',svg:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'},
    {k:'treasures',n:'אוצרות',t:'🎁 האוצרות שלי',svg:'<rect x="3" y="9" width="18" height="12" rx="1"/><path d="M2 9h20M12 9v12M12 9c-2-5-7-5-6-1M12 9c2-5 7-5 6-1"/>'},
    {k:'compete',n:'מתחרים',t:'🏆 מתחרים',svg:'<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 14v4M8 21h8"/>'}
  ];
  let cur='learn', lastPid=null;

  /* לאיזו לשונית שייך כל כרטיס. לא מוכר = "לומדת" — כדי ששום דבר חדש לא ייעלם */
  const BY_ID={
    tmEve:'learn', avTile:'learn', ttGo:'x', txRev:'learn',
    tmResume:'x', hbMoreBtn:'x', myBoard:'x',
    tmMock:'exams', msTile:'exams', txUp:'exams',
    t3Av:'treasures', tpAlb:'treasures', tpZoo:'treasures', tpShop:'treasures', tpEgg:'treasures',
    txDuel:'compete', wkHubBtn:'compete', pdCard:'compete',
    ttTitle:'learn exams treasures compete'
  };
  const CONTAINERS={txTiles:1, tmPlay:1, hbMore:1, hbMoreRow:1};
  function tabOf(el){
    if(el.id&&BY_ID[el.id]) return BY_ID[el.id];
    const c=el.classList;
    if(c.contains('sy-who')||c.contains('hub-nav')) return 'all';
    if(c.contains('hub-hi')) return 'learn';
    if(el.tagName==='H2') return 'x';   /* "מה לומדת היום?" — הכפתור החכם עונה על זה */
    if(c.contains('cd-ban')) return 'x';
    if(c.contains('st-bar')) return 'learn';
    if(c.contains('hub-grid')) return 'learn exams';
    if(c.contains('hub-arch')) return 'exams';
    if(c.contains('hub-foot')) return 'x';
    if(c.contains('tp-chip')){
      if(c.contains('egg')) return 'treasures';
      if(c.contains('pb')||c.contains('sis')) return 'compete';
      return 'learn';
    }
    return 'learn';
  }
  function tagAll(box){
    const walk=par=>{ for(const el of par.children){
      if(el.id&&CONTAINERS[el.id]){ if(el.dataset.tt!=='all') el.dataset.tt='all'; walk(el); continue; }
      const t=tabOf(el); if(el.dataset.tt!==t) el.dataset.tt=t;
    } };
    walk(box);
  }

  /* ---------- "בואי נלמד" ---------- */
  function info(){
    const ban=document.querySelector('#hubBox .cd-ban'), rs=$('tmResume'), rv=$('txRev');
    let line='', pct=0, soon=false, mid=false;
    if(ban){
      const b=ban.querySelector('.big'); line=(b?b.textContent:'').replace(/^⏳\s*/,'').trim();
      soon=/היום הבחינה|מחר הבחינה/.test(line);
      const bar=ban.querySelector('.cd-bar i'); if(bar) pct=parseInt(bar.style.width,10)||0;
      if(!bar&&soon) pct=100;
    }
    if(rs){ mid=/מאיפה שעצרת/.test(rs.textContent); if(!line){ const s=rs.querySelector('small'); line=s?s.textContent.trim():''; } }
    let due=0; if(rv){ const s=rv.querySelector('small'); const m=/(\d+)/.exec(s?s.textContent:''); if(m) due=+m[1]; }
    const P=prof(), rvDone=P&&lsG('tm_tt_rv_'+P.id)===day();
    const rvFirst=due>0&&!rvDone&&!soon;
    return {ban,rs,rv,line,pct,soon,mid,due,rvFirst,any:!!(ban||rs)};
  }
  function goSmart(){
    const I=info(), P=prof();
    if(I.rvFirst&&I.rv){ if(P) lsS('tm_tt_rv_'+P.id,day()); I.rv.click(); return; }
    if(I.rs&&I.mid){ I.rs.click(); return; }
    if(I.ban){ I.ban.click(); return; }
    if(I.rs){ I.rs.click(); return; }
    setTab('exams');
  }
  function smart(box){
    let b=$('ttGo');
    if(!b){ b=document.createElement('button'); b.type='button'; b.id='ttGo'; b.dataset.tt='learn'; b.onclick=goSmart; }
    const anchor=box.querySelector(':scope > .hub-hi')||box.querySelector(':scope > h2')||box.querySelector(':scope > .hub-nav');
    if(anchor&&b.previousElementSibling!==anchor) anchor.after(b); else if(!b.parentNode) box.prepend(b);
    const I=info();
    const mins=Math.round(I.pct/10);
    let sub='';
    if(I.line) sub+='<small>'+E(I.line)+'</small>';
    if(I.ban&&!I.soon) sub+='<small>'+(mins>=10?'סיימת 10 דקות היום! 🌟':mins+' מתוך 10 דקות היום')+'</small>';
    if(I.rvFirst) sub+='<small class="rv">מתחילות ב-'+Math.min(I.due,10)+' שאלות שחוזרות 🔁</small>';
    if(!I.any&&!I.rvFirst) sub+='<small>בוחרות בחינה ומתחילות</small>';
    const ring='background:conic-gradient(#0d2b52 0 '+I.pct+'%,rgba(13,43,82,.18) '+I.pct+'% 100%)';
    const h='<span class="rg" style="'+ring+'" aria-hidden="true"><i><svg viewBox="0 0 24 24"><path fill="#0d2b52" d="M17 5v14L6 12z"/></svg></i></span>'+
      '<b>בואי נלמד</b>'+sub;
    if(b._h!==h){ b._h=h; b.innerHTML=h; }
  }
  function title(box){
    let t=$('ttTitle');
    if(!t){ t=document.createElement('h3'); t.id='ttTitle'; t.dataset.tt=BY_ID.ttTitle; }
    const nav=box.querySelector(':scope > .hub-nav');
    if(nav&&t.previousElementSibling!==nav) nav.after(t); else if(!t.parentNode) box.prepend(t);
    const T=TABS.find(x=>x.k===cur), s=T?T.t:'';
    if(t._h!==s){ t._h=s; t.textContent=s; }
  }

  /* 28.11: תאריך הבחינה על כל כפתור מקצוע ("יום ב׳ 30.11") */
  function dates(box){
    let D=null; try{ D=(typeof DATES!=='undefined')?DATES:null; }catch(e){}
    if(!D||typeof fmtDate!=='function') return;
    box.querySelectorAll('.hub-grid .hub-sbtn[data-ex]').forEach(b=>{
      if(b.closest('details')) return;
      const v=D[b.dataset.ex]; const t=v?fmtDate(v):'';
      let i=b.querySelector(':scope > .tt-dt');
      if(!t){ if(i) i.remove(); return; }
      if(!i){ i=document.createElement('i'); i.className='tt-dt'; const chip=b.querySelector(':scope > .cd-chip'); if(chip) chip.before(i); else b.appendChild(i); }
      if(i._h!==t){ i._h=t; i.textContent='📅 '+t; }
    });
  }

  /* ---------- הסרגל למטה ---------- */
  function nav(){
    const hub=$('hub'); if(!hub) return;
    let n=$('ttNav');
    if(!n){
      n=document.createElement('nav'); n.id='ttNav'; n.setAttribute('aria-label','לשוניות');
      n.innerHTML=TABS.map(T=>'<button type="button" data-k="'+T.k+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+T.svg+'</svg>'+T.n+'</button>').join('');
      n.querySelectorAll('button').forEach(b=>b.onclick=()=>setTab(b.dataset.k));
    }
    if(n.parentNode!==hub) hub.appendChild(n);
    n.querySelectorAll('button').forEach(b=>{ if(b.dataset.k===cur) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current'); });
  }
  function setTab(k){
    cur=k; document.body.dataset.tt=k;
    const box=$('hubBox'); if(box) title(box);
    nav();
    const hub=$('hub'); if(hub) hub.scrollTop=0;
  }

  let busy=false;
  function apply(){
    const box=$('hubBox'), hub=$('hub'), P=prof();
    const on=!!(box&&hub&&P&&P.id!=='dad');
    document.body.classList.toggle('tmT',on);
    if(!on) return;
    if(P.id!==lastPid){ lastPid=P.id; cur='learn'; }
    if(document.body.dataset.tt!==cur) document.body.dataset.tt=cur;
    busy=true;
    try{ smart(box); title(box); dates(box); tagAll(box); nav(); }catch(e){ try{ console.warn('tm-tabs',e); }catch(_){} }
    busy=false;
  }
  let qd=0;
  function later(){ if(busy||qd) return; qd=setTimeout(()=>{ qd=0; apply(); },40); }

  function start(){
    const box=$('hubBox'), hub=$('hub'); if(!box||!hub) return false;
    new MutationObserver(later).observe(box,{childList:true,subtree:true});
    new MutationObserver(()=>{ if(!hub.classList.contains('hide')) later(); }).observe(hub,{attributes:true,attributeFilter:['class']});
    if(typeof showHub==='function'){
      const _sh=showHub;
      showHub=function(){ const r=_sh.apply(this,arguments); try{ apply(); }catch(e){} return r; };
    }
    apply();
    return true;
  }
  if(!start()){ addEventListener('DOMContentLoaded',start,{once:true}); }
  window.TM_TABS={set:setTab,get:()=>cur,apply};
})();

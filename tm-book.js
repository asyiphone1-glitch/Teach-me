/* ================================================================
   teach-me — 27.11.2026 (ישיבת צוות, אושר): 🎲 משחקי החוברת — מיכל
   משחקים שמופיעים בחוברת של הילדה, בתוך האפליקציה:
   🔤 תפזורת — נוגעים באות הראשונה ואז באות האחרונה של מילה (ימין←שמאל או למעלה←למטה).
   🔺 פירמידה — כל קומה = הקומה הקודמת + אות אחת. בוחרים את המילה הנכונה לכל קומה.
   כל מילה/קומה נכונה נרשמת כמו תשובה נכונה (tRec, משחק 'book') → 💎 וקומבו.
   הנושא '🎲 משחקי החוברת' לא נכנס לטבעת המוכנות של הנושאים.
   הכפתורים מופיעים במסך החומר (ליד "✏️ לתרגל הכול") רק בבחינות שיש להן משחקים ב-BOOK.
   ================================================================ */
(function(){
  const $=id=>document.getElementById(id);
  const E=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const S=()=>window.TM_SMART||{};
  const TP='🎲 משחקי החוברת';
  const curEx=()=>{ try{ return (typeof CUR_EXAM!=='undefined'&&CUR_EXAM)?CUR_EXAM:null; }catch(e){ return null; } };
  const rec=(q,ok,chosen,right)=>{ try{ window.tRec('book',{q,tp:TP},!!ok,chosen,right); }catch(e){} };
  const yay=()=>{ try{ mConfetti(); }catch(e){} };

  /* ---------- המשחקים לכל בחינה ---------- */
  const BOOK={
    'up-aviv-torah1':{
      ws:{
        title:'תפזורת המנחה (עמ׳ 20)',
        grid:['גאצנדבהשיה','תכתגפאנכהן','סולתתטתנור','עמרחשתדצממ','תסמלחבעפשח','פשאזעלנעלב','קמתצשקיטבת','רןפפאהנלונ','הדבשוחמשנו','דמחחרעחנהי'],
        clues:[
          {c:'1. לא שמים אותם במנחה',w:['שאור','דבש']},
          {c:'2. מרכיבי המנחה',w:['סולת','שמן','לבונה']},
          {c:'3. מאיזה סוג הקורבן הזה',w:['נדבה']},
          {c:'4. מי רגיל להביא מנחה',w:['עני']},
          {c:'5. מי מקבל חלק מהמנחה',w:['כהן']},
          {c:'6. שלושה סוגי מנחות',w:['מחבת','מרחשת','תנור']},
          {c:'7. מה חייבים לשים בקורבן',w:['מלח']}
        ]
      },
      pyr:{
        title:'הפירמידה (עמ׳ 20)',
        note:'כל קומה = הקומה שמעליה + אות אחת 🔺',
        rows:[
          {c:'האות שערכה 100',a:'ק',o:['ק','ר','מ']},
          {c:'ההפך מקשה',a:'קל',o:['קל','רך','קר']},
          {c:'"אביב קלוי באש" נקרא בתנ״ך',a:'קלי',o:['קלי','קמח','גרש']},
          {c:'"לא ל... המרוץ" (קהלת ט׳, י״א)',a:'קלים',o:['קלים','רצים','קטנים']}
        ]
      }
    }
  };
  window.TM_BOOK=BOOK;

  const css=document.createElement('style');
  css.textContent=`
.bk-grid{display:grid;grid-template-columns:repeat(10,1fr);gap:3px;direction:rtl;margin:8px auto 10px;max-width:360px;user-select:none;-webkit-user-select:none;}
.bk-grid button{aspect-ratio:1;border:1.5px solid #D8CDB8;border-radius:8px;background:#FFFDF8;font-family:'Heebo',sans-serif;font-weight:800;font-size:1.05rem;color:#3A2E22;padding:0;touch-action:manipulation;}
.bk-grid button.st{background:#FFE9A8;border-color:#E0A82E;}
.bk-grid button.fd{background:#CDEBC4;border-color:#6DB35D;color:#245A1B;}
.bk-grid button.no{animation:bkNo .35s;}
@keyframes bkNo{25%{transform:translateX(-3px)}75%{transform:translateX(3px)}}
.bk-cl{list-style:none;margin:0;padding:0;font-family:'Heebo',sans-serif;}
.bk-cl li{padding:6px 0;border-bottom:1px dashed #E5DCCB;font-size:.98rem;line-height:1.5;}
.bk-cl li:last-child{border-bottom:0;}
.bk-cl .w{display:inline-block;margin:2px 3px 0 0;padding:1px 9px;border-radius:999px;background:#F1ECE2;color:#B3A68E;font-weight:800;}
.bk-cl .w.fd{background:#CDEBC4;color:#245A1B;}
.bk-pyr{display:flex;flex-direction:column;align-items:center;gap:5px;margin:8px 0 12px;direction:rtl;}
.bk-pyr .r{display:flex;gap:5px;}
.bk-pyr .c{width:44px;height:44px;border:2px solid #C9B48A;border-radius:9px;background:#FFFDF8;display:flex;align-items:center;justify-content:center;font-family:'Heebo',sans-serif;font-weight:900;font-size:1.4rem;color:#3A2E22;}
.bk-pyr .r.cur .c{border-color:#E0A82E;background:#FFF4D6;}
.bk-pyr .r.ok .c{background:#CDEBC4;border-color:#6DB35D;animation:bkPop .4s;}
@keyframes bkPop{50%{transform:scale(1.12)}}
.bk-opts{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;}
.bk-opts button{min-width:84px;min-height:56px;border-radius:14px;border:2px solid #9BB7E6;background:#EEF4FF;font-family:'Heebo',sans-serif;font-weight:900;font-size:1.3rem;color:#22344F;}
.bk-opts button.no{border-color:#D9534F;background:#FFE3E0;animation:bkNo .35s;}
`;
  document.head.appendChild(css);

  function open(title,back){ const s=S(); if(!s.open) return null; s.open(); const box=$('txIn'); box.innerHTML=s.bar(title); s.wireBar(back); return box; }

  /* ---------- 🔤 תפזורת ---------- */
  function playWS(exId,back){
    const G=BOOK[exId]&&BOOK[exId].ws; if(!G) return;
    const N=G.grid.length, M=G.grid[0].length;
    const all=[]; G.clues.forEach(c=>c.w.forEach(w=>all.push(w)));
    const found=new Set(); let start=null, miss=0;
    const box=open('🔤 תפזורת',back); if(!box) return;
    box.insertAdjacentHTML('beforeend','<div class="tx-card"><p class="tx-note" style="text-align:center;margin:0">נוגעים באות הראשונה ואז באות האחרונה של המילה 👆</p>'+
      '<div class="bk-grid" id="bkG">'+G.grid.map((row,y)=>[...row].map((ch,x)=>'<button type="button" data-y="'+y+'" data-x="'+x+'">'+E(ch)+'</button>').join('')).join('')+'</div>'+
      '<p class="tx-note" id="bkCnt" style="text-align:center;margin:0 0 4px"></p></div>'+
      '<div class="tx-card"><ul class="bk-cl" id="bkCl"></ul></div>');
    const cell=(y,x)=>box.querySelector('#bkG [data-y="'+y+'"][data-x="'+x+'"]');
    function paint(){
      $('bkCl').innerHTML=G.clues.map(c=>'<li>'+E(c.c)+'<br>'+c.w.map(w=>'<span class="w'+(found.has(w)?' fd':'')+'">'+(found.has(w)?E(w):'_ '.repeat(w.length).trim())+'</span>').join('')+'</li>').join('');
      $('bkCnt').textContent='מצאת '+found.size+' מתוך '+all.length+' מילים';
    }
    function line(a,b){ /* רק שורה (ימין←שמאל) או עמודה (למעלה←למטה) */
      const out=[];
      if(a.y===b.y){ const s=Math.sign(b.x-a.x)||1; for(let x=a.x;x!==b.x+s;x+=s) out.push([a.y,x]); }
      else if(a.x===b.x){ const s=Math.sign(b.y-a.y); for(let y=a.y;y!==b.y+s;y+=s) out.push([y,a.x]); }
      return out;
    }
    box.querySelector('#bkG').addEventListener('click',ev=>{
      const b=ev.target.closest('button'); if(!b) return;
      const p={y:+b.dataset.y,x:+b.dataset.x};
      if(!start){ start=p; b.classList.add('st'); return; }
      const c0=cell(start.y,start.x); if(c0) c0.classList.remove('st');
      const L=line(start,p); start=null;
      if(L.length<2) return;
      const w=L.map(([y,x])=>G.grid[y][x]).join(''), rw=[...w].reverse().join('');
      const hit=all.find(x=>(x===w||x===rw)&&!found.has(x));
      if(hit){
        found.add(hit); L.forEach(([y,x])=>cell(y,x).classList.add('fd'));
        rec('תפזורת: '+hit,true,hit,hit); paint();
        if(found.size===all.length){ yay(); setTimeout(()=>{ box.insertAdjacentHTML('beforeend','<div class="tx-card" style="text-align:center"><p class="tx-big">🎉 מצאת את כל המילים!</p>'+(miss?'':'<p class="tx-note">בלי אף טעות 💪</p>')+'<button type="button" class="tx-next" id="bkBack">⬅ חזרה לחומר</button></div>'); $('bkBack').onclick=back; $('bkBack').scrollIntoView({behavior:'smooth',block:'center'}); },600); }
      } else { miss++; L.forEach(([y,x])=>{ const c=cell(y,x); c.classList.remove('no'); void c.offsetWidth; c.classList.add('no'); }); }
    });
    paint();
  }

  /* ---------- 🔺 פירמידה ---------- */
  function playPyr(exId,back){
    const P=BOOK[exId]&&BOOK[exId].pyr; if(!P) return;
    let i=0, first=true;
    const box=open('🔺 פירמידה',back); if(!box) return;
    box.insertAdjacentHTML('beforeend','<div class="tx-card"><p class="tx-note" style="text-align:center;margin:0">'+E(P.note)+'</p><div class="bk-pyr" id="bkP"></div><p class="tx-big" id="bkQ" style="text-align:center;margin:0 0 10px"></p><div class="bk-opts" id="bkO"></div></div>');
    function draw(){
      $('bkP').innerHTML=P.rows.map((r,k)=>'<div class="r'+(k<i?' ok':k===i?' cur':'')+'">'+[...r.a].map(ch=>'<div class="c">'+(k<i?E(ch):'')+'</div>').join('')+'</div>').join('');
      if(i>=P.rows.length){ $('bkQ').textContent='🎉 בנית את כל הפירמידה!'; $('bkO').innerHTML='<button type="button" id="bkBack" style="min-width:180px">⬅ חזרה לחומר</button>'; $('bkBack').onclick=back; yay(); return; }
      const r=P.rows[i]; first=true;
      $('bkQ').textContent='קומה '+(i+1)+': '+r.c;
      const o=r.o.slice(); for(let k=o.length-1;k>0;k--){ const j=Math.floor(Math.random()*(k+1)); [o[k],o[j]]=[o[j],o[k]]; }
      $('bkO').innerHTML=o.map(w=>'<button type="button" data-w="'+E(w)+'">'+E(w)+'</button>').join('');
    }
    box.querySelector('#bkO').addEventListener('click',ev=>{
      const b=ev.target.closest('button[data-w]'); if(!b||i>=P.rows.length) return;
      const r=P.rows[i], ok=b.dataset.w===r.a;
      if(first) rec('פירמידה: '+r.c,ok,b.dataset.w,r.a);
      if(ok){ i++; draw(); }
      else { first=false; b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); if(i>0) b.title='רמז: מתחילה ב'+P.rows[i-1].a; }
    });
    draw();
  }

  /* ---------- כפתורים במסך החומר ---------- */
  function btns(){
    const a=$('upAll'); if(!a||$('bkBtns')) return;
    const ex=curEx(); const B=ex&&BOOK[ex.id]; if(!B) return;
    const exId=ex.id;
    const wrap=document.createElement('div'); wrap.id='bkBtns';
    wrap.innerHTML=(B.ws?'<button type="button" class="tx-next sec" id="bkWs">🔤 תפזורת מהחוברת</button>':'')+(B.pyr?'<button type="button" class="tx-next sec" id="bkPy">🔺 פירמידה מהחוברת</button>':'');
    const tow=$('tpTowUp'); (tow||a).after(wrap);
    /* חזרה למסך החומר, עם אותו "חזרה" שהיה לו */
    const go=fn=>{ const ob=$('txBack')&&$('txBack').onclick; const P=(typeof PROFILE!=='undefined'&&PROFILE)?PROFILE.id:null;
      const home=()=>{ try{ if(P&&window.TM_UP&&TM_UP.openMat) return TM_UP.openMat(P,exId,ob||(()=>S().close())); }catch(e){} try{ S().close(); }catch(e){} };
      fn(exId,home); };
    if($('bkWs')) $('bkWs').onclick=()=>go(playWS);
    if($('bkPy')) $('bkPy').onclick=()=>go(playPyr);
  }
  new MutationObserver(()=>{ try{ btns(); }catch(e){} }).observe(document.body,{childList:true,subtree:true});
  window.TM_BOOKG={playWS,playPyr};
})();

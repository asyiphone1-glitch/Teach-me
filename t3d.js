/* ================================================================
   6.11.2026 (לבקשת ההורה): טקס הזוכות — סרט מצויר בתלת־ממד
   - במה תלת־ממדית אמיתית (three.js): וילונות שנפתחים, זרקורים, פודיום זהב/כסף/ארד,
     שלט נורות, קונפטי, זיקוקים, בלונים, קופסת מתנה, כתר ומדליות.
   - הדמויות: הציורים של אביב, רוני, הילי, זיו ואבא, כדמויות תלת־ממדיות עם עובי וצל.
   - אבא הוא המכריז: עומד ליד דוכן עם מיקרופון ומכריז על כל מקום.
   - אם אין WebGL / three.js לא נטען / "🎥 להכין סרטון" — הטקס הקודם רץ כרגיל.
   ================================================================ */
(function(){
  if(window.TM3D) return;
  const LIB='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  let LOADP=null;
  function loadThree(){
    if(window.THREE&&window.THREE.WebGLRenderer) return Promise.resolve(window.THREE);
    if(LOADP) return LOADP;
    LOADP=new Promise((ok,no)=>{ const s=document.createElement('script'); s.src=LIB; s.async=true;
      s.onload=()=>window.THREE?ok(window.THREE):no(new Error('three')); s.onerror=()=>no(new Error('three'));
      document.head.appendChild(s); setTimeout(()=>no(new Error('timeout')),30000); });
    LOADP.catch(()=>{ LOADP=null; }); return LOADP;
  }
  function glOK(){ try{ const c=document.createElement('canvas'); return !!(window.WebGLRenderingContext&&(c.getContext('webgl')||c.getContext('experimental-webgl'))); }catch(e){ return false; } }
  try{ const l=document.createElement('link'); l.rel='stylesheet'; l.href='https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&display=swap'; document.head.appendChild(l); }catch(e){}

  /* ---------- מסך ---------- */
  const css=document.createElement('style');
  css.textContent=`
#t3d{position:fixed;inset:0;z-index:2147483000;background:#0d0a26;display:none;overflow:hidden;touch-action:manipulation;-webkit-user-select:none;user-select:none}
#t3d.show{display:block}
#t3d canvas{position:absolute;inset:0;width:100%!important;height:100%!important;display:block}
#t3d .t3-bar{position:absolute;top:calc(10px + env(safe-area-inset-top,0px));left:60px;right:60px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap;z-index:8}
#t3d .t3-bar button,#t3d .t3-go{font:700 15px Heebo,sans-serif;padding:9px 18px;border-radius:999px;border:2px solid rgba(255,255,255,.55);background:rgba(20,10,40,.55);color:#fff;cursor:pointer;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
#t3d .t3-bar button.pri{background:#F3C24E;color:#2b1a00;border-color:#F3C24E}
#t3d .t3-x{position:absolute;top:calc(10px + env(safe-area-inset-top,0px));left:10px;width:42px;height:42px;border-radius:50%;border:2px solid rgba(255,255,255,.6);background:rgba(20,10,40,.6);color:#fff;font:700 20px Heebo,sans-serif;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:9}
#t3d .t3-txt{position:absolute;left:0;right:0;text-align:center;pointer-events:none;z-index:4;direction:ltr;font-family:Fredoka,'Secular One',Heebo,sans-serif;font-weight:700;line-height:1.02;padding:0 10px;opacity:0;transform:scale(.4);transition:opacity .25s,transform .45s cubic-bezier(.2,1.6,.4,1)}
#t3d .t3-txt.on{opacity:1;transform:scale(1)}
#t3d #t3T,#t3d #t3S{background:radial-gradient(ellipse at center,rgba(14,8,40,.62) 0%,rgba(14,8,40,.38) 42%,rgba(14,8,40,0) 70%);padding:6px 10px 10px}
#t3d #t3T{top:calc(11% + env(safe-area-inset-top,0px));font-size:min(13vw,7.4vh);color:#FFD54A;-webkit-text-stroke:2px #2A1638;text-shadow:0 5px 0 #8A4A00,0 9px 22px rgba(0,0,0,.55)}
#t3d #t3S{top:calc(11% + min(15vw,8.6vh) + env(safe-area-inset-top,0px));font-size:min(6.4vw,3.6vh);color:#fff;text-shadow:0 3px 0 #2A1638,0 6px 16px rgba(0,0,0,.6)}
#t3d #t3P{top:calc(11% + min(25vw,14vh) + env(safe-area-inset-top,0px))}
#t3d #t3P span{display:inline-block;font-size:min(7vw,4vh);padding:6px 22px;border-radius:999px;background:linear-gradient(#FFE58A,#F0B429);color:#3a2200;border:3px solid #2A1638;box-shadow:0 5px 0 #2A1638,0 10px 24px rgba(0,0,0,.4)}
#t3d .t3-bub{position:absolute;z-index:6;width:max-content;max-width:min(68vw,380px);background:#fff;color:#2A1638;border-radius:20px;padding:9px 15px 10px;font:700 min(4.6vw,19px)/1.3 Fredoka,Heebo,sans-serif;direction:ltr;text-align:center;box-shadow:0 8px 26px rgba(0,0,0,.45);border:3px solid #A3262F;transform:translate(-50%,-100%) scale(.6);opacity:0;transition:opacity .2s,transform .3s cubic-bezier(.2,1.5,.4,1);pointer-events:none}
#t3d .t3-bub.on{opacity:1;transform:translate(-50%,-100%) scale(1)}
#t3d .t3-bub b{display:block;font-size:.72em;letter-spacing:.04em;margin-bottom:1px}
#t3d .t3-bub i{position:absolute;bottom:-13px;left:50%;margin-left:-11px;width:0;height:0;border:11px solid transparent;border-top:13px solid #fff;border-bottom:0}
#t3d .t3-bub.dock{transform:translate(-50%,0) scale(1)}#t3d .t3-bub.dock i{display:none}
#t3d .t3-start{position:absolute;inset:0;z-index:7;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center;color:#fff;background:radial-gradient(circle at 50% 40%,rgba(60,30,120,.55),rgba(10,6,30,.88));padding:20px}
#t3d .t3-start .tr{font-size:84px;filter:drop-shadow(0 10px 18px rgba(0,0,0,.5));animation:t3b 1.6s ease-in-out infinite}
@keyframes t3b{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-12px) rotate(4deg)}}
#t3d .t3-start .big{direction:ltr;font:700 min(11vw,56px)/1.05 Fredoka,'Secular One',sans-serif;color:#FFD54A;-webkit-text-stroke:2px #2A1638;text-shadow:0 5px 0 #8A4A00}
#t3d .t3-start small{font:600 15px/1.5 Heebo,sans-serif;opacity:.92;max-width:420px}
#t3d .t3-go{font-size:22px!important;padding:14px 34px!important;background:#F3C24E!important;color:#2b1a00!important;border-color:#fff!important;box-shadow:0 8px 24px rgba(243,194,78,.45)}
#t3d .t3-go:disabled{opacity:.6}
#t3d .t3-prog{position:absolute;left:0;right:0;bottom:0;height:6px;background:rgba(255,255,255,.12);z-index:5}
#t3d .t3-prog i{display:block;height:100%;width:0;background:#F3C24E;margin-left:auto}
`;
  document.head.appendChild(css);
  const ov=document.createElement('div'); ov.id='t3d'; ov.setAttribute('role','dialog'); ov.setAttribute('aria-label','טקס הזוכות');
  ov.innerHTML='<div class="t3-txt" id="t3T"></div><div class="t3-txt" id="t3S"></div><div class="t3-txt" id="t3P"></div>'+
    '<div class="t3-bub" id="t3B"></div><div class="t3-bar" id="t3Bar"></div><button type="button" class="t3-x" id="t3X" aria-label="סגירה">✕</button><div class="t3-prog"><i id="t3Pr"></i></div>';
  const mount=()=>{ if(!ov.parentNode) document.body.appendChild(ov); };
  if(document.body) mount(); else addEventListener('DOMContentLoaded',mount);
  const $=id=>ov.querySelector('#'+id);
  function tap(el,fn){ el.onclick=fn; el.addEventListener('touchend',e=>{ e.preventDefault(); fn(e); },{passive:false}); }

  /* ---------- מצב ---------- */
  const AGE={ziv:1.1,roni:.97,hili:.97,aviv:.84,dad:1.2};
  const KCOL={aviv:'#14A39B',roni:'#E0447F',hili:'#E07A22',ziv:'#3F7BE6',dad:'#A3262F'};
  const TEXC={};
  let THREE=null, R=null, CTX=null, D=null, RUN=0, raf=0, renderer=null, scene=null, camera=null, cnv=null;
  let ANIMS=[], CH={}, W3={}, tPrev=0, wNow=0, startEl=null;

  function imgUrl(pid){ try{ if(window.TM_IMG) return TM_IMG(pid,'full'); }catch(e){} return 'img/'+pid+'-full.webp'; }
  function loadTex(pid){
    if(TEXC[pid]) return TEXC[pid];
    TEXC[pid]=new Promise(ok=>{ const im=new Image(); im.decoding='async';
      im.onload=()=>ok(im); im.onerror=()=>ok(null); im.src=imgUrl(pid); setTimeout(()=>ok(im.naturalWidth?im:null),15000); });
    return TEXC[pid];
  }

  /* ---------- open ---------- */
  function open(d,ctx){
    if(!glOK()) return false;
    const rows=(ctx&&ctx.rows)||[]; if(!rows.length) return false;
    D=d; CTX=ctx; R=rows;
    mount(); stop(); ov.classList.add('show');
    tap($('t3X'),close);
    bar('<button type="button" id="t3C">סגירה</button>'); tap($('t3C'),close);
    if(startEl) startEl.remove();
    startEl=document.createElement('div'); startEl.className='t3-start';
    const rng=(ctx.wkRange?ctx.wkRange(d.ws):'');
    startEl.innerHTML='<div class="tr">🏆</div><div class="big">Winners Show<br>of the Week</div>'+
      '<small>'+rng+' · סרט מצויר בתלת־ממד · אבא מכריז על הזוכים 🎤</small>'+
      '<button type="button" class="t3-go" id="t3Go" disabled>⏳ מכינים את הבמה…</button><small>כדאי להגביר את הקול 🔊</small>';
    ov.appendChild(startEl);
    const go=startEl.querySelector('#t3Go');
    const pids=[...new Set(R.map(r=>r.pid).concat(['dad']))];
    Promise.all([loadThree(),...pids.map(loadTex)]).then(([T,...ims])=>{
      if(!ov.classList.contains('show')||!startEl) return;
      THREE=T; const IM={}; pids.forEach((p,i)=>IM[p]=ims[i]);
      try{ build(IM); }catch(e){ console.warn('t3d build',e); return fallback(); }
      go.disabled=false; go.textContent='▶️ להתחיל!';
      tap(go,()=>{ if(go.disabled) return; go.disabled=true; unlock(); startEl.remove(); startEl=null; play(); });
    }).catch(e=>{ console.warn('t3d',e); fallback(); });
    return true;
  }
  function fallback(){ const d=D; close(true); try{ window.TM3D_OFF=true; window.tmCeremony&&window.tmCeremony(d,false); }finally{ window.TM3D_OFF=false; } }
  function bar(h){ $('t3Bar').innerHTML=h; }
  function close(keepHash){
    stop(); ov.classList.remove('show'); if(startEl){ startEl.remove(); startEl=null; }
    if(keepHash!==true){ try{ if(location.hash==='#tekes') history.replaceState(null,'',location.pathname+location.search); }catch(e){} }
  }
  addEventListener('keydown',e=>{ if(e.key==='Escape'&&ov.classList.contains('show')) close(); });
  function stop(){
    RUN++; cancelAnimationFrame(raf); raf=0; ANIMS=[];
    try{ speechSynthesis.cancel(); }catch(e){}
    mStop(); try{ if(SIL) SIL.pause(); }catch(e){}
    try{ if(AC) AC.close(); }catch(e){} AC=null; MASTER=null;
    txt('T',''); txt('S',''); txt('P',''); bub(null);
    if(renderer){ try{ scene.traverse(o=>{ if(o.geometry) o.geometry.dispose(); }); renderer.dispose(); renderer.forceContextLoss&&renderer.forceContextLoss(); }catch(e){} }
    if(cnv&&cnv.parentNode) cnv.remove(); renderer=null; scene=null; camera=null; cnv=null; CH={};
    removeEventListener('resize',onResize);
  }

  /* ---------- כלים ---------- */
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)), lerp=(a,b,p)=>a+(b-a)*p;
  const ease=x=>1-Math.pow(1-clamp(x,0,1),3), easeIO=x=>{ x=clamp(x,0,1); return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2; };
  const bounceOut=x=>{ x=clamp(x,0,1); const n=7.5625,d=2.75; if(x<1/d) return n*x*x; if(x<2/d) return n*(x-=1.5/d)*x+.75; if(x<2.5/d) return n*(x-=2.25/d)*x+.9375; return n*(x-=2.625/d)*x+.984375; };
  function tween(dur,fn){ return new Promise(res=>ANIMS.push({t0:performance.now(),dur:dur*1000,fn,res})); }
  function ctex(w,h,draw){ const c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d'); draw(g,w,h); const t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding; t.anisotropy=4; return t; }
  function rrect(g,x,y,w,h,r){ g.beginPath(); g.moveTo(x+r,y); g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r); g.arcTo(x,y+h,x,y,r); g.arcTo(x,y,x+w,y,r); g.closePath(); }
  function txt(k,h,cls){ const el=$('t3'+k); if(!el) return; if(!h){ el.classList.remove('on'); return; } el.innerHTML=h; if(k==='T') el.style.fontSize=String(h).replace(/<[^>]*>|&[a-z]+;/g,'').length>12?'min(9.5vw,5.4vh)':''; el.classList.remove('on'); void el.offsetWidth; el.classList.add('on'); }
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  /* ---------- בניית הבמה ---------- */
  const POD={1:{x:0,w:1.45,h:1.2,c:0xF2C14E,e:0x6a4a00},2:{x:1.55,w:1.35,h:.85,c:0xD9DEE8,e:0x30343c},3:{x:-1.55,w:1.35,h:.55,c:0xD9894A,e:0x4a2208}};
  const SPOT4={x:-2.5,z:.8}, SPOT5={x:-3.0,z:-1.0}, LECT={x:2.0,z:2.45};
  function build(IM){
    cnv=document.createElement('canvas'); ov.insertBefore(cnv,ov.firstChild);
    renderer=new THREE.WebGLRenderer({canvas:cnv,antialias:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.outputEncoding=THREE.sRGBEncoding; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.0;
    scene=new THREE.Scene(); scene.background=new THREE.Color(0x140d38); scene.fog=new THREE.Fog(0x140d38,16,34);
    camera=new THREE.PerspectiveCamera(46,1,.1,120);
    onResize(); addEventListener('resize',onResize);
    W3={}; CH={};

    /* אור */
    W3.amb=new THREE.HemisphereLight(0xc8b8ff,0x3a2414,.6); scene.add(W3.amb);
    const key=new THREE.SpotLight(0xfff2dd,1.5,40,.62,.55,1); key.position.set(0,10,7); key.target.position.set(0,.8,0);
    key.castShadow=true; key.shadow.mapSize.set(1024,1024); key.shadow.camera.near=4; key.shadow.camera.far=24; key.shadow.bias=-.0006;
    scene.add(key,key.target); W3.key=key;
    const fill=new THREE.DirectionalLight(0x9fb4ff,.35); fill.position.set(-6,4,6); scene.add(fill); W3.fill=fill;
    const rim=new THREE.DirectionalLight(0xff9ad0,.45); rim.position.set(4,6,-6); scene.add(rim); W3.rim=rim;

    /* רצפת הבמה */
    const plank=ctex(512,512,(g,w,h)=>{ for(let i=0;i<8;i++){ const y=i*h/8; g.fillStyle=['#9A5E32','#8E5429','#A0653A','#93592E'][i%4]; g.fillRect(0,y,w,h/8);
        g.fillStyle='rgba(0,0,0,.28)'; g.fillRect(0,y,w,3); const off=(i%2)*w/2; g.fillRect((off+w*.35)%w,y,3,h/8);
        for(let k=0;k<26;k++){ g.fillStyle='rgba(60,25,5,'+(.05+Math.random()*.07)+')'; g.fillRect(Math.random()*w,y+4+Math.random()*(h/8-8),40+Math.random()*120,1.5); } } });
    plank.wrapS=plank.wrapT=THREE.RepeatWrapping; plank.repeat.set(3,2);
    const floor=new THREE.Mesh(new THREE.BoxGeometry(18,.4,9.5),new THREE.MeshStandardMaterial({map:plank,roughness:.42,metalness:.08}));
    floor.position.set(0,-.2,.6); floor.receiveShadow=true; scene.add(floor);
    const trim=new THREE.Mesh(new THREE.BoxGeometry(18,.16,.16),new THREE.MeshStandardMaterial({color:0xE2A72E,metalness:.8,roughness:.3})); trim.position.set(0,-.02,5.35); scene.add(trim);
    const lip=new THREE.Mesh(new THREE.BoxGeometry(18,2.4,.3),new THREE.MeshStandardMaterial({color:0x5a0d1c,roughness:.8})); lip.position.set(0,-1.4,5.3); scene.add(lip);

    /* קיר אחורי עם כוכבים */
    const wall=new THREE.Mesh(new THREE.PlaneGeometry(26,16),new THREE.MeshBasicMaterial({map:ctex(1024,640,(g,w,h)=>{
      const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#0e0930'); gr.addColorStop(.6,'#1f1560'); gr.addColorStop(1,'#2c1f72'); g.fillStyle=gr; g.fillRect(0,0,w,h);
      const rg=g.createRadialGradient(w/2,h*.62,10,w/2,h*.62,w*.45); rg.addColorStop(0,'rgba(255,170,240,.22)'); rg.addColorStop(1,'rgba(255,190,255,0)'); g.fillStyle=rg; g.fillRect(0,0,w,h);
      for(let i=0;i<220;i++){ g.fillStyle='rgba(255,255,255,'+(.25+Math.random()*.7)+')'; g.beginPath(); g.arc(Math.random()*w,Math.random()*h*.85,Math.random()*1.8+.3,0,7); g.fill(); }
      g.strokeStyle='rgba(255,255,255,.07)'; g.lineWidth=2; for(let i=0;i<14;i++){ g.beginPath(); g.moveTo(w/2,h); g.lineTo(i*w/13,0); g.stroke(); } })}));
    wall.position.set(0,5.5,-4); scene.add(wall);

    /* שלט נורות */
    const sign=new THREE.Group(); sign.position.set(0,6.7,-3.6); sign.scale.setScalar(.85); scene.add(sign);
    const signT=ctex(1024,276,(g,w,h)=>{
        const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#B4123A'); gr.addColorStop(1,'#6E0A24'); g.fillStyle=gr; g.fillRect(0,0,w,h);
        g.font='700 150px Fredoka, "Secular One", sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.lineJoin='round';
        g.lineWidth=18; g.strokeStyle='#3a0412'; g.strokeText('WINNERS',w/2,h*.5); const tg=g.createLinearGradient(0,40,0,h-40); tg.addColorStop(0,'#FFF3B0'); tg.addColorStop(1,'#F0B429'); g.fillStyle=tg; g.fillText('WINNERS',w/2,h*.5); });
    const sb=new THREE.Mesh(new THREE.BoxGeometry(5.6,1.5,.3),[0,0,0,0,0,0].map((_,i)=>i===4?new THREE.MeshStandardMaterial({roughness:.5,map:signT,emissiveMap:signT,emissive:0xffffff,emissiveIntensity:.55}):new THREE.MeshStandardMaterial({color:0x7a0d26,roughness:.6})));
    sign.add(sb);
    W3.bulbOn=new THREE.MeshBasicMaterial({color:0xFFE38A}); W3.bulbOff=new THREE.MeshBasicMaterial({color:0x5a3a20});
    W3.bulbs=[]; const bg=new THREE.SphereGeometry(.065,10,8);
    for(let i=0;i<34;i++){ let x,y; if(i<12){ x=-2.65+i*(5.3/11); y=.66; } else if(i<24){ x=-2.65+(i-12)*(5.3/11); y=-.66; } else if(i<29){ x=-2.72; y=-.5+(i-24)*.25; } else { x=2.72; y=-.5+(i-29)*.25; }
      const b=new THREE.Mesh(bg,W3.bulbOn); b.position.set(x,y,.17); sign.add(b); W3.bulbs.push(b); }
    const ss=new THREE.Mesh(new THREE.PlaneGeometry(5.6,.5),new THREE.MeshBasicMaterial({transparent:true,map:ctex(1024,92,(g,w,h)=>{ g.font='700 60px Fredoka, sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillStyle='#FFE9A8'; g.fillText('★  SHOW OF THE WEEK  ★',w/2,h/2); })}));
    ss.position.set(0,-1.05,0); sign.add(ss);

    /* כוכבי זהב מסתובבים */
    W3.stars=[]; const sgeo=starGeo(); const smat=new THREE.MeshStandardMaterial({color:0xF3C24E,metalness:.85,roughness:.25,emissive:0x5a3a00});
    [[-3.6,4.9,-3],[3.6,4.6,-3],[-4.4,2.8,-2.4],[4.5,3.1,-2.2],[-2.6,6.6,-3.3],[2.9,6.8,-3.3]].forEach((p,i)=>{ const m=new THREE.Mesh(sgeo,smat); m.position.set(...p); m.scale.setScalar(.35+(i%3)*.1); scene.add(m); W3.stars.push(m); });

    /* פודיום */
    W3.pod={};
    [1,2,3].forEach(p=>{ const P=POD[p], g=new THREE.Group(); g.position.set(P.x,0,0); scene.add(g);
      const sh=new THREE.Shape(), w=P.w, dd=1.25, r=.12; sh.moveTo(-w/2+r,-dd/2); sh.lineTo(w/2-r,-dd/2); sh.quadraticCurveTo(w/2,-dd/2,w/2,-dd/2+r); sh.lineTo(w/2,dd/2-r); sh.quadraticCurveTo(w/2,dd/2,w/2-r,dd/2); sh.lineTo(-w/2+r,dd/2); sh.quadraticCurveTo(-w/2,dd/2,-w/2,dd/2-r); sh.lineTo(-w/2,-dd/2+r); sh.quadraticCurveTo(-w/2,-dd/2,-w/2+r,-dd/2);
      const geo=new THREE.ExtrudeGeometry(sh,{depth:P.h-.08,bevelEnabled:true,bevelThickness:.04,bevelSize:.04,bevelSegments:3,curveSegments:6}); geo.rotateX(-Math.PI/2); geo.translate(0,.04,0);
      const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:P.c,metalness:.62,roughness:.28,emissive:P.e,emissiveIntensity:.25})); m.castShadow=true; m.receiveShadow=true; g.add(m);
      const top=new THREE.Mesh(new THREE.BoxGeometry(w-.12,.05,dd-.12),new THREE.MeshStandardMaterial({color:0x8E1730,roughness:.75})); top.position.y=P.h+.01; top.receiveShadow=true; g.add(top);
      const num=new THREE.Mesh(new THREE.PlaneGeometry(.8,.8),new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,map:ctex(256,256,(c,W,H)=>{ c.font='700 210px Fredoka, "Secular One", sans-serif'; c.textAlign='center'; c.textBaseline='middle'; c.lineJoin='round'; c.lineWidth=22; c.strokeStyle='rgba(40,20,0,.75)'; c.strokeText(String(p),W/2,H*.56); c.fillStyle='#fff'; c.fillText(String(p),W/2,H*.56); })}));
      num.position.set(0,Math.max(.32,P.h*.5),dd/2+.05); num.scale.setScalar(p===1?.95:.8); g.add(num);
      W3.pod[p]={g,top:P.h+.035};
    });

    /* דוכן ומיקרופון של אבא */
    const lec=new THREE.Group(); lec.position.set(LECT.x-.12,0,LECT.z+.42); lec.rotation.y=-.35; scene.add(lec);
    const lgeo=new THREE.CylinderGeometry(.42,.32,1.05,6); lgeo.translate(0,.525,0);
    const lm=new THREE.Mesh(lgeo,new THREE.MeshStandardMaterial({color:0x3b2a8c,metalness:.3,roughness:.4})); lm.castShadow=true; lec.add(lm);
    const ltop=new THREE.Mesh(new THREE.BoxGeometry(.9,.06,.6),new THREE.MeshStandardMaterial({color:0xE2A72E,metalness:.8,roughness:.3})); ltop.position.y=1.08; ltop.rotation.x=.25; lec.add(ltop);
    const emb=new THREE.Mesh(new THREE.PlaneGeometry(.42,.42),new THREE.MeshBasicMaterial({transparent:true,map:ctex(128,128,(c,W,H)=>{ c.font='100px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('⭐',W/2,H/2+6); })})); emb.position.set(0,.6,.39); lec.add(emb);
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.55,8),new THREE.MeshStandardMaterial({color:0x222,metalness:.9,roughness:.3})); pole.position.set(.3,1.22,.02); pole.rotation.z=-.45; pole.rotation.x=-.15; lec.add(pole);
    const mic=new THREE.Mesh(new THREE.SphereGeometry(.075,16,12),new THREE.MeshStandardMaterial({color:0x2a2a2a,metalness:.6,roughness:.5})); mic.position.set(.42,1.45,0); lec.add(mic);
    W3.mic=mic;

    /* וילונות */
    W3.cur=[];
    const cgeo=new THREE.PlaneGeometry(3.6,11,56,1); const pa=cgeo.attributes.position;
    for(let i=0;i<pa.count;i++){ const x=pa.getX(i); pa.setZ(i,.2*Math.sin((x+1.8)/3.6*Math.PI*11)); } cgeo.computeVertexNormals();
    const cmat=new THREE.MeshStandardMaterial({color:0x9A0C26,roughness:.55,metalness:.08,side:THREE.DoubleSide,emissive:0x1a0005});
    [-1,1].forEach(s=>{ const g=new THREE.Group(); g.position.set(s*3.6,0,4.6); const m=new THREE.Mesh(cgeo,cmat); m.position.set(-s*1.8,4.6,0); g.add(m); scene.add(g); W3.cur.push(g); });
    const val=new THREE.Mesh(new THREE.BoxGeometry(9,1.2,.5),new THREE.MeshStandardMaterial({color:0x8E1730,roughness:.6})); val.position.set(0,8.1,4.7); scene.add(val);
    const tg=new THREE.TorusGeometry(.42,.05,8,24,Math.PI); const tm=new THREE.MeshStandardMaterial({color:0xE2A72E,metalness:.85,roughness:.25});
    for(let i=0;i<11;i++){ const t=new THREE.Mesh(tg,tm); t.position.set(-4.2+i*.84,7.5,4.97); t.rotation.z=Math.PI; scene.add(t); }

    /* זרקורים צבעוניים (קונוסים שקופים) */
    const gradA=ctex(4,128,(g,w,h)=>{ const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'rgba(255,255,255,0)'); gr.addColorStop(1,'rgba(255,255,255,1)'); g.fillStyle=gr; g.fillRect(0,0,w,h); });
    gradA.encoding=THREE.LinearEncoding;
    W3.beams=[0xffe7a8,0xff7ac0,0x7fd3ff,0xfff6d8].map((c,i)=>{
      const geo=new THREE.CylinderGeometry(.05,1.05,10,28,1,true); geo.translate(0,-5,0);
      const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:0,alphaMap:gradA,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
      const L=new THREE.SpotLight(c,0,22,.2,.6,1); scene.add(L,L.target);
      const pool=new THREE.Mesh(new THREE.CircleGeometry(1,32),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,map:soft()}));
      pool.rotation.x=-Math.PI/2; scene.add(m,pool);
      return {m,L,pool,src:new THREE.Vector3(i===3?0:(i===1?-4:4),9.2,i===3?5:2.5),tgt:new THREE.Vector3(0,0,0),to:new THREE.Vector3(0,0,0),a:0,aTo:0,col:c};
    });

    /* דמויות */
    const ids=[...new Set(R.map(r=>r.pid).concat(['dad']))];
    ids.forEach(pid=>{ if(IM[pid]) CH[pid]=mkChar(pid,IM[pid]); });
    if(CH.dad){ setPos(CH.dad,LECT.x,0,LECT.z); CH.dad.vis=true; CH.dad.g.visible=true; CH.dad.yawBase=-.3; }

    /* קונפטי */
    const CN=420, cg=new THREE.PlaneGeometry(.07,.12);
    const cm=new THREE.MeshBasicMaterial({side:THREE.DoubleSide});
    W3.conf=new THREE.InstancedMesh(cg,cm,CN); W3.conf.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(W3.conf);
    const CC=[0xF3C24E,0xE0447F,0x3F7BE6,0x14A39B,0xE07A22,0xffffff,0xB98CFF].map(c=>new THREE.Color(c));
    W3.cp=Array.from({length:CN},(_,i)=>{ W3.conf.setColorAt(i,CC[i%CC.length]); return {on:false,p:new THREE.Vector3(),v:new THREE.Vector3(),r:new THREE.Euler(),s:new THREE.Vector3(Math.random()*6,Math.random()*6,Math.random()*6)}; });
    W3.conf.instanceColor.needsUpdate=true; W3.cRain=0;
    /* זיקוקים */
    const FN=900, fg=new THREE.BufferGeometry(); fg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(FN*3),3)); fg.setAttribute('color',new THREE.BufferAttribute(new Float32Array(FN*3),3));
    W3.fw=new THREE.Points(fg,new THREE.PointsMaterial({size:.16,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,map:soft(),sizeAttenuation:true}));
    W3.fw.frustumCulled=false; scene.add(W3.fw);
    W3.fp=Array.from({length:FN},()=>({life:0,p:new THREE.Vector3(),v:new THREE.Vector3(),c:new THREE.Color()})); W3.fi=0;
    /* סימני שאלה */
    const qt=ctex(128,128,(c,W,H)=>{ c.font='700 110px Fredoka, sans-serif'; c.textAlign='center'; c.textBaseline='middle'; c.lineWidth=12; c.strokeStyle='#2A1638'; c.strokeText('?',W/2,H/2+6); c.fillStyle='#FFD54A'; c.fillText('?',W/2,H/2+6); });
    W3.qs=Array.from({length:30},()=>{ const s=new THREE.Sprite(new THREE.SpriteMaterial({map:qt,transparent:true,depthWrite:false})); s.visible=false; s.scale.setScalar(.5); scene.add(s); return {s,on:false,v:0}; });

    W3.dim=0; W3.dimTo=0; W3.shake=0; W3.danceOn=false; W3.orbit=0;
    W3.cam={p:new THREE.Vector3(0,3.4,8.2),l:new THREE.Vector3(0,3.2,4.6),P:new THREE.Vector3(0,3.4,8.2),L:new THREE.Vector3(0,3.2,4.6),k:2};
    camera.position.copy(W3.cam.p); camera.lookAt(W3.cam.l);
    tPrev=performance.now(); wNow=0;
    const loop=()=>{ raf=requestAnimationFrame(loop); frame(); }; raf=requestAnimationFrame(loop);
  }
  function soft(){ if(W3.softT) return W3.softT; W3.softT=ctex(64,64,(g,w,h)=>{ const r=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2); r.addColorStop(0,'rgba(255,255,255,1)'); r.addColorStop(.4,'rgba(255,255,255,.6)'); r.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=r; g.fillRect(0,0,w,h); }); W3.softT.encoding=THREE.LinearEncoding; return W3.softT; }
  function starGeo(){ const s=new THREE.Shape(); for(let i=0;i<10;i++){ const a=i/10*Math.PI*2-Math.PI/2, r=i%2?.42:1; const x=Math.cos(a)*r, y=-Math.sin(a)*r; i?s.lineTo(x,y):s.moveTo(x,y); } s.closePath();
    const g=new THREE.ExtrudeGeometry(s,{depth:.25,bevelEnabled:true,bevelThickness:.08,bevelSize:.08,bevelSegments:2}); g.center(); return g; }
  function onResize(){ if(!renderer) return; const w=ov.clientWidth||innerWidth, h=ov.clientHeight||innerHeight; renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); }

  /* ---------- דמות תלת־ממדית מהציור ---------- */
  function mkChar(pid,img){
    const tex=new THREE.Texture(img); tex.encoding=THREE.sRGBEncoding; tex.anisotropy=4; tex.needsUpdate=true;
    const ar=(img.naturalWidth||img.width)/(img.naturalHeight||img.height)||.35, h=1.7*(AGE[pid]||1), w=h*ar;
    const g=new THREE.Group(), piv=new THREE.Group(); g.add(piv); scene.add(g); g.visible=false;
    const geo=new THREE.PlaneGeometry(w,h); geo.translate(0,h/2,0);
    const front=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({map:tex,alphaTest:.45,roughness:.75,metalness:0,side:THREE.FrontSide}));
    front.castShadow=true; front.customDepthMaterial=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:tex,alphaTest:.45});
    piv.add(front);
    const edge=new THREE.MeshBasicMaterial({map:tex,alphaTest:.45,color:0x6b5578,side:THREE.DoubleSide});
    for(let k=1;k<=7;k++){ const m=new THREE.Mesh(geo,edge); m.position.z=-k*.009; piv.add(m); }
    const back=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({map:tex,alphaTest:.45,color:0xb7a6c9,roughness:.8,side:THREE.BackSide})); back.position.z=-.066; piv.add(back);
    const blob=new THREE.Mesh(new THREE.CircleGeometry(w*.55+.12,24),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.38,depthWrite:false,map:soft()}));
    blob.rotation.x=-Math.PI/2; blob.position.y=.012; blob.scale.set(1,.55,1); g.add(blob);
    const col=KCOL[pid]||'#E2A72E', nm=(R.find(r=>r.pid===pid)||{}).name||(pid==='dad'?'Dad':pid);
    const tag=new THREE.Sprite(new THREE.SpriteMaterial({depthWrite:false,transparent:true,map:ctex(512,160,(c,W,H)=>{ c.font='700 84px Fredoka, Heebo, sans-serif'; const tw=Math.min(W-30,c.measureText(nm).width+70);
      c.fillStyle='#2A1638'; rrect(c,(W-tw)/2-6,14,tw+12,H-28,60); c.fill(); c.fillStyle=col; rrect(c,(W-tw)/2,20,tw,H-40,54); c.fill();
      c.textAlign='center'; c.textBaseline='middle'; c.fillStyle='#fff'; c.fillText(nm,W/2,H/2+4); })}));
    tag.scale.set(1.15,.36,1); tag.position.y=h+.38; tag.visible=false; g.add(tag);
    const ch={pid,g,piv,h,w,col,name:nm,tag,blob,yaw:0,yawBase:0,spin:0,tilt:0,sq:1,hop:0,ph:Math.random()*6,talk:false,vis:false,medal:null,crown:null,balloons:null,dance:0};
    return ch;
  }
  function setPos(ch,x,y,z){ ch.g.position.set(x,y,z); }
  function show(ch){ if(!ch) return; ch.vis=true; ch.g.visible=true; }
  function medal(ch,place){
    const C={1:0xF3C24E,2:0xD3D9E3,3:0xCD8A52}[place];
    const m=new THREE.Group();
    const rib=new THREE.MeshStandardMaterial({color:new THREE.Color(ch.col),roughness:.6});
    [-1,1].forEach(s=>{ const b=new THREE.Mesh(new THREE.BoxGeometry(.07,.36,.012),rib); b.position.set(s*.075,.17,0); b.rotation.z=s*.38; m.add(b); });
    const disc=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.035,28),new THREE.MeshStandardMaterial({color:C,metalness:.9,roughness:.22,emissive:C,emissiveIntensity:.18}));
    disc.rotation.x=Math.PI/2; m.add(disc);
    const st=new THREE.Mesh(starGeo(),disc.material); st.scale.setScalar(.07); st.position.z=.03; m.add(st);
    m.position.set(0,ch.h*.64,.07); ch.piv.add(m); ch.medal=m; return m;
  }
  function crown(ch){
    const gold=new THREE.MeshStandardMaterial({color:0xF3C24E,metalness:.9,roughness:.2,emissive:0x6a4a00,emissiveIntensity:.3,side:THREE.DoubleSide});
    const c=new THREE.Group(); const band=new THREE.Mesh(new THREE.CylinderGeometry(.2,.22,.14,24,1,true),gold); c.add(band);
    for(let i=0;i<5;i++){ const a=i/5*Math.PI*2, s=new THREE.Mesh(new THREE.ConeGeometry(.055,.16,8),gold); s.position.set(Math.sin(a)*.2,.14,Math.cos(a)*.2); c.add(s);
      const j=new THREE.Mesh(new THREE.SphereGeometry(.03,8,6),new THREE.MeshStandardMaterial({color:[0xE0447F,0x3F7BE6,0x14A39B,0xE07A22,0xB98CFF][i],metalness:.3,roughness:.2})); j.position.set(Math.sin(a)*.215,0,Math.cos(a)*.215); c.add(j); }
    c.rotation.x=.12; c.position.set(0,ch.h-.03,.02); ch.piv.add(c); ch.crown=c; return c;
  }

  /* ---------- פריים ---------- */
  function frame(){
    if(!renderer) return;
    const now=performance.now(), dt=Math.min(.05,(now-tPrev)/1000); tPrev=now; wNow+=dt; const w=wNow;
    for(let i=ANIMS.length-1;i>=0;i--){ const a=ANIMS[i], p=clamp((now-a.t0)/a.dur,0,1); try{ a.fn(p); }catch(e){} if(p>=1){ ANIMS.splice(i,1); a.res(); } }
    /* מצלמה */
    const C=W3.cam, k=1-Math.exp(-dt*C.k);
    C.p.lerp(C.P,k); C.l.lerp(C.L,k);
    let cp=C.p.clone();
    if(W3.orbit){ const a=Math.sin(w*.35)*.55*W3.orbit, r=Math.hypot(cp.x-C.l.x,cp.z-C.l.z); cp.x=C.l.x+Math.sin(a)*r; cp.z=C.l.z+Math.cos(a)*r; }
    cp.x+=Math.sin(w*.6)*.06; cp.y+=Math.sin(w*.8)*.04;
    if(W3.shake>0){ cp.x+=(Math.random()-.5)*W3.shake; cp.y+=(Math.random()-.5)*W3.shake; W3.shake=Math.max(0,W3.shake-dt*1.6); }
    camera.position.copy(cp); camera.lookAt(C.l);
    /* אור */
    W3.dim=lerp(W3.dim,W3.dimTo,1-Math.exp(-dt*3));
    W3.amb.intensity=.6*(1-W3.dim*.8); W3.key.intensity=1.5*(1-W3.dim*.85); W3.fill.intensity=.35*(1-W3.dim*.7); W3.rim.intensity=.45*(1-W3.dim*.5);
    W3.beams.forEach(b=>{ b.a=lerp(b.a,b.aTo,1-Math.exp(-dt*4)); b.tgt.lerp(b.to,1-Math.exp(-dt*3.5));
      b.m.position.copy(b.src); const dir=b.tgt.clone().sub(b.src), len=dir.length(); dir.normalize();
      b.m.quaternion.setFromUnitVectors(new THREE.Vector3(0,-1,0),dir); b.m.scale.set(1,len/10,1); b.m.material.opacity=.16*b.a;
      b.L.position.copy(b.src); b.L.target.position.copy(b.tgt); b.L.intensity=2.4*b.a; b.pool.position.set(b.tgt.x,.02,b.tgt.z); b.pool.material.opacity=.45*b.a; b.pool.scale.setScalar(.95); });
    const ph=Math.floor(w*6); W3.bulbs.forEach((b,i)=>{ b.material=((ph+i)%3)?W3.bulbOn:W3.bulbOff; });
    W3.stars.forEach((s,i)=>{ s.rotation.y=w*(.6+i*.1); s.position.y+=Math.sin(w*1.3+i)*.002; });
    /* דמויות */
    Object.values(CH).forEach(ch=>{
      if(!ch.g.visible) return;
      const toCam=Math.atan2(camera.position.x-ch.g.position.x,camera.position.z-ch.g.position.z);
      ch.yaw=lerp(ch.yaw,toCam*.72+ch.yawBase*.4,1-Math.exp(-dt*4));
      let by=0, sq=ch.sq, tl=ch.tilt;
      if(ch.talk) by+=Math.abs(Math.sin(w*9))*.05;
      if(W3.danceOn&&ch.vis){ const b=Math.abs(Math.sin(w*Math.PI*2.1+ch.ph)); by+=b*.22; sq*=1-.06*(1-b); tl+=Math.sin(w*Math.PI*1.05+ch.ph)*.12; }
      const br=1+.012*Math.sin(w*2.3+ch.ph);
      ch.piv.position.y=by+ch.hop; ch.piv.rotation.y=ch.yaw+ch.spin; ch.piv.rotation.z=tl;
      ch.piv.scale.set(1/Math.sqrt(sq),sq*br,1/Math.sqrt(sq));
      ch.blob.scale.set(1/(1+ch.hop*.6),.55/(1+ch.hop*.6),1); ch.blob.material.opacity=.38/(1+ch.hop);
      if(ch.balloons) ch.balloons.forEach(b=>{ if(!b.m.visible) return; const t=b.m.position; t.x=ch.g.position.x+b.ox+Math.sin(w*1.8+b.ox*3)*.06; t.y=ch.g.position.y+ch.h+b.oy+Math.sin(w*2.2+b.ox)*.05; t.z=ch.g.position.z+b.oz;
        const pa=b.line.geometry.attributes.position; pa.setXYZ(0,ch.g.position.x,ch.g.position.y+ch.h*.82,ch.g.position.z+.05); pa.setXYZ(1,t.x,t.y-.36,t.z); pa.needsUpdate=true; });
    });
    /* קונפטי */
    const M=W3.M||(W3.M=new THREE.Matrix4()), Q=W3.Q||(W3.Q=new THREE.Quaternion()), S=W3.S1||(W3.S1=new THREE.Vector3(1,1,1)), Z=W3.Z0||(W3.Z0=new THREE.Vector3(0,0,0));
    if(W3.cRain>0){ let n=Math.floor(W3.cRain*dt*120); for(const c of W3.cp){ if(n<=0) break; if(!c.on){ c.on=true; c.p.set((Math.random()-.5)*8,7+Math.random()*2,(Math.random()-.5)*4+.5); c.v.set((Math.random()-.5)*.4,-1.2-Math.random()*.8,(Math.random()-.5)*.3); n--; } } }
    W3.cp.forEach((c,i)=>{ if(c.on){ c.v.y=Math.max(c.v.y-dt*2.2,-1.6); c.v.x+=Math.sin(w*3+i)*dt*.6; c.p.addScaledVector(c.v,dt); c.r.x+=c.s.x*dt; c.r.y+=c.s.y*dt; c.r.z+=c.s.z*dt; if(c.p.y<.02){ c.p.y=.02; c.v.set(0,0,0); c.s.set(0,0,0); c.r.x=-Math.PI/2; c.land=(c.land||0)+dt; if(c.land>4){ c.on=false; c.land=0; c.s.set(Math.random()*6,Math.random()*6,Math.random()*6); } }
        Q.setFromEuler(c.r); M.compose(c.p,Q,S); } else M.compose(Z,Q.identity(),Z); W3.conf.setMatrixAt(i,M); });
    W3.conf.instanceMatrix.needsUpdate=true;
    /* זיקוקים */
    const fpos=W3.fw.geometry.attributes.position, fcol=W3.fw.geometry.attributes.color;
    W3.fp.forEach((f,i)=>{ if(f.life>0){ f.life-=dt; f.v.y-=dt*1.1; f.v.multiplyScalar(1-dt*.9); f.p.addScaledVector(f.v,dt); const a=clamp(f.life/1.2,0,1); fpos.setXYZ(i,f.p.x,f.p.y,f.p.z); fcol.setXYZ(i,f.c.r*a,f.c.g*a,f.c.b*a); } else { fpos.setXYZ(i,0,-50,0); } });
    fpos.needsUpdate=true; fcol.needsUpdate=true;
    W3.qs.forEach(q=>{ if(!q.on) return; q.s.position.y-=q.v*dt; q.s.material.rotation+=dt*q.r; if(q.s.position.y<.2){ q.on=false; q.s.visible=false; } });
    renderer.render(scene,camera);
    placeBubble();
  }
  function confettiBurst(n,o,sp){ for(const c of W3.cp){ if(n<=0) break; if(c.on) continue; c.on=true; c.land=0; c.p.copy(o); const a=Math.random()*Math.PI*2, u=Math.random(); c.v.set(Math.cos(a)*sp*u,2.2+Math.random()*2.6,Math.sin(a)*sp*u*.6); c.s.set(Math.random()*8,Math.random()*8,Math.random()*8); n--; } }
  function firework(x,y,z,col){ const C=new THREE.Color(col); for(let k=0;k<90;k++){ const f=W3.fp[W3.fi]; W3.fi=(W3.fi+1)%W3.fp.length; const th=Math.random()*Math.PI*2, ph=Math.acos(2*Math.random()-1), sp=1.7+Math.random()*.5;
      f.p.set(x,y,z); f.v.set(Math.sin(ph)*Math.cos(th)*sp,Math.cos(ph)*sp,Math.sin(ph)*Math.sin(th)*sp*.6); f.life=1.1+Math.random()*.5; f.c.copy(C).lerp(new THREE.Color(0xffffff),Math.random()*.3); } }
  function qRain(){ W3.qs.forEach((q,i)=>{ setTimeout(()=>{ if(!renderer) return; q.on=true; q.s.visible=true; q.s.position.set((Math.random()-.5)*6,7+Math.random()*2,(Math.random()-.5)*3); q.v=2.2+Math.random()*1.6; q.r=(Math.random()-.5)*3; q.s.scale.setScalar(.35+Math.random()*.35); },i*110); }); }
  function beam(i,on,x,z){ const b=W3.beams[i]; b.aTo=on?1:0; if(x!=null){ b.to.set(x,0,z||0); if(!b.a) b.tgt.copy(b.to); } }
  function beamsOff(){ W3.beams.forEach(b=>b.aTo=0); }

  /* ---------- מצלמה ---------- */
  function wideDist(){ const a=camera.aspect||.5, t=Math.tan(camera.fov*Math.PI/360); return clamp(3.35/(t*a),8.5,17); }
  function camWide(k,yOff){ const d=wideDist(); W3.cam.P.set(0,2.3+d*.14+(yOff||0),d); W3.cam.L.set(0,1.55+(yOff||0)*.5,0); W3.cam.k=k||1.6; }
  function camOn(ch,dist,k,side){ const p=ch.g.position, d=(dist||4.4)*clamp(.56/(camera.aspect||.5),.85,1.5);
    W3.cam.P.set(p.x*.55+(side||0),p.y+ch.h*.62+.55,p.z+d); W3.cam.L.set(p.x,p.y+ch.h*.55,p.z); W3.cam.k=k||1.8; }
  function camAt(x,y,z,lx,ly,lz,k){ W3.cam.P.set(x,y,z); W3.cam.L.set(lx,ly,lz); W3.cam.k=k||1.8; }

  /* ---------- בועת דיבור ---------- */
  let BUBWHO=null;
  function bub(text,who){ const b=$('t3B'); if(!text){ b.classList.remove('on'); BUBWHO=null; return; }
    const ch=CH[who], col=(ch&&ch.col)||'#A3262F', nm=who==='dad'?'🎤 Dad':(ch?ch.name:'');
    b.style.borderColor=col; b.innerHTML='<b style="color:'+col+'">'+esc(nm)+'</b>'+esc(text)+'<i style="border-top-color:#fff"></i>';
    BUBWHO=who; b.classList.remove('on'); void b.offsetWidth; b.classList.add('on'); placeBubble(); }
  function placeBubble(){
    const b=$('t3B'); if(!BUBWHO||!camera) return; const ch=CH[BUBWHO]; const Wd=ov.clientWidth, Hd=ov.clientHeight;
    let x=Wd/2, y=Hd*.86, dock=true;
    if(ch&&ch.g.visible){ const v=ch.g.position.clone(); v.y+=ch.piv.position.y+ch.h+.12; v.project(camera);
      const sx=(v.x+1)/2*Wd, sy=(1-v.y)/2*Hd; if(v.z<1&&sy>Hd*.3&&sy<Hd*.95&&sx>0&&sx<Wd){ x=clamp(sx,Math.min(190,Wd*.38),Wd-Math.min(190,Wd*.38)); y=sy-6; dock=false; } }
    if(dock){ y=Hd*.80; }
    b.classList.toggle('dock',dock); b.style.left=x+'px'; b.style.top=y+'px';
  }

  /* ---------- קול ---------- */
  let VM=null, VF=null;
  function pickVoices(){
    let L=[]; try{ L=speechSynthesis.getVoices()||[]; }catch(e){}
    const en=L.filter(v=>/^en[-_]/i.test(v.lang));
    const find=list=>{ for(const r of list){ const v=en.find(v=>r.test(v.name)&&/en[-_]US/i.test(v.lang))||en.find(v=>r.test(v.name)); if(v) return v; } return null; };
    VM=find([/Andrew.*Natural/i,/Guy.*Natural/i,/Brian.*Natural/i,/Christopher.*Natural/i,/Eric.*Natural/i,/Davis.*Natural/i,/Roger.*Natural/i,/Steffan.*Natural/i,/Ryan.*Natural/i,/(Aaron|Evan|Nathan|Tom|Alex).*(Enhanced|Premium)/i,/Daniel.*(Enhanced|Premium)/i,/^Aaron/i,/^Alex$/i,/^Fred/i,/Google UK English Male/i,/Daniel/i,/\bMale\b/i]);
    VF=find([/Ava.*Natural/i,/Jenny.*Natural/i,/Aria.*Natural/i,/Emma.*Natural/i,/Ana.*Natural/i,/Natural/i,/Samantha.*(Enhanced|Premium)/i,/(Enhanced|Premium)/i,/Google US English/i,/Samantha/i,/Google UK English Female/i])||en[0]||null;
  }
  try{ speechSynthesis.addEventListener('voiceschanged',pickVoices); }catch(e){}
  const KP={aviv:1.5,roni:1.38,hili:1.45,ziv:1.25};
  function say(id,text,who){
    who=who||'dad';
    return new Promise(res=>{
      if(id!==RUN) return res();
      const est=1.1+String(text).replace(/[^A-Za-z0-9]/g,'').length*.07, t0=performance.now();
      bub(text,who); const ch=CH[who]; if(ch) ch.talk=true;
      let fin=false;
      const end=()=>{ if(fin) return; fin=true; const left=est*620-(performance.now()-t0);
        setTimeout(()=>{ if(ch) ch.talk=false; if(id===RUN) bub(null); setTimeout(res,180); },Math.max(0,left)); };
      let spoke=false;
      try{ if('speechSynthesis' in window){ if(!VF&&!VM) pickVoices();
        const u=new SpeechSynthesisUtterance(String(text).replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu,''));
        if(who==='dad'){ const v=VM||VF; if(v){ u.voice=v; u.lang=v.lang; } else u.lang='en-US'; u.pitch=VM?.95:.62; u.rate=.95; }
        else { const v=VF||VM; if(v){ u.voice=v; u.lang=v.lang; } else u.lang='en-US'; u.pitch=KP[who]||1.4; u.rate=1; }
        u.onend=end; u.onerror=end; if(speechSynthesis.paused) speechSynthesis.resume(); speechSynthesis.speak(u); spoke=true; } }catch(e){}
      setTimeout(end,spoke?est*2300+2500:est*1000);
    });
  }

  /* ---------- צלילים ומוזיקה ---------- */
  let AC=null, MASTER=null, NOISE=null, SIL=null, MB=null, MT=0, MN=0, MS=0, MI=.3, MMODE='off';
  function unlock(){
    try{ if(navigator.audioSession) navigator.audioSession.type='playback'; }catch(e){}
    try{ if(!SIL){ const sr=8000,n=sr/2,b=new ArrayBuffer(44+n*2),v=new DataView(b),wr=(o,t)=>{ for(let i=0;i<t.length;i++) v.setUint8(o+i,t.charCodeAt(i)); };
        wr(0,'RIFF'); v.setUint32(4,36+n*2,true); wr(8,'WAVEfmt '); v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,1,true); v.setUint32(24,sr,true); v.setUint32(28,sr*2,true); v.setUint16(32,2,true); v.setUint16(34,16,true); wr(36,'data'); v.setUint32(40,n*2,true);
        SIL=new Audio(URL.createObjectURL(new Blob([b],{type:'audio/wav'}))); SIL.loop=true; SIL.setAttribute('playsinline',''); }
      const p=SIL.play(); if(p&&p.catch) p.catch(()=>{}); }catch(e){}
    try{ AC=new (window.AudioContext||window.webkitAudioContext)(); MASTER=AC.createGain(); MASTER.gain.value=.8; MASTER.connect(AC.destination);
      const len=AC.sampleRate, b=AC.createBuffer(1,len,AC.sampleRate), d=b.getChannelData(0); for(let i=0;i<len;i++) d[i]=Math.random()*2-1; NOISE=b;
      if(AC.state!=='running') AC.resume(); const s=AC.createBufferSource(); s.buffer=AC.createBuffer(1,1,22050); s.connect(AC.destination); s.start(0); }catch(e){ AC=null; }
    try{ if('speechSynthesis' in window){ pickVoices(); speechSynthesis.cancel(); speechSynthesis.resume(); const u=new SpeechSynthesisUtterance('Hi'); u.volume=.01; u.rate=2; const v=VM||VF; if(v){ u.voice=v; u.lang=v.lang; } else u.lang='en-US'; speechSynthesis.speak(u); } }catch(e){}
  }
  const T=()=>AC?AC.currentTime:0;
  function hit(t,dur,f,q,vol,type,bus){ if(!AC) return; const s=AC.createBufferSource(); s.buffer=NOISE; const fl=AC.createBiquadFilter(); fl.type=type||'bandpass'; fl.frequency.value=f; fl.Q.value=q;
    const g=AC.createGain(); g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.001,t+dur); s.connect(fl); fl.connect(g); g.connect(bus||MASTER); s.start(t); s.stop(t+dur+.05); }
  function tone(t,f,dur,vol,type,bus,cut){ if(!AC) return; const o=AC.createOscillator(), g=AC.createGain(); o.type=type||'triangle'; o.frequency.value=f; let n=o;
    if(cut){ const lp=AC.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=cut; o.connect(lp); n=lp; }
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+.015); g.gain.setValueAtTime(vol,t+dur*.6); g.gain.exponentialRampToValueAtTime(.001,t+dur); n.connect(g); g.connect(bus||MASTER); o.start(t); o.stop(t+dur+.05); }
  function sweep(t,f0,f1,dur,vol,type){ if(!AC) return; const o=AC.createOscillator(), g=AC.createGain(); o.type=type||'sine'; o.frequency.setValueAtTime(f0,t); o.frequency.exponentialRampToValueAtTime(f1,t+dur);
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+.02); g.gain.exponentialRampToValueAtTime(.001,t+dur); o.connect(g); g.connect(MASTER); o.start(t); o.stop(t+dur+.05); }
  const FX={
    roll(d,pk){ const t=T(); let x=0; while(x<d){ const p=x/d; hit(t+x,.09,1800,.7,(.07+(pk||.4)*p)*(.8+Math.random()*.4)); x+=.1-.07*p; } },
    crash(){ const t=T(); hit(t,2.2,6000,.3,.5,'highpass'); hit(t,.3,110,1,.9,'lowpass'); },
    fanfare(big){ const t=T(), N=[523.25,659.25,783.99,1046.5]; N.forEach((f,i)=>tone(t+i*.13,f,.32,.15,'sawtooth',null,3500)); N.forEach(f=>tone(t+.56,f,big?1.8:1.1,.1,'triangle')); if(big) [587.33,739.99,880,1174.66].forEach(f=>tone(t+2.3,f,1.6,.08,'triangle')); },
    clap(d){ const t=T(); let x=0; while(x<d){ const e=Math.min(1,x/.3)*Math.min(1,(d-x)/.7); hit(t+x,.05,1400+Math.random()*1800,1.3,.15*e*(.5+Math.random()),'bandpass'); x+=.018+Math.random()*.03; } },
    boing(){ const t=T(); sweep(t,140,560,.16,.24); sweep(t+.16,560,240,.28,.16); },
    pop(){ const t=T(); hit(t,.09,2600,.8,.7,'highpass'); tone(t,880,.05,.07,'square'); },
    thud(){ hit(T(),.25,90,1,.8,'lowpass'); },
    whoosh(d){ if(!AC) return; const t=T(); d=d||1; const s=AC.createBufferSource(); s.buffer=NOISE; s.loop=true; const f=AC.createBiquadFilter(); f.type='bandpass'; f.Q.value=1.2; f.frequency.setValueAtTime(300,t); f.frequency.exponentialRampToValueAtTime(2400,t+d);
      const g=AC.createGain(); g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.22,t+d*.4); g.gain.linearRampToValueAtTime(0,t+d); s.connect(f); f.connect(g); g.connect(MASTER); s.start(t); s.stop(t+d+.05); },
    heart(d){ const t=T(); let x=0; while(x<d){ tone(t+x,55,.18,.5,'sine'); tone(t+x+.22,50,.16,.35,'sine'); x+=.85-.35*(x/d); } },
    ding(){ const t=T(); tone(t,1568,.7,.12,'sine'); tone(t+.02,2093,.55,.06,'sine'); },
    tap(){ const t=T(); hit(t,.08,500,1,.5,'lowpass'); hit(t+.32,.08,500,1,.5,'lowpass'); },
    boom(){ const t=T(); hit(t,.6,140,1,1,'lowpass'); hit(t,.4,3000,.5,.4,'highpass'); },
    crackle(){ const t=T(); for(let i=0;i<14;i++) hit(t+i*.035+Math.random()*.03,.05,4000+Math.random()*3000,.9,.11,'highpass'); },
    sparkle(){ const t=T(); [1318.5,1568,2093,2637].forEach((f,i)=>tone(t+i*.06,f,.35,.05,'sine')); },
    step(){ hit(T(),.06,320,1,.25,'lowpass'); }
  };
  const ROOT=[55,55,43.65,41.2], DROOT=[130.81,174.61,196,174.61];
  function mStart(){ if(!AC||MB) return; MB=AC.createGain(); MB.gain.value=0; MB.connect(MASTER); MN=AC.currentTime+.1; MS=0; MT=setInterval(mTick,60); MMODE='tense'; mGain(.55); }
  function mGain(v,tc){ if(MB&&AC) MB.gain.setTargetAtTime(v,AC.currentTime,tc||.4); }
  function mTick(){ if(!AC||!MB) return;
    if(MMODE==='dance'){ const spb=60/124/2; while(MN<AC.currentTime+.25){ const t=MN, k=MS%8, bar=Math.floor(MS/8)%4, r=DROOT[bar];
        if(k%2===0) hit(t,.25,90,1,.55,'lowpass',MB); if(k%4===2) hit(t,.12,1800,.8,.25,'bandpass',MB); hit(t,.03,8000,1,.05,'highpass',MB);
        tone(t,r*(k%2?2:1),spb*.8,.14,'triangle',MB); const mel=[0,4,7,12,7,4,9,7][k]; if(k!==3) tone(t,r*4*Math.pow(2,mel/12),spb*.7,.05,'square',MB,3000);
        MN+=spb; MS++; } return; }
    if(MMODE!=='tense') { MN=AC.currentTime+.1; return; }
    const spb=60/(92+MI*44)/2;
    while(MN<AC.currentTime+.25){ const t=MN, bar=Math.floor(MS/8)%4, k=MS%8, r=ROOT[bar];
      tone(t,r,spb*.9,.2*(.5+MI*.5),'sawtooth',MB,240+MI*280);
      if(k%2===1&&MI>.4) tone(t,r*2,spb*.6,.07*MI,'square',MB,520);
      if(MI>.55) hit(t,.04,8000,1,.03*MI,'highpass',MB);
      if(k===0||(MI>.75&&k===4)) hit(t,.35,110,1,.32*MI,'lowpass',MB);
      if(k===0) tone(t,r*4,spb*7.6,.025,'sawtooth',MB,800);
      MN+=spb; MS++; } }
  function music(mode,lvl){ if(!AC) return; if(!MB) mStart(); MMODE=mode; if(lvl!=null) MI=lvl; if(mode==='off') mGain(0,.5); else mGain(mode==='dance'?.75:.42+MI*.25); }
  function mStop(){ clearInterval(MT); MT=0; try{ if(MB) MB.disconnect(); }catch(e){} MB=null; MMODE='off'; }

  /* ---------- תנועה ---------- */
  function hopTo(ch,x,y,z,dur,height){ const s=ch.g.position.clone(); return tween(dur,p=>{ const e=easeIO(p); ch.g.position.set(lerp(s.x,x,e),lerp(s.y,y,e),lerp(s.z,z,e)); ch.hop=Math.sin(Math.PI*p)*(height||1); ch.tilt=Math.sin(Math.PI*p)*-.15*Math.sign(x-s.x||1); }).then(()=>{ ch.hop=0; ch.tilt=0; }); }
  function walkTo(ch,x,z,dur){ const s=ch.g.position.clone(); let last=0; return tween(dur,p=>{ const e=easeIO(p); ch.g.position.x=lerp(s.x,x,e); ch.g.position.z=lerp(s.z,z,e);
      const st=p*dur*3.2; ch.hop=Math.abs(Math.sin(st*Math.PI))*.16*(p<1?1:0); ch.tilt=Math.sin(st*Math.PI)*.07; const n=Math.floor(st); if(n!==last){ last=n; FX.step(); } }).then(()=>{ ch.hop=0; ch.tilt=0; }); }
  function land(ch){ FX.thud(); W3.shake=.12; return tween(.45,p=>{ ch.sq=1-.25*Math.sin(Math.PI*clamp(p*1.6,0,1))*(1-p*.3); }).then(()=>{ ch.sq=1; }); }
  function twirl(ch,dur){ FX.whoosh(dur||.8); return tween(dur||.8,p=>{ ch.spin=easeIO(p)*Math.PI*2; ch.hop=Math.sin(Math.PI*p)*.25; }).then(()=>{ ch.spin=0; ch.hop=0; }); }
  function giveMedal(ch,place){ const m=medal(ch,place); FX.ding(); return tween(.7,p=>{ m.position.y=ch.h*.64+1.4*(1-bounceOut(p)); m.rotation.y=(1-p)*6; }); }
  function giveCrown(ch){ const c=crown(ch); FX.sparkle(); return tween(.9,p=>{ c.position.y=ch.h-.03+1.6*(1-bounceOut(p)); c.rotation.y=(1-p)*8; }); }
  function tagOn(ch){ ch.tag.visible=true; return tween(.5,p=>{ const s=bounceOut(p); ch.tag.scale.set(1.15*s,.36*s,1); }); }

  /* ---------- הטקס ---------- */
  function placeTxt(i){ return ['1st','2nd','3rd','4th','5th'][i]+' place'; }
  function qSay(n){ n=n||0; return n===0?'no questions':n===1?'1 question':n+' questions'; }
  function prizeOf(i,r){ try{ return CTX.prizeOf?CTX.prizeOf(i,r):0; }catch(e){ return 0; } }
  function prog(p){ const el=$('t3Pr'); if(el) el.style.width=(clamp(p,0,1)*100)+'%'; }

  async function play(){
    const id=++RUN; prog(0);
    const ok=()=>{ if(id!==RUN) throw 'stop'; };
    const wait=s=>new Promise(r=>setTimeout(r,s*1000)).then(ok);
    const S=(t,w)=>say(id,t,w).then(ok);
    bar('<button type="button" id="t3C">סגירה</button>'); tap($('t3C'),close);
    const dad=CH.dad, tot=R.reduce((s,r)=>s+(r.n||0),0);
    const chOf=r=>r&&CH[r.pid];
    try{
      /* ---------- פתיחה ---------- */
      music('tense',.3);
      camAt(0,3.6,8.4,0,3.4,4.6,3);
      beam(3,true,0,4.4); W3.beams[3].tgt.set(0,0,4.4);
      txt('T','Winners Show!'); txt('S',esc(CTX.enRange?CTX.enRange(D.ws):''));
      await wait(1.4);
      FX.whoosh(2.2); FX.fanfare(false);
      tween(2.4,p=>{ const e=easeIO(p); W3.cur.forEach(g=>g.scale.x=lerp(1,.13,e)); });
      await wait(.6); txt('T',''); txt('S','');
      camWide(1.1); beam(3,true,LECT.x,LECT.z); prog(.04);
      await wait(1.8);
      camOn(dad,4.3,1.6,-.4); await wait(.9);
      FX.tap(); await S('Tap, tap... is this on?');
      await S('Welcome to the Winners Show!'); FX.clap(1.6);
      prog(.1);

      /* ---------- סה״כ שאלות ---------- */
      camWide(1.4,.4); beam(3,false); beam(0,true,0,0);
      txt('S','Together you answered'); qRain();
      const tw=tween(2.6,p=>{ txt2('T',String(Math.round(tot*ease(p)))); });
      txt('T','0'); await tw; FX.ding(); txt('P','<span>questions! 🎉</span>');
      await S('Together, you answered '+tot+' questions this week! Amazing!'); FX.clap(1.4);
      txt('T',''); txt('S',''); txt('P',''); prog(.2);

      /* ---------- מקום 5 ומקום 4 ---------- */
      for(const i of [4,3]){
        const r=R[i], ch=chOf(r); if(!r||!ch) continue;
        music('tense',.45); txt('T',placeTxt(i));
        if(r.pid==='dad'){
          camOn(dad,4.5,1.6); beam(3,true,LECT.x,LECT.z);
          await S('In '+(i===4?'fifth':'fourth')+' place... it\'s me, Dad!'); tagOn(dad); txt('S',esc('Dad · ✏️ '+qSay(r.n)));
          await twirl(dad,.8); await S('Next week, I will try harder!');
        } else {
          const sp=i===3?SPOT4:SPOT5, from=i===3?-5.2:5.2;
          beam(0,true,sp.x,sp.z); camWide(1.4);
          await S('In '+(i===4?'fifth':'fourth')+' place...');
          setPos(ch,from,0,sp.z); show(ch); ch.yawBase=i===3?.4:-.4;
          await walkTo(ch,sp.x,sp.z,1.9);
          camOn(ch,3.6,1.8); tagOn(ch); txt('T',esc(r.name)); txt('S','✏️ '+esc(qSay(r.n))); FX.clap(1.6);
          await S(r.name+'! '+(r.n?qSay(r.n)+'! Well done!':'Next week, you can do it!'));
          await twirl(ch,.7); await S(r.n?'Thank you!':'I will!',r.pid);
        }
        txt('T',''); txt('S',''); beamsOff(); prog(i===4?.3:.38);
      }

      /* ---------- מקום 3 ---------- */
      if(R[2]&&chOf(R[2])){
        const r=R[2], ch=chOf(r), P=W3.pod[3];
        music('tense',.8); camWide(1.3); txt('T','3rd place');
        await S('And now... third place!');
        beam(1,true,-2,0); beam(2,true,2,0);
        FX.roll(2.6,.45);
        await tween(2.6,p=>{ W3.beams[1].to.set(Math.sin(p*9)*2.6,0,Math.cos(p*7)*1.2); W3.beams[2].to.set(-Math.sin(p*8)*2.6,0,Math.sin(p*6)*1.2); }); ok();
        FX.crash(); beam(1,true,POD[3].x,0); beam(2,false);
        setPos(ch,POD[3].x,7.5,0); show(ch); ch.yawBase=.2; if(ch===dad) ch.tag.visible=false;
        camOn({g:{position:new THREE.Vector3(POD[3].x,P.top,0)},h:ch.h},4.2,2.2);
        await tween(.75,p=>{ ch.g.position.y=lerp(7.5,P.top,p*p); }); ok();
        await land(ch); txt('T',esc(r.name)); txt('S','✏️ '+esc(qSay(r.n)));
        tagOn(ch); await twirl(ch,.8); ok(); await giveMedal(ch,3); ok();
        const z=prizeOf(2,r); if(z){ txt('P','<span>🎁 '+z+' ₪</span>'); FX.sparkle(); }
        FX.clap(2);
        await S(r.pid==='dad'?'Third place... it\'s me, Dad!':r.name+'! '+qSay(r.n)+'!'+(z?' You won '+z+' shekels!':' Great job!'));
        await S(r.pid==='dad'?'Yay!':'Thank you, Dad!',r.pid);
        txt('T',''); txt('S',''); txt('P',''); beamsOff(); prog(.5);
      }

      /* ---------- מקום 2: קופסת מתנה ---------- */
      if(R[1]&&chOf(R[1])){
        const r=R[1], ch=chOf(r), P=W3.pod[2];
        const box=giftBox(); box.position.set(POD[2].x,P.top,0); box.scale.setScalar(.01); scene.add(box);
        music('tense',.85); camWide(1.3); txt('T','2nd place');
        FX.boing(); await tween(.6,p=>box.scale.setScalar(bounceOut(p))); ok();
        await S('Second place is hiding... in this gift box!');
        camOn({g:{position:new THREE.Vector3(POD[2].x,P.top,0)},h:1.2},4,1.8);
        beam(2,true,POD[2].x,0); FX.roll(2.2,.5);
        await tween(2.2,p=>{ box.rotation.z=Math.sin(p*60)*.07*p; box.position.x=POD[2].x+Math.sin(p*47)*.04*p; box.children[1].position.y=box.userData.lidY+Math.abs(Math.sin(p*30))*.08*p; }); ok();
        FX.boom(); W3.shake=.18; const lid=box.children[1];
        confettiBurst(70,new THREE.Vector3(POD[2].x,P.top+.6,0),2.2);
        setPos(ch,POD[2].x,P.top,0); show(ch); ch.sq=.3; ch.yawBase=-.2;
        tween(1.1,p=>{ lid.position.set(p*1.6,box.userData.lidY+p*3.2-p*p*2.4,p*.8); lid.rotation.set(p*4,0,-p*6); });
        tween(.45,p=>box.children[0].scale.set(1-p*.95,1-p*.95,1-p*.95)).then(()=>{ scene.remove(box); });
        await tween(.8,p=>{ ch.hop=Math.sin(Math.PI*p)*1.4; ch.sq=lerp(.3,1,clamp(p*3,0,1)); }); ok(); ch.hop=0;
        await land(ch); txt('T',esc(r.name)); txt('S','✏️ '+esc(qSay(r.n)));
        tagOn(ch); await giveMedal(ch,2); ok();
        const z=prizeOf(1,r); if(z){ txt('P','<span>🎁 '+z+' ₪</span>'); FX.sparkle(); }
        FX.clap(2);
        await S(r.pid==='dad'?'Second place... it\'s me, Dad!':r.name+'! '+qSay(r.n)+'!'+(z?' You won '+z+' shekels!':' Great job!'));
        await S(r.pid==='dad'?'Woo-hoo!':'Wow! Thank you!',r.pid);
        txt('T',''); txt('S',''); txt('P',''); beamsOff(); prog(.65);
      }

      /* ---------- מקום 1: בלונים מהשמיים ---------- */
      if(R[0]&&chOf(R[0])){
        const r=R[0], ch=chOf(r), P=W3.pod[1];
        music('tense',1); camWide(1.2); W3.dimTo=.85; txt('T','1st place');
        await S('And now... the moment we were all waiting for!');
        beam(1,true,-1,0); beam(2,true,1,0); FX.heart(3.2);
        await S('First place goes to...');
        FX.roll(2.4,.6);
        await tween(2.4,p=>{ W3.beams[1].to.set(Math.sin(p*10)*2.4,0,Math.cos(p*8)); W3.beams[2].to.set(-Math.sin(p*9)*2.4,0,Math.sin(p*7)); }); ok();
        FX.crash(); music('off'); beam(1,false); beam(2,false); beam(3,true,0,0); W3.beams[3].tgt.set(0,0,0);
        setPos(ch,0,8.5,0); show(ch); ch.yawBase=0; if(ch===dad) ch.tag.visible=false;
        ch.balloons=[[-.42,.55,0,0xE0447F],[0,.75,-.05,new THREE.Color(ch.col).getHex()],[.42,.55,0,0xFFD54A]].map(([ox,oy,oz,c])=>{
          const m=new THREE.Mesh(new THREE.SphereGeometry(.3,24,18),new THREE.MeshStandardMaterial({color:c,roughness:.18,metalness:.05,emissive:c,emissiveIntensity:.15})); m.scale.set(1,1.18,1); scene.add(m);
          const lg=new THREE.BufferGeometry(); lg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(6),3));
          const line=new THREE.Line(lg,new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.8})); line.frustumCulled=false; scene.add(line);
          return {m,line,ox,oy,oz}; });
        camAt(0,P.top+3.2,6.2,0,6,0,1.2); FX.whoosh(3);
        await tween(3.4,p=>{ const e=easeIO(p); ch.g.position.y=lerp(8.5,P.top,e); ch.g.position.x=Math.sin(p*5)*.4*(1-e); ch.tilt=Math.sin(p*5)*.1*(1-e);
          W3.cam.L.set(0,ch.g.position.y+ch.h*.6,0); W3.cam.P.set(0,ch.g.position.y+1.6,6.4*clamp(.56/(camera.aspect||.5),.85,1.5)); }); ok();
        ch.tilt=0; await land(ch); W3.dimTo=0;
        for(const b of ch.balloons){ await wait(.28); FX.pop(); b.m.visible=false; b.line.visible=false; confettiBurst(18,b.m.position.clone(),1.2); }
        await giveCrown(ch); ok();
        camOn(ch,4.3,1.6); FX.fanfare(true); W3.cRain=1;
        [[-2.4,5.6,-2.2,0xF3C24E],[2.3,6.1,-2.4,0xE0447F],[0,6.8,-2.6,0x7fd3ff],[-1.2,5.1,-2,0x14A39B],[1.5,5.3,-2,0xB98CFF]].forEach((f,i)=>setTimeout(()=>{ if(id===RUN&&renderer){ firework(...f); FX.crackle(); } },i*520));
        txt('T','🏆 '+esc(r.name)); txt('S','✏️ '+esc(qSay(r.n))); tagOn(ch);
        await twirl(ch,.9); ok(); await giveMedal(ch,1); ok();
        const z=prizeOf(0,r); if(z){ txt('P','<span>🎁 '+z+' ₪</span>'); FX.sparkle(); }
        FX.clap(3);
        await S(r.pid==='dad'?'First place... it\'s me, Dad! Wow!':r.name+'! '+qSay(r.n)+'!'+(z?' You won '+z+' shekels!':'')+' Congratulations!');
        await S(r.pid==='dad'?'Ha ha! Next week, girls, you can beat me!':'Yes! I did it! Thank you!',r.pid);
        txt('T',''); txt('S',''); txt('P',''); prog(.85);
      }

      /* ---------- ריקוד ---------- */
      beamsOff(); beam(1,true,-1.6,.2); beam(2,true,1.6,.2); beam(3,true,0,0);
      music('dance'); camWide(1); W3.orbit=1; W3.danceOn=true; W3.cRain=.6;
      txt('T','Great job, everyone!');
      let pz=[0,1,2].map(i=>R[i]?prizeOf(i,R[i]):0); if(pz.some(Boolean)) txt('S',[0,1,2].filter(i=>pz[i]).map(i=>esc(R[i].name)+' '+pz[i]+'₪').join(' · '));
      const swing=tween(9,p=>{ W3.beams[1].to.set(-1.6+Math.sin(p*14)*1.4,0,Math.cos(p*11)*.8); W3.beams[2].to.set(1.6-Math.sin(p*13)*1.4,0,Math.sin(p*9)*.8); });
      await S('Great job, everyone! I am so proud of you!');
      await wait(2.4);
      Object.values(CH).filter(c=>c.vis).forEach((c,i)=>setTimeout(()=>{ if(id===RUN) twirl(c,.8); },i*180));
      await swing; ok(); prog(.95);

      /* ---------- סיום ---------- */
      W3.danceOn=false; W3.orbit=0; W3.cRain=0; music('off'); txt('T',''); txt('S','');
      camWide(1.2);
      FX.whoosh(2.4); tween(2.6,p=>{ const e=easeIO(p); W3.cur.forEach(g=>g.scale.x=lerp(.13,1,e)); });
      await wait(1.2); camAt(0,3.6,8.4,0,3.4,4.6,1.4);
      txt('T','See you'); await wait(.4); txt('S','<span style="font-size:1.6em;color:#FFD54A">next week! 👋</span>');
      await S('See you next week!');
      prog(1);
      await wait(1);
    }catch(e){ if(e!=='stop') console.warn('t3d',e); return; }
    bar('<button type="button" class="pri" id="t3A">🔁 לראות שוב</button><button type="button" id="t3C">סגירה</button>');
    tap($('t3C'),close);
    tap($('t3A'),()=>replay());
  }
  function txt2(k,v){ const el=$('t3'+k); if(el){ el.textContent=v; el.classList.add('on'); } }
  async function replay(){
    const d=D, ctx=CTX; stop(); D=d; CTX=ctx;
    const pids=[...new Set(R.map(r=>r.pid).concat(['dad']))], ims=await Promise.all(pids.map(loadTex)), IM={}; pids.forEach((p,i)=>IM[p]=ims[i]);
    try{ build(IM); }catch(e){ return fallback(); }
    unlock(); play();
  }
  function giftBox(){
    const g=new THREE.Group();
    const bm=new THREE.MeshStandardMaterial({color:0xE0447F,roughness:.45,metalness:.1}), rm=new THREE.MeshStandardMaterial({color:0xF3C24E,metalness:.7,roughness:.3});
    const body=new THREE.Group(); const b=new THREE.Mesh(new THREE.BoxGeometry(1,.95,1),bm); b.position.y=.475; b.castShadow=true; body.add(b);
    const r1=new THREE.Mesh(new THREE.BoxGeometry(.16,.96,1.02),rm); r1.position.y=.475; body.add(r1); const r2=new THREE.Mesh(new THREE.BoxGeometry(1.02,.96,.16),rm); r2.position.y=.475; body.add(r2);
    g.add(body);
    const lid=new THREE.Group(); const l=new THREE.Mesh(new THREE.BoxGeometry(1.1,.22,1.1),bm); l.castShadow=true; lid.add(l);
    const l1=new THREE.Mesh(new THREE.BoxGeometry(.17,.23,1.12),rm); lid.add(l1); const l2=new THREE.Mesh(new THREE.BoxGeometry(1.12,.23,.17),rm); lid.add(l2);
    [-1,1].forEach(s=>{ const t=new THREE.Mesh(new THREE.TorusGeometry(.16,.05,10,20),rm); t.position.set(s*.15,.24,0); t.rotation.set(0,0,s*.6); t.scale.set(1,.7,1); lid.add(t); });
    lid.position.y=1.06; g.add(lid); g.userData.lidY=1.06;
    return g;
  }

  window.TM3D={open,close};
  /* טוענים את three.js מראש כדי שהטקס ייפתח מהר */
  setTimeout(()=>{ if(glOK()) loadThree().catch(()=>{}); },5000);
})();

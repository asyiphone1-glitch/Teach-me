/* teach-me — 🎓 המורה שלי (18.11.2026, אושר ע״י ההורה: "מקבל את כל ההמלצות")
   שיחה קולית עם מורה אישית שמכירה רק את החומר של הבחינה. Gemini Live דרך Firebase AI Logic (בלי שרת שלנו).
   - כפתור אחד במסך החומר של הבחינה ("🎓 לדבר עם המורה"), רק לבנות שההורים סימנו באזור ההורים (גרסת ניסיון).
   - המורה מדברת בגובה עיניים, שואלת שאלות, לא נותנת תשובה מיד. מדברת רק על החומר.
   - לא נשמרות הקלטות. נשמר רק תמליל קצר (tutor/<תאריך>_<שעה>_<ילדה>) שההורים רואים באזור ההורים. נמחק אחרי 30 יום.
   - מגבלת דקות ביום לכל ילדה (ברירת מחדל 20), ושיחה אחת עד 10 דקות — שלא יהיו הפתעות בחשבון.
   - כשהמורה מדברת, המיקרופון לא שולח (שלא תשמע את עצמה ברמקול). נגיעה בעיגול = "רגע, אני רוצה לדבר".
   ההגדרות: cfg/tutor בענן {on,kids:[],model,voice,mins}. הספריות של Firebase שמורות בתוך המאגר (lib/fb13). */
(function(){
  if(window.__tmTutor) return; window.__tmTutor=1;
  var KN={aviv:'אביב',roni:'רוני',hili:'הילי',ziv:'זיו'};
  var AGE={aviv:'בת 10, כיתה ה׳',roni:'בת 12, כיתה ו׳',hili:'בת 12, כיתה ו׳',ziv:'בת 13, כיתה ח׳'};
  var MODELS={'gemini-2.5-flash-native-audio-preview-12-2025':'Gemini 2.5 (יציב)','gemini-3.1-flash-live-preview':'Gemini 3.1 (חדש)'};
  var VOICES={Aoede:'אאודה · רכה',Leda:'לדה · צעירה',Kore:'קורה · ברורה',Zephyr:'זפיר · שמחה'};
  var DEF={on:false,kids:[],model:'gemini-2.5-flash-native-audio-preview-12-2025',voice:'Aoede',mins:20};
  var MAX_SESSION=10*60*1000;
  var LS='tm_tcfg', CFG=null;
  try{ CFG=JSON.parse(localStorage.getItem(LS)||'null'); }catch(e){ CFG=null; }
  function cfg(){ return Object.assign({},DEF,CFG||{}); }
  function db(){ try{ return (typeof DB!=='undefined'&&DB)?DB:null; }catch(e){ return null; } }
  function pid(){ try{ return (typeof PROFILE!=='undefined'&&PROFILE)?PROFILE.id:null; }catch(e){ return null; } }
  function exam(){ try{ return (typeof CUR_EXAM!=='undefined'&&CUR_EXAM)?CUR_EXAM:null; }catch(e){ return null; } }
  function $(id){ return document.getElementById(id); }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function pad(n){ return (n<10?'0':'')+n; }
  function dayKey(t){ var d=new Date(t||Date.now()); return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }

  var loadedAt=0;
  function load(){
    var d=db(); if(!d) return Promise.resolve(false);
    return d.doc('cfg/tutor').get().then(function(s){
      loadedAt=Date.now(); CFG=s&&s.exists?s.data():null;
      try{ if(CFG) localStorage.setItem(LS,JSON.stringify(CFG)); else localStorage.removeItem(LS); }catch(e){}
      paintBtn(); return true;
    },function(){ return false; });
  }
  var tries=0, iv=setInterval(function(){ tries++; load().then(function(ok){ if(ok||tries>40) clearInterval(iv); }); },1600);
  document.addEventListener('visibilitychange',function(){ if(document.visibilityState==='visible'&&Date.now()-loadedAt>10*60000) load(); });

  /* ---------- החומר של הבחינה, כטקסט למורה ---------- */
  function material(p,ex){
    if(!p||!ex) return null;
    var B=[]; try{ B=(window.TM_UP&&TM_UP.ready)?TM_UP.ready(p,ex.id)||[]:[]; }catch(e){ B=[]; }
    var out=[], qs=[];
    B.forEach(function(r){ ((r.mat&&r.mat.topics)||[]).forEach(function(t){
      out.push('## '+t.t+'\n'+String(t.ex||'')+(t.tip?'\nטריק לזכור: '+t.tip:''));
      (t.q||[]).slice(0,3).forEach(function(q){ if(q&&q.o&&q.o[q.a]!=null) qs.push('- '+q.q+' → '+q.o[q.a]); });
    }); });
    if(!out.length){
      var au=null; try{ au=window.TM_AU&&TM_AU[ex.id]; }catch(e){}
      if(Array.isArray(au)&&au.length) out.push(au.join('\n'));
    }
    if(!out.length) return null;
    var txt=out.join('\n\n'); if(txt.length>14000) txt=txt.slice(0,14000);
    var qt=qs.join('\n'); if(qt.length>5000) qt=qt.slice(0,5000);
    return {txt:txt,qs:qt,title:(ex.title||(B[0]&&B[0].mat&&B[0].mat.title)||'')};
  }
  function allowed(p){ var c=cfg(); return !!(c.on&&p&&Array.isArray(c.kids)&&c.kids.indexOf(p)>=0&&window.TM_FB_CFG&&window.isSecureContext!==false&&navigator.mediaDevices); }

  /* ---------- הכפתור במסך החומר ---------- */
  function paintBtn(){
    var all=$('upAll'), old=$('tmTutorBtn');
    if(!all){ if(old) old.remove(); return; }
    var p=pid(), ex=exam();
    if(old&&old.dataset.ex===((ex&&ex.id)||'')&&allowed(p)) return;
    if(old) old.remove();
    if(!(allowed(p)&&ex&&material(p,ex))) return;
    var b=document.createElement('button'); b.type='button'; b.id='tmTutorBtn'; b.className='tx-next sec';
    b.dataset.ex=ex.id; b.innerHTML='🎓 לדבר עם המורה'; b.onclick=function(){ open(p,ex); };
    all.after(b);
  }
  var pt=0; new MutationObserver(function(){ if(pt) return; pt=setTimeout(function(){ pt=0; try{ paintBtn(); }catch(e){} },150); }).observe(document.documentElement,{childList:true,subtree:true});

  /* ---------- הוראות למורה ---------- */
  function sysPrompt(p,m){
    var n=KN[p]||'';
    return [
      'את מורה פרטית חמה וסבלנית בשם "המורה". את מדברת רק בעברית, תמיד בעברית ישראלית טבעית, גם אם שומעים מילה בשפה אחרת.',
      'את מדברת עם '+n+', ילדה '+(AGE[p]||'')+'. פני אליה תמיד בלשון נקבה ובשמה.',
      'המטרה: לעזור לה להבין ולזכור את החומר לבחינה "'+m.title+'".',
      'איך מדברים: משפטים קצרים מאוד (עד 12 מילים), מילים פשוטות של ילדות, בלי מילים גבוהות. תור אחד = עד 3 משפטים, ואז שאלה אחת אליה. לא נאומים.',
      'איך מלמדים: קודם שואלים מה היא כבר יודעת. מסבירים חלק קטן, ואז שואלים שאלה קצרה כדי לבדוק. אם טעתה — לא אומרים "לא נכון" בחומרה; נותנים רמז קטן ונותנים לה לנסות שוב. רק אחרי ניסיון שני — מסבירים את התשובה. כשצודקת — מחמאה קצרה ואמיתית (למשל "יפה מאוד!") וממשיכים.',
      'משתמשים בטריקים לזכור שמופיעים בחומר. אפשר לבקש ממנה להסביר לך במילים שלה.',
      'גבולות: מדברים רק על החומר של הבחינה ועל לימודים. אם היא שואלת על משהו אחר — עונים במשפט אחד בעדינות ומחזירים לחומר. לא שואלים פרטים אישיים (כתובת, טלפון, בית ספר, חברים). לא מבטיחים דברים ולא מדברים על נושאים לא מתאימים לילדות.',
      'אם היא נשמעת עצובה, לחוצה מאוד או מספרת על משהו שמדאיג — עונים בחום במשפט אחד ואומרים לה שכדאי לספר לאבא או לאמא עכשיו.',
      'אל תמציאי עובדות שלא נמצאות בחומר. אם לא בטוחה — תגידי שכדאי לבדוק בחוברת או לשאול את המורה בכיתה.',
      'פתיחה: תגידי "היי '+n+'!" ומשפט אחד על הנושא, ותשאלי במה היא רוצה להתחיל או מה הכי קשה לה.',
      '',
      '=== החומר לבחינה (זה כל מה שמלמדים) ===',
      m.txt,
      m.qs?'\n=== דוגמאות לשאלות ותשובות מהחומר ===\n'+m.qs:''
    ].join('\n');
  }

  /* ---------- מסך השיחה ---------- */
  var CSS='#tmTutor{position:fixed;inset:0;z-index:2147481000;background:linear-gradient(180deg,#EEF3FF,#F8F4FF);display:none;flex-direction:column;align-items:center;justify-content:space-between;padding:calc(18px + env(safe-area-inset-top,0px)) 18px calc(22px + env(safe-area-inset-bottom,0px));direction:rtl;color:#1F2A44;font-family:inherit;text-align:center}'+
    '#tmTutor.show{display:flex}#tmTutor .tt-h{font-size:1.15rem;font-weight:800}#tmTutor .tt-s{font-size:.9rem;color:#5A6585;margin-top:4px}'+
    '#tmTutor .tt-o{width:min(62vw,250px);aspect-ratio:1;border-radius:50%;border:none;background:radial-gradient(circle at 35% 30%,#fff,#C9D6FF 55%,#8FA6F5);box-shadow:0 10px 40px rgba(80,100,200,.28);font-size:min(24vw,96px);display:flex;align-items:center;justify-content:center;transition:transform .2s;cursor:pointer;-webkit-tap-highlight-color:transparent}'+
    '#tmTutor.talk .tt-o{animation:ttP 1.1s ease-in-out infinite}#tmTutor.listen .tt-o{box-shadow:0 0 0 10px rgba(47,158,68,.18),0 10px 40px rgba(47,158,68,.3)}'+
    '@keyframes ttP{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}'+
    '#tmTutor .tt-st{font-size:1.05rem;font-weight:700;min-height:1.5em;margin-top:14px}#tmTutor .tt-cap{font-size:1rem;line-height:1.45;min-height:4.4em;max-width:520px;color:#33405F;margin-top:8px}'+
    '#tmTutor .tt-end{border:none;border-radius:16px;background:#E8590C;color:#fff;font:inherit;font-weight:800;font-size:1.1rem;padding:14px 26px;width:min(86vw,380px)}'+
    '#tmTutor .tt-t{font-size:.82rem;color:#7A849A;margin-top:8px}';
  var S=null; /* השיחה הנוכחית */
  function screen(){
    var w=$('tmTutor'); if(w) return w;
    var st=document.createElement('style'); st.textContent=CSS; document.head.appendChild(st);
    w=document.createElement('div'); w.id='tmTutor'; w.setAttribute('role','dialog'); w.setAttribute('aria-label','המורה שלי');
    w.innerHTML='<div><div class="tt-h">🎓 המורה שלי</div><div class="tt-s" id="ttSub"></div></div>'+
      '<div style="display:flex;flex-direction:column;align-items:center"><button type="button" class="tt-o" id="ttOrb" aria-label="נגיעה = אני רוצה לדבר">👩‍🏫</button><div class="tt-st" id="ttSt"></div><div class="tt-cap" id="ttCap"></div></div>'+
      '<div style="display:flex;flex-direction:column;align-items:center"><button type="button" class="tt-end" id="ttEnd">סיימתי ✋</button><div class="tt-t" id="ttTime"></div></div>';
    document.body.appendChild(w);
    $('ttEnd').onclick=function(){ stop('end'); };
    $('ttOrb').onclick=function(){ if(S&&S.playing) cutPlayback(true); };
    return w;
  }
  function state(cls,txt){ var w=$('tmTutor'); if(!w) return; w.classList.remove('talk','listen'); if(cls) w.classList.add(cls); $('ttSt').textContent=txt||''; }
  function cap(t){ var c=$('ttCap'); if(c) c.textContent=t||''; }

  function usedToday(p){
    var d=db(); if(!d) return Promise.resolve(0);
    var k=dayKey();
    return d.collection('tutor').since(k+'_').get().then(function(s){
      var ms=0; s.docs.forEach(function(x){ if(x.id.slice(0,10)!==k) return; var v=x.data()||{}; if(v.pid===p) ms+=+v.dur||0; }); return ms;
    },function(){ return 0; });
  }

  /* ---------- קול: מיקרופון 16kHz החוצה, 24kHz פנימה ---------- */
  var WORKLET="class P extends AudioWorkletProcessor{constructor(o){super();this.t=o.processorOptions.t;this.r=sampleRate;this.b=[];}process(i){var x=i[0];if(x&&x[0]&&x[0].length){var d=x[0],n=Math.round(d.length*this.t/this.r),q=d.length/n,o=new Int16Array(n);for(var k=0;k<n;k++){var s=Math.max(-1,Math.min(1,d[Math.floor(k*q)]));o[k]=s<0?s*32768:s*32767;}this.port.postMessage(o);}return true;}}registerProcessor('tm-mic',P);";
  function b64(u8){ var s='',i,C=0x8000; for(i=0;i<u8.length;i+=C) s+=String.fromCharCode.apply(null,u8.subarray(i,i+C)); return btoa(s); }
  function cutPlayback(byKid){
    if(!S) return;
    S.srcs.forEach(function(x){ try{ x.stop(); }catch(e){} }); S.srcs=[]; S.next=0; S.playing=false;
    if(byKid){ S.skipTurn=true; state('listen','אני מקשיבה לך… 👂'); }
  }
  function playPcm(b64s){
    var ctx=S.ctx, bin=atob(b64s), n=bin.length>>1, buf=ctx.createBuffer(1,n,24000), ch=buf.getChannelData(0);
    for(var i=0;i<n;i++){ var v=bin.charCodeAt(2*i)|(bin.charCodeAt(2*i+1)<<8); if(v>=32768) v-=65536; ch[i]=v/32768; }
    var src=ctx.createBufferSource(); src.buffer=buf; src.connect(ctx.destination);
    S.srcs.push(src); S.playing=true; state('talk','המורה מדברת… (נגיעה בעיגול = רגע!)');
    src.onended=function(){ if(!S) return; S.srcs=S.srcs.filter(function(x){ return x!==src; }); if(!S.srcs.length){ clearTimeout(S.quiet); S.quiet=setTimeout(function(){ if(S&&!S.srcs.length){ S.playing=false; state('listen','אני מקשיבה לך… 👂'); } },350); } };
    S.next=Math.max(ctx.currentTime+0.03,S.next||0); src.start(S.next); S.next+=buf.duration;
  }

  async function open(p,ex){
    if(S) return;
    var m=material(p,ex); if(!m) return;
    var w=screen(); w.classList.add('show'); document.body.style.overflow='hidden';
    $('ttSub').textContent=(KN[p]||'')+' · '+m.title; cap(''); $('ttTime').textContent='';
    state('', 'מתחברת למורה… ⏳');
    try{ speechSynthesis.cancel(); }catch(e){}
    var c=cfg();
    S={p:p,ex:ex,m:m,t0:0,lines:[],srcs:[],next:0,playing:false,closed:false,kidBuf:'',tBuf:''};
    var my=S;
    /* חייב לקרות מיד בתוך הנגיעה (אייפון) */
    try{ S.ctx=new (window.AudioContext||window.webkitAudioContext)(); if(S.ctx.state==='suspended') await S.ctx.resume(); }catch(e){ return fail('בטלפון הזה אי אפשר לדבר עם המורה 😕'); }
    try{ S.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}}); }
    catch(e){ return fail('צריך לאשר את המיקרופון 🎤 ואז לנסות שוב'); }
    if(my!==S) return;
    var used=await usedToday(p), left=(Math.max(1,+c.mins||20))*60000-used;
    if(left<60000) return fail('היום כבר דיברנו הרבה 😊 נמשיך מחר!');
    S.limit=Math.min(MAX_SESSION,left);
    try{
      var A=await import('./lib/fb13/firebase-app.js'), AI=await import('./lib/fb13/firebase-ai.js');
      var app=A.getApps().find(function(a){ return a.name==='tm-ai'; })||A.initializeApp(window.TM_FB_CFG,'tm-ai');
      if(window.TM_APPCHECK_KEY&&!window.__tmAiAC){ try{ var AC=await import('./lib/fb13/firebase-app-check.js'); AC.initializeAppCheck(app,{provider:new AC.ReCaptchaV3Provider(window.TM_APPCHECK_KEY),isTokenAutoRefreshEnabled:true}); window.__tmAiAC=1; }catch(e){} }
      var ai=AI.getAI(app,{backend:new AI.GoogleAIBackend()});
      var model=AI.getLiveGenerativeModel(ai,{
        model:MODELS[c.model]?c.model:DEF.model,
        systemInstruction:sysPrompt(p,m),
        generationConfig:{
          responseModalities:[AI.ResponseModality.AUDIO],
          speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:VOICES[c.voice]?c.voice:DEF.voice}}},
          inputAudioTranscription:{}, outputAudioTranscription:{}
        }
      });
      S.sess=await model.connect();
    }catch(e){ try{ console.warn('tutor',e); }catch(_){} return fail('המורה לא זמינה כרגע. נסי שוב עוד מעט 🙏'); }
    if(my!==S||S.closed){ try{ my.sess&&my.sess.close(); }catch(e){} return; }
    /* מיקרופון → המורה (רק כשהמורה לא מדברת) */
    try{
      var url=URL.createObjectURL(new Blob([WORKLET],{type:'application/javascript'}));
      await S.ctx.audioWorklet.addModule(url);
      S.srcNode=S.ctx.createMediaStreamSource(S.stream);
      S.node=new AudioWorkletNode(S.ctx,'tm-mic',{processorOptions:{t:16000}});
      S.node.port.onmessage=function(ev){ if(!S||S.closed||S.playing) return; try{ S.sess.sendAudioRealtime({mimeType:'audio/pcm;rate=16000',data:b64(new Uint8Array(ev.data.buffer))}); }catch(e){} };
      S.srcNode.connect(S.node);
    }catch(e){ return fail('בטלפון הזה אי אפשר לדבר עם המורה 😕'); }
    S.t0=Date.now();
    try{ if(navigator.wakeLock) navigator.wakeLock.request('screen').then(function(l){ if(S) S.lock=l; },function(){}); }catch(e){}
    S.tick=setInterval(tick,1000);
    receive(my);
    try{ await S.sess.send('(הילדה נכנסה עכשיו. תפתחי את השיחה.)',true); }catch(e){}
    state('', 'המורה מתחילה… 🎓');
  }
  function flushKid(){ if(S&&S.kidBuf.trim()){ S.lines.push({w:'k',s:S.kidBuf.trim().slice(0,400)}); S.kidBuf=''; } }
  function flushT(){ if(S&&S.tBuf.trim()){ S.lines.push({w:'t',s:S.tBuf.trim().slice(0,600)}); S.tBuf=''; } }
  async function receive(my){
    try{
      for await (var msg of my.sess.receive()){
        if(S!==my||my.closed) break;
        if(msg.type==='serverContent'){
          if(msg.interrupted){ cutPlayback(false); }
          if(msg.inputTranscription&&msg.inputTranscription.text){ flushT(); my.kidBuf+=msg.inputTranscription.text; }
          if(msg.outputTranscription&&msg.outputTranscription.text){ flushKid(); my.tBuf+=msg.outputTranscription.text; cap(my.tBuf.slice(-180)); }
          var parts=(msg.modelTurn&&msg.modelTurn.parts)||[];
          for(var i=0;i<parts.length;i++){ var pa=parts[i]; if(pa&&pa.inlineData&&/^audio\//.test(pa.inlineData.mimeType||'')){ if(my.skipTurn) continue; playPcm(pa.inlineData.data); } }
          if(msg.turnComplete){ my.skipTurn=false; flushT(); }
        } else if(msg.type==='goingAwayNotice'){ /* השרת עומד לסגור — מסיימים יפה */ }
      }
    }catch(e){ try{ console.warn('tutor recv',e); }catch(_){} }
    if(S===my&&!my.closed) stop('net');
  }
  function tick(){
    if(!S||!S.t0) return;
    var el=Date.now()-S.t0, left=S.limit-el;
    $('ttTime').textContent='עוד '+Math.max(0,Math.ceil(left/60000))+' דק׳';
    if(left<60000&&!S.warned){ S.warned=true; try{ S.sess.send('(נשארה דקה אחת. תסכמי במשפט אחד מה למדנו היום ותגידי להתראות.)',true); }catch(e){} }
    if(left<=0) stop('time');
  }
  function fail(t){
    var s=S; cleanup(s); S=null;
    state('',t); cap(''); $('ttTime').textContent='';
    var e=$('ttEnd'); if(e){ e.textContent='חזרה'; e.onclick=function(){ close(); }; }
  }
  function cleanup(s){
    if(!s) return; s.closed=true;
    try{ clearInterval(s.tick); clearTimeout(s.quiet); }catch(e){}
    try{ s.node&&(s.node.port.onmessage=null); s.srcNode&&s.srcNode.disconnect(); }catch(e){}
    try{ s.stream&&s.stream.getTracks().forEach(function(t){ t.stop(); }); }catch(e){}
    try{ s.srcs.forEach(function(x){ x.stop(); }); }catch(e){}
    try{ s.sess&&s.sess.close(); }catch(e){}
    try{ s.lock&&s.lock.release(); }catch(e){}
    try{ s.ctx&&s.ctx.close(); }catch(e){}
  }
  function save(s){
    if(!s||!s.t0) return;
    var dur=Date.now()-s.t0; if(dur<5000&&!s.lines.length) return;
    var d=db(); if(!d) return;
    var t=new Date(s.t0), id=dayKey(s.t0)+'_'+pad(t.getHours())+pad(t.getMinutes())+pad(t.getSeconds())+'_'+s.p;
    var L=s.lines.slice(-160);
    try{ d.doc('tutor/'+id).set({pid:s.p,ex:s.ex.id,exT:s.m.title,at:s.t0,dur:dur,L:L}).catch(function(){}); }catch(e){}
  }
  function stop(why){
    var s=S; if(!s) { close(); return; }
    flushKid(); flushT(); S=null; cleanup(s); save(s);
    if(why==='end'){ close(); return; }
    state('', why==='time'?'הזמן נגמר להיום. כל הכבוד! 🌟':'השיחה נקטעה. אפשר להתחיל שוב 🙏');
    var e=$('ttEnd'); if(e){ e.textContent='חזרה'; e.onclick=function(){ close(); }; }
  }
  function close(){
    var w=$('tmTutor'); if(w) w.classList.remove('show'); document.body.style.overflow='';
    var e=$('ttEnd'); if(e){ e.textContent='סיימתי ✋'; e.onclick=function(){ stop('end'); }; }
  }
  document.addEventListener('visibilitychange',function(){ if(document.visibilityState==='hidden'&&S) stop('net'); });

  /* ---------- אזור ההורים: הגדרות + שיחות אחרונות ---------- */
  function addParent(){
    var top=document.querySelector('#parentBox .dash-top'); if(!top||$('dTutor')) return;
    var box=document.createElement('div'); box.id='dTutor'; box.className='tm-hc';
    var after=$('dVoice')||$('dHealth')||$('dThree')||top; after.after(box);
    paintParent();
    load().then(paintParent);
    if(window.TM_VOICE) loadVoice();
  }
  function paintParent(){
    var b=$('dTutor'); if(!b) return;
    var c=cfg(), v=(window.TM_VOICE&&TM_VOICE.cfg())||null;
    var chip=function(k){ var on=c.kids.indexOf(k)>=0; return '<button type="button" data-kid="'+k+'" style="border:none;border-radius:999px;padding:7px 12px;font:inherit;margin:3px;background:'+(on?'#2F9E44':'#EEF1F7')+';color:'+(on?'#fff':'#1F2A44')+'">'+(on?'✓ ':'')+KN[k]+'</button>'; };
    var sel=function(id,O,cur){ return '<select id="'+id+'" style="font:inherit;padding:6px;border-radius:10px;border:1px solid #D5DBE8;max-width:100%">'+Object.keys(O).map(function(k){ return '<option value="'+k+'"'+(k===cur?' selected':'')+'>'+O[k]+'</option>'; }).join('')+'</select>'; };
    b.innerHTML='<h3>🎓 המורה שלי <small style="font-weight:400;color:#7A849A">(ניסיון)</small></h3>'+
      '<div style="margin:6px 0"><label><input type="checkbox" id="dtOn"'+(c.on?' checked':'')+'> פעיל</label></div>'+
      '<div style="font-size:.9rem;color:#55607A">מי יכולה לדבר עם המורה:</div><div>'+Object.keys(KN).map(chip).join('')+'</div>'+
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;align-items:center"><span>מודל:</span>'+sel('dtModel',MODELS,c.model)+'<span>קול:</span>'+sel('dtVoice',VOICES,c.voice)+'</div>'+
      '<div style="margin-top:8px">עד <input id="dtMins" type="number" min="5" max="120" value="'+(+c.mins||20)+'" style="width:4.5em;font:inherit;padding:4px;border-radius:8px;border:1px solid #D5DBE8"> דק׳ ביום לכל ילדה</div>'+
      '<div style="font-size:.82rem;color:#7A849A;margin-top:6px">הכפתור מופיע במסך החומר של בחינה שהועלתה ("🎓 לדבר עם המורה"). לא נשמרות הקלטות — רק תמליל, ל-30 יום.</div>'+
      '<button type="button" id="dtSave" class="restart-btn" style="margin-top:8px">💾 לשמור</button> <span id="dtNote" style="font-size:.88rem"></span>'+
      '<details id="dtLog" style="margin-top:10px"><summary>💬 שיחות אחרונות</summary><div id="dtLogB" style="font-size:.9rem">טוענת…</div></details>'+
      '<hr style="border:none;border-top:1px solid #E6E9F0;margin:14px 0">'+
      '<h3>🔊 הקול של הילה בכל טלפון</h3>'+
      '<div style="font-size:.85rem;color:#55607A">מפתח ואזור מ-Azure Speech (מסלול חינמי F0). בלי מפתח — הקול של הטלפון, כמו היום.</div>'+
      '<div style="display:flex;flex-direction:column;gap:6px;margin-top:6px">'+
      '<input id="dvKey" type="password" autocomplete="off" placeholder="מפתח (Key 1)" value="'+esc(v&&v.key||'')+'" style="font:inherit;padding:8px;border-radius:10px;border:1px solid #D5DBE8;direction:ltr">'+
      '<input id="dvReg" type="text" autocomplete="off" placeholder="אזור, למשל westeurope" value="'+esc(v&&v.region||'')+'" style="font:inherit;padding:8px;border-radius:10px;border:1px solid #D5DBE8;direction:ltr">'+
      '<label><input type="checkbox" id="dvOn"'+(!v||v.on?' checked':'')+'> להשתמש בקול של הילה</label></div>'+
      '<div style="margin-top:8px"><button type="button" id="dvTest" class="restart-btn">▶️ לשמוע</button> <button type="button" id="dvSave" class="restart-btn">💾 לשמור</button> <span id="dvNote" style="font-size:.88rem"></span></div>';
    b.querySelectorAll('[data-kid]').forEach(function(x){ x.onclick=function(){ var k=x.dataset.kid, L=cfg().kids.slice(), i=L.indexOf(k); if(i>=0) L.splice(i,1); else L.push(k); CFG=Object.assign(cfg(),{kids:L}); paintParent(); }; });
    $('dtSave').onclick=function(){
      var n=Object.assign(cfg(),{on:$('dtOn').checked,model:$('dtModel').value,voice:$('dtVoice').value,mins:Math.max(5,Math.min(120,+$('dtMins').value||20)),at:Date.now()});
      var d=db(); if(!d){ $('dtNote').textContent='אין חיבור לענן'; return; }
      $('dtNote').textContent='⏳';
      d.doc('cfg/tutor').set(n).then(function(){ CFG=n; try{ localStorage.setItem(LS,JSON.stringify(n)); }catch(e){} $('dtNote').textContent='✓ נשמר'; },function(){ $('dtNote').textContent='לא נשמר. בדקו חיבור'; });
    };
    var vin=function(){ return {key:$('dvKey').value.trim(),region:$('dvReg').value.trim(),on:$('dvOn').checked}; };
    $('dvTest').onclick=function(){ if(!window.TM_VOICE){ $('dvNote').textContent='רעננו את האפליקציה'; return; } $('dvNote').textContent='⏳'; TM_VOICE.test(vin()).then(function(err){ $('dvNote').textContent=err?'⚠️ '+err:'✓ עובד!'; }); };
    $('dvSave').onclick=function(){
      var n=vin(), d=db(); if(!d){ $('dvNote').textContent='אין חיבור לענן'; return; }
      if((n.key&&!n.region)||(!n.key&&n.region)){ $('dvNote').textContent='צריך גם מפתח וגם אזור'; return; }
      $('dvNote').textContent='⏳';
      (n.key?d.doc('cfg/voice').set(Object.assign(n,{at:Date.now()})):d.doc('cfg/voice').delete()).then(function(){ try{ TM_VOICE.set(n.key?n:null); }catch(e){} $('dvNote').textContent=n.key?'✓ נשמר. כל הטלפונים יתעדכנו':'✓ נמחק. חוזרים לקול של הטלפון'; },function(){ $('dvNote').textContent='לא נשמר. בדקו חיבור'; });
    };
    var lg=$('dtLog'); if(lg) lg.addEventListener('toggle',function(){ if(lg.open) paintLog(); });
  }
  function loadVoice(){ try{ TM_VOICE.reload().then(function(){ var k=$('dvKey'); if(k&&!k.value) paintParent(); }); }catch(e){} }
  function paintLog(){
    var el=$('dtLogB'), d=db(); if(!el) return; if(!d){ el.textContent='אין חיבור לענן'; return; }
    var cut=dayKey(Date.now()-30*864e5);
    /* ניקוי: שיחות מלפני 30 יום נמחקות */
    try{ d.collection('tutor').before(cut).get().then(function(s){ s.docs.forEach(function(x){ d.doc('tutor/'+x.id).delete().catch(function(){}); }); },function(){}); }catch(e){}
    d.collection('tutor').since(cut).get().then(function(s){
      var L=s.docs.map(function(x){ return {id:x.id,v:x.data()||{}}; }).sort(function(a,b){ return (b.v.at||0)-(a.v.at||0); }).slice(0,30);
      if(!L.length){ el.textContent='עוד אין שיחות.'; return; }
      el.innerHTML=L.map(function(it){ var v=it.v, t=new Date(v.at||0);
        return '<details style="border-top:1px solid #E6E9F0;padding:6px 0"><summary>'+esc(KN[v.pid]||v.pid)+' · '+esc(v.exT||'')+' · '+t.getDate()+'.'+(t.getMonth()+1)+' '+pad(t.getHours())+':'+pad(t.getMinutes())+' · '+Math.max(1,Math.round((v.dur||0)/60000))+' דק׳</summary>'+
          (v.L||[]).map(function(l){ return '<div style="margin:4px 0;'+(l.w==='k'?'color:#1F55B8':'color:#33405F')+'"><b>'+(l.w==='k'?esc(KN[v.pid]||'')+':':'🎓')+'</b> '+esc(l.s)+'</div>'; }).join('')+'</details>'; }).join('');
    },function(){ el.textContent='לא הצלחתי לטעון.'; });
  }
  function hookDash(){
    if(typeof window.showDash!=='function'||window.showDash.__tt) return false;
    var _sd=window.showDash;
    var w=function(){ var p=_sd.apply(this,arguments); setTimeout(addParent,200); var bx=$('parentBox'); if(bx){ var t=null; var mo=new MutationObserver(function(){ clearTimeout(t); t=setTimeout(addParent,220); }); mo.observe(bx,{childList:true}); setTimeout(function(){ mo.disconnect(); },30000); } return p; };
    w.__tt=1; window.showDash=w; return true;
  }
  if(!hookDash()){ var hk=0, hi=setInterval(function(){ if(hookDash()||++hk>30) clearInterval(hi); },500); }

  window.TM_TUTOR={open:open,cfg:cfg,reload:load};
})();

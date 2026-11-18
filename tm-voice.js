/* teach-me — 🔊 הקול של הילה בכל טלפון (18.11.2026, אושר ע״י ההורה)
   כל מה שהאפליקציה אומרת בעברית (הכתבה, שיעורים, תזכורות, סיכום לשמיעה…) עובר דרך הקול הטבעי של מיקרוסופט
   ("הילה", ו"אברי" כשהקריין גבר) — בכל טלפון, לא רק ב-Edge.
   איך: עוטפים את speechSynthesis.speak. משפט בעברית → מבקשים קובץ קול מ-Azure (מסלול חינמי, חצי מיליון תווים בחודש),
   שומרים אותו בזיכרון של הטלפון (אותו משפט לא נשלח פעמיים), ומשמיעים. כל האירועים (start/end/error) נשלחים כרגיל,
   כך שהקוד הקיים לא מרגיש שום הבדל.
   בלי מפתח / בלי אינטרנט / תקלה → הקול של הטלפון, כמו קודם. אנגלית תמיד בקול של הטלפון.
   ההגדרות (מפתח + אזור) נשמרות ב-cfg/voice בענן, נקראות רק בטלפון מאושר. בתוך ההכתבה (iframe) — לוקחים מהחלון הראשי. */
(function(){
  if(window.__tmVoice) return; window.__tmVoice=1;
  var SS=window.speechSynthesis;
  if(!SS||!window.fetch||!window.Audio||typeof SS.speak!=='function') return;

  /* ---------- הגדרות ---------- */
  var LS='tm_vcfg', CFG=null, BAD=0;
  try{ CFG=JSON.parse(localStorage.getItem(LS)||'null'); }catch(e){ CFG=null; }
  var TOP=null; try{ if(window.parent&&window.parent!==window&&window.parent.TM_VOICE) TOP=window.parent.TM_VOICE; }catch(e){ TOP=null; }
  function norm(c){
    if(!c||typeof c!=='object') return null;
    var key=String(c.key||'').trim(), region=String(c.region||'').trim().toLowerCase().replace(/[^a-z0-9]/g,'');
    if(!key||!region) return null;
    return {key:key,region:region,on:c.on!==false,f:String(c.f||'he-IL-HilaNeural'),m:String(c.m||'he-IL-AvriNeural')};
  }
  function cfg(){ if(TOP){ try{ return TOP.cfg(); }catch(e){ return null; } } return CFG; }
  function setCfg(c){
    CFG=norm(c); BAD=0;
    try{ if(CFG) localStorage.setItem(LS,JSON.stringify(CFG)); else localStorage.removeItem(LS); }catch(e){}
  }
  function live(){ var c=cfg(); return !!(c&&c.on&&Date.now()>BAD&&(!TOP||TOP.ok())); }

  /* ---------- השמעה ---------- */
  var oSpeak=SS.speak.bind(SS), oCancel=SS.cancel.bind(SS), oPause=SS.pause.bind(SS), oResume=SS.resume.bind(SS);
  var PROTO=Object.getPrototypeOf(SS)||{};
  function pd(n){ try{ var d=Object.getOwnPropertyDescriptor(PROTO,n); return d&&typeof d.get==='function'?d.get:null; }catch(e){ return null; } }
  var G={speaking:pd('speaking'),pending:pd('pending'),paused:pd('paused')};
  function nat(n){ try{ return G[n]?!!G[n].call(SS):false; }catch(e){ return false; } }
  var au=new Audio(); au.preload='auto'; try{ au.setAttribute('playsinline',''); }catch(e){}
  var Q=[], cur=null, curNative=false, gen=0, mine=false, myPaused=false;
  var SILENT='data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjYwLjE2LjEwMAAAAAAAAAAAAAAA//OEwAAAAAAAAAAAAEluZm8AAAAPAAAABQAAAqAAbW1tbW1tbW1tbW1tbW1tbW1tbZKSkpKSkpKSkpKSkpKSkpKSkpKStra2tra2tra2tra2tra2tra2trbb29vb29vb29vb29vb29vb29vb2///////////////////////////AAAAAExhdmM2MC4zMQAAAAAAAAAAAAAAACQEUAAAAAAAAAKgvT9A1gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//NExAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMu//NExFMAAANIAAAAADEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMu//NExKYAAANIAAAAADEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NExKwAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NExKwAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';

  /* אייפון: שחרור הנגן בנגיעה הראשונה, כדי שאחר כך יוכל לדבר לבד (הכתבה ברצף) */
  var unlocked=false;
  function unlock(){
    if(unlocked) return; unlocked=true;
    try{ if(!mine){ au.src=SILENT; var p=au.play(); if(p&&p.catch) p.catch(function(){ unlocked=false; }); } }catch(e){ unlocked=false; }
  }
  ['pointerdown','touchend','keydown'].forEach(function(t){ document.addEventListener(t,unlock,{capture:true,passive:true}); });

  function isHe(u){
    var l=String(u.lang||(u.voice&&u.voice.lang)||'').toLowerCase();
    if(l) return l.indexOf('he')===0||l.indexOf('iw')===0;
    return /[֐-׿]/.test(String(u.text||''));
  }
  function isMale(v){
    if(!v) return false;
    try{ if(typeof window.lsIsMale==='function') return !!window.lsIsMale(v); }catch(e){}
    return /avri|asaf|male|גבר/i.test(String(v.name||''))&&!/female/i.test(String(v.name||''));
  }
  function fire(u,type,extra){
    try{
      var e=null;
      try{ e=type==='error'?new SpeechSynthesisErrorEvent('error',{utterance:u,error:(extra&&extra.error)||'interrupted'}):new SpeechSynthesisEvent(type,{utterance:u,charIndex:0,elapsedTime:0}); }catch(x){ e=null; }
      if(!e){ e=new Event(type); try{ if(extra) for(var k in extra) e[k]=extra[k]; }catch(x){} }
      u.dispatchEvent(e);
    }catch(x){}
  }
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;'); }
  function clean(s){ return String(s||'').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu,' ').replace(/\s+/g,' ').trim(); }
  function pct(x,k){ var n=Math.round((x-1)*k); n=Math.max(-40,Math.min(60,n)); return (n>=0?'+':'')+n+'%'; }
  function hash(s){ var h=5381,i; for(i=0;i<s.length;i++) h=((h<<5)+h+s.charCodeAt(i))|0; return (h>>>0).toString(36)+'-'+s.length; }

  var MEM=new Map(), CN='tm-tts';
  function memPut(k,url){ MEM.set(k,url); if(MEM.size>80){ var f=MEM.keys().next().value; try{ URL.revokeObjectURL(MEM.get(f)); }catch(e){} MEM.delete(f); } }
  function getAudio(u,c){
    var text=clean(u.text); if(!text) return Promise.reject(new Error('empty'));
    var vn=isMale(u.voice)?c.m:c.f, rate=u.rate||1, pitch=u.pitch||1;
    var ssml='<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="he-IL"><voice name="'+esc(vn)+'"><prosody rate="'+pct(rate,100)+'" pitch="'+pct(pitch,25)+'">'+esc(text)+'</prosody></voice></speak>';
    var key='https://tts.teach-me.local/'+hash(vn+'|'+rate.toFixed(2)+'|'+pitch.toFixed(2)+'|'+text);
    if(MEM.has(key)) return Promise.resolve(MEM.get(key));
    var fromCache=('caches' in window)?caches.open(CN).then(function(cc){ return cc.match(key).then(function(r){ return r?r.blob():null; }); }).catch(function(){ return null; }):Promise.resolve(null);
    return fromCache.then(function(b){
      if(b&&b.size>100){ var url=URL.createObjectURL(b); memPut(key,url); return url; }
      var ctl=window.AbortController?new AbortController():null, to=setTimeout(function(){ try{ ctl&&ctl.abort(); }catch(e){} },7000);
      return fetch('https://'+c.region+'.tts.speech.microsoft.com/cognitiveservices/v1',{
        method:'POST', signal:ctl?ctl.signal:undefined,
        headers:{'Ocp-Apim-Subscription-Key':c.key,'Content-Type':'application/ssml+xml','X-Microsoft-OutputFormat':'audio-24khz-48kbitrate-mono-mp3'},
        body:ssml
      }).then(function(r){
        clearTimeout(to);
        if(!r.ok){ if(r.status===401||r.status===403) BAD=Date.now()+30*60000; else if(r.status===429) BAD=Date.now()+5*60000; throw new Error('tts '+r.status); }
        return r.blob();
      }).then(function(b){
        if(!b||b.size<100) throw new Error('tts empty');
        try{ if('caches' in window) caches.open(CN).then(function(cc){ cc.put(key,new Response(b,{headers:{'Content-Type':'audio/mpeg'}})); trim(cc); }).catch(function(){}); }catch(e){}
        try{ window.TM_VOICE_USED=(window.TM_VOICE_USED||0)+text.length; }catch(e){}
        var url=URL.createObjectURL(b); memPut(key,url); return url;
      },function(e){ clearTimeout(to); throw e; });
    });
  }
  var trimT=0;
  function trim(cc){ if(trimT>Date.now()) return; trimT=Date.now()+60000; cc.keys().then(function(ks){ if(ks.length>1500) ks.slice(0,ks.length-1200).forEach(function(k){ cc.delete(k); }); }).catch(function(){}); }

  function finish(u,my){ if(my!==gen||cur!==u) return; cur=null; curNative=false; mine=false; next(); }
  function playNative(u,my){
    curNative=true; mine=false;
    var done=function(){ u.removeEventListener('end',done); u.removeEventListener('error',done); finish(u,my); };
    u.addEventListener('end',done); u.addEventListener('error',done);
    try{ oSpeak(u); }catch(e){ done(); }
  }
  function next(){
    if(cur) return;
    cur=Q.shift()||null; if(!cur) return;
    var u=cur, my=++gen, c=cfg();
    if(!isHe(u)||!live()||!c){ playNative(u,my); return; }
    mine=true; curNative=false;
    getAudio(u,c).then(function(url){
      if(my!==gen) return;
      au.onended=function(){ if(my!==gen) return; fire(u,'end'); finish(u,my); };
      au.onerror=function(){ if(my!==gen) return; playNative(u,my); };
      au.src=url; try{ au.volume=(u.volume==null||u.volume<0)?1:Math.min(1,u.volume); }catch(e){}
      var p=au.play();
      if(p&&p.then) p.then(function(){ if(my===gen) fire(u,'start'); },function(){ if(my===gen) playNative(u,my); });
      else fire(u,'start');
    },function(){ if(my===gen) playNative(u,my); });
  }

  SS.speak=function(u){
    if(!u) return oSpeak(u);
    if(!live()&&!cur&&!Q.length) return oSpeak(u);
    Q.push(u); next();
  };
  SS.cancel=function(){
    var u=cur, wasMine=mine&&u; Q=[]; cur=null; gen++; mine=false; myPaused=false; curNative=false;
    try{ au.onended=au.onerror=null; au.pause(); }catch(e){}
    try{ oCancel(); }catch(e){}
    if(wasMine) fire(u,'error',{error:'interrupted'});
  };
  SS.pause=function(){ if(mine){ myPaused=true; try{ au.pause(); }catch(e){} } else oPause(); };
  SS.resume=function(){ if(mine&&myPaused){ myPaused=false; try{ au.play().catch(function(){}); }catch(e){} } else oResume(); };
  /* רק אם מצאנו את הקריאה המקורית — אחרת לא נוגעים (כדי לא לשבור את "האם מדבר עכשיו?") */
  try{
    if(G.speaking) Object.defineProperty(SS,'speaking',{configurable:true,get:function(){ return (mine&&!!cur)||nat('speaking'); }});
    if(G.pending) Object.defineProperty(SS,'pending',{configurable:true,get:function(){ return Q.length>0||nat('pending'); }});
    if(G.paused) Object.defineProperty(SS,'paused',{configurable:true,get:function(){ return mine?myPaused:nat('paused'); }});
  }catch(e){}

  /* ---------- טעינת ההגדרות מהענן (רק בחלון הראשי) ---------- */
  function cloud(){ try{ return (typeof DB!=='undefined'&&DB)?DB:null; }catch(e){ return null; } }
  var loadedAt=0;
  function load(){
    var d=cloud(); if(!d) return Promise.resolve(false);
    return d.doc('cfg/voice').get().then(function(s){ loadedAt=Date.now(); setCfg(s&&s.exists?s.data():null); return true; },function(){ return false; });
  }
  if(!TOP){
    var tries=0, iv=setInterval(function(){ tries++; load().then(function(ok){ if(ok||tries>40) clearInterval(iv); }); },1500);
    document.addEventListener('visibilitychange',function(){ if(document.visibilityState==='visible'&&Date.now()-loadedAt>10*60000) load(); });
  }

  /* ---------- ממשק לחלון הראשי, לאזור ההורים ולהכתבה ---------- */
  window.TM_VOICE={
    cfg:cfg,
    ok:function(){ return Date.now()>BAD; },
    live:live,
    set:function(c){ setCfg(c); },
    reload:load,
    /* בדיקה מאזור ההורים: מחזיר '' אם עבד, או הודעת שגיאה קצרה */
    test:function(c,text){
      var n=norm(c); if(!n) return Promise.resolve('חסר מפתח או אזור');
      var u={text:text||'שלום! ככה נשמע הקול החדש שלי. נעים להכיר.',rate:0.97,pitch:1,voice:null};
      return getAudio(u,n).then(function(url){ try{ SS.cancel(); }catch(e){} mine=true; cur=null; au.onended=function(){ mine=false; }; au.onerror=au.onended; au.src=url; return au.play().then(function(){ return ''; },function(){ mine=false; return 'הקול הגיע, אבל הטלפון לא נתן להשמיע. נסו שוב'; }); },
        function(e){ var m=String(e&&e.message||''); return /401|403/.test(m)?'המפתח או האזור לא נכונים':/429/.test(m)?'יותר מדי בקשות. נסו עוד דקה':'לא הצלחתי להתחבר ל-Azure'; });
    }
  };
})();

/* teach-me — חיבור ל-Firebase (8.11.2026)
   האפליקציה נכתבה במקור לענן של Claude (window.claude.use). הקובץ הזה נותן לה
   את אותו ממשק בדיוק, אבל שומר ב-Firebase. ינשופי (sample) כבוי — הוחלט לוותר עליו. */
(function(){
  var CFG={
    apiKey:"AIzaSyAkpMP6QkJZS67fOvVwP3yeuz-gMu1150Q",
    authDomain:"teach-me-cd228.firebaseapp.com",
    projectId:"teach-me-cd228",
    storageBucket:"teach-me-cd228.firebasestorage.app",
    messagingSenderId:"91472219194",
    appId:"1:91472219194:web:32e3fecdc791bc7ec63903"
  };
  /* 18.11.2026 לילה (אושר): App Check — הענן מקבל רק בקשות שבאות מהאפליקציה עצמה.
     כבוי עד שמדביקים כאן את מפתח האתר (reCAPTCHA v3) מקונסול Firebase. ריק = כמו קודם. */
  var APPCHECK_KEY='';
  /* 18.11.2026 (המורה שלי, אושר): אותן הגדרות גם לספריית ה-AI (lib/fb13) */
  window.TM_FB_CFG=CFG; window.TM_APPCHECK_KEY=APPCHECK_KEY;
  var V='10.12.2', BASE='https://www.gstatic.com/firebasejs/'+V+'/';
  function load(src){ return new Promise(function(ok,bad){ var s=document.createElement('script'); s.src=src; s.onload=ok; s.onerror=bad; document.head.appendChild(s); }); }

  /* כל מסמך נשמר כמחרוזת JSON אחת (j) — כך אין בעיה עם מערכים בתוך מערכים או ערכים ריקים */
  function unwrap(x){ if(x&&typeof x.j==='string'){ try{ return JSON.parse(x.j); }catch(e){} } return x; }
  function snapDoc(d){ return { id:d.id, exists:!!d.exists, data:function(){ return d.exists?unwrap(d.data()):undefined; } }; }
  function snapCol(s){ var docs=s.docs.map(snapDoc); return { docs:docs, size:docs.length, empty:!docs.length, forEach:function(f){ docs.forEach(f); } }; }

  function makeDb(fs){
    function doc(path){
      var r=fs.doc(path);
      return {
        id:r.id, path:path,
        get:function(){ return r.get().then(snapDoc); },
        set:function(o){ return r.set({j:JSON.stringify(o===undefined?null:o), t:Date.now()}); },
        delete:function(){ return r.delete(); },
        onSnapshot:function(cb,err){ return r.onSnapshot(function(s){ cb(snapDoc(s)); }, err||function(){}); }
      };
    }
    /* 12.11.2026 (חיסכון במכסה): שאילתה לפי שם המסמך — since('2026-10-13') = מהיום הזה והלאה, before(...) = לפניו.
       get({source:'cache'}) קורא מהזיכרון של הטלפון בלי לגעת בענן. */
    function query(q){
      return {
        get:function(o){ return (o?q.get(o):q.get()).then(snapCol); },
        onSnapshot:function(cb,err){ return q.onSnapshot(function(s){ cb(snapCol(s)); }, err||function(){}); }
      };
    }
    function collection(path){
      var c=fs.collection(path), ID=function(){ return firebase.firestore.FieldPath.documentId(); };
      return {
        path:path,
        doc:function(id){ return doc(path+'/'+id); },
        get:function(o){ return (o?c.get(o):c.get()).then(snapCol); },
        onSnapshot:function(cb,err){ return c.onSnapshot(function(s){ cb(snapCol(s)); }, err||function(){}); },
        since:function(id){ return query(c.where(ID(),'>=',id)); },
        before:function(id){ return query(c.where(ID(),'<',id)); }
      };
    }
    return { doc:doc, collection:collection };
  }


  /* ---------- 18.11.2026: נעילת מסד הנתונים (אושר ע״י ההורה) ----------
     כל טלפון נרשם ב-dev/{uid}. רק טלפון שאבא או אמא אישרו קורא וכותב (firestore.rules).
     טלפון שכבר היה מחובר לפני פרסום הכללים נרשם כמאושר. אחרי הפרסום — טלפון חדש מחכה לאישור.
     המסמכים ב-dev/ נשמרים רגיל (לא כ-j), כדי שהכללים יוכלו לבדוק את ok. */
  var KN={aviv:'אביב',roni:'רוני',hili:'הילי',ziv:'זיו'};
  function lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
  function myLock(){ var L=lsGet('tm_lock'); return KN[L]?L:null; }
  function devKind(){ var u=navigator.userAgent; return /iPhone/.test(u)?'אייפון':/iPad/.test(u)?'אייפד':/Android/.test(u)?'אנדרואיד':'מחשב'; }
  /* 18.11.2026 לילה (בדיקת אבטחה, אושר): קוד גדול להשוואה — מאשרים רק כשהקוד זהה לקוד על המסך של הטלפון */
  function code(id){ return String(id||'').slice(0,5); }
  var CODE_CSS='font-family:ui-monospace,Menlo,Consolas,monospace;font-weight:800;letter-spacing:.12em;direction:ltr;unicode-bidi:isolate';
  function el(tag,css,txt){ var e=document.createElement(tag); if(css) e.style.cssText=css; if(txt!=null) e.textContent=txt; return e; }
  function devGate(fs,uid){
    var ref=fs.collection('dev').doc(uid);
    return ref.get().then(function(d){
      if(d.exists) return d.data().ok===true;
      var base={at:Date.now(),kind:devKind(),who:myLock()||'parent'};
      return ref.set(Object.assign({},base,{ok:true})).then(function(){ return true; },function(){
        return ref.set(Object.assign({},base,{ok:false})).then(function(){ return false; },function(){ return true; });
      });
    },function(){ return true; })   /* בלי קליטה — ממשיכים עם מה שבזיכרון של הטלפון */
    .then(function(okd){
      if(okd) return;
      return new Promise(function(res){
        var w=el('div','position:fixed;inset:0;z-index:2147483000;background:#F4F6FB;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:24px;text-align:center;font-family:inherit;direction:rtl');
        w.appendChild(el('div','font-size:3rem','🔒'));
        w.appendChild(el('div','font-size:1.25rem;font-weight:700;color:#1F2A44','הטלפון מחכה לאישור של אבא או אמא'));
        w.appendChild(el('div','font-size:.95rem;color:#55607A','בטלפון של ההורים: teach-me ← 📱 טלפונים ← ✅'));
        w.appendChild(el('div','font-size:.95rem;color:#55607A;margin-top:6px','הקוד של הטלפון הזה ('+devKind()+'):'));
        w.appendChild(el('div',CODE_CSS+';font-size:2.4rem;color:#1F2A44;background:#fff;border:2px solid #D5DBE8;border-radius:14px;padding:8px 18px',code(uid)));
        w.appendChild(el('div','font-size:.85rem;color:#8A93A8','ההורים מאשרים רק אם רואים אצלם את אותו קוד'));
        var put=function(){ (document.body||document.documentElement).appendChild(w); };
        if(document.body) put(); else document.addEventListener('DOMContentLoaded',put);
        var off=ref.onSnapshot(function(s){ if(s.exists&&s.data().ok===true){ off(); w.remove(); res(); } },function(){});
      });
    });
  }
  /* רשימת הטלפונים — רק בטלפון של הורים (לא נעול על ילדה) */
  function devAdmin(fs){
    if(myLock()) return;
    var list=[], btn=null, box=null;
    var col=fs.collection('dev');
    function name(d){ return d.who==='server'?'⚙️ '+(d.kind||'שרת'):d.who==='yaya'?'🏠 yaya · '+(d.kind||''):(KN[d.who]?'טלפון של '+KN[d.who]:'טלפון של הורים')+' · '+(d.kind||''); }
    function when(t){ try{ return new Date(t).toLocaleDateString('he-IL',{day:'numeric',month:'numeric'}); }catch(e){ return ''; } }
    function paintBtn(){
      var pend=list.filter(function(x){ return x.d.ok!==true; }).length;
      var inParent=!!document.querySelector('#parentOv.show,#parentOv.on,#parentOv.open,#parentOv[style*="flex"]');
      if(!btn){ btn=el('button','position:fixed;left:12px;bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:2147482000;border:none;border-radius:999px;padding:10px 16px;font:inherit;font-weight:700;box-shadow:0 4px 14px rgba(0,0,0,.18);direction:rtl'); btn.type='button'; btn.onclick=openBox; document.body.appendChild(btn); }
      btn.textContent=pend?'📱 '+pend+' מחכים לאישור':'📱 טלפונים';
      btn.style.background=pend?'#E8590C':'#1F55B8'; btn.style.color='#fff';
      btn.style.display=(pend||inParent)?'':'none';
      if(box) paintBox();
    }
    function act(id,ok){ var r=col.doc(id); (ok?r.update({ok:true,okAt:Date.now()}):r.delete()).catch(function(){ alert('לא הצלחתי. בדקו חיבור לאינטרנט.'); }); }
    function paintBox(){
      var inner=box.firstChild; inner.innerHTML='';
      var top=el('div','display:flex;justify-content:space-between;align-items:center;margin-bottom:10px');
      top.appendChild(el('div','font-size:1.15rem;font-weight:700','📱 טלפונים'));
      var x=el('button','border:none;background:#EEF1F7;border-radius:10px;padding:6px 12px;font:inherit','סגור'); x.type='button'; x.onclick=function(){ box.remove(); box=null; };
      top.appendChild(x); inner.appendChild(top);
      if(list.some(function(it){ return it.d.ok!==true; })) inner.appendChild(el('div','background:#FFF4E6;color:#8A4B08;border-radius:10px;padding:8px 10px;margin-bottom:8px;font-size:.88rem','לאשר ✅ רק אם הקוד הגדול זהה לקוד שמופיע על המסך של הטלפון שביד. לא מכירים? ❌'));
      list.slice().sort(function(a,b){ return (a.d.ok===true)-(b.d.ok===true)||(b.d.at||0)-(a.d.at||0); }).forEach(function(it){
        var me=it.id===(firebase.auth().currentUser||{}).uid;
        var row=el('div','display:flex;align-items:center;gap:8px;padding:9px 0;border-top:1px solid #E6E9F0');
        var t=el('div','flex:1;min-width:0'); t.appendChild(el('div','font-weight:600',name(it.d)+(me?' (הטלפון הזה)':'')));
        t.appendChild(el('div','font-size:.8rem;color:#7A849A',(it.d.ok===true?'מאושר':'⏳ מחכה')+' · '+when(it.d.at)+' · '+it.id.slice(0,5)));
        row.appendChild(t);
        if(it.d.ok!==true) row.appendChild(el('div',CODE_CSS+';font-size:1.35rem;background:#EEF1F7;border-radius:8px;padding:4px 8px',code(it.id)));
        if(it.d.ok!==true){ var a=el('button','border:none;background:#2F9E44;color:#fff;border-radius:10px;padding:7px 12px;font:inherit;font-weight:700','✅ אשר'); a.type='button'; a.onclick=function(){ act(it.id,true); }; row.appendChild(a); }
        if(!me){ var r=el('button','border:none;background:#FFE3E3;color:#C92A2A;border-radius:10px;padding:7px 12px;font:inherit','❌'); r.type='button'; r.onclick=function(){ if(confirm(it.d.ok===true?'לנתק את הטלפון הזה?':'לדחות את הטלפון הזה?')) act(it.id,false); }; row.appendChild(r); }
        inner.appendChild(row);
      });
    }
    function openBox(){
      if(box) return;
      box=el('div','position:fixed;inset:0;z-index:2147482500;background:rgba(20,28,48,.45);display:flex;align-items:flex-end;justify-content:center;direction:rtl');
      box.appendChild(el('div','background:#fff;color:#1F2A44;width:100%;max-width:520px;max-height:80vh;overflow:auto;border-radius:18px 18px 0 0;padding:16px 16px calc(16px + env(safe-area-inset-bottom,0px))'));
      box.onclick=function(e){ if(e.target===box){ box.remove(); box=null; } };
      document.body.appendChild(box); paintBox();
    }
    function start(){
      col.onSnapshot(function(s){ list=s.docs.map(function(d){ return {id:d.id,d:d.data()}; }); paintBtn(); },function(){});
      var po=document.getElementById('parentOv');
      if(po&&window.MutationObserver) new MutationObserver(function(){ if(btn) paintBtn(); }).observe(po,{attributes:true,attributeFilter:['class','style']});
    }
    if(document.body) start(); else document.addEventListener('DOMContentLoaded',start);
  }

  var dbP=null;
  function getDb(){
    if(dbP) return dbP;
    dbP=load(BASE+'firebase-app-compat.js')
      .then(function(){ var L=[load(BASE+'firebase-auth-compat.js'),load(BASE+'firebase-firestore-compat.js')]; if(APPCHECK_KEY) L.push(load(BASE+'firebase-app-check-compat.js').catch(function(){})); return Promise.all(L); })
      .then(function(){
        var app=firebase.apps.length?firebase.app():firebase.initializeApp(CFG);
        if(APPCHECK_KEY&&firebase.appCheck){ try{ var AC=firebase.appCheck(); AC.activate(firebase.appCheck.ReCaptchaV3Provider?new firebase.appCheck.ReCaptchaV3Provider(APPCHECK_KEY):APPCHECK_KEY,true); }catch(e){} }
        var fs=firebase.firestore();
        try{ fs.enablePersistence({synchronizeTabs:true}).catch(function(){}); }catch(e){}
        return new Promise(function(ok,bad){
          var done=false;
          firebase.auth().onAuthStateChanged(function(u){ if(u&&!done){ done=true; devGate(fs,u.uid).then(function(){ ok(makeDb(fs)); devAdmin(fs); }); } });
          firebase.auth().signInAnonymously().catch(function(e){ if(!done){ done=true; bad(e); } });
          setTimeout(function(){ if(!done){ done=true; bad({code:'timeout'}); } },20000);
        });
      })
      .catch(function(e){ dbP=null; throw e; });
    return dbP;
  }

  /* שמירת קבצים: בטלפון — חלון השיתוף (שומרים ל"קבצים" או שולחים בוואטסאפ); במחשב — הורדה רגילה */
  var downloads={ save:function(o){
    var blob=o.data instanceof Blob?o.data:new Blob([o.data]), name=o.filename||'file';
    try{
      var f=new File([blob],name,{type:blob.type||'application/octet-stream'});
      if(navigator.canShare&&navigator.canShare({files:[f]})&&/iPhone|iPad|Android/i.test(navigator.userAgent)) return navigator.share({files:[f]});
    }catch(e){}
    var a=document.createElement('a'), u=URL.createObjectURL(blob); a.href=u; a.download=name; document.body.appendChild(a); a.click();
    setTimeout(function(){ URL.revokeObjectURL(u); a.remove(); },4000);
    return Promise.resolve();
  }};

  var user={ isOwner:function(){ return Promise.resolve(true); }, can:function(){ return Promise.resolve(true); }, me:function(){ return Promise.resolve({name:''}); } };

  window.TM_STANDALONE=true;
  window.claude={ use:function(name){
    if(name==='db') return getDb().catch(function(){ return null; });
    if(name==='downloads') return Promise.resolve(downloads);
    if(name==='user') return Promise.resolve(user);
    return Promise.resolve(null);   /* sample (ינשופי) ושאר היכולות — לא קיימים כאן */
  }};
  getDb().catch(function(){});
})();

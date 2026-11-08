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
    function collection(path){
      var c=fs.collection(path);
      return {
        path:path,
        doc:function(id){ return doc(path+'/'+id); },
        get:function(){ return c.get().then(snapCol); },
        onSnapshot:function(cb,err){ return c.onSnapshot(function(s){ cb(snapCol(s)); }, err||function(){}); }
      };
    }
    return { doc:doc, collection:collection };
  }

  var dbP=null;
  function getDb(){
    if(dbP) return dbP;
    dbP=load(BASE+'firebase-app-compat.js')
      .then(function(){ return Promise.all([load(BASE+'firebase-auth-compat.js'),load(BASE+'firebase-firestore-compat.js')]); })
      .then(function(){
        var app=firebase.apps.length?firebase.app():firebase.initializeApp(CFG);
        var fs=firebase.firestore();
        try{ fs.enablePersistence({synchronizeTabs:true}).catch(function(){}); }catch(e){}
        return new Promise(function(ok,bad){
          var done=false;
          firebase.auth().onAuthStateChanged(function(u){ if(u&&!done){ done=true; ok(makeDb(fs)); } });
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

/* 18.11.2026: המטמון tm-tts (קבצי הקול של הילה) לא נמחק בעדכון. */
/* teach-me — תמיד הגרסה החדשה (14.11.2026, אושר).
   קבצי האפליקציה (html/js): קודם מהרשת — כך כל חומר חדש מגיע מיד. אם אין אינטרנט, או שהרשת איטית מ-4 שניות —
   מהזיכרון של הטלפון (והגרסה החדשה ממשיכה לרדת ברקע). תמונות, אייקונים וגופנים: מהזיכרון, ומתעדכנים ברקע. */
const C='tm-v44';
const CORE=['./','index.html','tm-err.js','firebase-bridge.js','tm-voice.js','tm-tips.js','tm-tutor.js','tm-play.js','tm-tabs.js','manifest.webmanifest','icon-192.png','dictation.html','kefel.html','t3d.js','lib/three-r128.min.js'];
self.addEventListener('install',e=>{ self.skipWaiting(); e.waitUntil(caches.open(C).then(c=>c.addAll(CORE).catch(()=>{}))); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C&&k!=='tm-tts').map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  const u=new URL(r.url);
  const mine=u.origin===location.origin, cdn=/gstatic\.com\/firebasejs|fonts\.(googleapis|gstatic)\.com/.test(u.href);
  if(!mine&&!cdn) return;
  const key=mine?new Request(u.origin+u.pathname):r;   /* בלי #קוד-ילדה ובלי ?פרמטרים — אותו קובץ */
  const fresh=mine&&(r.mode==='navigate'||/(\/|\.html|\.js|\.webmanifest)$/.test(u.pathname));
  e.respondWith(caches.open(C).then(c=>{
    const net=fetch(r,mine?{cache:'no-cache'}:undefined).then(res=>{ if(res&&(res.ok||res.type==='opaque')) c.put(key,res.clone()).catch(()=>{}); return res; });
    if(fresh){
      /* קודם רשת; אם נכשלה או איטית — מהזיכרון */
      return new Promise(done=>{
        let over=false; const fin=x=>{ if(!over){ over=true; done(x); } };
        const fromCache=()=>c.match(key).then(h=>h||c.match('index.html')).then(h=>{ if(h) fin(h); else net.then(fin,()=>fin(Response.error())); });
        const t=setTimeout(fromCache,4000);
        net.then(res=>{ clearTimeout(t); if(res&&res.ok) fin(res); else fromCache(); },()=>{ clearTimeout(t); fromCache(); });
        e.waitUntil(net.catch(()=>{}));
      });
    }
    return c.match(key).then(hit=>{
      if(hit){ e.waitUntil(net.catch(()=>{})); return hit; }
      return net.catch(()=>c.match('index.html'));
    });
  }));
});

/* 🔔 תזכורות לבחינות גם כשהאפליקציה סגורה (10.11.2026) */
self.addEventListener('push',e=>{
  let p={}; try{ p=e.data?e.data.json():{}; }catch(x){ p={body:e.data?e.data.text():''}; }
  const n=p.notification||p;
  e.waitUntil(self.registration.showNotification(n.title||'teach-me',{
    body:n.body||'', icon:n.icon||'icon-192.png', badge:'icon-192.png', lang:'he', dir:'rtl',
    tag:n.tag||'tm', data:{url:n.url||'./'}
  }));
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  const url=(e.notification.data&&e.notification.data.url)||'./';
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(L=>{
    for(const c of L){ if('focus' in c) return c.focus(); }
    return self.clients.openWindow(url);
  }));
});

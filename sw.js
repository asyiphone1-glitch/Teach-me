/* teach-me — פתיחה מיידית (10.11.2026).
   הקבצים של האפליקציה נפתחים מיד מהזיכרון של הטלפון, ובמקביל הגרסה החדשה יורדת ברקע.
   בפתיחה הבאה כבר רואים אותה. בפעם הראשונה (או אם אין שום דבר בזיכרון) — מהרשת. */
const C='tm-v6';
const CORE=['./','index.html','firebase-bridge.js','manifest.webmanifest','icon-192.png','dictation.html','t3d.js','lib/three-r128.min.js'];
self.addEventListener('install',e=>{ self.skipWaiting(); e.waitUntil(caches.open(C).then(c=>c.addAll(CORE).catch(()=>{}))); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  const u=new URL(r.url);
  const mine=u.origin===location.origin, cdn=/gstatic\.com\/firebasejs|fonts\.(googleapis|gstatic)\.com/.test(u.href);
  if(!mine&&!cdn) return;
  const key=mine?new Request(u.origin+u.pathname):r;   /* בלי #קוד-ילדה ובלי ?פרמטרים — אותו קובץ */
  e.respondWith(caches.open(C).then(c=>c.match(key).then(hit=>{
    const net=fetch(r,mine?{cache:'no-cache'}:undefined).then(res=>{ if(res&&(res.ok||res.type==='opaque')) c.put(key,res.clone()); return res; });
    if(hit){ e.waitUntil(net.catch(()=>{})); return hit; }
    return net.catch(()=>c.match('index.html'));
  })));
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

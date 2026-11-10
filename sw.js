/* teach-me — פתיחה מיידית (10.11.2026).
   הקבצים של האפליקציה נפתחים מיד מהזיכרון של הטלפון, ובמקביל הגרסה החדשה יורדת ברקע.
   בפתיחה הבאה כבר רואים אותה. בפעם הראשונה (או אם אין שום דבר בזיכרון) — מהרשת. */
const C='tm-v2';
const CORE=['./','index.html','firebase-bridge.js','manifest.webmanifest','icon-192.png','dictation.html','t3d.js'];
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

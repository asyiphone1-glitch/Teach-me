/* teach-me — עבודה גם בלי אינטרנט. תמיד מנסים קודם את הגרסה החדשה מהרשת, ואם אין רשת — מהזיכרון */
const C='tm-v1';
self.addEventListener('install',e=>{ self.skipWaiting(); e.waitUntil(caches.open(C).then(c=>c.addAll(['./','index.html','firebase-bridge.js','manifest.webmanifest','icon-192.png']).catch(()=>{}))); });
self.addEventListener('activate',e=>{ e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  const u=new URL(r.url);
  const mine=u.origin===location.origin, cdn=/gstatic\.com\/firebasejs|fonts\.(googleapis|gstatic)\.com/.test(u.href);
  if(!mine&&!cdn) return;
  e.respondWith(fetch(r).then(res=>{ if(res&&(res.ok||res.type==='opaque')){ const cp=res.clone(); caches.open(C).then(c=>c.put(r,cp)); } return res; })
    .catch(()=>caches.match(r,{ignoreSearch:mine}).then(m=>m||caches.match('index.html'))));
});

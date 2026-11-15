// teach-me — 🛡️ רשת ביטחון, שלב 2: לחיצות באצבע כמו בטלפון (15.11.2026, אושר בישיבת צוות)
// פותח את האפליקציה בדפדפן בגודל אייפון, עם מסך מגע אמיתי (touch) ועם ענן מדומה,
// ולוחץ על כפתורים בכל המסכים: 4 הבנות, אבא, ההורים, הכתבה ולוח הכפל.
// כל שגיאת JavaScript = העדכון לא מגיע לבנות.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, devices } from 'playwright';

const ROOT = process.cwd();
const TAPS = +(process.env.TAPS || 60);
const SHOTS = process.env.SHOTS || '';
let seed = +(process.env.SEED || 15112026);
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.webp': 'image/webp', '.pdf': 'application/pdf', '.svg': 'image/svg+xml', '.wasm': 'application/wasm', '.mp3': 'audio/mpeg' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0].split('#')[0]).replace(/^\/+/, '') || 'index.html');
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const BASE = 'http://127.0.0.1:' + server.address().port + '/';

// ענן מדומה — אותו ממשק כמו firebase-bridge.js, הכול בזיכרון
const MOCK_BRIDGE = `(function(){
  var M=window.__TM_DB=new Map(), L=[];
  function snapDoc(p){ var v=M.get(p); return {id:p.split('/').pop(),exists:v!==undefined,data:function(){ return v===undefined?undefined:JSON.parse(JSON.stringify(v)); }}; }
  function kids(c){ var out=[]; M.forEach(function(v,k){ var i=k.lastIndexOf('/'); if(k.slice(0,i)===c) out.push(snapDoc(k)); }); return out; }
  function col(docs){ return {docs:docs,size:docs.length,empty:!docs.length,forEach:function(f){ docs.forEach(f); }}; }
  function fire(){ L.forEach(function(f){ try{ f(); }catch(e){} }); }
  function doc(p){ return {id:p.split('/').pop(),path:p,
    get:function(){ return Promise.resolve(snapDoc(p)); },
    set:function(o){ M.set(p,JSON.parse(JSON.stringify(o===undefined?null:o))); setTimeout(fire,0); return Promise.resolve(); },
    delete:function(){ M.delete(p); setTimeout(fire,0); return Promise.resolve(); },
    onSnapshot:function(cb){ var f=function(){ cb(snapDoc(p)); }; L.push(f); setTimeout(f,0); return function(){ L.splice(L.indexOf(f),1); }; } }; }
  function q(c,test){ var g=function(){ return col(kids(c).filter(function(d){ return test(d.id); })); };
    return {get:function(){ return Promise.resolve(g()); },onSnapshot:function(cb){ var f=function(){ cb(g()); }; L.push(f); setTimeout(f,0); return function(){ L.splice(L.indexOf(f),1); }; }}; }
  function collection(c){ return {path:c,doc:function(id){ return doc(c+'/'+id); },
    get:function(){ return Promise.resolve(col(kids(c))); },
    onSnapshot:function(cb){ var f=function(){ cb(col(kids(c))); }; L.push(f); setTimeout(f,0); return function(){ L.splice(L.indexOf(f),1); }; },
    since:function(id){ return q(c,function(x){ return x>=id; }); }, before:function(id){ return q(c,function(x){ return x<id; }); } }; }
  var db={doc:doc,collection:collection};
  var downloads={save:function(){ return Promise.resolve(); }};
  var user={isOwner:function(){ return Promise.resolve(true); },can:function(){ return Promise.resolve(true); },me:function(){ return Promise.resolve({name:''}); }};
  window.TM_STANDALONE=true;
  window.claude={use:function(n){ return Promise.resolve(n==='db'?db:n==='downloads'?downloads:n==='user'?user:null); }};
})();`;

const errors = [];
let taps = 0;
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--no-sandbox'] });

async function newPage(label, init) {
  const ctx = await browser.newContext({ ...devices['iPhone 13'], locale: 'he-IL', timezoneId: 'Asia/Jerusalem', serviceWorkers: 'block' });
  await ctx.route(u => !String(u).startsWith(BASE), r => r.abort());
  await ctx.route(BASE + 'firebase-bridge.js', r => r.fulfill({ contentType: 'text/javascript', body: MOCK_BRIDGE }));
  await ctx.addInitScript(i => {
    window.print = () => {}; try { navigator.share = () => Promise.resolve(); navigator.canShare = () => false; } catch (e) {}
    window.open = () => null;
    if (i) for (const k in i) try { localStorage.setItem(k, i[k]); } catch (e) {}
  }, init || null);
  const page = await ctx.newPage();
  page.on('pageerror', e => { if (!/tm-test-boom/.test(e.message)) errors.push('[' + label + '] ' + e.message + (e.stack ? '\n   ' + String(e.stack).split('\n').slice(1, 3).join('\n   ') : '')); });
  page.on('dialog', d => d.dismiss().catch(() => {}));
  page.on('popup', p => p.close().catch(() => {}));
  return { ctx, page };
}

// כל מה שאפשר ללחוץ עליו ונראה על המסך עכשיו
async function targets(page, avoid) {
  return page.evaluate(avoid => {
    const W = innerWidth, H = innerHeight, out = [];
    document.querySelectorAll('button,[role=button],.m-tile,.home-tile,.gate-btn,a[href^="#"],input[type=checkbox],label.sw,summary,[data-go],[data-ex]').forEach(el => {
      if (el.disabled || el.closest('#tmCel')) return;
      if (avoid && el.matches(avoid)) return;
      const r = el.getBoundingClientRect(); if (r.width < 4 || r.height < 4) return;
      const x = r.left + r.width / 2, y = r.top + r.height / 2; if (x < 1 || y < 1 || x > W - 1 || y > H - 1) return;
      const top = document.elementFromPoint(x, y); if (!top || !(el === top || el.contains(top) || top.contains(el))) return;
      const st = getComputedStyle(el); if (st.visibility === 'hidden' || +st.opacity === 0) return;
      out.push({ x, y, t: (el.id ? '#' + el.id + ' ' : '') + (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30) });
    });
    return out;
  }, avoid || null);
}
async function monkey(page, label, n, avoid) {
  for (let i = 0; i < n; i++) {
    if (page.isClosed()) return;
    if (!page.url().startsWith(BASE)) { await page.goto(BASE + 'index.html').catch(() => {}); await page.waitForTimeout(1200); }
    let T = await targets(page, avoid).catch(() => []);
    if (!T.length) { await page.mouse.wheel(0, 400).catch(() => {}); await page.waitForTimeout(150); T = await targets(page, avoid).catch(() => []); if (!T.length) continue; }
    const t = T[Math.floor(rnd() * T.length)];
    await page.touchscreen.tap(t.x, t.y).catch(() => {});
    taps++;
    await page.waitForTimeout(140);
    if (rnd() < 0.15) { await page.mouse.wheel(0, (rnd() - 0.3) * 900).catch(() => {}); await page.waitForTimeout(80); }
  }
}
async function tapSel(page, sel) {
  const el = page.locator(sel).first();
  if (!(await el.count().catch(() => 0))) return false;
  await el.scrollIntoViewIfNeeded({ timeout: 4000 }).catch(() => {});
  try { await el.tap({ timeout: 5000 }); } catch (e) {
    const b = await el.boundingBox({ timeout: 2000 }).catch(() => null);
    if (!b) return false;
    await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2);
  }
  taps++; await page.waitForTimeout(300); return true;
}
async function home(page) {
  await page.evaluate(() => { try { localStorage.removeItem('rh_profile'); } catch (e) {} }).catch(() => {});
  await page.goto(BASE + 'index.html'); await page.waitForTimeout(1800);
  await tapSel(page, 'text=כניסה ללימודים'); await page.waitForTimeout(500);
}
async function kid(page, pid) {
  await home(page);
  if (!(await tapSel(page, '.gate-btn[data-p="' + pid + '"]'))) throw new Error('לא מצאתי את הכפתור של ' + pid);
  // חלונות שקופצים בכניסה (תזכורת "בואי נתרגל" וכו׳) — סוגרים
  await dismiss(page);
}
async function dismiss(page) {
  for (let i = 0; i < 5; i++) {
    await page.waitForTimeout(450);
    let hit = false;
    for (const sel of ['#rmLater', 'button:has-text("הבנתי")', 'button:has-text("אחר כך")']) {
      const el = page.locator(sel).first();
      if (await el.isVisible().catch(() => false)) { await tapSel(page, sel); hit = true; }
    }
    if (!hit && i > 1) return;
  }
}
const AVOID_KID = '#gateParent,.nv-par,[data-act="end"]';

try {
  const { ctx, page } = await newPage('index');

  // 1. כל ילדה
  for (const pid of process.env.QUICK ? [] : ['aviv', 'roni', 'hili', 'ziv']) {
    await kid(page, pid);
    // כל מקצוע של הילדה: נכנסים, לוחצים קצת, וחוזרים
    const ex = await page.evaluate(() => [...document.querySelectorAll('.hub-sbtn[data-ex]')].map(b => b.dataset.ex));
    for (const id of ex) {
      await kid(page, pid);
      await tapSel(page, '.hub-sbtn[data-ex="' + id + '"]');
      await monkey(page, pid + '/' + id, Math.ceil(TAPS / 3), AVOID_KID);
    }
    await kid(page, pid);
    await monkey(page, pid, TAPS, AVOID_KID);
  }

  // 2. סבב תרגול מלא: עונים על 20 שאלות באצבע (התשובה הראשונה, ואז "הבאה")
  await kid(page, 'hili');
  await tapSel(page, '.hub-sbtn[data-ex="up-hili-geo1"]'); await page.waitForTimeout(600);
  if (await tapSel(page, '#upAll')) {
    for (let i = 0; i < 70; i++) {
      const T = await targets(page, AVOID_KID); if (!T.length) break;
      const opt = T.find(t => !/^#/.test(t.t) && t.y > 200) || T[0];
      await page.touchscreen.tap(opt.x, opt.y); taps++; await page.waitForTimeout(160);
    }
  }

  // 3. 🪐 כוכבי הלכת: טעות אחת ואז הסדר הנכון
  await kid(page, 'hili');
  await tapSel(page, '.hub-sbtn[data-ex="up-hili-geo1"]'); await page.waitForTimeout(1500); await dismiss(page);
  if (process.env.DBG) await page.screenshot({ path: '/home/claude/tt/dbg3.png' });
  if (process.env.DBG) console.log(await page.evaluate(() => { let ce = null; try { ce = CUR_EXAM && CUR_EXAM.id; } catch (e) {} return JSON.stringify({ ce, pl: !!document.querySelector('[data-tmpl]'), upAll: !!document.getElementById('upAll'), prof: typeof PROFILE !== 'undefined' && PROFILE && PROFILE.id, vis: [...document.querySelectorAll('button')].filter(b => b.offsetParent).slice(0, 12).map(b => b.id || b.textContent.trim().slice(0, 20)) }); }));
  if (!(await tapSel(page, '[data-tmpl]'))) errors.push('[planets] הכפתור "לסדר את כוכבי הלכת" לא הופיע אצל הילי');
  else {
    await tapSel(page, '#tmPl .pl-c[data-k="5"]');
    for (let k = 0; k < 3; k++) await tapSel(page, '#tmPl .pl-c[data-k="' + k + '"]');
    await tapSel(page, '#tmPl .pl-c[data-k="6"]');
    if (SHOTS) await page.screenshot({ path: SHOTS + '/planets-mid.png' });
    for (let k = 3; k < 8; k++) await tapSel(page, '#tmPl .pl-c[data-k="' + k + '"]');
    await page.waitForTimeout(600);
    if (SHOTS) await page.screenshot({ path: SHOTS + '/planets-end.png' });
    if (!(await page.locator('#tmPl .pl-end').count())) errors.push('[planets] מסך הסיום לא הופיע');
    await tapSel(page, '#tmPl .pl-close');
  }

  if (SHOTS) {
    await page.evaluate(() => window.TM_CELEB && TM_CELEB(18, 20, 'hili'));
    await page.waitForTimeout(900); await page.screenshot({ path: SHOTS + '/celebrate.png' });
    await page.waitForTimeout(3500);
  }

  // 4. אבא
  await home(page);
  if (await tapSel(page, '#dadRow')) await monkey(page, 'dad', Math.ceil(TAPS / 2), AVOID_KID);

  // 5. אזור ההורים
  await home(page);
  if (SHOTS) await page.evaluate(() => {
    const M = window.__TM_DB, now = Date.now(), d = new Date(now), day = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    M.set('presence/hili', { pid: 'hili', on: false, at: now - 3 * 3600e3, sa: true, os: 'ios', nt: 'granted' });
    M.set('presence/aviv', { pid: 'aviv', on: false, at: now - 26 * 3600e3, sa: false, os: 'ios', nt: 'default' });
    M.set('presence/ziv', { pid: 'ziv', on: false, at: now - 40 * 60e3, sa: false, os: 'android', nt: 'granted' });
    M.set('push/hili-x', { who: 'hili' }); M.set('push/ziv-x', { who: 'ziv' });
    M.set('err/' + day + '_d1_abc', { day, m: "TypeError: Cannot read properties of null (reading 'classList')", s: 'index.html:12345', p: 'index', w: 'roni', n: 3, t: now - 2 * 3600e3 });
  });
  if (await tapSel(page, '#gateParent')) {
    await page.waitForTimeout(1500);
    if (SHOTS) { await page.locator('#dHealth').scrollIntoViewIfNeeded().catch(() => {}); await page.waitForTimeout(400); await page.screenshot({ path: SHOTS + '/parent.png' }); }
    await monkey(page, 'parent', TAPS, null);
  }

  // 6. 🗃️ הקופסה השחורה תופסת תקלה
  await home(page);
  await page.evaluate(() => setTimeout(() => { throw new Error('tm-test-boom'); }, 0));
  await page.waitForTimeout(300);
  const q = await page.evaluate(() => (window.TM_ERRQ ? TM_ERRQ.get() : []).filter(x => /tm-test-boom/.test(x.m)).length);
  if (!q) errors.push('[blackbox] הקופסה השחורה לא שמרה תקלה');
  await page.waitForTimeout(9000);
  const sent = await page.evaluate(() => [...window.__TM_DB.keys()].filter(k => k.startsWith('err/')).length);
  if (!sent) errors.push('[blackbox] התקלה לא נשלחה לענן');
  await ctx.close();

  // 7. הכתבה ולוח הכפל
  for (const [f, init] of [['dictation.html', null], ['kefel.html', null]]) {
    const { ctx: c2, page: p2 } = await newPage(f, init);
    await p2.goto(BASE + f); await p2.waitForTimeout(1500);
    await monkey(p2, f, TAPS, null);
    await c2.close();
  }

  // 8. טלפון נעול של ילדה
  {
    const { ctx: c3, page: p3 } = await newPage('locked-aviv', { tm_lock: 'aviv' });
    await p3.goto(BASE + 'index.html'); await p3.waitForTimeout(2000);
    await monkey(p3, 'locked-aviv', Math.ceil(TAPS / 2), AVOID_KID);
    await c3.close();
  }
} catch (e) {
  errors.push('[test] ' + (e && e.message || e));
}

await browser.close();
server.close();
console.log('👆 ' + taps + ' לחיצות באצבע');
if (errors.length) { console.error('❌ ' + errors.length + ' שגיאות:\n' + errors.join('\n')); process.exit(1); }
console.log('✅ אין שגיאות');

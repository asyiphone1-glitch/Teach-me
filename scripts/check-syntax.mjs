// teach-me — 🛡️ רשת ביטחון, שלב 1: בדיקת תחביר (15.11.2026, אושר בישיבת צוות)
// בודק כל קטע <script> בכל קובץ html, וכל קובץ js. שגיאה אחת = העדכון לא מגיע לבנות.
import fs from 'node:fs';
import vm from 'node:vm';

const HTML = ['index.html', 'dictation.html', 'kefel.html', 'import.html'];
const JS = ['sw.js', 'firebase-bridge.js', 't3d.js', 'tm-err.js', 'tm-voice.js', 'tm-tips.js', 'tm-tutor.js', 'tm-play.js', 'tm-book.js', 'tm-tabs.js'];
const MJS = ['scripts/remind.mjs'];
let bad = 0, n = 0;

function check(code, where) {
  n++;
  try {
    new vm.Script(code, { filename: where });
  } catch (e) {
    bad++;
    console.error('❌ ' + where + ': ' + e.message);
  }
}

for (const f of HTML) {
  if (!fs.existsSync(f)) continue;
  const s = fs.readFileSync(f, 'utf8');
  const re = /<script(\s[^>]*)?>([\s\S]*?)<\/script>/gi;
  let m, k = 0;
  while ((m = re.exec(s))) {
    const attrs = m[1] || '';
    if (/\bsrc\s*=/.test(attrs)) continue;
    if (/type\s*=\s*["']?(application\/(ld\+)?json|text\/template|module)/i.test(attrs)) continue;
    k++;
    const line = s.slice(0, m.index).split('\n').length;
    check(m[2], f + ' (קטע ' + k + ', שורה ' + line + ')');
  }
}
for (const f of JS) if (fs.existsSync(f)) check(fs.readFileSync(f, 'utf8'), f);

// קבצי JSON ו-manifest
for (const f of fs.readdirSync('.').filter(x => /\.(json|webmanifest)$/.test(x))) {
  n++;
  try { JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { bad++; console.error('❌ ' + f + ': ' + e.message); }
}

// קבצים שהאפליקציה צריכה
for (const f of ['index.html', 'sw.js', 'tm-err.js', 'firebase-bridge.js', 'dictation.html', 'kefel.html', 't3d.js', 'lib/three-r128.min.js', 'manifest.webmanifest', 'icon-192.png']) {
  n++;
  if (!fs.existsSync(f)) { bad++; console.error('❌ חסר קובץ: ' + f); }
}

console.log((bad ? '❌' : '✅') + ' תחביר: ' + n + ' בדיקות, ' + bad + ' שגיאות');
for (const f of MJS) if (fs.existsSync(f)) console.log('   (' + f + ' נבדק בנפרד עם node --check)');
process.exit(bad ? 1 : 0);

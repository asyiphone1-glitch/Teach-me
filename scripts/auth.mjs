// teach-me — זהות קבועה לשרתים (18.11.2026, נעילת מסד הנתונים, אושר ע״י ההורה)
// עד היום כל הרצה נכנסה כמשתמש אנונימי חדש. אחרי הנעילה רק "טלפון" מאושר נכנס,
// אז לשרתים יש זהות אחת קבועה. אבא מאשר אותה פעם אחת ברשימת הטלפונים.
// החיבור נשמר מוצפן (המפתח נגזר מ-VAPID_PRIVATE שב-Secrets) בענף tm-state.
// ה-workflow מביא אותו ל-/tmp/tm-rt.enc ושומר חזרה את /tmp/tm-rt.new אם נוצר חדש.
import fs from 'node:fs';
import crypto from 'node:crypto';

const IN = '/tmp/tm-rt.enc', OUT = '/tmp/tm-rt.new';
const key = () => crypto.createHash('sha256').update('teach-me-rt|' + (process.env.VAPID_PRIVATE || '')).digest();
function enc(s) {
  const iv = crypto.randomBytes(12), c = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const b = Buffer.concat([c.update(s, 'utf8'), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), b]).toString('base64');
}
function dec(s) {
  try {
    const b = Buffer.from(s.trim(), 'base64'), d = crypto.createDecipheriv('aes-256-gcm', key(), b.subarray(0, 12));
    d.setAuthTag(b.subarray(12, 28));
    return Buffer.concat([d.update(b.subarray(28)), d.final()]).toString('utf8');
  } catch (e) { return null; }
}

async function ensureDev(project, uid, tok) {
  const base = 'https://firestore.googleapis.com/v1/projects/' + project + '/databases/(default)/documents/dev/' + uid;
  const H = { authorization: 'Bearer ' + tok, 'content-type': 'application/json' };
  const g = await fetch(base, { headers: H });
  if (g.ok) { const j = await g.json(); const ok = !!(j.fields && j.fields.ok && j.fields.ok.booleanValue); if (!ok) console.log('השרת מחכה לאישור של אבא ברשימת הטלפונים ב-teach-me.'); return ok; }
  const make = ok => fetch(base + '?currentDocument.exists=false', { method: 'PATCH', headers: H,
    body: JSON.stringify({ fields: { ok: { booleanValue: ok }, kind: { stringValue: 'שרת התזכורות' }, who: { stringValue: 'server' }, at: { integerValue: String(Date.now()) } } }) });
  if ((await make(true)).ok) return true;      // לפני שהכללים החדשים פורסמו
  await make(false);
  console.log('השרת נרשם וממתין לאישור של אבא ברשימת הטלפונים ב-teach-me.');
  return false;
}

export async function anonSignIn(apiKey, project) {
  let rt = null; try { rt = dec(fs.readFileSync(IN, 'utf8')); } catch (e) {}
  let tok = null, uid = null;
  if (rt) {
    const r = await fetch('https://securetoken.googleapis.com/v1/token?key=' + apiKey, { method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(rt) });
    const j = await r.json().catch(() => ({}));
    if (j.id_token) { tok = j.id_token; uid = j.user_id; if (j.refresh_token && j.refresh_token !== rt) fs.writeFileSync(OUT, enc(j.refresh_token)); }
  }
  if (!tok) {
    const r = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + apiKey, { method: 'POST',
      headers: { 'content-type': 'application/json' }, body: JSON.stringify({ returnSecureToken: true }) });
    const j = await r.json();
    if (!j.idToken) throw new Error('signIn failed');
    tok = j.idToken; uid = j.localId;
    if (process.env.VAPID_PRIVATE) fs.writeFileSync(OUT, enc(j.refreshToken));
  }
  try { await ensureDev(project, uid, tok); } catch (e) { console.log('dev check failed:', e.message); }
  return tok;
}

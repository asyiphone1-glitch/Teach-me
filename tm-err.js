/* teach-me — 🗃️ קופסה שחורה (15.11.2026, אושר בישיבת צוות)
   כל תקלת JavaScript בטלפון של ילדה נשמרת קודם בטלפון (tm_errq), ו-index.html שולח אותה לענן (err/...).
   באזור ההורים מופיע "⚠️ תקלות השבוע". לא שומרים שום מידע אישי — רק את הודעת התקלה, הקובץ והשורה.
   הקובץ נטען ראשון בכל עמוד (index, dictation, kefel), כדי לתפוס גם תקלות בזמן הטעינה. */
(function(){
  var K='tm_errq', MAX=40;
  var page=(location.pathname.split('/').pop()||'index.html').replace(/\.html$/,'')||'index';
  function q(){ try{ return JSON.parse(localStorage.getItem(K)||'[]')||[]; }catch(e){ return []; } }
  function save(a){ try{ localStorage.setItem(K,JSON.stringify(a.slice(-MAX))); }catch(e){} }
  function who(){
    try{ if(typeof PROFILE!=='undefined'&&PROFILE&&PROFILE.id) return PROFILE.id; }catch(e){}
    try{ if(window.parent&&window.parent!==window&&window.parent.TM_WHO) return window.parent.TM_WHO(); }catch(e){}
    try{ return localStorage.getItem('tm_lock')||''; }catch(e){ return ''; }
  }
  /* רעש שלא קשור לקוד שלנו: אין אינטרנט, הענן, השמעת קול שנחסמה, תוספים של הדפדפן */
  var NOISE=/^Script error\.?$|ResizeObserver loop|firebase|firestore|gstatic|Failed to fetch|NetworkError|Load failed|network|offline|unavailable|permission-denied|deadline-exceeded|AbortError|NotAllowedError|play\(\) request|interrupted|QuotaExceeded|webkit-masked-url|chrome-extension|moz-extension|safari-extension/i;
  function add(msg,src,line,col){
    msg=String(msg==null?'':msg).replace(/\s+/g,' ').trim().slice(0,220);
    src=String(src||'').split('?')[0].split('#')[0].split('/').pop();
    if(!msg||NOISE.test(msg)||NOISE.test(src)) return;
    var where=(src||page)+(line?':'+line:''), a=q(), now=Date.now(), b='';
    try{ b=(window.TM_BUILD)||(window.parent&&window.parent.TM_BUILD)||''; }catch(e){}
    for(var i=0;i<a.length;i++){ if(a[i].m===msg&&a[i].s===where){ a[i].n=(a[i].n||1)+1; a[i].t=now; save(a); return; } }
    a.push({m:msg,s:where,p:page,w:who(),t:now,b:String(b),n:1}); save(a);
  }
  window.addEventListener('error',function(e){
    if(!e) return;
    if(!e.message&&e.target&&e.target!==window) return;          /* תמונה/קובץ שלא נטען — לא תקלה בקוד */
    add(e.message||(e.error&&e.error.message),e.filename,e.lineno,e.colno);
  },true);
  window.addEventListener('unhandledrejection',function(e){
    var r=e&&e.reason; if(!r) return;
    if(r&&(r.code||r.name==='AbortError'||r.name==='NotAllowedError')) return;   /* קודים של Firebase/דפדפן */
    var st=String(r.stack||''), m=/([\w.-]+\.(?:html|js)):(\d+)/.exec(st);
    add((r.name&&r.name!=='Error'?r.name+': ':'')+(r.message||String(r)),m?m[1]:'',m?+m[2]:0);
  });
  window.TM_ERRQ={get:q,set:save,add:add};
})();

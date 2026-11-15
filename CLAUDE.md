# teach-me — כללי עבודה

## 🛡️ רשת ביטחון (מ-15.11.2026, אושר ע״י ההורה)
- **לא דוחפים ישר ל-`main`.** כל שינוי נדחף לענף `dev`.
- `.github/workflows/safety-net.yml` בודק כל דחיפה ל-`dev`: תחביר (`scripts/check-syntax.mjs`) ולחיצות באצבע בדפדפן בגודל אייפון עם ענן מדומה (`scripts/tap-test.mjs`).
- רק אם הבדיקה עוברת, ה-workflow מעביר את `dev` ל-`main` (fast-forward), ומשם GitHub Pages מפרסם לבנות.
- אם הבדיקה נכשלה: לתקן ב-`dev` ולדחוף שוב. הבנות ממשיכות עם הגרסה הקודמת בינתיים.
- לפני עבודה: `git fetch origin main dev` ולוודא ש-`dev` מכיל את `main`.
- בדיקה מקומית: `node scripts/check-syntax.mjs` ו-`CHROME_PATH=/usr/bin/google-chrome node scripts/tap-test.mjs` (`QUICK=1` מדלג על הסבב הארוך של כל ילדה).

## בכל עדכון
- להעלות את `TM_BUILD` ב-index.html ואת `C` ב-sw.js.
- לא משנים כלום בלי אישור ההורה. לא מריצים בדיקות אוטומטיות מהקרדיט של Claude בלי שההורה ביקש.

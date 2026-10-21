# 🔗 עדכון קישור ה-API ב-config.js

## איך למצוא את ה-URL החדש?

לאחר שפרסמת את הקוד ב-Apps Script:

1. **Deploy → Manage deployments**
2. תראה רשימת פריסות
3. **לחץ על "Copy" ליד Web app URL**
4. זה ה-URL שצריך!

הוא נראה כך:
```
https://script.google.com/macros/s/AKfycbw.../exec
```

---

## עדכון ב-config.js

### דרך 1: דרך VS Code / עורך קוד

1. פתח את הקובץ: `/workspace/js/config.js`
2. מצא את השורה:
```javascript
url: 'https://script.google.com/macros/s/...',
```
3. **החלף** את כל ה-URL בין המרכאות עם ה-URL החדש
4. **שמור** את הקובץ

### דרך 2: דרך GitHub

1. עבור ל: `https://github.com/YAIR-DAHN/shabat/blob/main/js/config.js`
2. לחץ על העיפרון (Edit)
3. מצא את השורה `url: '...'`
4. החלף את ה-URL
5. Commit changes

---

## דוגמה:

**לפני:**
```javascript
const CONFIG = {
    api: {
        url: 'https://script.google.com/macros/s/AKfycbwSts-TZ4bsySeSxXCqKHlSUk4T79frFdo68YSmR8NkcH-jtLwEslldz8L2e2xFvbtP/exec',
        cacheUrl: 'https://shabat-cache.yairdahn.workers.dev/read'
    },
    // ...
};
```

**אחרי:**
```javascript
const CONFIG = {
    api: {
        url: 'https://script.google.com/macros/s/[ה-URL_החדש_שלך]/exec',
        cacheUrl: 'https://shabat-cache.yairdahn.workers.dev/read'
    },
    // ...
};
```

---

## ✅ אחרי העדכון:

1. **שמור את הקובץ**
2. **Commit ל-Git:**
   ```bash
   git add js/config.js
   git commit -m "update: עדכון URL של Apps Script"
   git push
   ```
3. **רענן את הדפדפן** (Ctrl+Shift+R)
4. **בדוק שהפאנל עובד**

---

## 🚨 חשוב!

- **אל תשנה** את `cacheUrl` - תשאיר אותו כמו שהוא
- **רק** את השורה עם `url:` תשנה
- וודא שיש **פסיק** בסוף השורה
- וודא שה-URL בתוך **מרכאות בודדות** `'...'`

---

## 🔍 איך לבדוק שזה עובד?

1. פתח את הדפדפן
2. עבור לפאנל ניהול
3. **F12** → Console
4. אם אין שגיאות אדומות → עובד! ✅
5. אם יש CORS error → ה-URL לא נכון או הפריסה לא מוגדרת כ-"Anyone"

---

## 💡 טיפ:

אם אתה לא בטוח איזה URL נכון, תמיד אפשר:

1. Deploy → Test deployments
2. Copy test web app URL
3. נסה אותו
4. אם עובד → שנה ל-New deployment

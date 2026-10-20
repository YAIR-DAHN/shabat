# תיעוד טכני - מערכת ניהול תמונות הגלריה

## ארכיטקטורה

### זרימת המידע

```
[דפדפן] ←→ [Google Apps Script] ←→ [Google Sheets + Drive]
    ↓
[ai-gallery.js]
    ↓
[Gallery UI]
```

---

## מבנה הקבצים

### Frontend (Client Side)

#### `js/ai-gallery-config.js`
- **תפקיד**: הגדרת המבנה והטעינה הדינמית
- **API**: `loadAiGallery()` - טוען תמונות מהשרת
- **מבנה נתונים**:
```javascript
window.AI_GALLERY = {
    prize: 'גיפט קארד בשווי 200 ₪',
    images: [],
    loaded: false,
    loading: false
}
```

#### `js/ai-gallery.js`
- **תפקיד**: הצגת הגלריה לנערים
- **פונקציות עיקריות**:
  - `gallery()` - מחזיר רשימת תמונות
  - `renderBoard()` - מרנדר את כל התמונות
  - `sendLike()` - שולח לייק
  - `submitGuess()` - שולח ניחוש

#### `js/ai-gallery-admin.js`
- **תפקיד**: ניהול תמונות בפאנל הניהול
- **פונקציות עיקריות**:
  - `renderImageManager()` - מציג את הממשק
  - `uploadToDrive()` - מעלה תמונה ל-Drive
  - `editImage()` - עורך תמונה קיימת
  - `deleteImage()` - מוחק תמונה
- **Event Handlers**:
  - `handleFileSelect()` - בחירת קובץ
  - `submitUploadForm()` - שליחת טופס העלאה

#### `js/admin.js` (עדכונים)
- **שינויים**:
  - `renderGallery()` - הוסיף טאב "manage"
  - `initGalleryManageListeners()` - event listeners לניהול
  - `reloadGalleryAdmin()` - רענון הגלריה אחרי עדכון
  - `loadGallery()` - טוען גם את נתוני הגלריה

#### `css/admin.css` (עדכונים)
- **סטיילים חדשים**:
  - `.ap-gallery-grid` - רשת תמונות
  - `.ap-gallery-card` - כרטיס תמונה
  - `.ap-gallery-card__actions` - כפתורי פעולה

---

### Backend (Server Side)

#### `GOOGLE_APPS_SCRIPT_GALLERY.gs`

##### פונקציות API:

**1. `doGet_getAiGallery()`**
- מחזיר רשימת כל התמונות
- פורמט החזרה:
```javascript
{
  success: true,
  images: [
    {
      id: 'week1-1',
      week: 1,
      src: 'https://drive.google.com/uc?export=view&id=...',
      credit: 'שם | סניף',
      open: true,
      createdAt: '20/10/2026',
      driveId: '1Abc...'
    }
  ]
}
```

**2. `doGet_addAiImage(params)`**
- מוסיף תמונה חדשה
- פרמטרים:
```javascript
{
  pin: 'קוד ניהול',
  image: JSON.stringify({
    driveId: '1Abc...',
    week: 1,
    credit: 'שם | סניף',
    open: true
  })
}
```

**3. `doGet_updateAiImage(params)`**
- מעדכן תמונה קיימת
- פרמטרים:
```javascript
{
  pin: 'קוד ניהול',
  image: JSON.stringify({
    id: 'week1-1',
    week: 2,
    credit: 'שם חדש',
    open: false
  })
}
```

**4. `doGet_deleteAiImage(params)`**
- מוחק תמונה
- פרמטרים:
```javascript
{
  pin: 'קוד ניהול',
  imageId: 'week1-1'
}
```

##### פונקציות עזר:

**`getOrCreateSheet(sheetName)`**
- יוצר גיליון אם לא קיים
- מגדיר כותרות ועיצוב

**`migrateLegacyImages()`**
- מיגרציה חד-פעמית של תמונות קיימות מ-config.js
- רץ אוטומטית בפעם הראשונה

**`createGalleryFolder()`**
- יוצר תיקיית Drive חדשה
- מדפיס את ה-ID ללוג

---

## מבנה הגיליון `GalleryImages`

| עמודה | שם | תיאור | דוגמה |
|-------|-----|--------|--------|
| A | ID | מזהה ייחודי | week1-1 |
| B | Week | מספר שבוע | 1 |
| C | URL | קישור לתמונה | https://drive.google.com/uc?... |
| D | Credit | קרדיט ליוצר | שם \| סניף |
| E | Open | פתוח לניחושים | כן/לא |
| F | Created | תאריך יצירה | 20/10/2026 19:30 |
| G | DriveID | מזהה ב-Drive | 1Abc123... |

---

## זרימת פעולות

### הוספת תמונה חדשה

1. **משתמש בוחר קובץ** → `handleFileSelect()`
2. **משתמש ממלא פרטים** → טופס
3. **משתמש לוחץ "העלאה"** → `submitUploadForm()`
4. **קריאת הקובץ** → FileReader API
5. **העלאה ל-Drive** → `uploadToDrive()` (prompt למזהה)
6. **שליחה לשרת** → `fetchFromAPI('addAiImage', ...)`
7. **שרת מוסיף לגיליון** → `doGet_addAiImage()`
8. **רענון הממשק** → `reloadGalleryAdmin()`

### טעינת תמונות באתר

1. **דף נטען** → DOMContentLoaded
2. **קריאה ל-API** → `loadAiGallery()`
3. **קבלת נתונים** → `fetchFromAPI('getAiGallery')`
4. **שמירה ב-memory** → `window.AI_GALLERY.images`
5. **רינדור** → `renderBoard()` / `renderTeaser()`

---

## אבטחה

### הרשאות
- **קריאת תמונות**: פומבי (`getAiGallery`)
- **הוספה/עריכה/מחיקה**: דורש קוד ניהול (`pin`)
- **אימות**: `isAuthorized(pin)` ב-Apps Script

### CORS
- Apps Script מאפשר cross-origin requests
- ה-URL של ה-Web App צריך להיות מפורסם כ-"Anyone with link"

---

## Cache Management

### Frontend Cache
```javascript
window.AI_GALLERY.loaded = false; // איפוס cache
loadAiGallery(); // טעינה מחדש
```

### Backend Cache
```javascript
invalidateCache('getAiGallery'); // ניקוי cache בשרת
```

---

## העלאה אוטומטית (שדרוג עתידי)

לשדרג את `uploadToDrive()` להעלאה ישירה:

### אופציה 1: Google Picker API
```javascript
function loadPicker() {
  gapi.load('picker', () => {
    const picker = new google.picker.PickerBuilder()
      .addView(google.picker.ViewId.DOCS_IMAGES)
      .setCallback(pickerCallback)
      .build();
    picker.setVisible(true);
  });
}
```

### אופציה 2: Apps Script File Upload
צריך ליצור endpoint מיוחד:
```javascript
function doPost(e) {
  const blob = Utilities.newBlob(
    Utilities.base64Decode(e.parameter.data),
    e.parameter.mimeType,
    e.parameter.fileName
  );
  
  const folder = DriveApp.getFolderById(GALLERY_FOLDER_ID);
  const file = folder.createFile(blob);
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    fileId: file.getId()
  }));
}
```

---

## בדיקות

### Frontend
```bash
node -c js/ai-gallery-config.js
node -c js/ai-gallery-admin.js
```

### Backend
- בדיקה ידנית דרך Apps Script Editor
- Execution logs: View → Executions

### Integration
1. פתח פאנל ניהול
2. נסה להוסיף תמונה
3. בדוק שהיא מופיעה ברשימה
4. בדוק שהיא מופיעה ב-`guess.html`

---

## טיפים למפתחים

### הוספת שדה חדש לתמונה

1. **הוסף עמודה בגיליון**
2. **עדכן את `doGet_getAiGallery()`**:
```javascript
images.push({
  // ...שדות קיימים
  newField: row[8] // עמודה חדשה
});
```

3. **עדכן את `doGet_addAiImage()`**:
```javascript
sheet.appendRow([
  // ...ערכים קיימים
  imageData.newField
]);
```

4. **עדכן את הטופס ב-`ai-gallery-admin.js`**:
```javascript
html += '<input id="ap-image-newfield" ...>';
```

### דיבוג

**Frontend:**
```javascript
console.log(window.AI_GALLERY.images);
```

**Backend:**
```javascript
Logger.log('Debug: ' + JSON.stringify(data));
```

**Network:**
- פתח DevTools → Network
- סנן לפי "getAiGallery" / "addAiImage"

---

## שאלות נפוצות (FAQ)

**ש: איך לשנות את התיקייה ב-Drive?**  
תשובה: עדכן את `GALLERY_FOLDER_ID` ב-Apps Script ופרסם גרסה חדשה.

**ש: איך למחוק תמונה ממש (כולל מה-Drive)?**  
תשובה: `deleteImage()` מוחק רק מהגיליון. למחיקה מ-Drive צריך להוסיף:
```javascript
DriveApp.getFileById(driveId).setTrashed(true);
```

**ש: איך להוסיף validation לתמונות?**  
תשובה: הוסף בדיקות ב-`handleFileSelect()`:
```javascript
if (file.size > MAX_SIZE) { ... }
if (!ALLOWED_TYPES.includes(file.type)) { ... }
```

---

## תיעוד API מלא

ראה את הקובץ `GOOGLE_APPS_SCRIPT_GALLERY.gs` לתיעוד מפורט של כל פונקציה.

---

**מפתח: Cursor Agent**  
**תאריך: אוקטובר 2026**  
**גרסה: 1.0**

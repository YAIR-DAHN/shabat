# 🚀 העלאת תמונות קיימות ל-Google Drive (שמירה על ניחושים ולייקים)

## ⚠️ חשוב מאוד!

כדי שהניחושים והלייקים **לא יאבדו**, חייב לשמור על אותם **ID** של התמונות שכבר קיימות.

---

## 🎯 תהליך ההעלאה (צעד אחר צעד)

### שלב 1: הכנה - רשימת התמונות הקיימות

התמונות שלך כרגע (לפי `ai-gallery-config.js`):

| ID | שבוע | קובץ מקורי | קרדיט |
|----|------|------------|--------|
| week1-1 | 1 | 1.jpeg | - |
| week1-2 | 1 | 2.jpeg | - |
| week1-3 | 1 | 3.jpeg | ראובן בן שמחון \| גבעת שמואל |
| week1-4 | 1 | 4.jpeg | בן אהרוני \| חדרה בית אליעזר |
| week1-5 | 1 | 5.jpeg | שמואל עירוב \| רמת גן שקמה |
| week1-6 | 1 | 6.jpeg | בר שקיה \| רמת גן שקמה |
| week1-7 | 2 | 7.jpeg | - |
| week1-8 | 2 | 8.jpeg | - |
| week1-9 | 2 | 9.jpeg | איתי חדד \| מצליח |
| week2-10 | 2 | 10.jpeg | - |

---

### שלב 2: העלאת התמונות ל-Drive

1. **פתח את Google Drive שלך**
2. **עבור לתיקייה "AI Gallery Images"** (זו שיצרת)
3. **העלה את כל 10 התמונות**:
   - לחץ "New" → "File upload"
   - או גרור את כל הקבצים מ-`assets/aiImages/`
   - העלה: `1.jpeg, 2.jpeg, 3.jpeg, ..., 10.jpeg`

4. **חכה שההעלאה תסתיים**

---

### שלב 3: קבלת מזהי הקבצים

**עכשיו צריך לקבל את ה-ID של כל תמונה ב-Drive.**

#### דרך מהירה (מומלצת):

1. **לחץ ימין על קובץ** → "Get link"
2. **העתק את הקישור**, לדוגמה:
   ```
   https://drive.google.com/file/d/1Abc123XyZ_example/view?usp=sharing
   ```
3. **המזהה הוא החלק שאחרי `/d/`**:
   ```
   1Abc123XyZ_example
   ```

#### טבלת מעקב (מלא כשאתה עובד):

| קובץ | ID ב-Drive |
|------|------------|
| 1.jpeg | |
| 2.jpeg | |
| 3.jpeg | |
| 4.jpeg | |
| 5.jpeg | |
| 6.jpeg | |
| 7.jpeg | |
| 8.jpeg | |
| 9.jpeg | |
| 10.jpeg | |

---

### שלב 4: עדכון הגיליון GalleryImages

**עכשיו צריך לעדכן את הגיליון ב-Google Sheets עם ה-IDs החדשים.**

#### אופציה א': ידנית (הכי בטוח)

1. **פתח את Google Sheets** שלך
2. **עבור לגיליון "GalleryImages"**
3. **למצוא כל שורה לפי ה-ID** (עמודה A)
4. **עדכן את עמודה C (URL)** ל:
   ```
   https://drive.google.com/uc?export=view&id=המזהה_של_הקובץ
   ```
5. **עדכן את עמודה G (DriveID)** ל:
   ```
   המזהה_של_הקובץ
   ```

**דוגמה:**
- שורה עם ID = `week1-1`
- עדכן URL: `https://drive.google.com/uc?export=view&id=1Abc123...`
- עדכן DriveID: `1Abc123...`

#### אופציה ב': דרך Apps Script (מהיר יותר)

הוספתי לך סקריפט עזר:

```javascript
function updateImageUrls() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('GalleryImages');
  var data = sheet.getDataRange().getValues();
  
  // מילון: שם קובץ → Drive ID
  var mapping = {
    '1.jpeg': '1Abc123...', // <-- החלף עם ה-ID האמיתי!
    '2.jpeg': '1Def456...',
    '3.jpeg': '1Ghi789...',
    '4.jpeg': '...',
    '5.jpeg': '...',
    '6.jpeg': '...',
    '7.jpeg': '...',
    '8.jpeg': '...',
    '9.jpeg': '...',
    '10.jpeg': '...'
  };
  
  for (var i = 1; i < data.length; i++) {
    var imageId = data[i][0]; // week1-1, week1-2, etc.
    var oldSrc = data[i][2]; // assets/aiImages/1.jpeg
    
    // חילוץ שם הקובץ
    var fileName = oldSrc.split('/').pop(); // 1.jpeg
    
    if (mapping[fileName]) {
      var driveId = mapping[fileName];
      var newUrl = 'https://drive.google.com/uc?export=view&id=' + driveId;
      
      // עדכון URL ו-DriveID
      sheet.getRange(i + 1, 3).setValue(newUrl);
      sheet.getRange(i + 1, 7).setValue(driveId);
      
      Logger.log('עודכן: ' + imageId + ' → ' + fileName);
    }
  }
  
  Logger.log('✅ הושלם!');
}
```

**איך להריץ:**
1. עבור ל-Apps Script
2. הוסף פונקציה חדשה עם הקוד למעלה
3. **עדכן את `mapping`** עם ה-IDs שלך!
4. בחר את הפונקציה `updateImageUrls` למעלה
5. לחץ ▶️ Run
6. בדוק את ה-Logs

---

### שלב 5: בדיקה

1. **פתח את פאנל הניהול**
2. **עבור ל-תמונות → ניהול תמונות**
3. **בדוק שכל התמונות מופיעות** ועם ה-IDs הנכונים
4. **פתח את `guess.html`** באתר
5. **בדוק שהתמונות נטענות** מ-Drive
6. **בדוק שהלייקים והניחושים** עדיין קיימים!

---

## ✅ למה זה עובד?

המפתח הוא ש**ה-ID של התמונה לא משתנה**!

- **ניחושים** נשמרים עם `imageId: 'week1-1'`
- **לייקים** נשמרים עם `imageId: 'week1-1'`
- **אם ה-ID נשאר זהה**, הכל ממשיך לעבוד!

המערכת לא אכפת לה מאיפה התמונה מגיעה (GitHub או Drive), רק ש-**ה-ID זהה**.

---

## 🎁 בונוס: הסרת התמונות מ-GitHub (אופציונלי)

אחרי שכל התמונות ב-Drive ועובדות באתר, אפשר למחוק את התיקייה הישנה:

```bash
git rm -r assets/aiImages/*.jpeg
git commit -m "מעבר לאחסון ב-Google Drive"
git push
```

**אבל!** השאר את `assets/aiImages/README.md` כדי להסביר למה התיקייה ריקה.

---

## ❓ שאלות נפוצות

**ש: מה קורה אם אני טועה ב-ID?**  
ת: התמונה לא תיטען באתר, אבל הניחושים לא נמחקים. פשוט תקן את ה-ID בגיליון.

**ש: האם צריך להריץ מיגרציה?**  
ת: לא! המיגרציה כבר רצה אוטומטית בפעם הראשונה. עכשיו רק צריך לעדכן את ה-URLs.

**ש: האם התמונות צריכות להיות public?**  
ת: כן. כשאתה מעלה ל-Drive, הסקריפט אמור להגדיר אוטומטית "Anyone with link". אם לא, לחץ ימין → Share → "Anyone with the link".

**ש: למה לא להעלות דרך הפאנל?**  
ת: כי אז הן יקבלו IDs חדשים (week1-timestamp) והניחושים לא יתאימו. ככה אנחנו שומרים על ה-IDs המקוריים.

---

## 📞 צריך עזרה?

אם משהו לא עובד, תגיד לי:
1. איזה שלב?
2. מה השגיאה?
3. צילום מסך אם אפשר

אני כאן לעזור! 😊

---

**זהו! בהצלחה! 🚀**

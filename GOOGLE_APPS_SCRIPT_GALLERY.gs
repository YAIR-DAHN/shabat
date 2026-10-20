/**
 * קוד זה צריך להיות מודבק ב-Google Apps Script (Code.gs)
 * כחלק מהסקריפט הקיים.
 * 
 * התמונות נשמרות ב-Google Drive בתיקייה ייעודית,
 * והקישורים והמידע נשמרים בגיליון "GalleryImages".
 */

// מזהה התיקייה ב-Drive שבה יישמרו התמונות
// צריך ליצור תיקייה ולהחליף את המזהה הזה
var GALLERY_FOLDER_ID = 'YOUR_FOLDER_ID_HERE'; // <-- החלף עם מזהה התיקייה שלך!

/**
 * מקבל את רשימת התמונות מהגיליון
 */
function doGet_getAiGallery(params) {
  try {
    var sheet = getOrCreateSheet('GalleryImages');
    var data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      // אין תמונות, נמיר את התמונות הקיימות מ-config.js
      migrateLegacyImages();
      data = sheet.getDataRange().getValues();
    }
    
    var images = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (!row[0]) continue; // שורה ריקה
      
      images.push({
        id: row[0],
        week: Number(row[1]) || 1,
        src: row[2],
        credit: row[3] || '',
        open: row[4] === 'כן' || row[4] === true,
        createdAt: row[5] || '',
        driveId: row[6] || ''
      });
    }
    
    return { success: true, images: images };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * מעלה תמונה חדשה לגלריה
 */
function doGet_uploadAiImage(params) {
  if (!params.pin || !isAuthorized(params.pin)) {
    return { error: 'unauthorized' };
  }
  
  try {
    // קריאה זו תיקרא מהצד של הלקוח עם base64
    // אבל בגלל שזה GET, נחזיר URL להעלאה או נאפשר POST
    return { error: 'Use POST for file upload' };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * מוחק תמונה מהגלריה (לא מוחק מה-Drive, רק מהגיליון)
 */
function doGet_deleteAiImage(params) {
  if (!params.pin || !isAuthorized(params.pin)) {
    return { error: 'unauthorized' };
  }
  
  try {
    var imageId = params.imageId;
    if (!imageId) {
      return { success: false, error: 'חסר מזהה תמונה' };
    }
    
    var sheet = getOrCreateSheet('GalleryImages');
    var data = sheet.getDataRange().getValues();
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === imageId) {
        sheet.deleteRow(i + 1);
        invalidateCache('getAiGallery');
        return { success: true };
      }
    }
    
    return { success: false, error: 'תמונה לא נמצאה' };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * מעדכן פרטי תמונה קיימת
 */
function doGet_updateAiImage(params) {
  if (!params.pin || !isAuthorized(params.pin)) {
    return { error: 'unauthorized' };
  }
  
  try {
    var imageData = JSON.parse(params.image || '{}');
    if (!imageData.id) {
      return { success: false, error: 'חסר מזהה תמונה' };
    }
    
    var sheet = getOrCreateSheet('GalleryImages');
    var data = sheet.getDataRange().getValues();
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === imageData.id) {
        // עדכון השדות
        sheet.getRange(i + 1, 2).setValue(imageData.week || 1);
        sheet.getRange(i + 1, 4).setValue(imageData.credit || '');
        sheet.getRange(i + 1, 5).setValue(imageData.open ? 'כן' : 'לא');
        
        invalidateCache('getAiGallery');
        return { success: true };
      }
    }
    
    return { success: false, error: 'תמונה לא נמצאה' };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * מוסיף תמונה חדשה (מקבל URL של תמונה ב-Drive)
 */
function doGet_addAiImage(params) {
  if (!params.pin || !isAuthorized(params.pin)) {
    return { error: 'unauthorized' };
  }
  
  try {
    var imageData = JSON.parse(params.image || '{}');
    
    if (!imageData.driveId || !imageData.week) {
      return { success: false, error: 'חסרים שדות חובה' };
    }
    
    var sheet = getOrCreateSheet('GalleryImages');
    
    // יצירת ID אוטומטי
    var id = 'week' + imageData.week + '-' + Date.now();
    
    // קבלת URL ציבורי לתמונה
    var file = DriveApp.getFileById(imageData.driveId);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    var url = 'https://drive.google.com/uc?export=view&id=' + imageData.driveId;
    
    var timestamp = new Date().toLocaleString('he-IL');
    
    // הוספת שורה חדשה
    sheet.appendRow([
      id,
      imageData.week,
      url,
      imageData.credit || '',
      imageData.open ? 'כן' : 'לא',
      timestamp,
      imageData.driveId
    ]);
    
    invalidateCache('getAiGallery');
    return { success: true, id: id };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * יוצר את הגיליון אם הוא לא קיים
 */
function getOrCreateSheet(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    
    if (sheetName === 'GalleryImages') {
      // כותרות
      sheet.appendRow([
        'ID',
        'Week',
        'URL',
        'Credit',
        'Open',
        'Created',
        'DriveID'
      ]);
      
      // עיצוב
      var headerRange = sheet.getRange(1, 1, 1, 7);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('#ffffff');
      
      sheet.setFrozenRows(1);
      sheet.autoResizeColumns(1, 7);
    }
  }
  
  return sheet;
}

/**
 * מיגרציה חד-פעמית של התמונות הקיימות
 * רץ אוטומטית בפעם הראשונה
 */
function migrateLegacyImages() {
  var sheet = getOrCreateSheet('GalleryImages');
  
  var legacyImages = [
    { id: 'week1-1', week: 1, src: 'assets/aiImages/1.jpeg', credit: '', open: true },
    { id: 'week1-2', week: 1, src: 'assets/aiImages/2.jpeg', credit: '', open: true },
    { id: 'week1-3', week: 1, src: 'assets/aiImages/3.jpeg', credit: 'ראובן בן שמחון | גבעת שמואל', open: true },
    { id: 'week1-4', week: 1, src: 'assets/aiImages/4.jpeg', credit: 'בן אהרוני | חדרה בית אליעזר', open: true },
    { id: 'week1-5', week: 1, src: 'assets/aiImages/5.jpeg', credit: 'שמואל עירוב | רמת גן שקמה', open: true },
    { id: 'week1-6', week: 1, src: 'assets/aiImages/6.jpeg', credit: 'בר שקיה | רמת גן שקמה', open: true },
    { id: 'week1-7', week: 2, src: 'assets/aiImages/7.jpeg', credit: '', open: true },
    { id: 'week1-8', week: 2, src: 'assets/aiImages/8.jpeg', credit: '', open: true },
    { id: 'week1-9', week: 2, src: 'assets/aiImages/9.jpeg', credit: 'איתי חדד | מצליח', open: true },
    { id: 'week2-10', week: 2, src: 'assets/aiImages/10.jpeg', credit: '', open: true }
  ];
  
  var timestamp = new Date().toLocaleString('he-IL');
  
  legacyImages.forEach(function(img) {
    sheet.appendRow([
      img.id,
      img.week,
      img.src,
      img.credit,
      img.open ? 'כן' : 'לא',
      timestamp + ' (מיגרציה)',
      ''
    ]);
  });
}

/**
 * יוצר תיקיית Drive חדשה עבור התמונות
 * הרץ את זה פעם אחת כדי לקבל את ה-ID של התיקייה
 */
function createGalleryFolder() {
  var folder = DriveApp.createFolder('AI Gallery Images - Shabbat Program');
  Logger.log('Folder created with ID: ' + folder.getId());
  Logger.log('Paste this ID in GALLERY_FOLDER_ID variable above');
  return folder.getId();
}

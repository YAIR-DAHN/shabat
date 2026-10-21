/**
 * דוגמה: איך Code.gs צריך להראות עם ניהול תמונות
 * 
 * זו דוגמה - התאם לפי המבנה הקיים שלך!
 */

// ========================================
// פונקציית doGet ראשית
// ========================================

function doGet(e) {
  var action = e.parameter.action;
  
  // פעולות קיימות שלך (דוגמה)
  if (action === 'getBranches') {
    return ContentService.createTextOutput(
      JSON.stringify(doGet_getBranches(e.parameter))
    ).setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'getAiGuesses') {
    return ContentService.createTextOutput(
      JSON.stringify(doGet_getAiGuesses(e.parameter))
    ).setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'getAiLikes') {
    return ContentService.createTextOutput(
      JSON.stringify(doGet_getAiLikes(e.parameter))
    ).setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'submitAiGuess') {
    return ContentService.createTextOutput(
      JSON.stringify(doGet_submitAiGuess(e.parameter))
    ).setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'submitAiLike') {
    return ContentService.createTextOutput(
      JSON.stringify(doGet_submitAiLike(e.parameter))
    ).setMimeType(ContentService.MimeType.JSON);
  }
  
  // ========================================
  // ✨ הוסף את השורות האלה! (חדש)
  // ========================================
  
  if (action === 'getAiGallery') {
    return ContentService.createTextOutput(
      JSON.stringify(doGet_getAiGallery(e.parameter))
    ).setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'addAiImage') {
    return ContentService.createTextOutput(
      JSON.stringify(doGet_addAiImage(e.parameter))
    ).setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'updateAiImage') {
    return ContentService.createTextOutput(
      JSON.stringify(doGet_updateAiImage(e.parameter))
    ).setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'deleteAiImage') {
    return ContentService.createTextOutput(
      JSON.stringify(doGet_deleteAiImage(e.parameter))
    ).setMimeType(ContentService.MimeType.JSON);
  }
  
  // ========================================
  // סוף החלק החדש
  // ========================================
  
  // אם לא מצאנו את ה-action
  return ContentService.createTextOutput(
    JSON.stringify({ error: 'Invalid action' })
  ).setMimeType(ContentService.MimeType.JSON);
}

// ========================================
// פונקציות קיימות שלך
// ========================================

function isAuthorized(pin) {
  // הלוגיקה שלך לאימות קוד
  // ...
}

function doGet_getBranches(params) {
  // הקוד הקיים שלך
  // ...
}

function doGet_getAiGuesses(params) {
  // הקוד הקיים שלך
  // ...
}

function doGet_submitAiGuess(params) {
  // הקוד הקיים שלך
  // ...
}

function invalidateCache(action) {
  // הקוד הקיים שלך (אם יש)
  // אם אין, אפשר להשאיר ריק:
  // Logger.log('Cache invalidated: ' + action);
}

// ========================================
// ✨ פונקציות חדשות לניהול תמונות
// הוסף את כל הקוד מ-GOOGLE_APPS_SCRIPT_GALLERY.gs כאן
// ========================================

var GALLERY_FOLDER_ID = 'YOUR_FOLDER_ID_HERE'; // <-- עדכן!

function doGet_getAiGallery(params) {
  try {
    var sheet = getOrCreateSheet('GalleryImages');
    var data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      migrateLegacyImages();
      data = sheet.getDataRange().getValues();
    }
    
    var images = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (!row[0]) continue;
      
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
    var id = 'week' + imageData.week + '-' + Date.now();
    var file = DriveApp.getFileById(imageData.driveId);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    var url = 'https://drive.google.com/uc?export=view&id=' + imageData.driveId;
    var timestamp = new Date().toLocaleString('he-IL');
    
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

function getOrCreateSheet(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    
    if (sheetName === 'GalleryImages') {
      sheet.appendRow([
        'ID',
        'Week',
        'URL',
        'Credit',
        'Open',
        'Created',
        'DriveID'
      ]);
      
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

function migrateLegacyImages() {
  var sheet = getOrCreateSheet('GalleryImages');
  var timestamp = new Date().toLocaleString('he-IL');
  
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

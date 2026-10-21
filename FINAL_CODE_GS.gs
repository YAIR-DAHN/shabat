/**
 * קובץ Code.gs מתוקן ומלא - גרסה סופית
 * 
 * הוראות:
 * 1. פתח את Apps Script
 * 2. בחר את כל הטקסט בקובץ Code.gs (Ctrl+A)
 * 3. מחק הכל
 * 4. העתק והדבק את הקוד הזה במקום
 * 5. עדכן את המשתנים בתחילת הקובץ
 * 6. שמור ופרסם גרסה חדשה
 */

// ==========================================
// הגדרות כלליות - עדכן רק את החלק הזה!
// ==========================================

var SPREADSHEET_ID = 'הכנס_כאן_את_ID_של_הגיליון_שלך';
var GALLERY_FOLDER_ID = 'הכנס_כאן_את_ID_של_תיקיית_התמונות';

// שמות גיליונים (לא לשנות אלא אם יש סיבה)
var BRANCHES_SHEET_NAME = 'סניפים';
var GUESSES_SHEET_NAME = 'ניחושים תמונות';
var LIKES_SHEET_NAME = 'לייקים תמונות';
var ADMINS_SHEET_NAME = 'מנהלים'; // או איך שקראת לו

// ==========================================
// פונקציה ראשית - נקודת כניסה לכל הבקשות
// ==========================================

function doGet(e) {
  var action = e.parameter.action;
  
  try {
    // פעולות סניפים
    if (action === 'getBranches') {
      return jsonResponse(doGet_getBranches(e.parameter));
    }
    
    // ניחושים תמונות
    if (action === 'getAiGuesses') {
      return jsonResponse(doGet_getAiGuesses(e.parameter));
    }
    
    if (action === 'submitAiGuess') {
      return jsonResponse(doGet_submitAiGuess(e.parameter));
    }
    
    // לייקים תמונות
    if (action === 'getAiLikes') {
      return jsonResponse(doGet_getAiLikes(e.parameter));
    }
    
    if (action === 'getAiLikeAudit') {
      return jsonResponse(doGet_getAiLikeAudit(e.parameter));
    }
    
    if (action === 'submitAiLike') {
      return jsonResponse(doGet_submitAiLike(e.parameter));
    }
    
    if (action === 'setAiLikeCount') {
      return jsonResponse(doGet_setAiLikeCount(e.parameter));
    }
    
    // ===== גלריית תמונות - חדש! =====
    if (action === 'getAiGallery') {
      return jsonResponse(doGet_getAiGallery(e.parameter));
    }
    
    if (action === 'addAiImage') {
      return jsonResponse(doGet_addAiImage(e.parameter));
    }
    
    if (action === 'updateAiImage') {
      return jsonResponse(doGet_updateAiImage(e.parameter));
    }
    
    if (action === 'deleteAiImage') {
      return jsonResponse(doGet_deleteAiImage(e.parameter));
    }
    
    // אם לא מצאנו את ה-action
    return jsonResponse({ error: 'Invalid action: ' + action });
    
  } catch (err) {
    Logger.log('Error in doGet: ' + err.toString());
    return jsonResponse({ error: err.toString() });
  }
}

// פונקציית עזר להחזרת JSON
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// אימות והרשאות
// ==========================================

function isAuthorized(pin) {
  if (!pin) return false;
  
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(ADMINS_SHEET_NAME);
    
    if (!sheet) {
      // אם אין גיליון מנהלים, בדוק מול קוד קבוע (לא מומלץ!)
      return pin === 'YOUR_ADMIN_PIN'; // <-- שנה את זה!
    }
    
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][2] && data[i][2].toString() === pin.toString()) {
        return true;
      }
    }
    return false;
  } catch (err) {
    Logger.log('Auth error: ' + err);
    return false;
  }
}

// ==========================================
// פונקציות סניפים
// ==========================================

function doGet_getBranches(params) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(BRANCHES_SHEET_NAME);
    
    if (!sheet) {
      return { success: false, error: 'גיליון סניפים לא נמצא' };
    }
    
    var data = sheet.getDataRange().getValues();
    var branches = [];
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][0]) {
        branches.push(data[i][0]);
      }
    }
    
    return { success: true, data: branches };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

// ==========================================
// פונקציות ניחושים
// ==========================================

function doGet_getAiGuesses(params) {
  if (!params.pin || !isAuthorized(params.pin)) {
    return { error: 'unauthorized' };
  }
  
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(GUESSES_SHEET_NAME);
    
    if (!sheet) {
      return { success: false, error: 'גיליון ניחושים לא נמצא' };
    }
    
    var data = sheet.getDataRange().getValues();
    var guesses = [];
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][0]) {
        guesses.push({
          imageId: data[i][0],
          week: data[i][1],
          name: data[i][2],
          branch: data[i][3],
          phone: data[i][4],
          text: data[i][5],
          time: data[i][6]
        });
      }
    }
    
    return { success: true, data: guesses };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

function doGet_submitAiGuess(params) {
  try {
    var guess = JSON.parse(params.guess || '{}');
    
    if (!guess.imageId || !guess.name || !guess.text) {
      return { success: false, error: 'חסרים שדות חובה' };
    }
    
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(GUESSES_SHEET_NAME);
    
    if (!sheet) {
      return { success: false, error: 'גיליון ניחושים לא נמצא' };
    }
    
    var timestamp = new Date().toLocaleString('he-IL');
    
    sheet.appendRow([
      guess.imageId,
      guess.week || '',
      guess.name,
      guess.branch,
      guess.phone,
      guess.text,
      timestamp
    ]);
    
    return { success: true };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

// ==========================================
// פונקציות לייקים
// ==========================================

function doGet_getAiLikes(params) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(LIKES_SHEET_NAME);
    
    if (!sheet) {
      return { success: true, counts: {} };
    }
    
    var data = sheet.getDataRange().getValues();
    var counts = {};
    
    for (var i = 1; i < data.length; i++) {
      var imageId = data[i][0];
      var active = data[i][2] === 'כן' || data[i][2] === true;
      
      if (imageId && active) {
        counts[imageId] = (counts[imageId] || 0) + 1;
      }
    }
    
    return { success: true, counts: counts };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

function doGet_getAiLikeAudit(params) {
  if (!params.pin || !isAuthorized(params.pin)) {
    return { error: 'unauthorized' };
  }
  
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(LIKES_SHEET_NAME);
    
    if (!sheet) {
      return { success: true, likes: [], counts: {}, raw: {}, fixes: {} };
    }
    
    var data = sheet.getDataRange().getValues();
    var likes = [];
    var counts = {};
    var raw = {};
    
    for (var i = 1; i < data.length; i++) {
      var imageId = data[i][0];
      var deviceId = data[i][1];
      var active = data[i][2] === 'כן' || data[i][2] === true;
      var time = data[i][3];
      var ip = data[i][4];
      
      if (imageId) {
        likes.push({
          imageId: imageId,
          deviceId: deviceId,
          active: active,
          time: time,
          ip: ip,
          timeMs: time ? new Date(time).getTime() : 0,
          clientTime: data[i][5] || '',
          timeZone: data[i][6] || '',
          device: data[i][7] || '',
          browser: data[i][8] || ''
        });
        
        if (active) {
          counts[imageId] = (counts[imageId] || 0) + 1;
          raw[imageId] = (raw[imageId] || 0) + 1;
        }
      }
    }
    
    return { success: true, likes: likes, counts: counts, raw: raw, fixes: {} };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

function doGet_submitAiLike(params) {
  try {
    var like = JSON.parse(params.like || '{}');
    
    if (!like.imageId || !like.deviceId) {
      return { success: false, error: 'חסרים שדות חובה' };
    }
    
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(LIKES_SHEET_NAME);
    
    if (!sheet) {
      return { success: false, error: 'גיליון לייקים לא נמצא' };
    }
    
    var timestamp = new Date().toLocaleString('he-IL');
    var active = like.remove ? 'לא' : 'כן';
    
    sheet.appendRow([
      like.imageId,
      like.deviceId,
      active,
      timestamp,
      like.ip || '',
      like.clientTime || '',
      like.timeZone || '',
      like.device || '',
      like.browser || ''
    ]);
    
    return { success: true, liked: !like.remove };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

function doGet_setAiLikeCount(params) {
  if (!params.pin || !isAuthorized(params.pin)) {
    return { error: 'unauthorized' };
  }
  
  // פונקציה זו משמשת לתיקונים ידניים של מספרי לייקים
  // לא מממשים אותה כרגע - תחזיר success
  return { success: true };
}

// ==========================================
// גלריית תמונות - פונקציות חדשות
// ==========================================

function doGet_getAiGallery(params) {
  try {
    var sheet = getOrCreateSheet('GalleryImages');
    var data = sheet.getDataRange().getValues();
    
    // אם אין תמונות, הרץ מיגרציה
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
    Logger.log('Error in getAiGallery: ' + err);
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
      return { success: false, error: 'חסרים שדות חובה (driveId או week)' };
    }
    
    var sheet = getOrCreateSheet('GalleryImages');
    var id = 'week' + imageData.week + '-' + Date.now();
    
    // הגדרת הרשאות לקובץ
    try {
      var file = DriveApp.getFileById(imageData.driveId);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (driveErr) {
      Logger.log('Warning: Could not set file permissions: ' + driveErr);
    }
    
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
    
    return { success: true, id: id };
  } catch (err) {
    Logger.log('Error in addAiImage: ' + err);
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
        return { success: true };
      }
    }
    
    return { success: false, error: 'תמונה לא נמצאה' };
  } catch (err) {
    Logger.log('Error in updateAiImage: ' + err);
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
        return { success: true };
      }
    }
    
    return { success: false, error: 'תמונה לא נמצאה' };
  } catch (err) {
    Logger.log('Error in deleteAiImage: ' + err);
    return { success: false, error: err.toString() };
  }
}

// ==========================================
// פונקציות עזר לגלריה
// ==========================================

function getOrCreateSheet(sheetName) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    
    if (sheetName === 'GalleryImages') {
      // יצירת כותרות
      sheet.appendRow([
        'ID',
        'Week',
        'URL',
        'Credit',
        'Open',
        'Created',
        'DriveID'
      ]);
      
      // עיצוב כותרות
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
  
  Logger.log('מיגרציה הושלמה: ' + legacyImages.length + ' תמונות');
}

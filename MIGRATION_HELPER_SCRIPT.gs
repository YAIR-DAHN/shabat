/**
 * סקריפט עזר להעלאת תמונות קיימות ל-Drive
 * העתק את הפונקציה הזו ל-Apps Script והרץ אותה אחרי שהעלית את התמונות
 */

/**
 * עדכון URLs של תמונות קיימות לקישורי Drive
 * 
 * שלבים:
 * 1. העלה את כל התמונות מ-assets/aiImages/ לתיקייה ב-Drive
 * 2. קבל את ה-ID של כל קובץ (לחץ ימין → Get link)
 * 3. עדכן את mapping למטה עם ה-IDs
 * 4. הרץ את הפונקציה הזו
 */
function updateExistingImagesToDrive() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('GalleryImages');
  
  if (!sheet) {
    Logger.log('❌ שגיאה: גיליון GalleryImages לא קיים');
    return;
  }
  
  var data = sheet.getDataRange().getValues();
  
  // ========================================
  // 🔧 עדכן את המילון הזה עם ה-IDs שלך!
  // ========================================
  var filenameToDriveId = {
    '1.jpeg': 'YOUR_DRIVE_ID_HERE',   // week1-1
    '2.jpeg': 'YOUR_DRIVE_ID_HERE',   // week1-2
    '3.jpeg': 'YOUR_DRIVE_ID_HERE',   // week1-3
    '4.jpeg': 'YOUR_DRIVE_ID_HERE',   // week1-4
    '5.jpeg': 'YOUR_DRIVE_ID_HERE',   // week1-5
    '6.jpeg': 'YOUR_DRIVE_ID_HERE',   // week1-6
    '7.jpeg': 'YOUR_DRIVE_ID_HERE',   // week1-7
    '8.jpeg': 'YOUR_DRIVE_ID_HERE',   // week1-8
    '9.jpeg': 'YOUR_DRIVE_ID_HERE',   // week1-9
    '10.jpeg': 'YOUR_DRIVE_ID_HERE'   // week2-10
  };
  // ========================================
  
  var updated = 0;
  var skipped = 0;
  var errors = 0;
  
  Logger.log('🚀 מתחיל עדכון תמונות...');
  Logger.log('');
  
  // עבור על כל השורות (מתחיל מ-1 כדי לדלג על כותרת)
  for (var i = 1; i < data.length; i++) {
    var imageId = data[i][0];      // week1-1
    var week = data[i][1];         // 1
    var currentUrl = data[i][2];   // assets/aiImages/1.jpeg
    var credit = data[i][3];       // קרדיט
    var open = data[i][4];         // כן/לא
    var created = data[i][5];      // תאריך
    var currentDriveId = data[i][6]; // Drive ID קיים (ריק כנראה)
    
    // בדוק אם זה קישור ישן מ-assets
    if (currentUrl && currentUrl.indexOf('assets/aiImages/') !== -1) {
      // חלץ את שם הקובץ
      var filename = currentUrl.split('/').pop();
      
      // בדוק אם יש ID חדש למיפוי
      if (filenameToDriveId[filename] && filenameToDriveId[filename] !== 'YOUR_DRIVE_ID_HERE') {
        var newDriveId = filenameToDriveId[filename];
        var newUrl = 'https://drive.google.com/uc?export=view&id=' + newDriveId;
        
        try {
          // עדכן את השורה
          sheet.getRange(i + 1, 3).setValue(newUrl);        // עמודה C - URL
          sheet.getRange(i + 1, 7).setValue(newDriveId);    // עמודה G - DriveID
          
          Logger.log('✅ ' + imageId + ' (' + filename + ')');
          Logger.log('   URL חדש: ' + newUrl);
          updated++;
        } catch (err) {
          Logger.log('❌ שגיאה בעדכון ' + imageId + ': ' + err);
          errors++;
        }
      } else {
        Logger.log('⏭️  מדלג: ' + imageId + ' (' + filename + ') - אין ID במיפוי');
        skipped++;
      }
    } else {
      Logger.log('⏭️  מדלג: ' + imageId + ' - כבר מעודכן או פורמט לא מוכר');
      skipped++;
    }
    
    Logger.log('');
  }
  
  Logger.log('═══════════════════════════════════════');
  Logger.log('📊 סיכום:');
  Logger.log('   ✅ עודכנו: ' + updated + ' תמונות');
  Logger.log('   ⏭️  דולגו: ' + skipped + ' תמונות');
  Logger.log('   ❌ שגיאות: ' + errors);
  Logger.log('═══════════════════════════════════════');
  
  if (updated > 0) {
    Logger.log('');
    Logger.log('🎉 הצלחה! התמונות עודכנו.');
    Logger.log('📝 עכשיו בדוק באתר שהתמונות נטענות כמו שצריך.');
    Logger.log('');
    Logger.log('💡 טיפ: נקה את ה-cache של הדפדפן (Ctrl+Shift+R)');
  }
  
  if (errors > 0) {
    Logger.log('');
    Logger.log('⚠️  היו שגיאות. בדוק את ההרשאות והנתונים.');
  }
  
  if (updated === 0 && skipped > 0) {
    Logger.log('');
    Logger.log('⚠️  אף תמונה לא עודכנה!');
    Logger.log('   בדוק ש:');
    Logger.log('   1. עדכנת את המילון filenameToDriveId');
    Logger.log('   2. החלפת את "YOUR_DRIVE_ID_HERE" עם IDs אמיתיים');
    Logger.log('   3. התמונות בגיליון באמת מתחילות ב-"assets/aiImages/"');
  }
}

/**
 * בדיקה מהירה - מדפיס את התמונות הנוכחיות
 */
function checkCurrentImages() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('GalleryImages');
  
  if (!sheet) {
    Logger.log('❌ גיליון GalleryImages לא קיים');
    return;
  }
  
  var data = sheet.getDataRange().getValues();
  
  Logger.log('📋 תמונות נוכחיות בגיליון:');
  Logger.log('');
  
  for (var i = 1; i < data.length; i++) {
    var imageId = data[i][0];
    var currentUrl = data[i][2];
    var driveId = data[i][6];
    
    Logger.log(imageId + ':');
    Logger.log('  URL: ' + currentUrl);
    Logger.log('  DriveID: ' + (driveId || '(ריק)'));
    Logger.log('');
  }
}

/**
 * הגדרת הרשאות לכל התמונות ב-Drive
 * מוודא שכולן מוגדרות כ-"Anyone with link can view"
 */
function makeAllImagesPublic() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('GalleryImages');
  
  if (!sheet) {
    Logger.log('❌ גיליון GalleryImages לא קיים');
    return;
  }
  
  var data = sheet.getDataRange().getValues();
  var success = 0;
  var failed = 0;
  
  Logger.log('🔓 מגדיר הרשאות לתמונות...');
  Logger.log('');
  
  for (var i = 1; i < data.length; i++) {
    var imageId = data[i][0];
    var driveId = data[i][6];
    
    if (driveId && driveId !== 'YOUR_DRIVE_ID_HERE' && driveId.length > 10) {
      try {
        var file = DriveApp.getFileById(driveId);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        Logger.log('✅ ' + imageId + ' - הרשאות הוגדרו');
        success++;
      } catch (err) {
        Logger.log('❌ ' + imageId + ' - שגיאה: ' + err);
        failed++;
      }
    }
  }
  
  Logger.log('');
  Logger.log('📊 סיכום הרשאות:');
  Logger.log('   ✅ הצלחה: ' + success);
  Logger.log('   ❌ כשלון: ' + failed);
}

/**
 * יצירת טבלת מעקב לקובץ אקסל
 * מדפיס טבלה שאפשר להעתיק ולהדביק
 */
function generateTrackingTable() {
  Logger.log('📋 טבלת מעקב להעלאת תמונות:');
  Logger.log('');
  Logger.log('העתק את הטבלה הזו ושמור אותה כשאתה עובד:');
  Logger.log('');
  Logger.log('קובץ\t\tID מקורי\t\tDrive ID');
  Logger.log('─────────────────────────────────────────────');
  
  var files = [
    { name: '1.jpeg', id: 'week1-1' },
    { name: '2.jpeg', id: 'week1-2' },
    { name: '3.jpeg', id: 'week1-3' },
    { name: '4.jpeg', id: 'week1-4' },
    { name: '5.jpeg', id: 'week1-5' },
    { name: '6.jpeg', id: 'week1-6' },
    { name: '7.jpeg', id: 'week1-7' },
    { name: '8.jpeg', id: 'week1-8' },
    { name: '9.jpeg', id: 'week1-9' },
    { name: '10.jpeg', id: 'week2-10' }
  ];
  
  files.forEach(function(file) {
    Logger.log(file.name + '\t\t' + file.id + '\t\t[הדבק כאן]');
  });
  
  Logger.log('');
  Logger.log('💡 אחרי שמילאת, עדכן את filenameToDriveId ב-updateExistingImagesToDrive()');
}

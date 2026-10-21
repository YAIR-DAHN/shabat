// עדכון הקבועים
const SPREADSHEET_ID = '1vzNdXWaZe1FKk4SFy0mWhbJ7s64zC-HAMOdMnXV52v4'; // צריך להחליף את זה ב-ID האמיתי
const QUESTIONS_SHEET_NAME = 'שאלות';
const ANSWERS_SHEET_NAME = 'תשובות';
const BRANCHES_SHEET_NAME = 'סניפים';
const WINNERS_SHEET_NAME = 'זוכים';
const UPDATES_SHEET_NAME = 'עדכונים';
const REGISTRATION_SHEET_NAME = 'רישום'; // גיליון חדש לרישום
const PODCAST_LOTTERY_SHEET_NAME = 'פודקאסט הגרלה';
const PODCAST_LISTENS_SHEET_NAME = 'האזנות פודקאסט';
const DISCUSSION_COMMENTS_SHEET_NAME = 'תגובות דיון';
const GOOD_DEEDS_SHEET_NAME = 'מעשים טובים';
const AI_GUESSES_SHEET_NAME = 'ניחושי תמונות';
const AI_LIKES_SHEET_NAME = 'לייקים לתמונות';
const AI_LIKE_FIX_SHEET_NAME = 'תיקון לייקים';
// הקוד לדף הניהול ai-admin.html. כדאי להחליף לפני פרסום.
const AI_ADMIN_PIN = '887181';
const WEEKS_SHEET_NAME = 'שבועות';
const ANSWERS_ARCHIVE_SHEET_NAME = 'ארכיון תשובות';
const ADMIN_USERS_SHEET_NAME = 'מנהלים';
const SETTINGS_SHEET_NAME = 'הגדרות';
const DIRECTORY_SHEET_NAME = 'לוז סניפים מפורט לפי יום';
const DIRECTORY_NOTES_SHEET_NAME = 'טלפונים רכזים וזמני פעילות';
const DIRECTORY_STATUSES = ['בעניין', 'לא בעניין', 'צריך דירבון', 'לא עונה'];
const ADMIN_BOOTSTRAP_PIN = '887181';
const ADMIN_BOOTSTRAP_NAME = 'סופר אדמין';
const ADMIN_ANSWER_SLOTS = 12;

function doGet(e) {
  var body = JSON.stringify(handleRequest(e));
  var callback = e && e.parameter ? String(e.parameter.callback || '') : '';
  if (/^shabbatCb[0-9]+$/.test(callback)) {
    return ContentService.createTextOutput(callback + '(' + body + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(body)
    .setMimeType(ContentService.MimeType.JSON);
    
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
}

function handleRequest(e) {
  const action = e.parameter.action;
  let data = null;
  
  try {
    if (e.parameter.data) {
      data = JSON.parse(decodeURIComponent(e.parameter.data));
    }
  } catch (error) {
    return {
      error: 'Invalid data format'
    };
  }
  
  switch(action) {
    case 'getBranches':
      return {
        data: getBranches()
      };
      
    case 'getQuestions':
      return {
        data: getCurrentQuestions()
      };
      
    case 'testConnection':
      return {
        status: 'success',
        message: 'מחובר בהצלחה!'
      };
      
    case 'submitQuiz':
      if (!data) {
        return { error: 'No data provided' };
      }
      const result = submitQuiz(data.userDetails, data.answers);
      if (!result.success) {
        return { error: result.error || 'Failed to submit quiz' };
      }
      return result;
      
    case 'submitRegistration':
      if (!data) {
        return { error: 'No data provided' };
      }
      const regResult = submitRegistration(data.userDetails);
      if (!regResult.success) {
        return { error: regResult.error || 'Failed to submit registration' };
      }
      return regResult;
      
    case 'submitPodcastLottery':
      if (!data) {
        return { error: 'No data provided' };
      }
      const lotteryResult = submitPodcastLottery(data.userDetails);
      if (!lotteryResult.success) {
        return { error: lotteryResult.error || 'Failed to submit lottery entry' };
      }
      return lotteryResult;
      
    case 'savePodcastListen':
      if (!data) {
        return { error: 'No data provided' };
      }
      const listenResult = savePodcastListen(data);
      if (!listenResult.success) {
        return { error: listenResult.error || 'Failed to save listen data' };
      }
      return listenResult;
      
    case 'submitWinnerForm':
      if (!data) {
        return { error: 'No data provided' };
      }
      const winnerResult = submitWinnerForm(data.winnerDetails);
      if (!winnerResult.success) {
        return { error: winnerResult.error || 'Failed to submit winner form' };
      }
      return winnerResult;
      
    case 'getWinners':
      return getWinners();
      
    case 'getUpdates':
      return getUpdates();
      
    case 'submitDiscussionComment':
      if (!data) {
        return { error: 'No data provided' };
      }
      const commentResult = submitDiscussionComment(data.comment);
      if (!commentResult.success) {
        return { error: commentResult.error || 'Failed to submit comment' };
      }
      return commentResult;
      
    case 'submitDiscussionReply':
      console.log("Received submitDiscussionReply request with data:", JSON.stringify(data));
      if (!data) {
        return { error: 'No data provided' };
      }
      console.log("Calling submitDiscussionReply with:", JSON.stringify(data.reply));
      const replyResult = submitDiscussionReply(data.reply);
      console.log("submitDiscussionReply result:", JSON.stringify(replyResult));
      if (!replyResult.success) {
        return { error: replyResult.error || 'Failed to submit reply' };
      }
      return replyResult;
      
    case 'likeComment':
      if (!data || !data.commentId) {
        return { error: 'No comment ID provided' };
      }
      return likeComment(data.commentId);
      
    case 'unlikeComment':
      if (!data || !data.commentId) {
        return { error: 'No comment ID provided' };
      }
      return unlikeComment(data.commentId);
      
    case 'getDiscussionComments':
      return getDiscussionComments(e);
      
    case 'submitGoodDeed':
      if (!data) {
        return { error: 'No data provided' };
      }
      // תמיכה בפורמטים שונים של נתונים
      const deedData = data.deedData || data;
      return submitGoodDeed(deedData);
      
    case 'getGoodDeeds':
      return getGoodDeeds();

    case 'submitAiGuess':
      if (!data) {
        return { error: 'No data provided' };
      }
      return submitAiGuess(data.guess || data);

    case 'getAiGuesses':
      if (!allowAiRead(data)) return { error: 'unauthorized' };
      return getAiGuesses();

    case 'getAiLikes':
      return getAiLikes();

    case 'getAiLikeAudit':
      if (!allowAiRead(data)) return { error: 'unauthorized' };
      return getAiLikeAudit();

    case 'setAiLikeCount':
      if (!allowAiWrite(data)) return { error: 'unauthorized' };
      return setAiLikeCount(data);

    case 'submitAiLike':
      if (!data) {
        return { error: 'No data provided' };
      }
      return submitAiLike(data.like || data);

    case 'getSiteSettings':
      return getSiteSettings();

    case 'adminLogin':
      return adminLogin(data);

    case 'adminOverview':
      return adminOverview(data);

    case 'adminListQuestions':
      return adminListQuestions(data);

    case 'adminSaveQuestion':
      return adminSaveQuestion(data);

    case 'adminDeleteQuestion':
      return adminDeleteQuestion(data);

    case 'adminMoveQuestion':
      return adminMoveQuestion(data);

    case 'adminCreateWeek':
      return adminCreateWeek(data);

    case 'adminUpdateWeek':
      return adminUpdateWeek(data);

    case 'adminPublishWeek':
      return adminPublishWeek(data);

    case 'adminArchiveAnswers':
      return adminArchiveAnswers(data);

    case 'adminDeleteWeek':
      return adminDeleteWeek(data);

    case 'adminListAnswers':
      return adminListAnswers(data);

    case 'adminListBranches':
      return adminListBranches(data);

    case 'adminAddBranch':
      return adminAddBranch(data);

    case 'adminRenameBranch':
      return adminRenameBranch(data);

    case 'adminDeleteBranch':
      return adminDeleteBranch(data);

    case 'adminListUpdates':
      return adminListUpdates(data);

    case 'adminSaveUpdate':
      return adminSaveUpdate(data);

    case 'adminDeleteUpdate':
      return adminDeleteUpdate(data);

    case 'adminListWinners':
      return adminListWinners(data);

    case 'adminSaveWinner':
      return adminSaveWinner(data);

    case 'adminDeleteWinner':
      return adminDeleteWinner(data);

    case 'adminMoveWinner':
      return adminMoveWinner(data);

    case 'adminListRegistrations':
      return adminListRegistrations(data);

    case 'adminListStaff':
      return adminListStaff(data);

    case 'adminSaveStaff':
      return adminSaveStaff(data);

    case 'adminDeleteStaff':
      return adminDeleteStaff(data);

    case 'adminSetOwnPin':
      return adminSetOwnPin(data);

    case 'adminSetQuizOpen':
      return adminSetQuizOpen(data);

    case 'adminClearDuplicateAnswers':
      return adminClearDuplicateAnswers(data);

    case 'coordinatorOverview':
      return coordinatorOverview(data);

    case 'adminListDirectory':
      return adminListDirectory(data);

    case 'adminSaveDirectory':
      return adminSaveDirectory(data);

    case 'adminDeleteDirectory':
      return adminDeleteDirectory(data);
      
    default:
      return {
        error: 'Invalid action'
      };
  }
}

function doPost(e) {
  // טיפול בבקשות POST עם אותן כותרות CORS
  const response = ContentService.createTextOutput()
    .setMimeType(ContentService.MimeType.JSON)
    .setContent(JSON.stringify(handleRequest(e)));
  
  return response;
}

// פונקציה להחזרת רשימת הסניפים
function getBranches() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(BRANCHES_SHEET_NAME);
  const branches = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
  return branches.flat().filter(branch => branch !== '');
}

// פונקציה להחזרת השאלות למבחן הנוכחי
function getCurrentQuestions() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(QUESTIONS_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // מחזיר רק שאלות פעילות למבחן הנוכחי
  const questions = data.slice(1)
    .filter(row => row[headers.indexOf('פעיל')] === true)
    .map(row => ({
      id: row[headers.indexOf('מזהה')],
      question: row[headers.indexOf('שאלה')],
      type: row[headers.indexOf('סוג')],
      options: row.slice(headers.indexOf('אופציה 1'), headers.indexOf('אופציה 1') + 4)
        .filter(option => option !== ''),
      correctAnswer: row[headers.indexOf('תשובה נכונה')]
    }));
    
  return questions;
}

// פונקציה לשמירת תשובות המשתמש
function submitQuiz(userDetails, answers) {
  if (!userDetails || !userDetails.userName || !userDetails.branch || !userDetails.phone) {
    return {
      success: false,
      error: 'חסרים פרטי משתמש'
    };
  }

  if (!answers || !Array.isArray(answers)) {
    return {
      success: false,
      error: 'חסרות תשובות'
    };
  }

  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(ANSWERS_SHEET_NAME);
  const timestamp = new Date();
  
  // חישוב ציון
  const questions = getCurrentQuestions();
  let score = 0;
  questions.forEach((q, index) => {
    if (answers[index] && q.correctAnswer === answers[index]) {
      score++;
    }
  });
  
  const finalScore = (score / questions.length) * 100;
  
  try {
    // שמירת התשובות
    sheet.appendRow([
      timestamp,
      userDetails.userName,
      userDetails.branch,
      userDetails.phone,
      ...answers,
      finalScore
    ]);
    
    return {
      success: true,
      score: finalScore
    };
  } catch (error) {
    console.error('Error saving quiz:', error);
    return {
      success: false,
      error: 'שגיאה בשמירת השעשועון'
    };
  }
}

// פונקציית בדיקה פשוטה
function testConnection() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheets = ss.getSheets().map(sheet => sheet.getName());
    return {
      status: 'success',
      message: 'מחובר בהצלחה!',
      sheets: sheets
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.toString()
    };
  }
}

// פונקציה לשמירת פרטי רישום
function submitRegistration(userDetails) {
  console.log("קבלת בקשת רישום:", JSON.stringify(userDetails));
  
  if (!userDetails || !userDetails.userName || !userDetails.branch || !userDetails.phone) {
    console.error("חסרים פרטי משתמש:", JSON.stringify(userDetails));
    return {
      success: false,
      error: 'חסרים פרטי משתמש'
    };
  }

  try {
    // בדיקה אם קיים גיליון רישום, ואם לא - יוצרים אותו
    let ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let registrationSheet = ss.getSheetByName(REGISTRATION_SHEET_NAME);
    
    if (!registrationSheet) {
      console.log("יוצר גיליון רישום חדש");
      registrationSheet = ss.insertSheet(REGISTRATION_SHEET_NAME);
      registrationSheet.getRange('A1:D1').setValues([['תאריך', 'שם', 'סניף', 'טלפון']]);
      registrationSheet.setFrozenRows(1);
    }
    
    const timestamp = new Date();
    console.log("הוספת שורה חדשה לגיליון רישום");
    
    // שמירת פרטי הרישום
    registrationSheet.appendRow([
      timestamp,
      userDetails.userName,
      userDetails.branch,
      userDetails.phone
    ]);
    
    console.log("רישום הושלם בהצלחה עבור:", userDetails.userName);
    return {
      success: true,
      message: 'הרישום הושלם בהצלחה'
    };
  } catch (error) {
    console.error('שגיאת רישום:', error.toString());
    return {
      success: false,
      error: 'שגיאה בשמירת פרטי הרישום: ' + error.toString()
    };
  }
}

// פונקציה לשמירת פרטי הגרלת פודקאסט
function submitPodcastLottery(userDetails) {
  console.log("קבלת בקשת הגרלת פודקאסט:", JSON.stringify(userDetails));
  
  if (!userDetails || !userDetails.userName || !userDetails.branch || !userDetails.phone || !userDetails.episode) {
    console.error("חסרים פרטי משתמש:", JSON.stringify(userDetails));
    return {
      success: false,
      error: 'חסרים פרטי משתמש'
    };
  }

  try {
    // בדיקה אם קיים גיליון הגרלת פודקאסט, ואם לא - יוצרים אותו
    let ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let lotterySheet = ss.getSheetByName(PODCAST_LOTTERY_SHEET_NAME);
    
    if (!lotterySheet) {
      console.log("יוצר גיליון הגרלת פודקאסט חדש");
      lotterySheet = ss.insertSheet(PODCAST_LOTTERY_SHEET_NAME);
      lotterySheet.getRange('A1:E1').setValues([['תאריך', 'שם', 'טלפון', 'סניף', 'פרק']]);
      lotterySheet.setFrozenRows(1);
    }
    
    const timestamp = new Date();
    console.log("הוספת רישום להגרלה עבור:", userDetails.userName);
    
    // שמירת פרטי ההגרלה
    lotterySheet.appendRow([
      timestamp,
      userDetails.userName,
      userDetails.phone,
      userDetails.branch,
      userDetails.episode
    ]);
    
    console.log("רישום להגרלה הושלם בהצלחה");
    return {
      success: true,
      message: 'נרשמת להגרלה בהצלחה'
    };
  } catch (error) {
    console.error('שגיאת רישום להגרלה:', error.toString());
    return {
      success: false,
      error: 'שגיאה בשמירת פרטי ההגרלה: ' + error.toString()
    };
  }
}

// פונקציה לשמירת נתוני האזנה
function savePodcastListen(data) {
  console.log("קבלת בקשת שמירת האזנה:", JSON.stringify(data));
  
  try {
    let ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let listensSheet = ss.getSheetByName(PODCAST_LISTENS_SHEET_NAME);
    
    if (!listensSheet) {
      console.log("יוצר גיליון האזנות פודקאסט חדש");
      listensSheet = ss.insertSheet(PODCAST_LISTENS_SHEET_NAME);
      listensSheet.getRange('A1:H1').setValues([['מזהה', 'מכשיר', 'פרק', 'שם פרק', 'תאריך', 'משך האזנה (שניות)', 'הושלם', 'עדכון אחרון']]);
      listensSheet.setFrozenRows(1);
    }

    const sessionId = data.sessionId;
    const deviceId = data.deviceId;
    const episodeId = data.episodeId;
    const episodeTitle = data.episodeTitle;
    const updateType = data.updateType;
    const totalListened = data.totalListened;
    const completed = data.completed;
    const timestamp = new Date(data.timestamp);
    
    // חיפוש שורה קיימת לפי sessionId
    const dataRange = listensSheet.getDataRange();
    const values = dataRange.getValues();
    let existingRow = -1;
    
    // חיפוש השורה הקיימת (החל מהשורה השנייה כי הראשונה היא כותרות)
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === sessionId) { // sessionId נמצא בעמודה הראשונה
        existingRow = i + 1; // +1 כי getValues() מתחיל מ-0
        break;
      }
    }

    const rowData = [
      sessionId,
      deviceId,
      episodeId,
      episodeTitle,
      timestamp,
      totalListened,
      completed ? 'כן' : 'לא',
      timestamp // עדכון אחרון
    ];

    if (existingRow > 0 && updateType !== 'start') {
      // עדכון שורה קיימת (רק אם זה לא התחלת האזנה)
      listensSheet.getRange(existingRow, 1, 1, rowData.length).setValues([rowData]);
      console.log(`עודכן שורה ${existingRow} עבור האזנה ${sessionId}`);
    } else if (updateType === 'start') {
      // הוספת שורה חדשה רק עבור התחלת האזנה
      listensSheet.appendRow(rowData);
      console.log(`נוספה שורה חדשה עבור האזנה ${sessionId}`);
    }

    return { success: true };
  } catch (error) {
    console.error('שגיאה בשמירת נתוני האזנה:', error);
    return { success: false, error: error.toString() };
  }
}

// פונקציה לשמירת טופס זכייה
function submitWinnerForm(winnerDetails) {
  console.log("קבלת בקשת טופס זכייה:", JSON.stringify(winnerDetails));
  
  if (!winnerDetails || !winnerDetails.winningCategory || !winnerDetails.userName || 
      !winnerDetails.phone || !winnerDetails.branch || !winnerDetails.accountOwner || 
      !winnerDetails.parentPhone || !winnerDetails.idNumber || !winnerDetails.bankName || 
      !winnerDetails.bankBranch || !winnerDetails.accountNumber) {
    console.error("חסרים פרטי זכייה:", JSON.stringify(winnerDetails));
    return {
      success: false,
      error: 'חסרים פרטי זכייה נדרשים'
    };
  }

  try {
    // בדיקה אם קיים גיליון טופס זכייה, ואם לא - יוצרים אותו
    let ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let winnerSheet = ss.getSheetByName('טופס זכייה');
    
    if (!winnerSheet) {
      console.log("יוצר גיליון טופס זכייה חדש");
      winnerSheet = ss.insertSheet('טופס זכייה');
      winnerSheet.getRange('A1:K1').setValues([
        ['תאריך', 'זכייה עבור', 'שם הזוכה', 'טלפון', 'סניף', 'שם בעל החשבון', 'טלפון הורה', 'תעודת זהות', 'שם הבנק', 'סניף הבנק', 'מספר חשבון']
      ]);
      winnerSheet.setFrozenRows(1);
    }
    
    const timestamp = new Date();
    console.log("הוספת טופס זכייה חדש עבור:", winnerDetails.userName);
    
    // שמירת פרטי הזכייה
    winnerSheet.appendRow([
      timestamp,
      winnerDetails.winningCategory,
      winnerDetails.userName,
      winnerDetails.phone,
      winnerDetails.branch,
      winnerDetails.accountOwner,
      winnerDetails.parentPhone,
      winnerDetails.idNumber,
      winnerDetails.bankName,
      winnerDetails.bankBranch,
      winnerDetails.accountNumber
    ]);
    
    console.log("טופס זכייה נשמר בהצלחה");
    return {
      success: true,
      message: 'טופס הזכייה נשלח בהצלחה'
    };
  } catch (error) {
    console.error('שגיאת שמירת טופס זכייה:', error.toString());
    return {
      success: false,
      error: 'שגיאה בשמירת טופס הזכייה: ' + error.toString()
    };
  }
}

// נוסיף פונקציה שתיצור את המבנה הבסיסי של הגיליון אם הוא לא קיים
function setupSpreadsheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // הגדרת גיליון סניפים
  let branchesSheet = ss.getSheetByName(BRANCHES_SHEET_NAME);
  if (!branchesSheet) {
    branchesSheet = ss.insertSheet(BRANCHES_SHEET_NAME);
    branchesSheet.getRange('A1').setValue('שם הסניף');
  }
  
  // הגדרת גיליון שאלות
  let questionsSheet = ss.getSheetByName(QUESTIONS_SHEET_NAME);
  if (!questionsSheet) {
    questionsSheet = ss.insertSheet(QUESTIONS_SHEET_NAME);
    questionsSheet.getRange('A1:I1').setValues([['מזהה', 'שאלה', 'סוג', 'אופציה 1', 'אופציה 2', 'אופציה 3', 'אופציה 4', 'תשובה נכונה', 'פעיל']]);
  }
  
  // הגדרת גיליון תשובות
  let answersSheet = ss.getSheetByName(ANSWERS_SHEET_NAME);
  if (!answersSheet) {
    answersSheet = ss.insertSheet(ANSWERS_SHEET_NAME);
    answersSheet.getRange('A1:E1').setValues([['תאריך', 'שם', 'סניף', 'טלפון', 'ציון']]);
  }
  
  // הגדרת גיליון רישום
  let registrationSheet = ss.getSheetByName(REGISTRATION_SHEET_NAME);
  if (!registrationSheet) {
    registrationSheet = ss.insertSheet(REGISTRATION_SHEET_NAME);
    registrationSheet.getRange('A1:D1').setValues([['תאריך', 'שם', 'סניף', 'טלפון']]);
    registrationSheet.setFrozenRows(1);
  }
  
  // הגדרת גיליון הגרלת פודקאסט
  let podcastLotterySheet = ss.getSheetByName(PODCAST_LOTTERY_SHEET_NAME);
  if (!podcastLotterySheet) {
    podcastLotterySheet = ss.insertSheet(PODCAST_LOTTERY_SHEET_NAME);
    podcastLotterySheet.getRange('A1:E1').setValues([['תאריך', 'שם', 'טלפון', 'סניף', 'פרק']]);
    podcastLotterySheet.setFrozenRows(1);
  }
  
  // הגדרת גיליון האזנות פודקאסט
  let podcastListensSheet = ss.getSheetByName(PODCAST_LISTENS_SHEET_NAME);
  if (!podcastListensSheet) {
    podcastListensSheet = ss.insertSheet(PODCAST_LISTENS_SHEET_NAME);
    podcastListensSheet.getRange('A1:H1').setValues([['מזהה', 'מכשיר', 'פרק', 'שם פרק', 'תאריך', 'משך האזנה (שניות)', 'הושלם', 'עדכון אחרון']]);
    podcastListensSheet.setFrozenRows(1);
  }
  
  // הגדרת גיליון תגובות דיון
  let discussionCommentsSheet = ss.getSheetByName(DISCUSSION_COMMENTS_SHEET_NAME);
  if (!discussionCommentsSheet) {
    discussionCommentsSheet = ss.insertSheet(DISCUSSION_COMMENTS_SHEET_NAME);
    discussionCommentsSheet.getRange('A1:H1').setValues([['תאריך', 'שם', 'טלפון', 'תגובה', 'מזהה', 'זמן יצירה', 'תגובה על', 'מזהה דיון']]);
    discussionCommentsSheet.setFrozenRows(1);
  }
  
  // הגדרת גיליון מעשים טובים
  let goodDeedsSheet = ss.getSheetByName(GOOD_DEEDS_SHEET_NAME);
  if (!goodDeedsSheet) {
    goodDeedsSheet = ss.insertSheet(GOOD_DEEDS_SHEET_NAME);
    goodDeedsSheet.getRange('A1:H1').setValues([
      ['תאריך', 'שם מלא', 'טלפון', 'סניף', 'סוג מעשה טוב', 'תיאור', 'הרגשה', 'זמן יצירה']
    ]);
    goodDeedsSheet.setFrozenRows(1);
  }
  
  return "Spreadsheet setup completed";
}

function getWinners() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const winnersSheet = ss.getSheetByName(WINNERS_SHEET_NAME);
  
  if (!winnersSheet) {
    return { data: [] };
  }
  
  const data = winnersSheet.getDataRange().getValues();
  const headers = data[0];
  const winners = data.slice(1).map(row => ({
    name: row[0],
    branch: row[1],
    prize: row[2],
    quiz: row[3],
    date: row[4] || ''
  })).filter(winner => String(winner.name || '').trim());
  
  return { data: winners };
}

function getUpdates() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const updatesSheet = ss.getSheetByName(UPDATES_SHEET_NAME);
  
  if (!updatesSheet) {
    return { data: [] };
  }
  
  const data = updatesSheet.getDataRange().getValues();
  const headers = data[0];
  const updates = data.slice(1).reverse()
    .filter(row => String(row[1] || '').trim() || String(row[2] || '').trim())
    .map(row => ({
      date: row[0],
      title: row[1],
      content: row[2],
      type: String(row[3] || 'עדכון רגיל').trim()
    }));
  
  return { data: updates };
}

// פונקציה לשמירת תגובות דיון
function submitDiscussionComment(comment) {
  console.log("קבלת בקשת תגובת דיון:", JSON.stringify(comment));
  
  if (!comment || !comment.name || !comment.phone || !comment.text || !comment.discussionId) {
    console.error("חסרים פרטי תגובה:", JSON.stringify(comment));
    return {
      success: false,
      error: 'חסרים פרטי תגובה נדרשים'
    };
  }

  try {
    // בדיקה אם קיים גיליון תגובות דיון, ואם לא - יוצרים אותו
    let ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let commentsSheet = ss.getSheetByName(DISCUSSION_COMMENTS_SHEET_NAME);
    
    if (!commentsSheet) {
      console.log("יוצר גיליון תגובות דיון חדש");
      commentsSheet = ss.insertSheet(DISCUSSION_COMMENTS_SHEET_NAME);
      commentsSheet.getRange('A1:H1').setValues([
        ['תאריך', 'שם', 'טלפון', 'תגובה', 'מזהה', 'זמן יצירה', 'תגובה על', 'מזהה דיון']
      ]);
      commentsSheet.setFrozenRows(1);
    }
    
    const timestamp = new Date();
    const commentId = Date.now().toString();
    console.log("הוספת תגובה חדשה עבור:", comment.name, "בדיון:", comment.discussionId);
    
    // שמירת התגובה
    commentsSheet.appendRow([
      timestamp,
      comment.name,
      comment.phone,
      comment.text,
      commentId,
      timestamp.getTime(),
      '', // עמודה G ריקה לתגובות רגילות
      comment.discussionId // עמודה H - מזהה הדיון
    ]);
    
    console.log("תגובה נשמרה בהצלחה");
    return {
      success: true,
      message: 'תגובתך נשלחה בהצלחה',
      commentId: commentId
    };
  } catch (error) {
    console.error('שגיאת שמירת תגובה:', error.toString());
    return {
      success: false,
      error: 'שגיאה בשמירת התגובה: ' + error.toString()
    };
  }
}

// פונקציה לקבלת תגובות דיון
function getDiscussionComments(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const commentsSheet = ss.getSheetByName(DISCUSSION_COMMENTS_SHEET_NAME);
    
    if (!commentsSheet) {
      return { data: [] };
    }
    
    const data = commentsSheet.getDataRange().getValues();
    if (data.length <= 1) {
      return { data: [] };
    }
    
    const headers = data[0];
    console.log('Headers:', headers);
    console.log('Data rows:', data.slice(1));
    
    // קבלת מזהה הדיון מהפרמטרים
    const discussionId = e && e.parameter ? e.parameter.discussionId : null;
    console.log('Requested discussion ID:', discussionId);
    
    const comments = data.slice(1)
      .map(row => {
        console.log('Processing row:', row);
        
        // בדיקה אם השורה ריקה
        if (!row[0] && !row[1] && !row[2]) {
          console.log('Skipping empty row');
          return null;
        }
        
        // מבנה חדש: עמודה A = תאריך, עמודה B = שם, עמודה C = טלפון, עמודה D = תגובה, עמודה E = מזהה, עמודה F = זמן יצירה, עמודה G = תגובה על, עמודה H = מזהה דיון
        const timestamp = row[0]; // עמודה A
        const name = row[1]; // עמודה B  
        const phone = row[2]; // עמודה C
        const text = row[3]; // עמודה D
        const commentId = row[4]; // עמודה E
        const creationTime = row[5]; // עמודה F (זמן יצירה)
        const replyTo = row[6]; // עמודה G (תגובה על)
        const rowDiscussionId = row[7]; // עמודה H (מזהה דיון)
        
        console.log('Extracted data:', { name, text, commentId, timestamp, discussionId: rowDiscussionId });
        
        // בדיקה אם יש תוכן
        if (!name || !text) {
          console.log('Skipping row without name or text');
          return null;
        }
        
        // סינון לפי מזהה הדיון
        if (discussionId && rowDiscussionId !== discussionId) {
          console.log('Skipping comment from different discussion:', rowDiscussionId, '!=', discussionId);
          return null;
        }
        
        let formattedDate = 'תאריך לא ידוע';
        
        try {
          if (timestamp) {
            // אם זה כבר מחרוזת בפורמט עברי, נשתמש בה
            if (typeof timestamp === 'string' && timestamp.includes('/')) {
              formattedDate = timestamp;
            } else {
              // אחרת ננסה לפרסר כ-Date object
              const date = new Date(timestamp);
              if (!isNaN(date.getTime())) {
                formattedDate = date.toLocaleString('he-IL', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                });
              }
            }
          }
        } catch (error) {
          console.error('שגיאה בעיצוב תאריך:', error);
        }
        
        // בדוק אם יש עמודת לייקים
        const likes = row[8] || 0; // עמודה I - לייקים (עכשיו אחרי עמודת מזהה דיון)
        
        return {
          id: commentId || Date.now().toString(),
          name: name,
          text: text,
          date: formattedDate,
          timestamp: timestamp ? (typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp.getTime()) : Date.now(),
          replyTo: replyTo || null,
          likes: likes,
          discussionId: rowDiscussionId
        };
      })
      .filter(comment => comment !== null) // הסרת שורות ריקות
      .sort((a, b) => b.timestamp - a.timestamp); // מיון לפי זמן (חדש קודם)
    
    console.log('Final comments for discussion', discussionId, ':', comments);
    return { data: comments };
  } catch (error) {
    console.error('שגיאה בקבלת תגובות:', error);
    return { 
      success: false, 
      error: 'שגיאה בקבלת התגובות: ' + error.toString(),
      data: [] 
    };
  }
}



// פונקציה לשמירת תגובות על תגובות
function submitDiscussionReply(reply) {
  console.log("קבלת בקשת תגובה על תגובה:", JSON.stringify(reply));
  
  if (!reply || !reply.name || !reply.phone || !reply.text || !reply.replyTo || !reply.discussionId) {
    console.error("חסרים פרטי תגובה:", JSON.stringify(reply));
    return {
      success: false,
      error: 'חסרים פרטי תגובה נדרשים'
    };
  }

  try {
    // בדיקה אם קיים גיליון תגובות דיון
    let ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let commentsSheet = ss.getSheetByName(DISCUSSION_COMMENTS_SHEET_NAME);
    
    if (!commentsSheet) {
      console.log("יוצר גיליון תגובות דיון חדש");
      commentsSheet = ss.insertSheet(DISCUSSION_COMMENTS_SHEET_NAME);
      commentsSheet.getRange('A1:H1').setValues([
        ['תאריך', 'שם', 'טלפון', 'תגובה', 'מזהה', 'זמן יצירה', 'תגובה על', 'מזהה דיון']
      ]);
      commentsSheet.setFrozenRows(1);
    }
    
    const timestamp = new Date();
    const replyId = Date.now().toString();
    console.log("הוספת תגובה חדשה עבור:", reply.name, "על תגובה:", reply.replyTo, "בדיון:", reply.discussionId);
    
    // שמירת התגובה
    commentsSheet.appendRow([
      timestamp,
      reply.name,
      reply.phone,
      reply.text,
      replyId,
      timestamp.getTime(),
      reply.replyTo,
      reply.discussionId // עמודה H - מזהה הדיון
    ]);
    
    console.log("תגובה נשמרה בהצלחה");
    return {
      success: true,
      message: 'תגובתך נשלחה בהצלחה',
      replyId: replyId
    };
  } catch (error) {
    console.error('שגיאת שמירת תגובה:', error.toString());
    return {
      success: false,
      error: 'שגיאה בשמירת התגובה: ' + error.toString()
    };
  }
}

// פונקציה ללייק תגובה
function likeComment(commentId) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const commentsSheet = ss.getSheetByName(DISCUSSION_COMMENTS_SHEET_NAME);
    
    if (!commentsSheet) {
      return { success: false, error: 'גיליון תגובות לא נמצא' };
    }
    
    const data = commentsSheet.getDataRange().getValues();
    const headers = data[0];
    
    // מצא את השורה עם ה-ID המתאים
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowCommentId = row[4]; // עמודה E - מזהה
      
      if (rowCommentId.toString() === commentId.toString()) {
        // בדוק אם יש עמודת לייקים, אם לא - הוסף אותה
        let likesColumnIndex = headers.indexOf('לייקים');
        if (likesColumnIndex === -1) {
          likesColumnIndex = headers.length;
          commentsSheet.getRange(1, likesColumnIndex + 1).setValue('לייקים');
        }
        
        // עדכן את מספר הלייקים
        const currentLikes = row[likesColumnIndex] || 0;
        const newLikes = currentLikes + 1;
        commentsSheet.getRange(i + 1, likesColumnIndex + 1).setValue(newLikes);
        
        return { success: true, likes: newLikes };
      }
    }
    
    return { success: false, error: 'תגובה לא נמצאה' };
  } catch (error) {
    console.error('שגיאה בלייק תגובה:', error);
    return { success: false, error: 'שגיאה בעדכון הלייק' };
  }
}

// פונקציה לביטול לייק תגובה
function unlikeComment(commentId) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const commentsSheet = ss.getSheetByName(DISCUSSION_COMMENTS_SHEET_NAME);
    
    if (!commentsSheet) {
      return { success: false, error: 'גיליון תגובות לא נמצא' };
    }
    
    const data = commentsSheet.getDataRange().getValues();
    const headers = data[0];
    
    // מצא את השורה עם ה-ID המתאים
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowCommentId = row[4]; // עמודה E - מזהה
      
      if (rowCommentId.toString() === commentId.toString()) {
        // בדוק אם יש עמודת לייקים
        let likesColumnIndex = headers.indexOf('לייקים');
        if (likesColumnIndex === -1) {
          return { success: false, error: 'עמודת לייקים לא קיימת' };
        }
        
        // עדכן את מספר הלייקים
        const currentLikes = row[likesColumnIndex] || 0;
        const newLikes = Math.max(0, currentLikes - 1);
        commentsSheet.getRange(i + 1, likesColumnIndex + 1).setValue(newLikes);
        
        return { success: true, likes: newLikes };
      }
    }
    
    return { success: false, error: 'תגובה לא נמצאה' };
  } catch (error) {
    console.error('שגיאה בביטול לייק תגובה:', error);
    return { success: false, error: 'שגיאה בעדכון הלייק' };
  }
}

// פונקציה לשמירת מעשה טוב
function submitGoodDeed(deedData) {
  console.log("קבלת בקשת מעשה טוב:", JSON.stringify(deedData));
  
  if (!deedData || !deedData.fullName || !deedData.phone || !deedData.branch || 
      !deedData.deedType || !deedData.description || !deedData.feeling) {
    console.error("חסרים פרטי מעשה טוב:", JSON.stringify(deedData));
    return {
      success: false,
      error: 'חסרים פרטי מעשה טוב נדרשים'
    };
  }

  try {
    // בדיקה אם קיים גיליון מעשים טובים, ואם לא - יוצרים אותו
    let ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let goodDeedsSheet = ss.getSheetByName(GOOD_DEEDS_SHEET_NAME);
    
    if (!goodDeedsSheet) {
      console.log("יוצר גיליון מעשים טובים חדש");
      goodDeedsSheet = ss.insertSheet(GOOD_DEEDS_SHEET_NAME);
      goodDeedsSheet.getRange('A1:I1').setValues([
        ['תאריך', 'שם מלא', 'טלפון', 'סניף', 'סוג מעשה טוב', 'תיאור', 'הרגשה', 'הצגה פומבית', 'זמן יצירה']
      ]);
      goodDeedsSheet.setFrozenRows(1);
    }
    
    const timestamp = new Date();
    console.log("הוספת מעשה טוב חדש עבור:", deedData.fullName);
    
    // שמירת המעשה הטוב
    goodDeedsSheet.appendRow([
      timestamp,
      deedData.fullName,
      deedData.phone,
      deedData.branch,
      deedData.deedType,
      deedData.description,
      deedData.feeling,
      deedData.showPublicly ? 'כן' : 'לא',
      timestamp.getTime()
    ]);
    
    console.log("מעשה טוב נשמר בהצלחה");
    return {
      success: true,
      message: 'המעשה הטוב נשלח בהצלחה!',
      timestamp: timestamp.getTime()
    };
  } catch (error) {
    console.error('שגיאת שמירת מעשה טוב:', error.toString());
    return {
      success: false,
      error: 'שגיאה בשמירת המעשה הטוב: ' + error.toString()
    };
  }
}

// פונקציה לקבלת מעשים טובים
function getGoodDeeds() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const goodDeedsSheet = ss.getSheetByName(GOOD_DEEDS_SHEET_NAME);
    
    if (!goodDeedsSheet) {
      return { data: [] };
    }
    
    const data = goodDeedsSheet.getDataRange().getValues();
    if (data.length <= 1) {
      return { data: [] };
    }
    
    const headers = data[0];
    const goodDeeds = data.slice(1)
      .map(row => {
        // בדיקה אם השורה ריקה
        if (!row[0] && !row[1] && !row[2]) {
          return null;
        }
        
        const timestamp = row[0];
        const fullName = row[1];
        const phone = row[2];
        const branch = row[3];
        const deedType = row[4];
        const description = row[5];
        const feeling = row[6];
        const showPublicly = row[7];
        const creationTime = row[8];
        
        // בדיקה אם יש תוכן ואם המשתמש אישר הצגה פומבית
        if (!fullName || !description || showPublicly !== 'כן') {
          return null;
        }
        
        let formattedDate = 'תאריך לא ידוע';
        
        try {
          if (timestamp) {
            const date = new Date(timestamp);
            if (!isNaN(date.getTime())) {
              formattedDate = date.toLocaleString('he-IL', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              });
            }
          }
        } catch (error) {
          console.error('שגיאה בעיצוב תאריך:', error);
        }
        
        return {
          name: fullName,
          deedType: deedType,
          description: description,
          feeling: feeling,
          date: formattedDate,
          timestamp: creationTime || (timestamp ? timestamp.getTime() : Date.now())
        };
      })
      .filter(deed => deed !== null) // הסרת שורות ריקות
      .sort((a, b) => b.timestamp - a.timestamp) // מיון לפי זמן (חדש קודם)
      .slice(0, 10); // מגביל ל-10 מעשים טובים אחרונים
    
    console.log('Final good deeds:', goodDeeds);
    return { data: goodDeeds };
  } catch (error) {
    console.error('שגיאה בקבלת מעשים טובים:', error);
    return { 
      success: false, 
      error: 'שגיאה בקבלת המעשים הטובים: ' + error.toString(),
      data: [] 
    };
  }
}

function submitAiGuess(guess) {
  if (!guess || !guess.name || !guess.branch || !guess.phone || !guess.imageId || !guess.text) {
    return { success: false, error: 'חסרים פרטים' };
  }

  var name = String(guess.name).trim();
  var branch = String(guess.branch).trim();
  var phone = String(guess.phone).replace(/[\s-]/g, '');
  var text = String(guess.text).trim();
  var imageId = String(guess.imageId).trim();
  var week = String(guess.week || '');

  if (name.length < 2 || branch.length < 2 || text.length < 2 || text.length > 400) {
    return { success: false, error: 'הפרטים קצרים מדי' };
  }
  if (!/^0\d{8,9}$/.test(phone)) {
    return { success: false, error: 'מספר טלפון לא תקין' };
  }

  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(AI_GUESSES_SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(AI_GUESSES_SHEET_NAME);
      sheet.getRange('A1:G1').setValues([['תאריך', 'שם', 'סניף', 'טלפון', 'שבוע', 'מזהה תמונה', 'ניחוש']]);
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      new Date(),
      safeCell(name),
      safeCell(branch),
      phone,
      week,
      safeCell(imageId),
      safeCell(text)
    ]);

    return { success: true };
  } catch (error) {
    return { success: false, error: 'שגיאה בשמירת הניחוש: ' + error.toString() };
  }
}

function getAiGuesses() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(AI_GUESSES_SHEET_NAME);
    if (!sheet || sheet.getLastRow() < 2) {
      return { success: true, data: [] };
    }

    var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 7).getValues();
    var guesses = rows.filter(function (row) {
      return row[1] || row[6];
    }).map(function (row) {
      var when = row[0];
      var formatted = '';
      if (when instanceof Date) {
        formatted = Utilities.formatDate(when, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
      } else {
        formatted = String(when || '');
      }
      return {
        time: formatted,
        name: row[1],
        branch: row[2],
        phone: String(row[3] || ''),
        week: String(row[4] || ''),
        imageId: String(row[5] || ''),
        text: String(row[6] || '')
      };
    }).reverse();

    return { success: true, data: guesses };
  } catch (error) {
    return { success: false, error: 'שגיאה בקריאת הניחושים: ' + error.toString(), data: [] };
  }
}

var AI_LIKE_HEADERS = [
  'תאריך',
  'מזהה תמונה',
  'מזהה מכשיר',
  'כתובת IP',
  'שעה אצל המשתמש',
  'אזור זמן',
  'פרטי מכשיר',
  'דפדפן',
  'פעיל',
  'שעת ביטול'
];

function ensureAiLikesSheet(ss) {
  var sheet = ss.getSheetByName(AI_LIKES_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(AI_LIKES_SHEET_NAME);
  }
  var current = sheet.getRange(1, 1, 1, AI_LIKE_HEADERS.length).getValues()[0];
  var same = true;
  for (var i = 0; i < AI_LIKE_HEADERS.length; i++) {
    if (String(current[i] || '') !== AI_LIKE_HEADERS[i]) same = false;
  }
  if (!same) {
    sheet.getRange(1, 1, 1, AI_LIKE_HEADERS.length).setValues([AI_LIKE_HEADERS]);
    sheet.setFrozenRows(1);
    sheet.getRange('A:A').setNumberFormat('dd/mm/yyyy hh:mm:ss');
    sheet.getRange('J:J').setNumberFormat('dd/mm/yyyy hh:mm:ss');
  }
  return sheet;
}

function ensureLikeFixSheet(ss) {
  var sheet = ss.getSheetByName(AI_LIKE_FIX_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(AI_LIKE_FIX_SHEET_NAME);
    sheet.getRange(1, 1, 1, 4).setValues([['מזהה תמונה', 'קיזוז', 'הערה', 'עודכן']]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function likeRowActive(row) {
  return String(row[8] || '') !== 'לא';
}

function formatSheetTime(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss');
  }
  return String(value || '');
}

function clipText(value, max) {
  return safeCell(String(value || '').replace(/[\r\n\t]/g, ' ').slice(0, max));
}

function cleanIp(value) {
  var ip = String(value || '').trim();
  if (!ip || ip.length > 45 || !/^[0-9a-fA-F:.]+$/.test(ip)) return '';
  return ip;
}

function readLikeRows(sheet) {
  if (!sheet || sheet.getLastRow() < 2) return [];
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, AI_LIKE_HEADERS.length).getValues();
}

function readLikeFixes(ss) {
  var map = {};
  var sheet = ss.getSheetByName(AI_LIKE_FIX_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return map;
  sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getValues().forEach(function (row) {
    var imageId = String(row[0] || '').trim();
    var offset = Number(row[1]);
    if (!imageId || !isFinite(offset)) return;
    map[imageId] = {
      offset: offset,
      note: String(row[2] || ''),
      updated: formatSheetTime(row[3])
    };
  });
  return map;
}

function summarizeLikes(ss) {
  var raw = {};
  readLikeRows(ss.getSheetByName(AI_LIKES_SHEET_NAME)).forEach(function (row) {
    var imageId = String(row[1] || '').trim();
    if (!imageId || !likeRowActive(row)) return;
    raw[imageId] = (raw[imageId] || 0) + 1;
  });
  var fixes = readLikeFixes(ss);
  var counts = {};
  Object.keys(raw).forEach(function (imageId) {
    counts[imageId] = raw[imageId];
  });
  Object.keys(fixes).forEach(function (imageId) {
    counts[imageId] = Math.max(0, (raw[imageId] || 0) + fixes[imageId].offset);
  });
  return { raw: raw, fixes: fixes, counts: counts };
}

function getAiLikes() {
  try {
    var summary = summarizeLikes(SpreadsheetApp.openById(SPREADSHEET_ID));
    return { success: true, counts: summary.counts };
  } catch (error) {
    return { success: false, error: 'שגיאה בקריאת לייקים: ' + error.toString(), counts: {} };
  }
}

function getAiLikeAudit() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var summary = summarizeLikes(ss);
    var rows = readLikeRows(ss.getSheetByName(AI_LIKES_SHEET_NAME));
    if (rows.length > 400) rows = rows.slice(rows.length - 400);
    var likes = rows.map(function (row) {
      var when = row[0];
      return {
        time: formatSheetTime(when),
        timeMs: when instanceof Date ? when.getTime() : 0,
        imageId: String(row[1] || ''),
        deviceId: String(row[2] || ''),
        ip: String(row[3] || ''),
        clientTime: String(row[4] || ''),
        timeZone: String(row[5] || ''),
        device: String(row[6] || ''),
        browser: String(row[7] || ''),
        active: likeRowActive(row),
        removedAt: formatSheetTime(row[9])
      };
    }).reverse();
    return {
      success: true,
      raw: summary.raw,
      fixes: summary.fixes,
      counts: summary.counts,
      likes: likes
    };
  } catch (error) {
    return { success: false, error: 'שגיאה בקריאת פירוט הלייקים: ' + error.toString() };
  }
}

function setAiLikeCount(data) {
  var imageId = String(data.imageId || '').trim();
  if (imageId.length < 2 || imageId.length > 80) {
    return { success: false, error: 'מזהה תמונה לא תקין' };
  }
  var clear = data.clear === true || data.clear === 'true';
  var lock = LockService.getScriptLock();
  var locked = false;
  try {
    lock.waitLock(10000);
    locked = true;
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ensureLikeFixSheet(ss);
    var last = sheet.getLastRow();
    var rowIndex = -1;
    if (last >= 2) {
      var ids = sheet.getRange(2, 1, last - 1, 1).getValues();
      for (var i = 0; i < ids.length; i++) {
        if (String(ids[i][0]).trim() === imageId) {
          rowIndex = i + 2;
          break;
        }
      }
    }
    if (clear) {
      if (rowIndex !== -1) sheet.deleteRow(rowIndex);
    } else {
      var desired = parseInt(data.count, 10);
      if (isNaN(desired) || desired < 0 || desired > 100000) {
        return { success: false, error: 'המספר צריך להיות בין 0 ל-100000' };
      }
      var raw = 0;
      readLikeRows(ss.getSheetByName(AI_LIKES_SHEET_NAME)).forEach(function (row) {
        if (String(row[1] || '').trim() === imageId && likeRowActive(row)) raw++;
      });
      var offset = desired - raw;
      var note = clipText(data.note, 120);
      var values = [[safeCell(imageId), offset, note, new Date()]];
      if (rowIndex === -1) sheet.appendRow(values[0]);
      else sheet.getRange(rowIndex, 1, 1, 4).setValues(values);
    }
    var summary = summarizeLikes(ss);
    return {
      success: true,
      counts: summary.counts,
      raw: summary.raw,
      fixes: summary.fixes
    };
  } catch (error) {
    return { success: false, error: 'שגיאה בעדכון הלייקים: ' + error.toString() };
  } finally {
    if (locked) lock.releaseLock();
  }
}

function submitAiLike(like) {
  if (!like || !like.imageId || !like.deviceId) {
    return { success: false, error: 'חסרים פרטים' };
  }

  var imageId = String(like.imageId).trim();
  var deviceId = String(like.deviceId).trim();
  if (!/^[A-Za-z0-9_-]{8,80}$/.test(deviceId) || imageId.length < 2 || imageId.length > 80) {
    return { success: false, error: 'פרטי לייק לא תקינים' };
  }

  var lock = LockService.getScriptLock();
  var locked = false;
  try {
    lock.waitLock(10000);
    locked = true;
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ensureAiLikesSheet(ss);
    var remove = like.remove === true || like.remove === 'true';
    var rows = readLikeRows(sheet);
    var activeRow = -1;
    for (var i = 0; i < rows.length; i++) {
      if (String(rows[i][1]) === imageId && String(rows[i][2]) === deviceId && likeRowActive(rows[i])) {
        activeRow = i + 2;
      }
    }

    if (remove) {
      if (activeRow !== -1) {
        sheet.getRange(activeRow, 9, 1, 2).setValues([['לא', new Date()]]);
      }
    } else if (activeRow === -1) {
      sheet.appendRow([
        new Date(),
        safeCell(imageId),
        deviceId,
        cleanIp(like.ip),
        clipText(like.clientTime, 40),
        clipText(like.timeZone, 60),
        clipText(like.device, 160),
        clipText(like.browser, 180),
        'כן',
        ''
      ]);
    }

    var summary = summarizeLikes(ss);
    var stillLiked = false;
    readLikeRows(sheet).forEach(function (row) {
      if (String(row[1]) === imageId && String(row[2]) === deviceId && likeRowActive(row)) {
        stillLiked = true;
      }
    });

    return {
      success: true,
      liked: stillLiked,
      count: summary.counts[imageId] || 0
    };
  } catch (error) {
    return { success: false, error: 'שגיאה בשמירת הלייק: ' + error.toString() };
  } finally {
    if (locked) lock.releaseLock();
  }
}

function safeCell(value) {
  var text = String(value || '');
  if (text.charAt(0) === '=' || text.charAt(0) === '+' || text.charAt(0) === '@') {
    return "'" + text;
  }
  return text;
}

// ——— פאנל ניהול ———
// שבועות, ארכיון תשובות, הרשאות ודשבורד. גיליון התשובות החי נשאר כמו שהוא,
// כדי שנוסחאות הדשבורד בשיטס ימשיכו לעבוד על השבוע הפתוח.

function sheetsUrl() {
  return 'https://docs.google.com/spreadsheets/d/' + SPREADSHEET_ID + '/edit';
}

function cleanId(value) {
  if (typeof value === 'number' && isFinite(value)) {
    if (Math.abs(value - Math.round(value)) < 1e-6) return String(Math.round(value));
    return String(value);
  }
  return String(value || '').trim();
}

function isActiveFlag(value) {
  if (value === true || value === 1) return true;
  var text = String(value || '').trim().toLowerCase();
  return text === 'true' || text === 'כן' || text === '1';
}

function normalizeRole(role) {
  var value = String(role || '').trim().toLowerCase();
  if (value === 'super' || value === 'סופר' || value === 'סופר אדמין') return 'super';
  if (value === 'admin' || value === 'אדמין' || value === 'עריכה') return 'admin';
  if (value === 'viewer' || value === 'צפייה' || value === 'צפיה' || value === 'מורשה צפייה') return 'viewer';
  if (value === 'coordinator' || value === 'רכז' || value === 'רכז סניף') return 'coordinator';
  return '';
}

function parseBranchList(value) {
  var source = Array.isArray(value) ? value : String(value || '').split(/\n|,|·/);
  var out = [];
  source.forEach(function (part) {
    var name = String(part || '').trim();
    if (name && out.indexOf(name) === -1) out.push(name);
  });
  return out;
}

function roleRank(role) {
  if (role === 'super') return 3;
  if (role === 'admin') return 2;
  if (role === 'viewer') return 1;
  return 0;
}

function sameAnswer(a, b) {
  return String(a || '').trim() === String(b || '').trim();
}

function toScore(value) {
  if (value === '' || value === null || value === undefined) return null;
  var n = typeof value === 'number' ? value : parseFloat(String(value).replace('%', '').trim());
  if (!isFinite(n) || n < 0 || n > 100) return null;
  return Math.round(n * 10) / 10;
}

function scoreAttempt(answers, questions) {
  if (!questions || !questions.length) return null;
  var correct = 0;
  questions.forEach(function (q, index) {
    if (sameAnswer(answers[index], q.correctAnswer)) correct++;
  });
  return Math.round((correct / questions.length) * 1000) / 10;
}

function formatPhone(value) {
  if (value instanceof Date || value === '' || value === null || value === undefined) return '';
  var digits = '';
  if (typeof value === 'number' && isFinite(value)) digits = String(Math.round(value));
  else digits = String(value).replace(/\D/g, '');
  if (digits.indexOf('972') === 0 && digits.length > 9) digits = '0' + digits.substring(3);
  if (digits.length === 9 && digits.charAt(0) === '5') digits = '0' + digits;
  if (digits.length === 10) return digits.substring(0, 3) + '-' + digits.substring(3);
  return digits;
}

function formatDay(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'dd/MM/yyyy');
  }
  return String(value || '').trim();
}

function cleanStoredText(value) {
  var text = String(value == null ? '' : value).trim();
  if (text.charAt(0) === "'") text = text.substring(1).trim();
  return text;
}

function writeTextCell(cell, value) {
  var text = String(value == null ? '' : value);
  cell.setNumberFormat('@');
  cell.setValue(text ? "'" + text : '');
}

function readStaffRows(sheet) {
  if (!sheet || sheet.getLastRow() < 2) return [];
  var height = sheet.getLastRow() - 1;
  var values = sheet.getRange(2, 1, height, 5).getValues();
  var pins = sheet.getRange(2, 2, height, 1).getDisplayValues();
  return values.map(function (row, index) {
    return {
      row: index + 2,
      name: String(row[0] || '').trim(),
      pin: cleanStoredText(pins[index][0]),
      role: normalizeRole(row[2]),
      active: String(row[3] || '').trim() !== 'לא',
      branches: parseBranchList(row[4])
    };
  }).filter(function (user) {
    return user.name && user.pin && user.role;
  });
}

function matchStaff(users, pin) {
  for (var i = 0; i < users.length; i++) {
    if (users[i].active && users[i].pin === pin) return users[i];
  }
  return null;
}

function matchLogin(users, pin, loginName) {
  loginName = String(loginName || '').trim();
  var needsName = false;
  for (var i = 0; i < users.length; i++) {
    var user = users[i];
    if (!user.active || user.pin !== pin) continue;
    if (user.role === 'coordinator') {
      if (loginName && user.name === loginName) return user;
      needsName = true;
      continue;
    }
    if (!loginName || user.name === loginName) return user;
  }
  if (needsName) return { needsName: true };
  return null;
}

function ensureStaffSheet(ss) {
  var sheet = ss.getSheetByName(ADMIN_USERS_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(ADMIN_USERS_SHEET_NAME);
    sheet.getRange(1, 1, 1, 5).setValues([['שם', 'קוד', 'תפקיד', 'פעיל', 'סניפים']]);
    sheet.setFrozenRows(1);
  }
  if (String(sheet.getRange(1, 5).getValue() || '').trim() !== 'סניפים') {
    sheet.getRange(1, 5).setValue('סניפים');
  }
  sheet.getRange(1, 2, Math.max(sheet.getMaxRows(), 1), 1).setNumberFormat('@');
  return sheet;
}

function guardAnyStaff(data) {
  var pin = data && String(data.pin || '').trim();
  if (!pin) return { error: 'unauthorized' };
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(ADMIN_USERS_SHEET_NAME);
  if (!sheet) return { error: 'unauthorized' };
  var user = matchStaff(readStaffRows(sheet), pin);
  if (!user) return { error: 'unauthorized' };
  return { ss: ss, user: user };
}

function allowAiRead(data) {
  if (data && String(data.pin || '') === String(AI_ADMIN_PIN)) return true;
  var g = guardAdmin(data, 'viewer');
  return !g.error;
}

function allowAiWrite(data) {
  if (data && String(data.pin || '') === String(AI_ADMIN_PIN)) return true;
  var g = guardAdmin(data, 'admin');
  return !g.error;
}

function guardAdmin(data, minRole) {
  var pin = data && String(data.pin || '').trim();
  if (!pin) return { error: 'unauthorized' };
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(ADMIN_USERS_SHEET_NAME);
  if (!sheet) return { error: 'unauthorized' };
  var user = matchStaff(readStaffRows(sheet), pin);
  if (!user) return { error: 'unauthorized' };
  if (roleRank(user.role) < roleRank(minRole || 'viewer')) return { error: 'forbidden' };
  return { ss: ss, user: user };
}

function ensureWeeksSheet(ss) {
  var sheet = ss.getSheetByName(WEEKS_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(WEEKS_SHEET_NAME);
    sheet.getRange(1, 1, 1, 8).setValues([['מזהה', 'שם', 'נושא', 'סטטוס', 'עודכן', 'הצג פתיחה', 'הודעת פתיחה', 'הודעת סיום']]);
    sheet.setFrozenRows(1);
  }
  ensureWeekMessageColumns(sheet);
  if (sheet.getLastRow() < 2) {
    sheet.appendRow(['1', 'שבוע 1', '', 'פעיל', new Date(), 'לא', '', '']);
  }
  return sheet;
}

function ensureWeekMessageColumns(sheet) {
  if (!sheet) return sheet;
  var width = Math.max(sheet.getLastColumn(), 1);
  var current = sheet.getRange(1, 1, 1, width).getValues()[0];
  if (String(current[5] || '').trim() !== 'הצג פתיחה') {
    sheet.getRange(1, 6, 1, 3).setValues([['הצג פתיחה', 'הודעת פתיחה', 'הודעת סיום']]);
  }
  return sheet;
}

function readWeeks(ss) {
  var sheet = ss.getSheetByName(WEEKS_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return [];
  ensureWeekMessageColumns(sheet);
  var width = Math.max(sheet.getLastColumn(), 8);
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, width).getValues().map(function (row, index) {
    return {
      row: index + 2,
      id: cleanId(row[0]),
      name: String(row[1] || '').trim(),
      topic: String(row[2] || '').trim(),
      status: String(row[3] || '').trim() || 'טיוטה',
      openingShow: String(row[5] || '').trim() === 'כן',
      openingText: String(row[6] || '').trim(),
      closingText: String(row[7] || '').trim()
    };
  }).filter(function (week) {
    return week.id;
  });
}

function activeWeekMessages(ss) {
  var active = null;
  readWeeks(ss).forEach(function (week) {
    if (week.status === 'פעיל') active = week;
  });
  if (!active) return { openingShow: false, openingText: '', closingText: '' };
  return {
    openingShow: !!active.openingShow,
    openingText: active.openingText || '',
    closingText: active.closingText || ''
  };
}

function questionHeaders(sheet) {
  var last = Math.max(sheet.getLastColumn(), 1);
  var headers = sheet.getRange(1, 1, 1, last).getValues()[0].map(function (header) {
    return String(header || '').trim();
  });
  while (headers.length && !headers[headers.length - 1]) headers.pop();
  if (headers.indexOf('שבוע') === -1) {
    sheet.getRange(1, headers.length + 1).setValue('שבוע');
    headers.push('שבוע');
  }
  return headers;
}

function readQuestions(ss) {
  var sheet = ss.getSheetByName(QUESTIONS_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return [];
  var headers = questionHeaders(sheet);
  var idx = {};
  headers.forEach(function (header, index) {
    if (header) idx[header] = index;
  });
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getValues();
  var list = [];
  values.forEach(function (row, index) {
    if (idx['שאלה'] === undefined) return;
    var text = String(row[idx['שאלה']] || '').trim();
    if (!text) return;
    var options = [];
    for (var n = 1; n <= 4; n++) {
      options.push(idx['אופציה ' + n] === undefined ? '' : String(row[idx['אופציה ' + n]] || '').trim());
    }
    while (options.length && !options[options.length - 1]) options.pop();
    list.push({
      row: index + 2,
      id: cleanId(row[idx['מזהה']]),
      question: text,
      type: String((idx['סוג'] === undefined ? '' : row[idx['סוג']]) || 'אמריקאי').trim() || 'אמריקאי',
      options: options,
      correctAnswer: String(idx['תשובה נכונה'] === undefined ? '' : row[idx['תשובה נכונה']] || '').trim(),
      active: idx['פעיל'] !== undefined && isActiveFlag(row[idx['פעיל']]),
      weekId: idx['שבוע'] === undefined ? '' : cleanId(row[idx['שבוע']])
    });
  });
  return list;
}

function tagActiveQuestions(ss) {
  var sheet = ss.getSheetByName(QUESTIONS_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return;
  var headers = questionHeaders(sheet);
  var weekCol = headers.indexOf('שבוע');
  var activeCol = headers.indexOf('פעיל');
  var questionCol = headers.indexOf('שאלה');
  if (weekCol < 0 || activeCol < 0 || questionCol < 0) return;
  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getValues();
  var tagged = false;
  rows.forEach(function (row) {
    if (String(row[weekCol] || '').trim()) tagged = true;
  });
  if (tagged) return;
  var activeWeek = '';
  readWeeks(ss).forEach(function (week) {
    if (week.status === 'פעיל') activeWeek = week.id;
  });
  if (!activeWeek) return;
  rows.forEach(function (row, index) {
    if (!String(row[questionCol] || '').trim() || !isActiveFlag(row[activeCol])) return;
    sheet.getRange(index + 2, weekCol + 1).setValue(activeWeek);
  });
}

function archiveHeaderRow() {
  var headers = ['שבוע', 'שם שבוע', 'תאריך', 'שם', 'סניף', 'טלפון', 'ציון', 'מספר שאלות'];
  for (var i = 1; i <= ADMIN_ANSWER_SLOTS; i++) headers.push('תשובה ' + i);
  return headers;
}

function ensureArchiveSheet(ss) {
  var sheet = ss.getSheetByName(ANSWERS_ARCHIVE_SHEET_NAME);
  var headers = archiveHeaderRow();
  if (!sheet) {
    sheet = ss.insertSheet(ANSWERS_ARCHIVE_SHEET_NAME);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    return sheet;
  }
  if (sheet.getLastRow() < 1 || !String(sheet.getRange(1, 1).getValue() || '').trim()) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function ensureSettingsSheet(ss) {
  var sheet = ss.getSheetByName(SETTINGS_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SETTINGS_SHEET_NAME);
    sheet.getRange(1, 1, 1, 2).setValues([['מפתח', 'ערך']]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function readSetting(ss, key) {
  var sheet = ss.getSheetByName(SETTINGS_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return '';
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0] || '').trim() === key) return String(values[i][1] || '').trim();
  }
  return '';
}

function writeSetting(ss, key, value) {
  var sheet = ensureSettingsSheet(ss);
  var last = sheet.getLastRow();
  if (last >= 2) {
    var keys = sheet.getRange(2, 1, last - 1, 1).getValues();
    for (var i = 0; i < keys.length; i++) {
      if (String(keys[i][0] || '').trim() === key) {
        sheet.getRange(i + 2, 2).setValue(value);
        return;
      }
    }
  }
  sheet.appendRow([key, value]);
}

function quizOpenValue(raw) {
  if (raw === 'כן' || raw === 'true' || raw === '1') return true;
  if (raw === 'לא' || raw === 'false' || raw === '0') return false;
  return null;
}

function getSiteSettings() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var raw = readSetting(ss, 'quizOpen');
    var messages = activeWeekMessages(ss);
    return {
      success: true,
      quizOpen: quizOpenValue(raw),
      openingShow: messages.openingShow,
      openingText: messages.openingText,
      closingText: messages.closingText
    };
  } catch (error) {
    return { success: false, quizOpen: null };
  }
}

function prepareAdminSpreadsheet(ss) {
  ensureWeeksSheet(ss);
  var questionsSheet = ss.getSheetByName(QUESTIONS_SHEET_NAME);
  if (questionsSheet) {
    questionHeaders(questionsSheet);
    tagActiveQuestions(ss);
  }
  ensureArchiveSheet(ss);
  ensureSettingsSheet(ss);
}

function adminLogin(data) {
  var pin = data && String(data.pin || '').trim();
  if (!pin) return { success: false, error: 'unauthorized' };
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(ADMIN_USERS_SHEET_NAME);
    var users = sheet ? readStaffRows(sheet) : [];
    var user = null;
    if (!users.length) {
      if (pin !== String(ADMIN_BOOTSTRAP_PIN)) return { success: false, error: 'unauthorized' };
      sheet = ensureStaffSheet(ss);
      if (sheet.getLastRow() < 2) {
        sheet.appendRow([ADMIN_BOOTSTRAP_NAME, String(ADMIN_BOOTSTRAP_PIN), 'super', 'כן']);
      }
      user = { name: ADMIN_BOOTSTRAP_NAME, role: 'super' };
    } else {
      user = matchLogin(users, pin, data && data.loginName);
      if (!user) return { success: false, error: 'unauthorized' };
      if (user.needsName) return { success: false, error: 'לרכז סניף צריך גם את שם המשתמש.' };
    }
    prepareAdminSpreadsheet(ss);
    ensureStaffSheet(ss);
    return {
      success: true,
      name: user.name,
      role: user.role,
      branches: user.role === 'coordinator' ? (user.branches || []) : [],
      sheetsUrl: sheetsUrl()
    };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function readLiveAttempts(ss, questions) {
  var sheet = ss.getSheetByName(ANSWERS_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return [];
  var expected = questions ? questions.length : 0;
  var width = Math.max(sheet.getLastColumn(), 4 + expected + 1);
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, width).getValues();
  var out = [];
  values.forEach(function (row) {
    var name = String(row[1] || '').trim();
    if (!name) return;
    var tail = row.slice(4);
    while (tail.length && String(tail[tail.length - 1]).trim() === '') tail.pop();
    var answers = [];
    for (var i = 0; i < expected; i++) answers.push(String(tail[i] || '').trim());
    var score = scoreAttempt(answers, questions);
    if (score === null) score = toScore(tail[expected]);
    out.push({
      date: formatSheetTime(row[0]),
      name: name,
      branch: String(row[2] || '').trim() || 'ללא סניף',
      phone: formatPhone(row[3]),
      answers: answers,
      score: score,
      source: 'live'
    });
  });
  return out;
}

function countLiveAnswers(ss) {
  var sheet = ss.getSheetByName(ANSWERS_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return 0;
  var names = sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).getValues();
  var count = 0;
  names.forEach(function (row) {
    if (String(row[0] || '').trim()) count++;
  });
  return count;
}

function readArchiveAttempts(ss) {
  var sheet = ss.getSheetByName(ANSWERS_ARCHIVE_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return [];
  var width = Math.max(sheet.getLastColumn(), archiveHeaderRow().length);
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, width).getValues();
  var out = [];
  values.forEach(function (row) {
    var name = String(row[3] || '').trim();
    if (!name) return;
    var count = parseInt(row[7], 10);
    if (!isFinite(count) || count < 0) count = 0;
    if (count > ADMIN_ANSWER_SLOTS) count = ADMIN_ANSWER_SLOTS;
    var answers = [];
    for (var i = 0; i < count; i++) answers.push(String(row[8 + i] || '').trim());
    out.push({
      weekId: cleanId(row[0]),
      weekName: String(row[1] || '').trim(),
      date: formatSheetTime(row[2]),
      name: name,
      branch: String(row[4] || '').trim() || 'ללא סניף',
      phone: formatPhone(row[5]),
      score: toScore(row[6]),
      answers: answers,
      source: 'archive'
    });
  });
  return out;
}

function archiveLiveAnswers(ss, week, questions) {
  var attempts = readLiveAttempts(ss, questions || []);
  if (!attempts.length) return 0;
  var sheet = ensureArchiveSheet(ss);
  var headers = archiveHeaderRow();
  var block = attempts.map(function (attempt) {
    var row = [
      week.id,
      week.name,
      attempt.date,
      safeCell(attempt.name),
      safeCell(attempt.branch),
      attempt.phone,
      attempt.score === null ? '' : attempt.score,
      (questions || []).length
    ];
    for (var i = 0; i < ADMIN_ANSWER_SLOTS; i++) row.push(safeCell(attempt.answers[i] || ''));
    return row;
  });
  sheet.getRange(sheet.getLastRow() + 1, 1, block.length, headers.length).setValues(block);
  var live = ss.getSheetByName(ANSWERS_SHEET_NAME);
  if (live && live.getLastRow() > 1) {
    live.getRange(2, 1, live.getLastRow() - 1, Math.max(live.getLastColumn(), 1)).clearContent();
  }
  return attempts.length;
}

function questionsForWeek(questions, week) {
  var list = questions.filter(function (q) { return q.weekId === week.id; });
  if (!list.length && week.status === 'פעיל') {
    list = questions.filter(function (q) { return q.active; });
  }
  return list;
}

function summarizeAttempts(attempts) {
  var scores = [];
  var perfect = 0;
  var high = 0;
  var mid = 0;
  var low = 0;
  var sum = 0;
  var branches = {};
  var phones = {};
  attempts.forEach(function (attempt) {
    var branchName = attempt.branch || 'ללא סניף';
    if (!branches[branchName]) branches[branchName] = { name: branchName, count: 0, sum: 0, scored: 0, perfect: 0, low: 0 };
    var branch = branches[branchName];
    branch.count++;
    if (attempt.score !== null && isFinite(attempt.score)) {
      scores.push(attempt.score);
      sum += attempt.score;
      branch.sum += attempt.score;
      branch.scored++;
      if (attempt.score >= 99.5) {
        perfect++;
        branch.perfect++;
      } else if (attempt.score >= 80) high++;
      else if (attempt.score >= 60) mid++;
      else {
        low++;
        branch.low++;
      }
    }
    var phone = String(attempt.phone || '').replace(/\D/g, '');
    if (phone) phones[phone] = (phones[phone] || 0) + 1;
  });
  var duplicatePhones = 0;
  Object.keys(phones).forEach(function (phone) {
    if (phones[phone] > 1) duplicatePhones++;
  });
  var branchList = Object.keys(branches).map(function (name) {
    var branch = branches[name];
    return {
      name: branch.name,
      count: branch.count,
      avg: branch.scored ? Math.round((branch.sum / branch.scored) * 10) / 10 : 0,
      perfect: branch.perfect,
      low: branch.low
    };
  }).sort(function (a, b) {
    return b.count - a.count || b.avg - a.avg;
  });
  return {
    attempts: attempts.length,
    avg: scores.length ? Math.round((sum / scores.length) * 10) / 10 : 0,
    perfect: perfect,
    distribution: { perfect: perfect, high: high, mid: mid, low: low },
    branches: branchList,
    duplicatePhones: duplicatePhones
  };
}

function questionStats(questions, attempts) {
  return questions.map(function (q, index) {
    var correct = 0;
    attempts.forEach(function (attempt) {
      if (sameAnswer(attempt.answers[index], q.correctAnswer)) correct++;
    });
    return {
      id: q.id,
      question: q.question,
      correctCount: correct,
      total: attempts.length,
      rate: attempts.length ? Math.round((correct / attempts.length) * 1000) / 10 : 0
    };
  });
}

function readRegistrations(ss) {
  var sheet = ss.getSheetByName(REGISTRATION_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return [];
  var width = Math.max(Math.min(sheet.getLastColumn(), 4), 4);
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, width).getValues();
  var out = [];
  values.forEach(function (row) {
    var name = String(row[1] || '').trim();
    if (!name) return;
    out.push({
      date: formatSheetTime(row[0]),
      name: name,
      branch: String(row[2] || '').trim(),
      phone: formatPhone(row[3])
    });
  });
  return out;
}

function registrationSummary(registrations, attempted) {
  var phones = {};
  var branches = {};
  registrations.forEach(function (row) {
    var phone = String(row.phone || '').replace(/\D/g, '');
    if (phone) phones[phone] = true;
    if (!row.branch) return;
    branches[row.branch] = (branches[row.branch] || 0) + 1;
  });
  var top = Object.keys(branches).map(function (name) {
    return { name: name, count: branches[name] };
  }).sort(function (a, b) {
    return b.count - a.count;
  }).slice(0, 8);
  var quiet = Object.keys(branches).filter(function (name) {
    return !attempted[name];
  }).map(function (name) {
    return { name: name, count: branches[name] };
  }).sort(function (a, b) {
    return b.count - a.count;
  });
  return {
    total: registrations.length,
    unique: Object.keys(phones).length,
    branchCount: Object.keys(branches).length,
    top: top,
    quietCount: quiet.length,
    quiet: quiet.slice(0, 8)
  };
}

function loadAdminContext(ss) {
  var weeks = readWeeks(ss);
  var questions = readQuestions(ss);
  var archive = readArchiveAttempts(ss);
  var active = null;
  weeks.forEach(function (week) {
    if (week.status === 'פעיל') active = week;
  });
  var liveQuestions = active ? questionsForWeek(questions, active) : [];
  var live = active ? readLiveAttempts(ss, liveQuestions) : [];
  return { weeks: weeks, questions: questions, archive: archive, active: active, live: live };
}

function weekAttempts(ctx, week) {
  var archived = ctx.archive.filter(function (row) { return row.weekId === week.id; });
  var live = ctx.active && ctx.active.id === week.id ? ctx.live : [];
  return {
    questions: questionsForWeek(ctx.questions, week),
    attempts: archived.concat(live),
    liveCount: live.length,
    archiveCount: archived.length
  };
}

function publicWeek(week, pack) {
  var summary = summarizeAttempts(pack.attempts);
  return {
    id: week.id,
    name: week.name,
    topic: week.topic,
    status: week.status,
    questionCount: pack.questions.length,
    count: summary.attempts,
    avg: summary.avg,
    perfect: summary.perfect,
    branchNames: summary.branches.map(function (branch) { return branch.name; }),
    liveCount: pack.liveCount,
    archiveCount: pack.archiveCount
  };
}

function adminOverview(data) {
  try {
    var g = guardAdmin(data, 'viewer');
    if (g.error) return { success: false, error: g.error };
    var ctx = loadAdminContext(g.ss);
    var selected = ctx.active;
    var requested = cleanId(data && data.weekId);
    if (requested) {
      ctx.weeks.forEach(function (week) {
        if (week.id === requested) selected = week;
      });
    }
    var comparison = ctx.weeks.map(function (week) {
      return publicWeek(week, weekAttempts(ctx, week));
    });
    var pack = selected ? weekAttempts(ctx, selected) : { questions: [], attempts: [], liveCount: 0, archiveCount: 0 };
    var summary = summarizeAttempts(pack.attempts);
    var attempted = {};
    summary.branches.forEach(function (branch) { attempted[branch.name] = true; });
    var recent = pack.attempts.slice(-8).reverse().map(function (row) {
      return { name: row.name, branch: row.branch, score: row.score, date: row.date, phone: row.phone };
    });
    return {
      success: true,
      sheetsUrl: sheetsUrl(),
      quizOpen: quizOpenValue(readSetting(g.ss, 'quizOpen')),
      weeks: comparison,
      unassigned: ctx.questions.filter(function (q) { return !q.weekId; }).length,
      selected: selected ? {
        id: selected.id,
        name: selected.name,
        topic: selected.topic,
        status: selected.status,
        questionCount: pack.questions.length,
        liveCount: pack.liveCount,
        archiveCount: pack.archiveCount,
        attempts: summary.attempts,
        avg: summary.avg,
        perfect: summary.perfect,
        distribution: summary.distribution,
        duplicatePhones: summary.duplicatePhones,
        branches: summary.branches,
        questions: questionStats(pack.questions, pack.attempts),
        recent: recent
      } : null,
      registrations: registrationSummary(readRegistrations(g.ss), attempted)
    };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function adminListQuestions(data) {
  try {
    var g = guardAdmin(data, 'viewer');
    if (g.error) return { success: false, error: g.error };
    var weeks = readWeeks(g.ss);
    return {
      success: true,
      weeks: weeks.map(function (week) {
        return {
          id: week.id,
          name: week.name,
          topic: week.topic,
          status: week.status,
          openingShow: week.openingShow,
          openingText: week.openingText,
          closingText: week.closingText
        };
      }),
      questions: readQuestions(g.ss).map(function (q) {
        return {
          id: q.id,
          weekId: q.weekId,
          question: q.question,
          type: q.type,
          options: q.options,
          correctAnswer: q.correctAnswer,
          active: q.active
        };
      })
    };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function validateQuestion(input) {
  var q = {
    id: cleanId(input && input.id),
    weekId: cleanId(input && input.weekId),
    question: String(input && input.question || '').trim(),
    type: String(input && input.type || 'אמריקאי').trim(),
    options: [],
    correctAnswer: String(input && input.correctAnswer || '').trim()
  };
  if (q.question.length < 2) return { error: 'חסר נוסח שאלה' };
  if (q.question.length > 500) return { error: 'השאלה ארוכה מדי' };
  if (!q.weekId) return { error: 'צריך לשייך את השאלה לשבוע' };
  if (q.type !== 'פתוחה') q.type = 'אמריקאי';
  if (q.type === 'אמריקאי') {
    var source = (input && input.options) || [];
    var seen = {};
    for (var i = 0; i < source.length && q.options.length < 4; i++) {
      var option = String(source[i] || '').trim();
      if (!option) continue;
      if (option.length > 300) return { error: 'אפשרות ארוכה מדי' };
      if (seen[option]) return { error: 'יש שתי אפשרויות זהות' };
      seen[option] = true;
      q.options.push(option);
    }
    if (q.options.length < 2) return { error: 'צריך לפחות שתי אפשרויות, ואפשר עד ארבע' };
    if (!seen[q.correctAnswer]) return { error: 'סמנו תשובה נכונה מתוך האפשרויות' };
  } else if (!q.correctAnswer || q.correctAnswer.length > 300) {
    return { error: 'לשאלה פתוחה צריך למלא את התשובה לציון' };
  }
  return { question: q };
}

function writeQuestion(sheet, headers, rowNumber, q, active) {
  var map = {};
  headers.forEach(function (header, index) {
    if (header) map[header] = index;
  });
  var row = sheet.getRange(rowNumber, 1, 1, headers.length).getValues()[0];
  function put(name, value) {
    if (map[name] === undefined) return;
    row[map[name]] = value;
  }
  put('מזהה', q.id);
  put('שאלה', safeCell(q.question));
  put('סוג', q.type);
  for (var n = 1; n <= 4; n++) put('אופציה ' + n, safeCell(q.options[n - 1] || ''));
  put('תשובה נכונה', safeCell(q.correctAnswer));
  put('שבוע', q.weekId);
  put('פעיל', !!active);
  sheet.getRange(rowNumber, 1, 1, headers.length).setValues([row]);
}

function adminSaveQuestion(data) {
  var lock = LockService.getScriptLock();
  var locked = false;
  try {
    var g = guardAdmin(data, 'admin');
    if (g.error) return { success: false, error: g.error };
    var checked = validateQuestion(data && data.question);
    if (checked.error) return { success: false, error: checked.error };
    var q = checked.question;
    var weeks = readWeeks(g.ss);
    var week = null;
    weeks.forEach(function (item) { if (item.id === q.weekId) week = item; });
    if (!week) return { success: false, error: 'השבוע לא נמצא' };
    lock.waitLock(12000);
    locked = true;
    var sheet = g.ss.getSheetByName(QUESTIONS_SHEET_NAME);
    var headers = questionHeaders(sheet);
    var existing = readQuestions(g.ss);
    var rowNumber = 0;
    if (q.id) {
      existing.forEach(function (item) { if (item.id === q.id) rowNumber = item.row; });
      if (!rowNumber) return { success: false, error: 'השאלה לא נמצאה. רעננו את הרשימה.' };
    } else {
      q.id = String(new Date().getTime());
      rowNumber = Math.max(sheet.getLastRow(), 1) + 1;
    }
    writeQuestion(sheet, headers, rowNumber, q, week.status === 'פעיל');
    return { success: true, id: q.id };
  } catch (error) {
    return { success: false, error: error.toString() };
  } finally {
    if (locked) lock.releaseLock();
  }
}

function adminDeleteQuestion(data) {
  var lock = LockService.getScriptLock();
  var locked = false;
  try {
    var g = guardAdmin(data, 'admin');
    if (g.error) return { success: false, error: g.error };
    var id = cleanId(data && data.id);
    var found = null;
    readQuestions(g.ss).forEach(function (q) { if (q.id === id) found = q; });
    if (!found) return { success: false, error: 'השאלה לא נמצאה' };
    lock.waitLock(12000);
    locked = true;
    g.ss.getSheetByName(QUESTIONS_SHEET_NAME).deleteRow(found.row);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.toString() };
  } finally {
    if (locked) lock.releaseLock();
  }
}

function swapSheetRows(sheet, rowA, rowB) {
  var width = Math.max(sheet.getLastColumn(), 1);
  var a = sheet.getRange(rowA, 1, 1, width).getValues();
  var b = sheet.getRange(rowB, 1, 1, width).getValues();
  sheet.getRange(rowA, 1, 1, width).setValues(b);
  sheet.getRange(rowB, 1, 1, width).setValues(a);
}

function adminMoveQuestion(data) {
  var lock = LockService.getScriptLock();
  var locked = false;
  try {
    var g = guardAdmin(data, 'admin');
    if (g.error) return { success: false, error: g.error };
    var id = cleanId(data && data.id);
    var direction = data && data.direction === 'up' ? -1 : 1;
    var questions = readQuestions(g.ss);
    var current = null;
    questions.forEach(function (q) { if (q.id === id) current = q; });
    if (!current) return { success: false, error: 'השאלה לא נמצאה' };
    var siblings = questions.filter(function (q) { return q.weekId === current.weekId; });
    var index = -1;
    siblings.forEach(function (q, i) { if (q.id === id) index = i; });
    var next = siblings[index + direction];
    if (!next) return { success: true };
    lock.waitLock(12000);
    locked = true;
    swapSheetRows(g.ss.getSheetByName(QUESTIONS_SHEET_NAME), current.row, next.row);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.toString() };
  } finally {
    if (locked) lock.releaseLock();
  }
}

function adminCreateWeek(data) {
  try {
    var g = guardAdmin(data, 'admin');
    if (g.error) return { success: false, error: g.error };
    var sheet = ensureWeeksSheet(g.ss);
    var weeks = readWeeks(g.ss);
    var nextId = 1;
    weeks.forEach(function (week) {
      var n = parseInt(week.id, 10);
      if (isFinite(n) && n >= nextId) nextId = n + 1;
    });
    var name = String(data && data.name || '').trim() || ('שבוע ' + nextId);
    var topic = String(data && data.topic || '').trim();
    var openingText = String(data && data.openingText || '').trim();
    var closingText = String(data && data.closingText || '').trim();
    var openingShow = data && (data.openingShow === true || data.openingShow === 'true' || data.openingShow === 'כן');
    if (name.length > 40) return { success: false, error: 'שם השבוע ארוך מדי' };
    if (topic.length > 80) return { success: false, error: 'הנושא ארוך מדי' };
    if (openingText.length > 600 || closingText.length > 600) return { success: false, error: 'ההודעה ארוכה מדי' };
    sheet.appendRow([String(nextId), safeCell(name), safeCell(topic), 'טיוטה', new Date(), openingShow ? 'כן' : 'לא', safeCell(openingText), safeCell(closingText)]);
    return { success: true, id: String(nextId) };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function adminUpdateWeek(data) {
  try {
    var g = guardAdmin(data, 'admin');
    if (g.error) return { success: false, error: g.error };
    var id = cleanId(data && data.id);
    var name = String(data && data.name || '').trim();
    var topic = String(data && data.topic || '').trim();
    var openingText = String(data && data.openingText || '').trim();
    var closingText = String(data && data.closingText || '').trim();
    var openingShow = data && (data.openingShow === true || data.openingShow === 'true' || data.openingShow === 'כן');
    if (!name) return { success: false, error: 'חסר שם שבוע' };
    if (name.length > 40 || topic.length > 80) return { success: false, error: 'הטקסט ארוך מדי' };
    if (openingText.length > 600 || closingText.length > 600) return { success: false, error: 'ההודעה ארוכה מדי' };
    var week = null;
    readWeeks(g.ss).forEach(function (item) { if (item.id === id) week = item; });
    if (!week) return { success: false, error: 'השבוע לא נמצא' };
    var sheet = ensureWeekMessageColumns(g.ss.getSheetByName(WEEKS_SHEET_NAME));
    sheet.getRange(week.row, 2, 1, 7).setValues([[safeCell(name), safeCell(topic), week.status, new Date(), openingShow ? 'כן' : 'לא', safeCell(openingText), safeCell(closingText)]]);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function adminPublishWeek(data) {
  var lock = LockService.getScriptLock();
  var locked = false;
  try {
    var g = guardAdmin(data, 'admin');
    if (g.error) return { success: false, error: g.error };
    var id = cleanId(data && data.weekId);
    var weeks = readWeeks(g.ss);
    var target = null;
    var current = null;
    weeks.forEach(function (week) {
      if (week.id === id) target = week;
      if (week.status === 'פעיל') current = week;
    });
    if (!target) return { success: false, error: 'השבוע לא נמצא' };
    var questions = readQuestions(g.ss);
    if (!questions.filter(function (q) { return q.weekId === target.id; }).length) {
      return { success: false, error: 'אין שאלות בשבוע הזה. קודם מוסיפים שאלות, ואז מפרסמים.' };
    }
    var liveCount = countLiveAnswers(g.ss);
    var force = data && (data.force === true || data.force === 'true');
    if (current && current.id !== target.id && liveCount > 0 && !force) {
      return {
        success: false,
        error: 'needs-archive',
        liveCount: liveCount,
        message: 'בגיליון התשובות יש ' + liveCount + ' תשובות של השבוע הפעיל. פרסום השבוע החדש יעביר אותן לארכיון וינקה את הגיליון, כדי שהשבועות לא יתערבבו.'
      };
    }
    lock.waitLock(20000);
    locked = true;
    var archived = 0;
    if (current && current.id !== target.id && liveCount > 0) {
      archived = archiveLiveAnswers(g.ss, current, questionsForWeek(questions, current));
    }
    var weekSheet = g.ss.getSheetByName(WEEKS_SHEET_NAME);
    weeks.forEach(function (week) {
      var status = week.id === target.id ? 'פעיל' : (week.status === 'פעיל' ? 'ארכיון' : week.status);
      weekSheet.getRange(week.row, 4, 1, 2).setValues([[status, new Date()]]);
    });
    var qSheet = g.ss.getSheetByName(QUESTIONS_SHEET_NAME);
    var activeCol = questionHeaders(qSheet).indexOf('פעיל');
    readQuestions(g.ss).forEach(function (q) {
      if (activeCol >= 0) qSheet.getRange(q.row, activeCol + 1).setValue(q.weekId === target.id);
    });
    return { success: true, archived: archived };
  } catch (error) {
    return { success: false, error: error.toString() };
  } finally {
    if (locked) lock.releaseLock();
  }
}

function adminArchiveAnswers(data) {
  var lock = LockService.getScriptLock();
  var locked = false;
  try {
    var g = guardAdmin(data, 'admin');
    if (g.error) return { success: false, error: g.error };
    var ctx = loadAdminContext(g.ss);
    if (!ctx.active) return { success: false, error: 'אין שבוע פעיל' };
    if (!ctx.live.length) return { success: false, error: 'גיליון התשובות כבר ריק' };
    lock.waitLock(20000);
    locked = true;
    var count = archiveLiveAnswers(g.ss, ctx.active, questionsForWeek(ctx.questions, ctx.active));
    return { success: true, archived: count };
  } catch (error) {
    return { success: false, error: error.toString() };
  } finally {
    if (locked) lock.releaseLock();
  }
}

function adminDeleteWeek(data) {
  var lock = LockService.getScriptLock();
  var locked = false;
  try {
    var g = guardAdmin(data, 'admin');
    if (g.error) return { success: false, error: g.error };
    var id = cleanId(data && data.id);
    var week = null;
    readWeeks(g.ss).forEach(function (item) { if (item.id === id) week = item; });
    if (!week) return { success: false, error: 'השבוע לא נמצא' };
    if (week.status !== 'טיוטה') return { success: false, error: 'אפשר למחוק רק שבוע שעדיין בטיוטה' };
    lock.waitLock(12000);
    locked = true;
    var qSheet = g.ss.getSheetByName(QUESTIONS_SHEET_NAME);
    var headers = questionHeaders(qSheet);
    var weekCol = headers.indexOf('שבוע');
    var activeCol = headers.indexOf('פעיל');
    readQuestions(g.ss).forEach(function (q) {
      if (q.weekId !== id) return;
      if (weekCol >= 0) qSheet.getRange(q.row, weekCol + 1).setValue('');
      if (activeCol >= 0) qSheet.getRange(q.row, activeCol + 1).setValue(false);
    });
    g.ss.getSheetByName(WEEKS_SHEET_NAME).deleteRow(week.row);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.toString() };
  } finally {
    if (locked) lock.releaseLock();
  }
}

function adminListAnswers(data) {
  try {
    var g = guardAdmin(data, 'viewer');
    if (g.error) return { success: false, error: g.error };
    var ctx = loadAdminContext(g.ss);
    var week = ctx.active;
    var requested = cleanId(data && data.weekId);
    ctx.weeks.forEach(function (item) { if (item.id === requested) week = item; });
    if (!week) return { success: true, attempts: [], questions: [], weeks: [] };
    var pack = weekAttempts(ctx, week);
    var source = String(data && data.source || 'all');
    var attempts = pack.attempts.filter(function (row) {
      if (source === 'live') return row.source === 'live';
      if (source === 'archive') return row.source === 'archive';
      return true;
    });
    if (attempts.length > 1500) attempts = attempts.slice(attempts.length - 1500);
    return {
      success: true,
      week: { id: week.id, name: week.name, topic: week.topic, status: week.status },
      liveCount: pack.liveCount,
      archiveCount: pack.archiveCount,
      questions: pack.questions.map(function (q) {
        return { id: q.id, question: q.question, options: q.options, correctAnswer: q.correctAnswer };
      }),
      attempts: attempts
    };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function readBranchRows(ss) {
  var sheet = ss.getSheetByName(BRANCHES_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return [];
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
  var out = [];
  values.forEach(function (row, index) {
    var name = String(row[0] || '').trim();
    if (name) out.push({ row: index + 2, name: name });
  });
  return out;
}

function adminListBranches(data) {
  try {
    var g = guardAdmin(data, 'viewer');
    if (g.error) return { success: false, error: g.error };
    return { success: true, branches: readBranchRows(g.ss).map(function (b) { return b.name; }) };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function adminAddBranch(data) {
  try {
    var g = guardAdmin(data, 'admin');
    if (g.error) return { success: false, error: g.error };
    var name = String(data && data.name || '').trim();
    if (name.length < 2 || name.length > 60) return { success: false, error: 'שם הסניף צריך להיות בין 2 ל-60 תווים' };
    var rows = readBranchRows(g.ss);
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].name === name) return { success: false, error: 'הסניף כבר ברשימה' };
    }
    var sheet = g.ss.getSheetByName(BRANCHES_SHEET_NAME);
    if (!sheet) return { success: false, error: 'גיליון הסניפים לא נמצא' };
    sheet.appendRow([safeCell(name)]);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function adminRenameBranch(data) {
  try {
    var g = guardAdmin(data, 'admin');
    if (g.error) return { success: false, error: g.error };
    var from = String(data && data.from || '').trim();
    var to = String(data && data.to || '').trim();
    if (!from || to.length < 2 || to.length > 60) return { success: false, error: 'השם החדש לא תקין' };
    var rows = readBranchRows(g.ss);
    var target = null;
    rows.forEach(function (row) {
      if (row.name === to && row.name !== from) target = row;
    });
    if (target) return { success: false, error: 'כבר יש סניף בשם הזה' };
    var found = null;
    rows.forEach(function (row) { if (row.name === from) found = row; });
    if (!found) return { success: false, error: 'הסניף לא נמצא' };
    g.ss.getSheetByName(BRANCHES_SHEET_NAME).getRange(found.row, 1).setValue(safeCell(to));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function adminDeleteBranch(data) {
  try {
    var g = guardAdmin(data, 'admin');
    if (g.error) return { success: false, error: g.error };
    var name = String(data && data.name || '').trim();
    var found = null;
    readBranchRows(g.ss).forEach(function (row) { if (row.name === name) found = row; });
    if (!found) return { success: false, error: 'הסניף לא נמצא' };
    g.ss.getSheetByName(BRANCHES_SHEET_NAME).deleteRow(found.row);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function ensureUpdatesSheet(ss) {
  var sheet = ss.getSheetByName(UPDATES_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(UPDATES_SHEET_NAME);
    sheet.getRange(1, 1, 1, 4).setValues([['תאריך העדכון', 'כותרת העדכון', 'תוכן העדכון', 'סוג העדכון']]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function readUpdateRows(ss) {
  var sheet = ss.getSheetByName(UPDATES_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return [];
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getValues();
  var list = [];
  values.forEach(function (row, index) {
    var title = String(row[1] || '').trim();
    var content = String(row[2] || '').trim();
    if (!title && !content) return;
    list.push({
      row: index + 2,
      date: formatDay(row[0]),
      title: title,
      content: content,
      type: String(row[3] || 'עדכון רגיל').trim() || 'עדכון רגיל'
    });
  });
  return list.reverse();
}

function adminListUpdates(data) {
  try {
    var g = guardAdmin(data, 'viewer');
    if (g.error) return { success: false, error: g.error };
    return { success: true, updates: readUpdateRows(g.ss) };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function adminSaveUpdate(data) {
  try {
    var g = guardAdmin(data, 'admin');
    if (g.error) return { success: false, error: g.error };
    var update = data && data.update || {};
    var title = String(update.title || '').trim();
    var content = String(update.content || '').trim();
    var date = String(update.date || '').trim();
    var type = String(update.type || 'עדכון רגיל').trim();
    var allowed = { 'עדכון רגיל': true, 'עדכון חשוב': true, 'שעשועון חדש': true, 'זוכים': true };
    if (!title || !content) return { success: false, error: 'חסרים כותרת או תוכן' };
    if (title.length > 80 || content.length > 1800 || date.length > 30) return { success: false, error: 'הטקסט ארוך מדי' };
    if (!allowed[type]) type = 'עדכון רגיל';
    var sheet = ensureUpdatesSheet(g.ss);
    var rowNumber = parseInt(update.row, 10);
    var values = [[safeCell(date), safeCell(title), safeCell(content), type]];
    if (rowNumber >= 2 && rowNumber <= sheet.getLastRow()) {
      sheet.getRange(rowNumber, 1, 1, 4).setValues(values);
    } else {
      sheet.appendRow(values[0]);
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function adminDeleteUpdate(data) {
  try {
    var g = guardAdmin(data, 'admin');
    if (g.error) return { success: false, error: g.error };
    var rowNumber = parseInt(data && data.row, 10);
    var sheet = g.ss.getSheetByName(UPDATES_SHEET_NAME);
    if (!sheet || rowNumber < 2 || rowNumber > sheet.getLastRow()) return { success: false, error: 'העדכון לא נמצא' };
    var title = String(sheet.getRange(rowNumber, 2).getValue() || '').trim();
    if (title && data.title && title !== String(data.title).trim()) {
      return { success: false, error: 'הרשימה השתנתה. רעננו ונסו שוב.' };
    }
    sheet.deleteRow(rowNumber);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function ensureWinnersSheet(ss) {
  var sheet = ss.getSheetByName(WINNERS_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(WINNERS_SHEET_NAME);
    sheet.getRange(1, 1, 1, 6).setValues([['שם', 'סניף', 'פרס', 'עבור', 'תאריך', 'טלפון']]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function readWinnerRows(ss) {
  var sheet = ss.getSheetByName(WINNERS_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return [];
  var width = Math.max(sheet.getLastColumn(), 6);
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, width).getValues();
  var list = [];
  values.forEach(function (row, index) {
    var name = String(row[0] || '').trim();
    if (!name) return;
    list.push({
      row: index + 2,
      name: name,
      branch: String(row[1] || '').trim(),
      prize: String(row[2] || '').trim(),
      quiz: String(row[3] || '').trim(),
      date: formatDay(row[4]),
      phone: formatPhone(row[5])
    });
  });
  return list;
}

function adminListWinners(data) {
  try {
    var g = guardAdmin(data, 'viewer');
    if (g.error) return { success: false, error: g.error };
    return { success: true, winners: readWinnerRows(g.ss) };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function adminSaveWinner(data) {
  try {
    var g = guardAdmin(data, 'admin');
    if (g.error) return { success: false, error: g.error };
    var winner = data && data.winner || {};
    var name = String(winner.name || '').trim();
    var branch = String(winner.branch || '').trim();
    var prize = String(winner.prize || '').trim();
    var quiz = String(winner.quiz || '').trim();
    var date = String(winner.date || '').trim();
    var phone = formatPhone(winner.phone);
    if (name.length < 2) return { success: false, error: 'חסר שם זוכה' };
    if (name.length > 60 || branch.length > 60 || prize.length > 80 || quiz.length > 80) {
      return { success: false, error: 'אחד השדות ארוך מדי' };
    }
    var sheet = ensureWinnersSheet(g.ss);
    var values = [[safeCell(name), safeCell(branch), safeCell(prize), safeCell(quiz), safeCell(date), phone]];
    var rowNumber = parseInt(winner.row, 10);
    if (rowNumber >= 2 && rowNumber <= Math.max(sheet.getLastRow(), 1)) {
      sheet.getRange(rowNumber, 1, 1, 6).setValues(values);
    } else {
      sheet.appendRow(values[0]);
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function adminDeleteWinner(data) {
  try {
    var g = guardAdmin(data, 'admin');
    if (g.error) return { success: false, error: g.error };
    var rowNumber = parseInt(data && data.row, 10);
    var sheet = g.ss.getSheetByName(WINNERS_SHEET_NAME);
    if (!sheet || rowNumber < 2 || rowNumber > sheet.getLastRow()) return { success: false, error: 'הזוכה לא נמצא' };
    sheet.deleteRow(rowNumber);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function adminMoveWinner(data) {
  var lock = LockService.getScriptLock();
  var locked = false;
  try {
    var g = guardAdmin(data, 'admin');
    if (g.error) return { success: false, error: g.error };
    var winners = readWinnerRows(g.ss);
    var index = -1;
    var rowNumber = parseInt(data && data.row, 10);
    winners.forEach(function (winner, i) { if (winner.row === rowNumber) index = i; });
    if (index < 0) return { success: false, error: 'הזוכה לא נמצא' };
    var direction = data && data.direction === 'up' ? -1 : 1;
    var other = winners[index + direction];
    if (!other) return { success: true };
    lock.waitLock(12000);
    locked = true;
    swapSheetRows(g.ss.getSheetByName(WINNERS_SHEET_NAME), winners[index].row, other.row);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.toString() };
  } finally {
    if (locked) lock.releaseLock();
  }
}

function adminListRegistrations(data) {
  try {
    var g = guardAdmin(data, 'viewer');
    if (g.error) return { success: false, error: g.error };
    var rows = readRegistrations(g.ss);
    var phones = {};
    rows.forEach(function (row) {
      var phone = String(row.phone || '').replace(/\D/g, '');
      if (phone) phones[phone] = (phones[phone] || 0) + 1;
    });
    rows.forEach(function (row) {
      var phone = String(row.phone || '').replace(/\D/g, '');
      row.duplicate = !!(phone && phones[phone] > 1);
    });
    return {
      success: true,
      total: rows.length,
      unique: Object.keys(phones).length,
      registrations: rows
    };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function adminListStaff(data) {
  try {
    var g = guardAdmin(data, 'super');
    if (g.error) return { success: false, error: g.error };
    var users = readStaffRows(g.ss.getSheetByName(ADMIN_USERS_SHEET_NAME));
    return {
      success: true,
      staff: users.map(function (user) {
        return { name: user.name, role: user.role, active: user.active, branches: user.branches || [] };
      })
    };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function adminSaveStaff(data) {
  var lock = LockService.getScriptLock();
  var locked = false;
  try {
    var g = guardAdmin(data, 'super');
    if (g.error) return { success: false, error: g.error };
    var incoming = data && data.staff || {};
    var original = String(incoming.originalName || incoming.name || '').trim();
    var name = String(incoming.name || '').trim();
    var role = normalizeRole(incoming.role);
    var active = incoming.active === false || incoming.active === 'false' ? 'לא' : 'כן';
    var pin = String(incoming.pin || '').trim();
    if (name.length < 2 || name.length > 40) return { success: false, error: 'השם צריך להיות בין 2 ל-40 תווים' };
    if (!role) return { success: false, error: 'צריך לבחור תפקיד' };
    lock.waitLock(12000);
    locked = true;
    var sheet = ensureStaffSheet(g.ss);
    var users = readStaffRows(sheet);
    var current = null;
    users.forEach(function (user) { if (user.name === original) current = user; });
    if (!current && pin.length < 6) return { success: false, error: 'לקוד חדש צריך לפחות 6 תווים' };
    if (pin && (pin.length < 6 || pin.length > 40)) return { success: false, error: 'הקוד צריך להיות בין 6 ל-40 תווים' };
    var nextPin = pin || (current ? current.pin : '');
    var branches = [];
    if (role === 'coordinator') {
      var known = {};
      readBranchRows(g.ss).forEach(function (row) { known[row.name] = true; });
      parseBranchList(incoming.branches).forEach(function (name) {
        if (known[name]) branches.push(name);
      });
      if (!branches.length) return { success: false, error: 'רכז צריך לפחות סניף אחד מהרשימה' };
    }
    for (var i = 0; i < users.length; i++) {
      if (users[i].name !== original && (users[i].name === name || users[i].pin === nextPin)) {
        return { success: false, error: 'השם או הקוד כבר בשימוש' };
      }
    }
    var nextUsers = users.filter(function (user) { return user.name !== original; });
    if (active === 'כן') nextUsers.push({ name: name, role: role, active: true });
    var supers = nextUsers.filter(function (user) { return user.active && user.role === 'super'; });
    if (!supers.length) return { success: false, error: 'חייב להישאר לפחות סופר אדמין פעיל אחד' };
    var values = [[safeCell(name), '', role, active, branches.join('\n')]];
    if (current) sheet.getRange(current.row, 1, 1, 5).setValues(values);
    else sheet.appendRow(values[0]);
    writeTextCell(sheet.getRange(current ? current.row : sheet.getLastRow(), 2), nextPin);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.toString() };
  } finally {
    if (locked) lock.releaseLock();
  }
}

function adminDeleteStaff(data) {
  try {
    var g = guardAdmin(data, 'super');
    if (g.error) return { success: false, error: g.error };
    var name = String(data && data.name || '').trim();
    var sheet = g.ss.getSheetByName(ADMIN_USERS_SHEET_NAME);
    var users = readStaffRows(sheet);
    var current = null;
    users.forEach(function (user) { if (user.name === name) current = user; });
    if (!current) return { success: false, error: 'המשתמש לא נמצא' };
    var supers = users.filter(function (user) {
      return user.active && user.role === 'super' && user.name !== name;
    });
    if (!supers.length) return { success: false, error: 'אי אפשר למחוק את הסופר אדמין האחרון' };
    sheet.deleteRow(current.row);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function adminSetOwnPin(data) {
  try {
    var g = guardAnyStaff(data);
    if (g.error) return { success: false, error: g.error };
    var nextPin = String(data && data.nextPin || '').trim();
    if (nextPin.length < 6 || nextPin.length > 40) return { success: false, error: 'הקוד החדש צריך להיות בין 6 ל-40 תווים' };
    var sheet = g.ss.getSheetByName(ADMIN_USERS_SHEET_NAME);
    var users = readStaffRows(sheet);
    for (var i = 0; i < users.length; i++) {
      if (users[i].name !== g.user.name && users[i].pin === nextPin) {
        return { success: false, error: 'הקוד הזה כבר בשימוש' };
      }
    }
    writeTextCell(sheet.getRange(g.user.row, 2), nextPin);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function adminClearDuplicateAnswers(data) {
  var lock = LockService.getScriptLock();
  var locked = false;
  try {
    var g = guardAdmin(data, 'admin');
    if (g.error) return { success: false, error: g.error };
    lock.waitLock(15000);
    locked = true;
    var ctx = loadAdminContext(g.ss);
    if (!ctx.active) return { success: false, error: 'אין שבוע פעיל' };
    var questions = questionsForWeek(ctx.questions, ctx.active);
    var expected = questions.length;
    var sheet = g.ss.getSheetByName(ANSWERS_SHEET_NAME);
    if (!sheet || sheet.getLastRow() < 2) return { success: true, removed: 0 };
    var width = Math.max(sheet.getLastColumn(), 4 + expected + 1);
    var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, width).getValues();
    var groups = {};
    values.forEach(function (row, index) {
      var name = String(row[1] || '').trim();
      if (!name) return;
      var digits = String(formatPhone(row[3]) || '').replace(/\D/g, '');
      if (!digits) return;
      var tail = row.slice(4);
      while (tail.length && String(tail[tail.length - 1]).trim() === '') tail.pop();
      var answers = [];
      for (var i = 0; i < expected; i++) answers.push(String(tail[i] || '').trim());
      var score = scoreAttempt(answers, questions);
      if (score === null) score = toScore(tail[expected]);
      if (score === null) score = -1;
      var when = row[0] instanceof Date ? row[0].getTime() : 0;
      if (!groups[digits]) groups[digits] = [];
      groups[digits].push({ row: index + 2, score: score, when: when });
    });
    var drop = [];
    Object.keys(groups).forEach(function (phone) {
      var list = groups[phone];
      if (list.length < 2) return;
      list.sort(function (a, b) {
        if (b.score !== a.score) return b.score - a.score;
        return a.when - b.when;
      });
      for (var n = 1; n < list.length; n++) drop.push(list[n].row);
    });
    drop.sort(function (a, b) { return b - a; });
    drop.forEach(function (rowNumber) { sheet.deleteRow(rowNumber); });
    return { success: true, removed: drop.length };
  } catch (error) {
    return { success: false, error: error.toString() };
  } finally {
    if (locked) lock.releaseLock();
  }
}

function coordinatorOverview(data) {
  try {
    var g = guardAnyStaff(data);
    if (g.error) return { success: false, error: g.error };
    if (g.user.role !== 'coordinator') return { success: false, error: 'forbidden' };
    var allowed = {};
    (g.user.branches || []).forEach(function (name) { allowed[name] = true; });
    var ctx = loadAdminContext(g.ss);
    var selected = ctx.active;
    var requested = cleanId(data && data.weekId);
    if (requested) {
      ctx.weeks.forEach(function (week) {
        if (week.id === requested) selected = week;
      });
    }
    function onlyMine(attempts) {
      return attempts.filter(function (row) { return allowed[row.branch]; });
    }
    var weeks = ctx.weeks.map(function (week) {
      var summary = summarizeAttempts(onlyMine(weekAttempts(ctx, week).attempts));
      return { id: week.id, name: week.name, status: week.status, count: summary.attempts, avg: summary.avg };
    });
    if (!selected) {
      return { success: true, branches: g.user.branches || [], weeks: weeks, selected: null, attempts: [], quiet: [], guesses: [] };
    }
    var pack = weekAttempts(ctx, selected);
    var attempts = onlyMine(pack.attempts).slice().reverse();
    var summary = summarizeAttempts(attempts);
    var phones = {};
    attempts.forEach(function (row) {
      var phone = String(row.phone || '').replace(/\D/g, '');
      if (phone) phones[phone] = true;
    });
    var quiet = readRegistrations(g.ss).filter(function (row) {
      if (!allowed[row.branch]) return false;
      var phone = String(row.phone || '').replace(/\D/g, '');
      if (phone && phones[phone]) return false;
      if (!phone) {
        return !attempts.some(function (attempt) {
          return attempt.branch === row.branch && attempt.name === row.name;
        });
      }
      return true;
    }).slice(0, 80).map(function (row) {
      return { name: row.name };
    });
    var numberMatch = String(selected.name || selected.id || '').match(/(\d+)/);
    var number = numberMatch ? numberMatch[1] : '';
    var guessPack = getAiGuesses();
    var guesses = ((guessPack && guessPack.data) || []).filter(function (guess) {
      if (!allowed[String(guess.branch || '').trim()]) return false;
      if (!number) return true;
      return String(guess.week || '') === number || String(guess.imageId || '').indexOf('week' + number + '-') === 0;
    }).slice(0, 40).map(function (guess) {
      return { name: String(guess.name || ''), text: String(guess.text || '') };
    });
    return {
      success: true,
      branches: g.user.branches || [],
      weeks: weeks,
      selected: {
        id: selected.id,
        name: selected.name,
        status: selected.status,
        attempts: summary.attempts,
        avg: summary.avg,
        perfect: summary.perfect,
        distribution: summary.distribution,
        branches: summary.branches
      },
      attempts: attempts.map(function (row) {
        return {
          name: row.name,
          branch: row.branch,
          phone: row.phone,
          score: row.score,
          date: row.date,
          answers: (row.answers || []).map(function (text, index) {
            var question = pack.questions[index];
            return { text: text, correct: !!(question && sameAnswer(text, question.correctAnswer)) };
          })
        };
      }),
      quiet: quiet,
      guesses: guesses
    };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function adminSetQuizOpen(data) {
  try {
    var g = guardAdmin(data, 'admin');
    if (g.error) return { success: false, error: g.error };
    var open = data && (data.open === true || data.open === 'true');
    writeSetting(g.ss, 'quizOpen', open ? 'כן' : 'לא');
    return { success: true, quizOpen: open };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// אלפון הסניפים. המקור לעריכה הוא גיליון לוז לפי יום, כי כל יום עומד בשורה
// ואפשר לדעת מי פעיל היום. גיליון הסניפים של האתר לא משתנה.

function normBranch(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function normHeader(value) {
  return String(value || '')
    .replace(/[״"]/g, '"')
    .replace(/[׳']/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function todayLetter() {
  var zone = Session.getScriptTimeZone() || 'Asia/Jerusalem';
  var iso = Utilities.formatDate(new Date(), zone, 'u');
  var map = { '7': 'א', '1': 'ב', '2': 'ג', '3': 'ד', '4': 'ה', '5': 'ו', '6': 'ש' };
  return map[iso] || '';
}

function dayName(letter) {
  var names = { 'א': 'ראשון', 'ב': 'שני', 'ג': 'שלישי', 'ד': 'רביעי', 'ה': 'חמישי', 'ו': 'שישי', 'ש': 'שבת' };
  return names[letter] || '';
}

function normalizeDay(value) {
  var text = String(value || '').trim();
  if (!text) return '';
  var names = { 'ראשון': 'א', 'שני': 'ב', 'שלישי': 'ג', 'רביעי': 'ד', 'חמישי': 'ה', 'שישי': 'ו', 'שבת': 'ש' };
  if (names[text]) return names[text];
  var letters = text.match(/[אבגדהוש]/g);
  if (letters && letters.length) return letters[0];
  return '';
}

function clockFromDisplay(value) {
  if (value instanceof Date) {
    var zone = Session.getScriptTimeZone() || 'Asia/Jerusalem';
    return Utilities.formatDate(value, zone, 'HH:mm');
  }
  var match = String(value || '').trim().match(/(\d{1,2}):(\d{2})/);
  if (!match) return '';
  var hour = match[1];
  if (hour.length < 2) hour = '0' + hour;
  return hour + ':' + match[2];
}

function clipText(value, max) {
  var text = String(value || '').trim();
  if (text.length > max) return text.substring(0, max);
  return text;
}

function phoneOrEmpty(value) {
  var text = String(value || '').trim();
  if (!text) return '';
  var formatted = formatPhone(text);
  var digits = String(formatted || text).replace(/\D/g, '');
  if (digits.length < 9 || digits.length > 15) return null;
  return formatted || text;
}

function emailOrEmpty(value) {
  var text = String(value || '').trim();
  if (!text) return '';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(text)) return null;
  return text;
}

function indexDirectoryHeaders(headers) {
  var aliases = {
    name: ['אתר', 'שם הסניף', 'סניף'],
    day: ['יום', 'ימי פעילות'],
    from: ['משעה', 'שעת התחלה'],
    to: ['עד שעה', 'שעת סיום'],
    address: ['כתובת'],
    city: ['עיר'],
    area: ['אזור'],
    lead: ['רכז'],
    phone: ['נייד', 'טלפון', 'נייד רכז'],
    email: ['דוא"ל', 'אימייל', 'מייל', 'דואל'],
    lead2: ['רכז נוסף'],
    phone2: ['נייד רכז נוסף', 'טלפון רכז נוסף'],
    email2: ['דוא"ל רכז נוסף', 'אימייל רכז נוסף'],
    status: ['סטטוס'],
    notes: ['הערות', 'הערה']
  };
  var idx = {};
  var used = {};
  Object.keys(aliases).forEach(function (key) {
    var wanted = aliases[key].map(normHeader);
    for (var i = 0; i < headers.length; i++) {
      if (used[i]) continue;
      if (wanted.indexOf(normHeader(headers[i])) !== -1) {
        idx[key] = i;
        used[i] = true;
        break;
      }
    }
  });
  return idx;
}

function findDirectorySheet(ss) {
  var exact = ss.getSheetByName(DIRECTORY_SHEET_NAME);
  if (exact) return exact;
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    var name = sheets[i].getName();
    if (name.indexOf('לוז') !== -1 && name.indexOf('יום') !== -1) return sheets[i];
  }
  return null;
}

function readDirectoryTable(sheet) {
  if (!sheet || sheet.getLastRow() < 1) return { headers: [], idx: {}, rows: [] };
  var width = Math.max(sheet.getLastColumn(), 1);
  var headers = sheet.getRange(1, 1, 1, width).getValues()[0].map(function (header) {
    return String(header || '').trim();
  });
  while (headers.length && !headers[headers.length - 1]) headers.pop();
  var idx = indexDirectoryHeaders(headers);
  if (sheet.getLastRow() < 2 || idx.name === undefined) return { headers: headers, idx: idx, rows: [] };
  var height = sheet.getLastRow() - 1;
  var values = sheet.getRange(2, 1, height, headers.length).getValues();
  var display = sheet.getRange(2, 1, height, headers.length).getDisplayValues();
  var rows = [];
  values.forEach(function (raw, index) {
    function text(key) {
      if (idx[key] === undefined) return '';
      var shown = String(display[index][idx[key]] || '').trim();
      if (shown) return shown;
      var value = raw[idx[key]];
      if (value instanceof Date) return '';
      return String(value || '').trim();
    }
    function phone(key) {
      if (idx[key] === undefined) return '';
      var fromRaw = formatPhone(raw[idx[key]]);
      if (fromRaw && fromRaw.charAt(0) === '0') return fromRaw;
      var shown = String(display[index][idx[key]] || '').trim();
      if (shown && shown.indexOf('@') === -1) {
        var formatted = formatPhone(shown);
        if (formatted) return formatted;
      }
      return fromRaw || '';
    }
    function clock(key) {
      if (idx[key] === undefined) return '';
      return clockFromDisplay(display[index][idx[key]]) || clockFromDisplay(raw[idx[key]]);
    }
    var name = normBranch(text('name'));
    if (!name) return;
    rows.push({
      row: index + 2,
      name: name,
      day: normalizeDay(text('day')),
      from: clock('from'),
      to: clock('to'),
      address: text('address'),
      city: text('city'),
      area: text('area'),
      lead: text('lead'),
      phone: phone('phone'),
      email: text('email'),
      lead2: text('lead2'),
      phone2: phone('phone2'),
      email2: text('email2'),
      status: text('status'),
      notes: text('notes')
    });
  });
  return { headers: headers, idx: idx, rows: rows };
}

function groupDirectoryRows(rows) {
  var order = [];
  var map = {};
  rows.forEach(function (row) {
    var key = normBranch(row.name);
    if (!map[key]) {
      map[key] = {
        name: row.name,
        city: '',
        address: '',
        area: '',
        status: '',
        notes: '',
        lead: '',
        phone: '',
        email: '',
        lead2: '',
        phone2: '',
        email2: '',
        days: []
      };
      order.push(key);
    }
    var item = map[key];
    ['city', 'address', 'area', 'status', 'notes', 'lead', 'phone', 'email', 'lead2', 'phone2', 'email2'].forEach(function (field) {
      if (!item[field] && row[field]) item[field] = row[field];
    });
    item.days.push({ row: row.row, day: row.day, from: row.from, to: row.to });
  });
  return order.map(function (key) { return map[key]; });
}

function readExtraNotes(ss) {
  var sheet = ss.getSheetByName(DIRECTORY_NOTES_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return {};
  var width = Math.max(sheet.getLastColumn(), 1);
  var headers = sheet.getRange(1, 1, 1, width).getDisplayValues()[0];
  var idx = indexDirectoryHeaders(headers);
  if (idx.name === undefined || idx.notes === undefined) return {};
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, width).getDisplayValues();
  var map = {};
  values.forEach(function (row) {
    var name = normBranch(row[idx.name]);
    var notes = String(row[idx.notes] || '').trim();
    if (name && notes && !map[name]) map[name] = notes;
  });
  return map;
}

function branchNameSet(sheet, column, weekColumn, weekId) {
  var set = {};
  if (!sheet || sheet.getLastRow() < 2) return set;
  var width = Math.max(sheet.getLastColumn(), column, weekColumn || 1);
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, width).getValues();
  values.forEach(function (row) {
    if (weekColumn && weekId && cleanId(row[weekColumn - 1]) !== String(weekId)) return;
    var name = normBranch(row[column - 1]);
    if (name) set[name] = true;
  });
  return set;
}

function directoryFlags(ss, weekId) {
  var active = null;
  readWeeks(ss).forEach(function (week) {
    if (week.status === 'פעיל') active = week;
  });
  var selected = weekId || (active && active.id) || '';
  var useLive = !selected || (active && selected === active.id);
  var weekSet = useLive
    ? branchNameSet(ss.getSheetByName(ANSWERS_SHEET_NAME), 3, 0, '')
    : branchNameSet(ss.getSheetByName(ANSWERS_ARCHIVE_SHEET_NAME), 5, 1, selected);
  var ever = branchNameSet(ss.getSheetByName(ANSWERS_SHEET_NAME), 3, 0, '');
  var archived = branchNameSet(ss.getSheetByName(ANSWERS_ARCHIVE_SHEET_NAME), 5, 0, '');
  Object.keys(archived).forEach(function (name) { ever[name] = true; });
  var quiet = {};
  var regs = branchNameSet(ss.getSheetByName(REGISTRATION_SHEET_NAME), 3, 0, '');
  Object.keys(regs).forEach(function (name) {
    if (!weekSet[name]) quiet[name] = true;
  });
  return { week: weekSet, ever: ever, quiet: quiet };
}

function directoryHasInfo(item) {
  if (!item) return false;
  if (item.city || item.address || item.area || item.lead || item.phone || item.email || item.lead2 || item.phone2 || item.email2 || item.status || item.notes) return true;
  return (item.days || []).some(function (day) { return day.day || day.from || day.to; });
}

function decorateDirectory(name, found, inList, flags, today) {
  var item = found || {
    name: name,
    city: '',
    address: '',
    area: '',
    status: '',
    notes: '',
    lead: '',
    phone: '',
    email: '',
    lead2: '',
    phone2: '',
    email2: '',
    days: []
  };
  var key = normBranch(name);
  var activeToday = (item.days || []).some(function (day) { return day.day === today; });
  return {
    name: name,
    city: item.city || '',
    address: item.address || '',
    area: item.area || '',
    status: DIRECTORY_STATUSES.indexOf(item.status) === -1 ? '' : item.status,
    notes: clipText(item.notes || '', 500),
    lead: item.lead || '',
    phone: item.phone || '',
    email: item.email || '',
    lead2: item.lead2 || '',
    phone2: item.phone2 || '',
    email2: item.email2 || '',
    days: (item.days || []).map(function (day) {
      return { row: day.row || '', day: day.day || '', from: day.from || '', to: day.to || '' };
    }),
    inList: !!inList,
    hasInfo: directoryHasInfo(item),
    participated: !!flags.week[key],
    ever: !!flags.ever[key],
    quiet: !!flags.quiet[key],
    activeToday: activeToday
  };
}

function mergeDirectory(publicNames, grouped, flags, today, extraNotes, namedOnly) {
  var used = {};
  var groupedByName = {};
  grouped.forEach(function (item) { groupedByName[normBranch(item.name)] = item; });
  var out = [];
  publicNames.forEach(function (name) {
    var key = normBranch(name);
    if (!key || used[key]) return;
    used[key] = true;
    var found = groupedByName[key] || null;
    if (found && !found.notes && extraNotes[key]) found.notes = extraNotes[key];
    out.push(decorateDirectory(name, found, true, flags, today));
  });
  if (namedOnly) return out;
  grouped.forEach(function (item) {
    var key = normBranch(item.name);
    if (used[key]) return;
    used[key] = true;
    if (!item.notes && extraNotes[key]) item.notes = extraNotes[key];
    out.push(decorateDirectory(item.name, item, false, flags, today));
  });
  return out;
}

function directoryForRole(role, names, grouped, flags, today, extra) {
  var namedOnly = role === 'coordinator';
  var branches = mergeDirectory(names, grouped, flags, today, namedOnly ? {} : extra, namedOnly);
  if (namedOnly) {
    branches.forEach(function (branch) { branch.notes = ''; });
  }
  return branches;
}

function ensureDirectoryColumns(sheet, headers) {
  var idx = indexDirectoryHeaders(headers);
  if (idx.status === undefined) {
    sheet.getRange(1, headers.length + 1).setValue('סטטוס');
    headers.push('סטטוס');
    idx.status = headers.length - 1;
  }
  if (idx.notes === undefined) {
    sheet.getRange(1, headers.length + 1).setValue('הערות');
    headers.push('הערות');
    idx.notes = headers.length - 1;
  }
  return idx;
}

function directorySharedPairs(record) {
  return {
    name: safeCell(record.name),
    address: safeCell(record.address),
    city: safeCell(record.city),
    area: safeCell(record.area),
    lead: safeCell(record.lead),
    phone: record.phone,
    email: safeCell(record.email),
    lead2: safeCell(record.lead2),
    phone2: record.phone2,
    email2: safeCell(record.email2),
    status: record.status,
    notes: safeCell(record.notes)
  };
}

function writeDirectoryPairs(sheet, rowNumber, idx, pairs) {
  var asText = { phone: true, phone2: true, from: true, to: true };
  Object.keys(pairs).forEach(function (key) {
    if (idx[key] === undefined) return;
    var cell = sheet.getRange(rowNumber, idx[key] + 1);
    if (asText[key]) writeTextCell(cell, pairs[key]);
    else cell.setValue(pairs[key] || '');
  });
}

function appendDirectoryRow(sheet, headers, idx, record, day) {
  var blank = [];
  for (var i = 0; i < headers.length; i++) blank.push('');
  sheet.appendRow(blank);
  var pairs = directorySharedPairs(record);
  pairs.day = day.day || '';
  pairs.from = day.from || '';
  pairs.to = day.to || '';
  writeDirectoryPairs(sheet, sheet.getLastRow(), idx, pairs);
}

function adminListDirectory(data) {
  try {
    var g = guardAnyStaff(data);
    if (g.error) return { success: false, error: g.error };
    var today = todayLetter();
    var names = [];
    if (g.user.role === 'coordinator') names = (g.user.branches || []).slice();
    else names = readBranchRows(g.ss).map(function (row) { return row.name; });
    var flags = directoryFlags(g.ss, cleanId(data && data.weekId));
    var sheet = findDirectorySheet(g.ss);
    var extra = g.user.role === 'coordinator' ? {} : readExtraNotes(g.ss);
    var grouped = [];
    var missing = false;
    var errorText = '';
    if (!sheet) {
      missing = true;
      errorText = 'לא מצאתי את גיליון «' + DIRECTORY_SHEET_NAME + '».';
    } else {
      var table = readDirectoryTable(sheet);
      if (table.idx.name === undefined) {
        missing = true;
        errorText = 'בגיליון הלוז לא נמצאה עמודת «אתר».';
      } else {
        grouped = groupDirectoryRows(table.rows);
      }
    }
    return {
      success: true,
      missing: missing,
      error: errorText,
      sheet: sheet ? sheet.getName() : '',
      today: today,
      todayName: dayName(today),
      branches: directoryForRole(g.user.role, names, grouped, flags, today, extra)
    };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function parseDirectoryDays(incoming) {
  var days = [];
  var source = incoming || [];
  if (!Array.isArray(source)) return { error: 'ימי הפעילות לא תקינים' };
  for (var i = 0; i < source.length; i++) {
    var day = source[i] || {};
    var letter = normalizeDay(day.day);
    var from = String(day.from || '').trim() ? clockFromDisplay(day.from) : '';
    var to = String(day.to || '').trim() ? clockFromDisplay(day.to) : '';
    if (String(day.from || '').trim() && !from) return { error: 'שעת התחלה לא תקינה' };
    if (String(day.to || '').trim() && !to) return { error: 'שעת סיום לא תקינה' };
    if ((from || to) && !letter) return { error: 'לכל שעות פעילות צריך לבחור יום' };
    if (!letter && !from && !to) continue;
    days.push({ row: parseInt(day.row, 10) || 0, day: letter, from: from, to: to });
  }
  return { days: days };
}

function adminSaveDirectory(data) {
  var lock = LockService.getScriptLock();
  var locked = false;
  try {
    var g = guardAnyStaff(data);
    if (g.error) return { success: false, error: g.error };
    var incoming = data && data.branch || {};
    var name = normBranch(incoming.name);
    if (name.length < 2 || name.length > 80) return { success: false, error: 'שם הסניף לא תקין' };
    if (g.user.role === 'coordinator') {
      var allowed = false;
      (g.user.branches || []).forEach(function (branch) {
        if (normBranch(branch) === name) allowed = true;
      });
      if (!allowed) return { success: false, error: 'אפשר לערוך רק סניף שמשויך אליך' };
    } else if (roleRank(g.user.role) < roleRank('admin')) {
      return { success: false, error: 'forbidden' };
    }
    var status = String(incoming.status || '').trim();
    if (status && DIRECTORY_STATUSES.indexOf(status) === -1) return { success: false, error: 'סטטוס לא מוכר' };
    var notes = String(incoming.notes || '').trim();
    if (notes.length > 500) return { success: false, error: 'ההערה ארוכה מדי' };
    var phone = phoneOrEmpty(incoming.phone);
    var phone2 = phoneOrEmpty(incoming.phone2);
    var email = emailOrEmpty(incoming.email);
    var email2 = emailOrEmpty(incoming.email2);
    if (phone === null || phone2 === null) return { success: false, error: 'טלפון לא תקין' };
    if (email === null || email2 === null) return { success: false, error: 'אימייל לא תקין' };
    var parsed = parseDirectoryDays(incoming.days);
    if (parsed.error) return { success: false, error: parsed.error };
    var record = {
      name: name,
      city: clipText(incoming.city, 40),
      address: clipText(incoming.address, 120),
      area: clipText(incoming.area, 40),
      status: status,
      notes: notes,
      lead: clipText(incoming.lead, 40),
      phone: phone,
      email: email,
      lead2: clipText(incoming.lead2, 40),
      phone2: phone2,
      email2: email2
    };
    lock.waitLock(12000);
    locked = true;
    var sheet = findDirectorySheet(g.ss);
    if (!sheet) return { success: false, error: 'לא מצאתי את גיליון «' + DIRECTORY_SHEET_NAME + '»' };
    var table = readDirectoryTable(sheet);
    if (table.idx.name === undefined) return { success: false, error: 'בגיליון הלוז חסרה עמודת אתר' };
    var headers = table.headers.slice();
    var idx = ensureDirectoryColumns(sheet, headers);
    var mine = table.rows.filter(function (row) { return normBranch(row.name) === name; });
    if (g.user.role === 'coordinator') {
      var keptStatus = '';
      var keptNotes = '';
      mine.forEach(function (row) {
        if (!keptStatus && row.status) keptStatus = row.status;
        if (!keptNotes && row.notes) keptNotes = row.notes;
      });
      record.status = keptStatus;
      record.notes = keptNotes;
    }
    var keep = {};
    parsed.days.forEach(function (day) {
      if (day.row && mine.some(function (row) { return row.row === day.row; })) keep[day.row] = day;
    });
    var shared = directorySharedPairs(record);
    if (!parsed.days.length) {
      if (mine.length) {
        writeDirectoryPairs(sheet, mine[0].row, idx, shared);
        writeDirectoryPairs(sheet, mine[0].row, idx, { day: '', from: '', to: '' });
        var leftover = [];
        for (var n = 1; n < mine.length; n++) leftover.push(mine[n].row);
        leftover.sort(function (a, b) { return b - a; });
        leftover.forEach(function (rowNumber) { sheet.deleteRow(rowNumber); });
      } else {
        appendDirectoryRow(sheet, headers, idx, record, { day: '', from: '', to: '' });
      }
      return { success: true };
    }
    mine.forEach(function (row) {
      var day = keep[row.row];
      if (!day) return;
      var pairs = directorySharedPairs(record);
      pairs.day = day.day;
      pairs.from = day.from;
      pairs.to = day.to;
      writeDirectoryPairs(sheet, row.row, idx, pairs);
    });
    var drop = [];
    mine.forEach(function (row) {
      if (!keep[row.row]) drop.push(row.row);
    });
    drop.sort(function (a, b) { return b - a; });
    drop.forEach(function (rowNumber) { sheet.deleteRow(rowNumber); });
    parsed.days.forEach(function (day) {
      if (day.row && keep[day.row]) return;
      appendDirectoryRow(sheet, headers, idx, record, day);
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.toString() };
  } finally {
    if (locked) lock.releaseLock();
  }
}

function adminDeleteDirectory(data) {
  var lock = LockService.getScriptLock();
  var locked = false;
  try {
    var g = guardAdmin(data, 'admin');
    if (g.error) return { success: false, error: g.error };
    var name = normBranch(data && data.name);
    if (!name) return { success: false, error: 'חסר שם סניף' };
    lock.waitLock(12000);
    locked = true;
    var sheet = findDirectorySheet(g.ss);
    if (!sheet) return { success: false, error: 'לא מצאתי את גיליון הלוז' };
    var table = readDirectoryTable(sheet);
    var drop = table.rows.filter(function (row) {
      return normBranch(row.name) === name;
    }).map(function (row) { return row.row; });
    drop.sort(function (a, b) { return b - a; });
    drop.forEach(function (rowNumber) { sheet.deleteRow(rowNumber); });
    return { success: true, removed: drop.length };
  } catch (error) {
    return { success: false, error: error.toString() };
  } finally {
    if (locked) lock.releaseLock();
  }
}

var CACHE_WORKER_INGEST = 'https://shabat-cache.yairdahn.workers.dev/ingest';

function sha256Hex(text) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(text), Utilities.Charset.UTF_8);
  return bytes.map(function (b) {
    var value = b < 0 ? b + 256 : b;
    var hex = value.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function cacheSuperPin(ss) {
  var sheet = ss.getSheetByName(ADMIN_USERS_SHEET_NAME);
  var users = readStaffRows(sheet);
  for (var i = 0; i < users.length; i++) {
    if (users[i].active && users[i].role === 'super') return users[i].pin;
  }
  return '';
}

function pushCacheSnapshot() {
  var secret = PropertiesService.getScriptProperties().getProperty('CACHE_SECRET');
  if (!secret) throw new Error('חסר CACHE_SECRET במאפייני הסקריפט');
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var pin = cacheSuperPin(ss);
  if (!pin) throw new Error('אין סופר אדמין פעיל');
  var weeks = readWeeks(ss);
  var weekIds = [''];
  weeks.forEach(function (week) {
    if (weekIds.indexOf(week.id) === -1) weekIds.push(week.id);
  });
  var base = { pin: pin };
  var variants = {};
  weekIds.forEach(function (weekId) {
    variants['adminOverview|' + weekId + '|'] = adminOverview({ pin: pin, weekId: weekId });
    variants['adminListDirectory|' + weekId + '|'] = adminListDirectory({ pin: pin, weekId: weekId });
    ['all', 'live', 'archive'].forEach(function (source) {
      variants['adminListAnswers|' + weekId + '|' + source] = adminListAnswers({ pin: pin, weekId: weekId, source: source });
    });
  });
  var users = readStaffRows(ss.getSheetByName(ADMIN_USERS_SHEET_NAME));
  var staff = [];
  var coordinators = {};
  var started = Date.now();
  users.forEach(function (user) {
    if (!user.active) return;
    var hash = sha256Hex(user.pin);
    staff.push({ pinHash: hash, role: user.role, active: true });
    if (user.role !== 'coordinator' || Date.now() - started > 200000) return;
    var pack = {};
    weekIds.forEach(function (weekId) {
      if (Date.now() - started > 200000) return;
      pack['coordinatorOverview|' + weekId + '|'] = coordinatorOverview({ pin: user.pin, loginName: user.name, weekId: weekId });
      pack['adminListDirectory|' + weekId + '|'] = adminListDirectory({ pin: user.pin, loginName: user.name, weekId: weekId });
    });
    coordinators[hash] = pack;
  });
  var bundle = {
    at: Date.now(),
    public: {
      getBranches: { data: getBranches() },
      getQuestions: { data: getCurrentQuestions() },
      getWinners: getWinners(),
      getUpdates: getUpdates(),
      getSiteSettings: getSiteSettings(),
      getAiLikes: getAiLikes(),
      getGoodDeeds: getGoodDeeds(),
      testConnection: { status: 'success', message: 'מחובר בהצלחה!' }
    },
    admin: {
      adminListQuestions: adminListQuestions(base),
      adminListBranches: adminListBranches(base),
      adminListUpdates: adminListUpdates(base),
      adminListWinners: adminListWinners(base),
      adminListRegistrations: adminListRegistrations(base),
      adminListStaff: adminListStaff(base),
      getAiGuesses: getAiGuesses(),
      getAiLikeAudit: getAiLikeAudit()
    },
    variants: variants,
    staff: staff,
    coordinators: coordinators
  };
  var response = UrlFetchApp.fetch(CACHE_WORKER_INGEST, {
    method: 'post',
    contentType: 'application/json',
    headers: { 'X-Cache-Secret': secret },
    payload: JSON.stringify(bundle),
    muteHttpExceptions: true
  });
  var code = response.getResponseCode();
  if (code < 200 || code >= 300) throw new Error('עדכון העותק נכשל: ' + code);
}

function installCacheTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    if (trigger.getHandlerFunction() === 'pushCacheSnapshot') ScriptApp.deleteTrigger(trigger);
  });
  ScriptApp.newTrigger('pushCacheSnapshot').timeBased().everyMinutes(5).create();
  pushCacheSnapshot();
}

/**
 * קוד זה צריך להיות מודבק ב-Google Apps Script (Code.gs)
 * כחלק מהסקריפט הקיים.
 * 
 * התמונות נשמרות ב-Google Drive בתיקייה ייעודית,
 * והקישורים והמידע נשמרים בגיליון "GalleryImages".
 */

// מזהה התיקייה ב-Drive שבה יישמרו התמונות
// צריך ליצור תיקייה ולהחליף את המזהה הזה
var GALLERY_FOLDER_ID = '1aokhET2mfVjBd9CG2Qktl5zSRaRprEuD'; // <-- החלף עם מזהה התיקייה שלך!

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

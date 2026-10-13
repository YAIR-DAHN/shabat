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
const AI_ADMIN_PIN = 'shabbat200';

function doGet(e) {
  const response = ContentService.createTextOutput()
    .setMimeType(ContentService.MimeType.JSON)
    .setContent(JSON.stringify(handleRequest(e)));
  
  return response;
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
      if (!data || String(data.pin) !== String(AI_ADMIN_PIN)) {
        return { error: 'unauthorized' };
      }
      return getAiGuesses();

    case 'getAiLikes':
      return getAiLikes();

    case 'getAiLikeAudit':
      if (!data || String(data.pin) !== String(AI_ADMIN_PIN)) {
        return { error: 'unauthorized' };
      }
      return getAiLikeAudit();

    case 'setAiLikeCount':
      if (!data || String(data.pin) !== String(AI_ADMIN_PIN)) {
        return { error: 'unauthorized' };
      }
      return setAiLikeCount(data);

    case 'submitAiLike':
      if (!data) {
        return { error: 'No data provided' };
      }
      return submitAiLike(data.like || data);
      
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
    quiz: row[3]
  }));
  
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
    .map(row => ({
      date: row[0],
      title: row[1],
      content: row[2],
      type: row[3].toLowerCase().trim()
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
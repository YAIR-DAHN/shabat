/**
 * גלריית תמונות ה-AI.
 * כדי להוסיף תמונה: שמים את הקובץ בתיקייה assets/aiImages
 * ומוסיפים שורה למערך images.
 *
 * week       מספר שבוע הלימוד
 * credit     קרדיט, אפשר להשאיר ריק
 * open       false סוגר את הניחושים לתמונה הזו
 */
window.AI_GALLERY = {
    prize: 'גיפט קארד בשווי 200 ₪',
    images: [
        {
            id: 'week1-1',
            week: 1,
            src: 'assets/aiImages/1.jpeg',
            credit: '',
            open: true
        },
        {
            id: 'week1-2',
            week: 1,
            src: 'assets/aiImages/2.jpeg',
            credit: '',
            open: true
        },
        {
            id: 'week1-3',
            week: 1,
            src: 'assets/aiImages/3.jpeg',
            credit: 'ראובן בן שמחון מסניף גבעת שמואל',
            open: true
        }
    ]
};

window.aiWeekLabel = function (week) {
    var letters = ['', 'א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ז׳', 'ח׳', 'ט׳', 'י׳', 'י״א', 'י״ב'];
    var n = Number(week);
    return 'שבוע ' + (letters[n] || n);
};

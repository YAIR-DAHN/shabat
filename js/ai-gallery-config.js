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
            credit: 'ראובן בן שמחון | גבעת שמואל',
            open: true
        },
        {
            id: 'week1-4',
            week: 1,
            src: 'assets/aiImages/4.jpeg',
            credit: 'בן אהרוני | חדרה בית אליעזר',
            open: true
        },
        {
            id: 'week1-5',
            week: 1,
            src: 'assets/aiImages/5.jpeg',
            credit: 'שמואל עירוב | רמת גן שקמה',
            open: true
        },
        {
            id: 'week1-6',
            week: 1,
            src: 'assets/aiImages/6.jpeg',
            credit: 'בר שקיה | רמת גן שקמה',
            open: true
        },
        {
            id: 'week1-7',
            week: 2,
            src: 'assets/aiImages/7.jpeg',
            credit: '',
            open: true
        },
        {
            id: 'week1-8',
            week: 2,
            src: 'assets/aiImages/8.jpeg',
            credit: '',
            open: true
        },
        {
            id: 'week1-9',
            week: 2,
            src: 'assets/aiImages/9.jpeg',
            credit: 'איתי חדד | מצליח',
            open: true
        },
        {
            id: 'week2-10',
            week: 2,
            src: 'assets/aiImages/10.jpeg',
            credit: '',
            open: true
        },
    ]
};

window.aiWeekLabel = function (week) {
    var letters = ['', 'א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ז׳', 'ח׳', 'ט׳', 'י׳', 'י״א', 'י״ב'];
    var n = Number(week);
    return 'שבוע ' + (letters[n] || n);
};

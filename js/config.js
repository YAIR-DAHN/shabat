const CONFIG = {
    api: {
        url: 'https://script.google.com/macros/s/AKfycbzyOqOyD8Bd5RaZ5nPy1UbEbIIp1aRsFKFbfAaAvVcU7kNc8v4QF6e_nXqI4KIxZu4P/exec'
    },

    quiz: {
        isAvailable: true,
        nextQuizDate: '2025-05-19',
        hebrewDate: 'יום שני',
        displayDate: '19.5',
        showAnnouncement: false,
        announcementText:
            'ברוכים הבאים לשעשועון השבועי בנושא דיני שבת!\nבתחילת השעשועון יוצגו לכם שאלות לרענן את הידע - השאלות אינן משפיעות על הציון.\nבהצלחה!',
        // introductionText: 'ארבע השאלות הבאות נועדו לרענן את הידע ולא משפיעות על הציון',
        sounds: {
            good: 'assets/sound/good.mp3',
            next: 'assets/sound/next.mp3',
            applause: 'assets/sound/applause.mp3',
            background: 'assets/sound/correctAns.mp3',
            backgroundVolume: 0.14,
            sfxVolume: 0.75
        }
    },

    general: {
        projectName: 'מיזם השבת',
        organizationName: 'אור ישראלי'
    }
};

Object.freeze(CONFIG);

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

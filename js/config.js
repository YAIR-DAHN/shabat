const CONFIG = {
    api: {
        url: 'https://script.google.com/macros/s/AKfycbwayIziiJLGrGsX3tPJitd7oKdlA5PQ3ExJn5Cl_tC0I3RzV0EKRie-UiHvy_0ASgWD/exec'
    },

    quiz: {
        // isAvailable: false,
        isAvailable: true,
        nextQuizDate: '2025-05-19',
        hebrewDate: 'יום שני',
        displayDate: '19.5',
        showAnnouncement: false,
        announcementText:
            'ברוכים הבאים לחידון השבועי בנושא שבת!\nבתחילת השעשועון יוצגו שאלות לרענון - הן אינן משפיעות על הציון.\nבהצלחה!',
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
        projectName: 'תוכנית שבת',
        organizationName: 'אור ישראלי'
    }
};

Object.freeze(CONFIG);

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

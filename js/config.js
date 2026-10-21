const CONFIG = {
    api: {
        url: 'https://script.google.com/macros/s/AKfycbwSts-TZ4bsySeSxXCqKHlSUk4T79frFdo68YSmR8NkcH-jtLwEslldz8L2e2xFvbtP/exec',
        cacheUrl: 'https://shabat-cache.yairdahn.workers.dev/read'
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

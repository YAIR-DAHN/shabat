/**
 * גלריית תמונות ה-AI.
 * התמונות עכשיו נטענות מ-Google Sheets דרך ה-API.
 * ניהול התמונות נעשה דרך פאנל הניהול.
 */
window.AI_GALLERY = {
    prize: 'גיפט קארד בשווי 200 ₪',
    images: [],
    loaded: false,
    loading: false,
    listeners: []
};

window.loadAiGallery = function () {
    if (window.AI_GALLERY.loaded || window.AI_GALLERY.loading) {
        return Promise.resolve(window.AI_GALLERY.images);
    }

    window.AI_GALLERY.loading = true;

    if (typeof fetchFromAPI !== 'function') {
        console.error('fetchFromAPI is not available');
        window.AI_GALLERY.loading = false;
        return Promise.resolve([]);
    }

    return fetchFromAPI('getAiGallery')
        .then(function (result) {
            if (result && result.success && Array.isArray(result.images)) {
                window.AI_GALLERY.images = result.images;
                window.AI_GALLERY.loaded = true;
            }
            window.AI_GALLERY.loading = false;
            window.AI_GALLERY.listeners.forEach(function (fn) {
                fn();
            });
            return window.AI_GALLERY.images;
        })
        .catch(function (err) {
            console.error('Failed to load gallery:', err);
            window.AI_GALLERY.loading = false;
            return [];
        });
};

window.aiWeekLabel = function (week) {
    var letters = ['', 'א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ז׳', 'ח׳', 'ט׳', 'י׳', 'י״א', 'י״ב'];
    var n = Number(week);
    return 'שבוע ' + (letters[n] || n);
};

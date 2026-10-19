// פונקציות משותפות כמו showModal, initDarkMode וכו' 

// שימוש בקונפיגורציה המרכזית
// const API_URL = CONFIG.api.url; // הסרתי את זה כי זה כבר מוגדר ב-config.js

// טיפול במצב לילה - תמיד נשאר במצב בהיר
function initDarkMode() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;
    
    // תמיד נשאר במצב בהיר
    document.body.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
    
    // עדכון האייקון
    const icon = themeToggle.querySelector('.material-icons');
    if (icon) icon.textContent = 'dark_mode';

    themeToggle.addEventListener('click', () => {
        const isDark = document.body.hasAttribute('data-theme');
        const icon = themeToggle.querySelector('.material-icons');

        if (!isDark) {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            if (icon) icon.textContent = 'light_mode';
        } else {
            document.body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            if (icon) icon.textContent = 'dark_mode';
        }
    });
}

// קאש לנתונים
const cache = {
    questions: null,
    branches: null
};

// הגדרת זמינות השעשועון
const QUIZ_CONFIG = {
    // isAvailable: false, // האם השעשועון זמין כרגע
    isAvailable: true, // האם השעשועון זמין כרגע
    nextQuizDate: '2024-05-26'  // תאריך השעשועון הבא
};

function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

function showElementLoading(element) {
    const loader = document.createElement('div');
    loader.className = 'element-loader';
    element.appendChild(loader);
}

function hideElementLoading(element) {
    const loader = element.querySelector('.element-loader');
    if (loader) {
        loader.remove();
    }
}

const CACHE_READS = {
    getBranches: true,
    getQuestions: true,
    getWinners: true,
    getUpdates: true,
    getSiteSettings: true,
    getAiLikes: true,
    getGoodDeeds: true,
    testConnection: true,
    adminOverview: true,
    adminListQuestions: true,
    adminListAnswers: true,
    adminListBranches: true,
    adminListUpdates: true,
    adminListWinners: true,
    adminListRegistrations: true,
    adminListStaff: true,
    adminListDirectory: true,
    coordinatorOverview: true,
    getAiGuesses: true,
    getAiLikeAudit: true
};

var sheetSkipUntil = {};

function cacheMemoryKey(action, data) {
    return 'shabbat-cache:' + action + ':' + ((data && data.weekId) || '') + ':' + ((data && data.source) || '');
}

function invalidateSheetCache() {
    var until = Date.now() + 6 * 60 * 1000;
    Object.keys(CACHE_READS).forEach(function (action) {
        sheetSkipUntil[action] = until;
        dropCacheMemory(action);
    });
}

function dropCacheMemory(action) {
    var prefix = 'shabbat-cache:' + action + ':';
    [sessionStorage, localStorage].forEach(function (store) {
        try {
            var keys = [];
            for (var i = 0; i < store.length; i++) {
                var key = store.key(i);
                if (key && key.indexOf(prefix) === 0) keys.push(key);
            }
            keys.forEach(function (key) { store.removeItem(key); });
        } catch (error) {}
    });
}

function readCacheRecord(action, data) {
    try {
        const store = data && data.pin ? sessionStorage : localStorage;
        const saved = JSON.parse(store.getItem(cacheMemoryKey(action, data)) || 'null');
        if (!saved || !saved.at || Date.now() - saved.at > 6 * 60 * 60 * 1000) return null;
        return saved;
    } catch (error) {
        return null;
    }
}

function readCacheMemory(action, data) {
    const saved = readCacheRecord(action, data);
    return saved && saved.body || null;
}

function writeCacheMemory(action, data, body, sheetUntil) {
    try {
        const store = data && data.pin ? sessionStorage : localStorage;
        store.setItem(cacheMemoryKey(action, data), JSON.stringify({
            at: Date.now(),
            body: body,
            sheetUntil: sheetUntil || 0
        }));
    } catch (error) {}
}

async function readCache(action, data) {
    if (!CONFIG.api.cacheUrl || !CACHE_READS[action]) return null;
    const saved = readCacheRecord(action, data);
    if (saved && saved.sheetUntil > Date.now()) return saved.body;
    if (sheetSkipUntil[action] > Date.now()) return null;
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = controller ? setTimeout(function () { controller.abort(); }, 2500) : null;
    try {
        const url = new URL(CONFIG.api.cacheUrl);
        url.searchParams.append('action', action);
        if (data) url.searchParams.append('data', encodeURIComponent(JSON.stringify(data)));
        const response = await fetch(url.toString(), {
            method: 'GET',
            credentials: 'omit',
            signal: controller ? controller.signal : undefined
        });
        if (!response.ok) return readCacheMemory(action, data);
        const json = await response.json();
        if (!json || json.miss === true) return null;
        const fresh = readCacheRecord(action, data);
        if (fresh && fresh.sheetUntil > Date.now()) return fresh.body;
        writeCacheMemory(action, data, json);
        return json;
    } catch (error) {
        return readCacheMemory(action, data);
    } finally {
        if (timer) clearTimeout(timer);
    }
}

function scriptUrl(action, data, callback) {
    const url = new URL(CONFIG.api.url);
    url.searchParams.append('action', action);
    if (callback) url.searchParams.append('callback', callback);
    if (data) url.searchParams.append('data', encodeURIComponent(JSON.stringify(data)));
    url.searchParams.append('nc', String(Date.now()));
    return url.toString();
}

function parseScriptJson(text) {
    const trimmed = String(text || '').trim();
    if (!trimmed || trimmed.charAt(0) === '<') {
        throw new Error('Invalid JSON response');
    }
    return JSON.parse(trimmed);
}

function requestByScript(action, data) {
    return new Promise(function (resolve, reject) {
        const callback = 'shabbatCb' + Date.now() + Math.floor(Math.random() * 1000);
        const script = document.createElement('script');
        let timer = setTimeout(fail, 20000);
        function cleanup() {
            clearTimeout(timer);
            timer = null;
            try { delete window[callback]; } catch (error) { window[callback] = undefined; }
            if (script.parentNode) script.parentNode.removeChild(script);
        }
        function fail() {
            cleanup();
            reject(new Error('Invalid JSON response'));
        }
        window[callback] = function (json) {
            cleanup();
            resolve(json);
        };
        script.onerror = fail;
        script.src = scriptUrl(action, data, callback);
        document.head.appendChild(script);
    });
}

async function requestAppsScript(action, data) {
    try {
        const response = await fetch(scriptUrl(action, data), {
            method: 'GET',
            credentials: 'omit',
            cache: 'no-store'
        });
        return parseScriptJson(await response.text());
    } catch (error) {
        return requestByScript(action, data);
    }
}

async function fetchFromAPI(action, method = 'GET', data = null) {
    const cached = await readCache(action, data);
    if (cached) return cached;
    try {
        const json = await requestAppsScript(action, data);
        if (sheetSkipUntil[action] > Date.now()) {
            writeCacheMemory(action, data, json, sheetSkipUntil[action]);
            delete sheetSkipUntil[action];
        }
        return json;
    } catch (error) {
        console.error('Error fetching from API:', error);
        throw error;
    }
}

function showModal(options) {
    const { title, message, icon = 'info', confirmText = 'אישור', cancelText = 'ביטול', onConfirm, onCancel } = options;
    
    // הסרת מודלים קודמים אם קיימים
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modalHTML = `
        <div class="modal-overlay">
            <div class="modal">
                <button class="modal-close">
                    <span class="material-icons">close</span>
                </button>
                <div class="modal-header">
                    <span class="material-icons modal-icon">${icon}</span>
                    <h3 class="modal-title">${title}</h3>
                </div>
                <div class="modal-content">${message}</div>
                <div class="modal-actions">
                    ${onCancel ? `<button class="modal-button secondary">${cancelText}</button>` : ''}
                    <button class="modal-button primary">${confirmText}</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modalOverlay = document.querySelector('.modal-overlay');
    
    // בדיקה אם יש סגנונות למודל
    if (!document.querySelector('style#modal-styles')) {
        const modalStyles = `
            <style id="modal-styles">
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity 0.3s, visibility 0.3s;
                }
                
                .modal-overlay.active {
                    opacity: 1;
                    visibility: visible;
                }
                
                .modal {
                    background-color: white;
                    border-radius: 8px;
                    max-width: 90%;
                    width: 500px;
                    padding: 20px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                    position: relative;
                }
                
                .modal-close {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 24px;
                    color: #999;
                }
                
                .modal-header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 15px;
                }
                
                .modal-icon {
                    margin-left: 10px;
                    color: #1abc9c;
                    font-size: 24px;
                }
                
                .modal-title {
                    margin: 0;
                    font-size: 20px;
                }
                
                .modal-content {
                    margin-bottom: 20px;
                    line-height: 1.5;
                }
                
                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                }
                
                .modal-button {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    margin-right: 10px;
                }
                
                .modal-button:last-child {
                    margin-right: 0;
                }
                
                .modal-button.primary {
                    background-color: #1abc9c;
                    color: white;
                }
                
                .modal-button.secondary {
                    background-color: #f1f1f1;
                    color: #333;
                }
                
                .modal-button.primary:hover {
                    background-color: #16a085;
                }
                
                .modal-button.secondary:hover {
                    background-color: #e0e0e0;
                }
            </style>
        `;
        document.head.insertAdjacentHTML('beforeend', modalStyles);
    }
    
    // הוספת הקלאס active מיד
    modalOverlay.classList.add('active');
    
    const confirmButton = modalOverlay.querySelector('.modal-button.primary');
    const cancelButton = modalOverlay.querySelector('.modal-button.secondary');
    const closeButton = modalOverlay.querySelector('.modal-close');
    
    // פונקציה לסגירת המודל
    const closeModal = (callback) => {
        modalOverlay.classList.remove('active');
        setTimeout(() => {
            modalOverlay.remove();
            if (callback) callback();
        }, 300);
    };
    
    confirmButton.addEventListener('click', () => {
        closeModal(onConfirm);
    });
    
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            closeModal(onCancel);
        });
    }
    
    closeButton.addEventListener('click', () => {
        closeModal(onCancel);
    });
    
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal(onCancel);
        }
    });
    
    document.addEventListener('keydown', function closeOnEsc(e) {
        if (e.key === 'Escape') {
            document.removeEventListener('keydown', closeOnEsc);
            closeModal(onCancel);
        }
    });
}

// פתיחת החידון: אם הוגדרה בגיליון ההגדרות היא קובעת, אחרת נשארת ההגדרה בקובץ.
async function quizIsOpen() {
    var fallback = false;
    if (typeof CONFIG !== 'undefined' && CONFIG.quiz && typeof CONFIG.quiz.isAvailable === 'boolean') {
        fallback = CONFIG.quiz.isAvailable;
    } else if (typeof QUIZ_CONFIG !== 'undefined') {
        fallback = !!QUIZ_CONFIG.isAvailable;
    }
    var cacheKey = 'shabbat-quiz-open';
    try {
        var cached = JSON.parse(sessionStorage.getItem(cacheKey) || 'null');
        if (cached && Date.now() - cached.at < 30000) {
            return typeof cached.open === 'boolean' ? cached.open : fallback;
        }
    } catch (error) {}
    try {
        var result = await Promise.race([
            fetchFromAPI('getSiteSettings'),
            new Promise(function (resolve) { setTimeout(function () { resolve(null); }, 4000); })
        ]);
        var open = result && typeof result.quizOpen === 'boolean' ? result.quizOpen : null;
        try { sessionStorage.setItem(cacheKey, JSON.stringify({ at: Date.now(), open: open })); } catch (error) {}
        if (typeof open === 'boolean') return open;
    } catch (error) {}
    return fallback;
}

// פונקציה לניתוב לדף המתאים
async function handleQuizNavigation(event) {
    if (event) {
        event.preventDefault();
    }
    var open = await quizIsOpen();
    window.location.href = open ? 'quiz.html' : 'quiz-unavailable.html';
}

function showContactInfo() {
    showModal({
        title: 'y.d. systems',
        message: `
            <div class="contact-item">
                <span class="material-icons">phone</span>
                <a href="tel:0583730000" dir="ltr">058-373-0000</a>
            </div>
            <div class="contact-item">
                <span class="material-icons">forum</span>
                <a href="https://wa.me/972583730000" target="_blank" dir="ltr">058-373-0000</a>
            </div>
            <div class="contact-item">
                <span class="material-icons">email</span>
                <a href="mailto:yairdahn@gmail.com">yairdahn@gmail.com</a>
            </div>
        `,
        confirmText: 'סגור',
        icon: 'contact_support'
    });
}

// פונקציות להצגת מודאל תמונה
function openImageModal(src) {
    // יצירת המודאל אם לא קיים
    let modal = document.querySelector('.image-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.innerHTML = `
            <button class="close-modal" onclick="closeImageModal()">
                <span class="material-icons">close</span>
            </button>
            <img class="modal-image" src="" alt="תמונה מוגדלת">
        `;
        document.body.appendChild(modal);

        // סגירת המודאל בלחיצה על הרקע
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeImageModal();
            }
        });

        // סגירת המודאל בלחיצה על ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeImageModal();
            }
        });
    }

    // עדכון התמונה והצגת המודאל
    const modalImage = modal.querySelector('.modal-image');
    modalImage.src = src;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeImageModal() {
    const modal = document.querySelector('.image-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// הוספת מאזיני לחיצה לכרטיסי המודעות
document.addEventListener('DOMContentLoaded', () => {
    const announcementCards = document.querySelectorAll('.announcement-card');
    announcementCards.forEach(card => {
        card.addEventListener('click', () => {
            const image = card.querySelector('.announcement-image');
            if (image) {
                openImageModal(image.src);
            }
        });
    });
}); 
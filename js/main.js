// שימוש בקונפיגורציה המרכזית
// const API_URL = CONFIG.api.url; // הסרתי את זה כי זה כבר מוגדר ב-config.js

// קאש לנתונים - הועבר ל-common.js
// const cache = {
//     questions: null,
//     branches: null
// };

function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

// מצב טעינה מינימלי לאלמנטים ספציפיים
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

async function fetchFromAPI(action, method = 'GET', data = null) {
    if (typeof readCache === 'function') {
        const cached = await readCache(action, data);
        if (cached) return cached;
    }
    const jsonResponse = await requestAppsScript(action, data);
    if (jsonResponse && jsonResponse.error) throw new Error(jsonResponse.error);
    return jsonResponse;
}

async function testAppScriptConnection() {
    showLoading();
    try {
        const result = await fetchFromAPI('testConnection');
        console.log('תוצאת בדיקת החיבור:', result);
        if (result && result.status === 'success') {
            console.log('גיליונות קיימים:', result.sheets);
            return true;
        }
        console.error('שגיאה:', result.message);
        return false;
    } catch (error) {
        console.error('שגיאה בבדיקת החיבור:', error);
        if (error.message.includes('Failed to fetch')) {
            showModal({
                title: 'שגיאת חיבור',
                message: 'לא ניתן להתחבר לשרת. אנא בדוק את החיבור לאינטרנט.',
                icon: 'wifi_off'
            });
        } else {
            showModal({
                title: 'שגיאת מערכת',
                message: 'אירעה שגיאה בהתחברות למערכת. אנא נסה שוב מאוחר יותר.',
                icon: 'error'
            });
        }
        return false;
    } finally {
        hideLoading();
    }
}

// פונקציה לטעינת נתונים ברקע
async function preloadData() {
    try {
        // טעינה מקבילית של שאלות וסניפים
        const [questionsResponse, branchesResponse] = await Promise.all([
            fetchFromAPI('getQuestions'),
            fetchFromAPI('getBranches')
        ]);

        cache.questions = questionsResponse.data;
        cache.branches = branchesResponse.data;
        
        return true;
    } catch (error) {
        console.error('שגיאה בטעינת נתונים מקדימה:', error);
        return false;
    }
}

// אתחול בטעינת הדף
document.addEventListener('DOMContentLoaded', () => {
    // אתחול מצב לילה
    initDarkMode();
    
    // טעינת נתונים מקדימה
    preloadData();
    
    // בדיקת חיבור לשרת
    testAppScriptConnection();
});

// מעקב אחר גלילת העמוד
window.addEventListener('scroll', () => {
    document.body.classList.toggle('scrolled', window.scrollY > 50);
}); 
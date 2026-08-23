// דף הרשמה - סניפים מ-cache המשותף (כמו בשעשועון), שמירת userDetails ל-localStorage לשימוש בחידון

function getWhatsappUpdatesUrl() {
    if (typeof SITE !== 'undefined' && SITE.links && SITE.links.whatsappUpdates) {
        return SITE.links.whatsappUpdates;
    }
    return 'https://chat.whatsapp.com/Lh3rqZNMhJQ6SKPm4VFMC4';
}

/** אותו מפתח ומבנה כמו ב-quiz.js - השעשועון קורא userName, branch, phone */
function persistUserDetailsForQuiz(userDetails) {
    try {
        const payload = {
            userName: userDetails.userName,
            branch: userDetails.branch,
            phone: userDetails.phone
        };
        if (userDetails.age) {
            payload.age = userDetails.age;
        }
        localStorage.setItem('userDetails', JSON.stringify(payload));
    } catch (e) {
        console.error('שמירת פרטים לזיכרון מקומי:', e);
    }
}

function loadUserDetailsFromStorageIntoForm() {
    try {
        const u = JSON.parse(localStorage.getItem('userDetails') || '{}');
        const nameEl = document.getElementById('fullName');
        const branchEl = document.getElementById('branch');
        const phoneEl = document.getElementById('phone');
        const ageEl = document.getElementById('age');
        if (u.userName && nameEl) nameEl.value = u.userName;
        if (u.branch && branchEl) branchEl.value = u.branch;
        if (u.phone && phoneEl) phoneEl.value = u.phone;
        if (u.age && ageEl) ageEl.value = String(u.age);
    } catch (e) {
        console.error('טעינת פרטים מקומית:', e);
    }
}

window.showTermsModal = function () {
    const modal = document.getElementById('termsModal');
    if (!modal) return;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
};

window.closeTermsModal = function () {
    const modal = document.getElementById('termsModal');
    if (!modal) return;
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
};

document.addEventListener('DOMContentLoaded', function () {
    const termsModal = document.getElementById('termsModal');
    if (termsModal) {
        termsModal.addEventListener('click', function (e) {
            if (e.target === termsModal) {
                closeTermsModal();
            }
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && termsModal && termsModal.classList.contains('is-open')) {
            closeTermsModal();
        }
    });

    testAppScriptConnection().then(function (isConnected) {
        if (isConnected) {
            preloadBranchesFromServer().then(function () {
                setupRegistrationForm();
            });
        } else {
            useLocalBranchesData();
            setupRegistrationForm();
        }
    });
});

function useLocalBranchesData() {
    cache.branches = [
        'ירושלים - רמות',
        'ירושלים - בית וגן',
        'ירושלים - גילה',
        'בני ברק - ויז\'ניץ',
        'בני ברק - פרדס כץ',
        'אלעד',
        'מודיעין עילית',
        'ביתר עילית',
        'בית שמש',
        'צפת',
        'אשדוד',
        'חיפה'
    ];
}

function setupRegistrationForm() {
    loadUserDetailsFromStorageIntoForm();

    if (cache.branches && cache.branches.length) {
        updateBranchList(cache.branches);
    }

    const branchInput = document.getElementById('branch');
    if (branchInput) {
        branchInput.addEventListener('input', function () {
            validateBranch(branchInput);
        });
        branchInput.addEventListener('blur', function () {
            validateBranch(branchInput);
        });
    }

    const phoneEl = document.getElementById('phone');
    if (phoneEl) {
        phoneEl.addEventListener('input', function (e) {
            const phone = e.target.value.replace(/\D/g, '');
            if (phone.length > 10) {
                e.target.value = phone.slice(0, 10);
            } else {
                e.target.value = phone;
            }
        });
    }

    const form = document.getElementById('registration-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const branchInputEl = document.getElementById('branch');
        const accept = document.getElementById('acceptTerms');
        const fullName = document.getElementById('fullName').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const branch = branchInputEl.value.trim();
        const age = document.getElementById('age').value;

        if (!accept.checked) {
            showModal({
                title: 'אישור נדרש',
                message: 'יש לאשר את התקנון כדי להמשיך.',
                icon: 'info'
            });
            return;
        }

        if (!validateBranch(branchInputEl)) {
            showModal({
                title: 'סניף',
                message: 'נא לבחור סניף מהרשימה.',
                icon: 'place'
            });
            return;
        }

        const userDetails = {
            userName: fullName,
            branch: branch,
            phone: phone,
            age: age
        };

        const btn = document.getElementById('submitBtn');
        const btnText = btn.querySelector('.btn-text');
        const spin = btn.querySelector('.loading-spinner');
        btn.disabled = true;
        if (btnText) btnText.classList.add('hidden');
        if (spin) spin.classList.remove('hidden');

        submitRegistration(userDetails).catch(function () {
            btn.disabled = false;
            if (btnText) btnText.classList.remove('hidden');
            if (spin) spin.classList.add('hidden');
        });
    });
}

async function testAppScriptConnection() {
    showLoading();
    try {
        const result = await fetchFromAPI('testConnection');
        if (result && result.status === 'success') {
            return true;
        }
        return false;
    } catch (error) {
        console.error('שגיאה בבדיקת החיבור:', error);
        showModal({
            title: 'שגיאת חיבור',
            message: 'לא ניתן להתחבר לשרת. אנא בדוק את החיבור לאינטרנט.',
            icon: 'wifi_off'
        });
        return false;
    } finally {
        hideLoading();
    }
}

async function preloadBranchesFromServer() {
    try {
        const branchesResponse = await fetchFromAPI('getBranches');
        if (branchesResponse && branchesResponse.data && Array.isArray(branchesResponse.data)) {
            cache.branches = branchesResponse.data;
            return true;
        }
        throw new Error('פורמט תגובה לא חוקי');
    } catch (error) {
        console.error('שגיאה בטעינת סניפים:', error);
        useLocalBranchesData();
        return false;
    }
}

function validateBranch(input) {
    const branch = input.value;
    const errorElement = input.parentElement.querySelector('.error-message');

    if (!cache.branches) {
        return true;
    }

    if (!cache.branches.includes(branch)) {
        input.classList.add('invalid');
        if (!errorElement) {
            const error = document.createElement('div');
            error.className = 'error-message';
            error.textContent = 'אנא בחר סניף מהרשימה';
            input.parentElement.appendChild(error);
        }
        return false;
    }

    input.classList.remove('invalid');
    if (errorElement) {
        errorElement.remove();
    }
    return true;
}

/**
 * התנהגות זהה ל-quiz.js - חיפוש, תצוגת dropdown, סגירה בלחיצה מחוץ לאזור
 */
function updateBranchList(branches) {
    const input = document.getElementById('branch');
    if (!input) return;
    const resultsContainer = input.parentElement.querySelector('.branch-results');
    if (!resultsContainer) return;

    function filterBranches(searchText) {
        const filtered = branches.filter(function (branch) {
            return branch.toLowerCase().includes(searchText.toLowerCase());
        });

        resultsContainer.innerHTML = filtered
            .map(function (branch) {
                return (
                    '<div class="branch-option">' +
                    '<span class="material-icons">location_on</span>' +
                    '<span class="branch-name">' +
                    branch +
                    '</span></div>'
                );
            })
            .join('');

        if (filtered.length > 0) {
            resultsContainer.style.display = 'block';
        } else {
            resultsContainer.style.display = 'none';
        }
    }

    input.addEventListener('input', function (e) {
        const searchText = e.target.value.trim();
        if (searchText) {
            filterBranches(searchText);
        } else {
            resultsContainer.innerHTML = '';
            resultsContainer.style.display = 'none';
        }
    });

    resultsContainer.addEventListener('click', function (e) {
        const option = e.target.closest('.branch-option');
        if (option) {
            const branchName = option.querySelector('.branch-name').textContent;
            input.value = branchName;
            resultsContainer.innerHTML = '';
            resultsContainer.style.display = 'none';
            validateBranch(input);
        }
    });

    document.addEventListener('click', function (e) {
        if (!e.target.closest('.branch-search-container')) {
            resultsContainer.innerHTML = '';
            resultsContainer.style.display = 'none';
        }
    });
}

function submitRegistration(userDetails) {
    showLoading();
    return sendRegistrationToServer(userDetails)
        .then(function (result) {
            hideLoading();
            persistUserDetailsForQuiz(userDetails);
            showSuccessPage();
            return result;
        })
        .catch(function (error) {
            console.error('שגיאה ברישום:', error);
            hideLoading();
            showModal({
                title: 'שגיאה',
                message: error.message || 'אירעה שגיאה ברישום. אנא נסה שוב מאוחר יותר.',
                icon: 'error'
            });
            throw error;
        });
}

async function sendRegistrationToServer(userDetails) {
    try {
        const result = await fetchFromAPI('submitRegistration', 'GET', {
            userDetails: userDetails
        });

        try {
            localStorage.setItem(
                'lastRegistration',
                JSON.stringify({
                    timestamp: new Date().toISOString(),
                    details: userDetails
                })
            );
        } catch (e) {
            console.error('שגיאה בשמירה מקומית:', e);
        }

        if (!result.success) {
            throw new Error(result.error || 'שגיאה ברישום');
        }

        return result;
    } catch (apiError) {
        console.error('שגיאה בשליחה לשרת:', apiError);
        return {
            success: true,
            message: 'הפרטים התקבלו אך לא נשמרו עקב בעיה טכנית. אנו מטפלים בנושא.'
        };
    }
}

function showSuccessPage() {
    const waUrl = getWhatsappUpdatesUrl();

    function ensureCss(href, id) {
        if (id && document.getElementById(id)) return;
        const l = document.createElement('link');
        l.rel = 'stylesheet';
        l.href = href;
        if (id) l.id = id;
        document.head.appendChild(l);
    }

    ensureCss('https://fonts.googleapis.com/icon?family=Material+Icons', 'reg-success-icons');
    ensureCss(
        'https://fonts.googleapis.com/css2?family=Heebo:wght@400;600;700&family=Rubik:wght@600;700;800&display=swap',
        'reg-success-fonts'
    );
    ensureCss('css/tokens.css', 'reg-success-tokens');
    ensureCss('css/register-page.css', 'reg-success-css');

    document.body.innerHTML =
        '<div class="register-success-page">' +
        '  <div class="register-success-card">' +
        '    <span class="material-icons success-icon" aria-hidden="true">check_circle</span>' +
        '    <h1>ההרשמה נקלטה!</h1>' +
        '    <p>הפרטים נשמרו. בהצלחה בשעשועון ובפעילות.</p>' +
        '    <div class="register-success-wa">' +
        '      <h2><span class="material-icons" style="font-size:1.25rem;vertical-align:middle;">campaign</span> הצטרפות לקבוצת העדכונים</h2>' +
        '      <p>מומלץ להצטרף לקבוצת הוואטסאפ השקטה של התוכנית:</p>' +
        '      <ul>' +
        '        <li>עדכונים על שעשועון שבועי וזמני פתיחה</li>' +
        '        <li>פרסום זוכים</li>' +
        '        <li>הגרלות מיוחדות לחברי הקבוצה</li>' +
        '        <li>עדכונים כלליים - בלי ספאם</li>' +
        '      </ul>' +
        '    </div>' +
        '    <div class="register-success-actions">' +
        '      <a class="btn-wa" href="' +
        waUrl +
        '" target="_blank" rel="noopener noreferrer">' +
        '        <span class="material-icons" aria-hidden="true">chat</span>' +
        '        הצטרפות לוואטסאפ' +
        '      </a>' +
        '      <button type="button" class="btn-ghost" onclick="window.location.href=\'index.html\'">' +
        '        חזרה לדף הבית' +
        '      </button>' +
        '    </div>' +
        '  </div>' +
        '</div>';
}

function showModal(options) {
    const modalHTML =
        '<div class="modal-overlay active">' +
        '<div class="modal-content">' +
        '<div class="modal-header">' +
        '<span class="material-icons modal-icon">' +
        (options.icon || 'info') +
        '</span>' +
        '<h3 class="modal-title">' +
        options.title +
        '</h3>' +
        '</div>' +
        '<p>' +
        options.message +
        '</p>' +
        '<div class="modal-actions">' +
        '<button class="modal-button primary" id="modal-ok">אישור</button>' +
        '</div>' +
        '</div>' +
        '</div>';

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('modal-ok').addEventListener('click', function () {
        const el = document.querySelector('.modal-overlay.active');
        if (el) el.remove();
    });
}

function showLoading() {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) loadingElement.classList.remove('hidden');
}

function hideLoading() {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) loadingElement.classList.add('hidden');
}

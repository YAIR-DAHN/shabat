(function () {
    var SHEETS = 'https://docs.google.com/spreadsheets/d/1vzNdXWaZe1FKk4SFy0mWhbJ7s64zC-HAMOdMnXV52v4/edit';
    var SESSION = 'shabbat-admin-session';
    var RANK = { viewer: 1, admin: 2, super: 3 };
    var ROLE_LABEL = { super: 'סופר אדמין', admin: 'אדמין', viewer: 'צפייה', coordinator: 'רכז סניף' };
    var UPDATE_TYPES = ['עדכון רגיל', 'עדכון חשוב', 'שעשועון חדש', 'זוכים'];
    var DAY_OPTIONS = [['א', 'ראשון'], ['ב', 'שני'], ['ג', 'שלישי'], ['ד', 'רביעי'], ['ה', 'חמישי'], ['ו', 'שישי'], ['ש', 'שבת']];
    var DIR_STATUSES = ['בעניין', 'לא בעניין', 'צריך דירבון', 'לא עונה'];
    var NAV = [
        { id: 'dashboard', icon: 'insights', label: 'דשבורד' },
        { id: 'questions', icon: 'quiz', label: 'שאלות' },
        { id: 'answers', icon: 'fact_check', label: 'תשובות' },
        { id: 'participants', icon: 'groups', label: 'משתתפים' },
        { id: 'branches', icon: 'account_tree', label: 'סניפים' },
        { id: 'directory', icon: 'contacts', label: 'אלפון' },
        { id: 'registrations', icon: 'how_to_reg', label: 'נרשמים' },
        { id: 'updates', icon: 'campaign', label: 'עדכונים' },
        { id: 'winners', icon: 'emoji_events', label: 'זוכים' },
        { id: 'gallery', icon: 'photo_library', label: 'תמונות' },
        { id: 'staff', icon: 'admin_panel_settings', label: 'צוות', super: true }
    ];

    var state = {
        pin: '',
        loginName: '',
        name: '',
        role: 'viewer',
        sheetsUrl: SHEETS,
        section: 'dashboard',
        weekId: '',
        overview: null,
        branchSort: 'count',
        questions: [],
        weeks: [],
        questionWeek: '',
        answers: null,
        answerSource: 'all',
        answerQuery: '',
        answerScore: 'all',
        dashQuery: '',
        dashMin: 1,
        prefillWinner: null,
        winnerNote: '',
        branches: [],
        branchQuery: '',
        branchShort: false,
        registrations: null,
        regQuery: '',
        regDupOnly: false,
        showAbsent: false,
        insightAttempts: null,
        insightWeek: '',
        guessesLoaded: false,
        depth: 0,
        historyReady: false,
        galleryTab: 'guesses',
        galleryFilter: 'all',
        galleryQuery: '',
        guesses: [],
        likeAudit: null,
        updates: [],
        winners: [],
        people: null,
        peopleQuery: '',
        peopleWeek: 'all',
        peopleBranch: 'all',
        peopleScore: 'all',
        peopleSort: 'recent',
        peopleWon: false,
        peopleDup: false,
        peopleOpen: '',
        staff: [],
        mine: null,
        directory: null,
        dirQuery: '',
        dirPart: 'all',
        dirDay: 'all',
        dirStatus: 'all',
        dirArea: 'all',
        dirMissingPhone: false,
        dirOpen: '',
        dirDraft: null,
        dirFocus: '',
        profileBranch: '',
        assigned: []
    };

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function can(role) {
        return (RANK[state.role] || 0) >= (RANK[role] || 1);
    }

    function shortWhen(value) {
        var match = String(value || '').match(/(\d{1,2}\/\d{1,2}\/\d{4})\s+(\d{1,2}:\d{2})/);
        if (!match) return String(value || '');
        return match[2] + ' · ' + match[1];
    }

    function prettyPhone(value) {
        var digits = String(value || '').replace(/\D/g, '');
        if (digits.length === 10) return digits.slice(0, 3) + '-' + digits.slice(3, 6) + '-' + digits.slice(6);
        return String(value || '');
    }

    function fmtScore(value) {
        if (value === null || value === undefined || value === '') return '—';
        var n = Number(value);
        if (!isFinite(n)) return '—';
        return String(Math.round(n * 10) / 10).replace(/\.0$/, '');
    }

    function scoreClass(value) {
        var n = Number(value);
        if (!isFinite(n)) return '';
        if (n >= 99.5) return 'is-perfect';
        if (n >= 80) return 'is-high';
        if (n >= 60) return 'is-mid';
        return 'is-low';
    }

    function chip(status) {
        var kind = status === 'פעיל' ? 'is-live' : status === 'טיוטה' ? 'is-draft' : 'is-archive';
        return '<span class="ap-chip ' + kind + '">' + escapeHtml(status || '') + '</span>';
    }

    function todayLabel() {
        var d = new Date();
        var day = d.getDate();
        var month = d.getMonth() + 1;
        return (day < 10 ? '0' : '') + day + '/' + (month < 10 ? '0' : '') + month + '/' + d.getFullYear();
    }

    function toast(message) {
        var box = document.getElementById('ap-toast');
        box.hidden = false;
        box.textContent = message;
        clearTimeout(toast.timer);
        toast.timer = setTimeout(function () { box.hidden = true; }, 3200);
    }

    function ask(message, okLabel) {
        var modal = document.getElementById('ap-modal');
        document.getElementById('ap-modal-text').textContent = message;
        document.getElementById('ap-modal-ok').textContent = okLabel || 'אישור';
        modal.hidden = false;
        return new Promise(function (resolve) {
            function finish(value) {
                modal.hidden = true;
                document.getElementById('ap-modal-ok').removeEventListener('click', onOk);
                document.getElementById('ap-modal-cancel').removeEventListener('click', onCancel);
                resolve(value);
            }
            function onOk() { finish(true); }
            function onCancel() { finish(false); }
            document.getElementById('ap-modal-ok').addEventListener('click', onOk);
            document.getElementById('ap-modal-cancel').addEventListener('click', onCancel);
        });
    }

    function api(action, extra) {
        var payload = { pin: state.pin };
        if (extra) {
            Object.keys(extra).forEach(function (key) { payload[key] = extra[key]; });
        }
        return fetchFromAPI(action, 'GET', payload).then(function (result) {
            if (!result || result.error === 'Invalid action') {
                throw new Error('הסקריפט בגוגל עדיין בלי פאנל הניהול. צריך לעדכן את Code.gs ולפרסם גרסה חדשה על אותה פריסה.');
            }
            if (result.error === 'needs-archive') {
                var err = new Error(result.message || 'צריך לארכב את התשובות קודם.');
                err.code = 'needs-archive';
                throw err;
            }
            if (result.error === 'unauthorized') {
                logout();
                throw new Error('הקוד לא תקף יותר.');
            }
            if (result.error === 'forbidden') throw new Error('אין הרשאה לפעולה הזו.');
            if (result.success === false || (result.error && result.success !== true)) {
                throw new Error(result.error || 'הפעולה לא הושלמה');
            }
            if (typeof invalidateSheetCache === 'function' && action !== 'adminLogin' && action !== 'adminOverview' && action !== 'coordinatorOverview' && action.indexOf('adminList') !== 0 && action.indexOf('get') !== 0) {
                invalidateSheetCache();
            }
            return result;
        });
    }

    function view(html) {
        document.getElementById('ap-view').innerHTML = html;
    }

    function paintNav() {
        var items = state.role === 'coordinator'
            ? [
                { id: 'mine', icon: 'insights', label: 'הסניף שלי' },
                { id: 'participants', icon: 'groups', label: 'משתתפים' },
                { id: 'profile', icon: 'badge', label: 'פרטי הסניף' }
            ]
            : NAV.filter(function (item) { return !item.super || state.role === 'super'; });
        document.getElementById('ap-nav').innerHTML = items.map(function (item) {
            return '<button type="button" class="ap-nav__btn' + (item.id === state.section ? ' is-on' : '') + '" data-section="' + item.id + '"><span class="material-icons">' + item.icon + '</span>' + item.label + '</button>';
        }).join('');
        document.getElementById('ap-role').textContent = ROLE_LABEL[state.role] || '';
        document.getElementById('ap-hello').textContent = 'שלום, ' + state.name;
        var note = document.querySelector('.ap-top__note');
        if (note) {
            note.textContent = state.role === 'coordinator'
                ? 'מוצגים רק הנתונים של הסניפים שמשויכים אליך.'
                : 'מה שנשמר כאן נכתב לאותו גיליון. רענון מציג גם עריכות שנעשו בשיטס.';
        }
        document.getElementById('ap-sheets').href = state.sheetsUrl || SHEETS;
        document.body.dataset.role = state.role;
    }

    function navSnapshot(section) {
        return {
            admin: true,
            section: section || state.section,
            weekId: state.weekId,
            answerQuery: state.answerQuery,
            answerScore: state.answerScore,
            galleryTab: state.galleryTab
        };
    }

    function updateBackButton() {
        var button = document.getElementById('ap-back');
        if (!button) return;
        button.disabled = state.depth < 1;
    }

    function openSection(id, options) {
        if (state.role === 'coordinator' && id !== 'mine' && id !== 'profile' && id !== 'participants') id = 'mine';
        options = options || {};
        if (!options.back) {
            var snap = navSnapshot(id);
            if (!state.historyReady || options.replace || id === state.section) {
                history.replaceState(snap, '');
                state.historyReady = true;
            } else {
                history.pushState(snap, '');
                state.depth++;
            }
        }
        state.section = id;
        paintNav();
        updateBackButton();
        view('<div class="ap-skel" aria-label="טוען"><i></i><i></i><i></i></div>');
        var job = {
            dashboard: loadDashboard,
            questions: loadQuestions,
            answers: loadAnswers,
            participants: loadParticipants,
            branches: loadBranches,
            registrations: loadRegistrations,
            updates: loadUpdates,
            winners: loadWinners,
            gallery: loadGallery,
            staff: loadStaff,
            directory: loadDirectory,
            profile: loadProfile,
            mine: loadMine
        }[id];
        if (!job) return;
        job().catch(function (error) {
            view('<p class="ap-error">' + escapeHtml(error.message || 'לא הצלחנו לטעון.') + '</p>');
        });
    }

    function reloadFromSheet() {
        if (typeof invalidateSheetCache === 'function') invalidateSheetCache();
        state.directory = null;
        state.overview = null;
        openSection(state.section, { replace: true });
        toast('הנתונים נטענים מהגיליון');
    }

    function head(title, text) {
        return '<header class="ap-head"><div><h2>' + title + '</h2>' + (text ? '<p>' + text + '</p>' : '') + '</div><button type="button" class="ap-ghost" data-refresh>רענון</button></header>';
    }

    function loadDashboard() {
        return api('adminOverview', { weekId: state.weekId }).then(function (result) {
            state.overview = result;
            state.sheetsUrl = result.sheetsUrl || state.sheetsUrl;
            if (result.selected) state.weekId = result.selected.id;
            renderDashboard();
            return loadDashExtra();
        });
    }

    function loadDashExtra() {
        var weekId = state.weekId;
        var jobs = [];
        if (!state.branches.length) {
            jobs.push(api('adminListBranches').then(function (result) {
                state.branches = result.branches || [];
            }).catch(function () {}));
        }
        if (state.insightWeek !== weekId) {
            jobs.push(api('adminListAnswers', { weekId: weekId, source: 'all' }).then(function (result) {
                state.insightWeek = weekId;
                state.insightAttempts = result.attempts || [];
            }).catch(function () {
                state.insightAttempts = [];
            }));
        }
        if (!state.guessesLoaded) {
            jobs.push(fetchFromAPI('getAiGuesses', 'GET', { pin: state.pin }).then(function (result) {
                state.guessesLoaded = true;
                if (result && result.data) state.guesses = result.data;
            }).catch(function () {
                state.guessesLoaded = true;
            }));
        }
        jobs.push(ensureDirectory());
        if (!jobs.length) return Promise.resolve();
        return Promise.all(jobs).then(function () {
            if (state.section === 'dashboard') renderDashboard();
        });
    }

    function renderDashboard() {
        var data = state.overview;
        var selected = data.selected;
        var weeks = data.weeks || [];
        if (!selected) {
            view(head('דשבורד', 'עדיין אין שבוע פעיל.') + '<p class="ap-empty">אחרי כניסה ראשונה נוצר שבוע 1. אם הגליון ריק, התחילו בהוספת שאלות.</p>');
            return;
        }
        var dist = selected.distribution || { perfect: 0, high: 0, mid: 0, low: 0 };
        var scored = dist.perfect + dist.high + dist.mid + dist.low;
        var regs = data.registrations || { total: 0, unique: 0, quiet: [], quietCount: 0 };
        var sorted = (selected.branches || []).slice().sort(function (a, b) {
            if (state.branchSort === 'avg') return b.avg - a.avg || b.count - a.count;
            return b.count - a.count || b.avg - a.avg;
        }).filter(function (branch) {
            if (state.dashMin > 1 && branch.count < state.dashMin) return false;
            return !state.dashQuery.trim() || branch.name.indexOf(state.dashQuery.trim()) !== -1;
        });
        var hardest = (selected.questions || []).slice().sort(function (a, b) { return a.rate - b.rate; })[0];
        var bars = [
            ['is-perfect', dist.perfect, '100'],
            ['is-high', dist.high, '80–99'],
            ['is-mid', dist.mid, '60–79'],
            ['is-low', dist.low, 'מתחת ל-60']
        ];
        var totalAttempts = weeks.reduce(function (sum, week) { return sum + (Number(week.count) || 0); }, 0);
        var weight = 0;
        var weighted = 0;
        weeks.forEach(function (week) {
            if (week.count && isFinite(Number(week.avg))) {
                weighted += Number(week.avg) * week.count;
                weight += week.count;
            }
        });
        var seenNames = {};
        var knownBranches = 0;
        state.branches.forEach(function (name) {
            if (seenNames[name]) return;
            seenNames[name] = true;
            knownBranches++;
        });
        var strong = strongestWeek(weeks);
        var guessStats = weekGuessStats(selected);
        var title = weekTitle(selected);
        view(
            head('דשבורד', '') +
            '<section class="ap-project"><div class="ap-project__title"><strong>מבט כללי</strong><span>כל השבועות יחד</span></div><section class="ap-stats">' +
            stat('נבחנים בחידונים', totalAttempts, weight ? 'ממוצע כללי ' + fmtScore(weighted / weight) : 'הגשות מכל השבועות', '') +
            stat('סניפים שהשתתפו', projectBranchCount(weeks, selected), knownBranches ? 'מתוך ' + knownBranches + ' ברשימה' : 'לפחות סניף אחד בכל שבוע', 'is-gold') +
            stat('נרשמים', regs.total, regs.unique + ' טלפונים שונים', 'is-rose') +
            stat('השבוע החזק', strong ? weekTitle(strong) : '—', strong ? 'ממוצע ' + fmtScore(strong.avg) + ' · ' + strong.count + ' נבחנים' : 'עדיין אין נתונים', 'is-green') +
            '</section></section>' +
            '<header class="ap-weekhead"><div><p class="ap-muted">סקירה שבועית</p><h3>הצגת נתונים של ' + escapeHtml(title) + '</h3></div><div class="ap-actions"><label class="ap-field">בחירת שבוע<select id="ap-dash-week">' +
            weeks.map(function (week) {
                return '<option value="' + escapeHtml(week.id) + '"' + (week.id === selected.id ? ' selected' : '') + '>' + escapeHtml(week.name) + '</option>';
            }).join('') +
            '</select></label>' + chip(selected.status) +
            (selected.topic ? '<span class="ap-muted">' + escapeHtml(selected.topic) + '</span>' : '') +
            '<span class="ap-muted">' + selected.liveCount + ' בגיליון הפתוח · ' + selected.archiveCount + ' בארכיון</span></div></header>' +
            '<section class="ap-stats ap-stats--five">' +
            stat('נבחנים', selected.attempts, 'מתוך ' + selected.questionCount + ' שאלות', '') +
            stat('ממוצע', fmtScore(selected.avg), 'השבוע', 'is-gold') +
            stat('ציון מלא', selected.perfect, selected.attempts ? Math.round(selected.perfect / selected.attempts * 100) + '% מהנבחנים' : 'אין נבחנים', 'is-green') +
            stat('סניפים', selected.branches.length, knownBranches ? 'מתוך ' + knownBranches + ' ברשימה' : 'השתתפו השבוע', 'is-rose') +
            '<article class="ap-stat"><span>חידת התמונה</span><strong>' + (guessStats.ready ? guessStats.guesses : '…') + '</strong><span>' + (guessStats.ready ? guessStats.images + ' תמונות פתוחות' : 'טוען ניחושים') + '</span><button type="button" class="ap-ghost ap-mini" data-open-gallery>לניחושים וללייקים</button></article>' +
            '</section>' +
            directoryDashNote() +
            '<div class="ap-pair is-board">' +
            '<section class="ap-card"><div class="ap-actions"><strong>סניפים</strong><input id="ap-dash-branch" placeholder="חיפוש סניף" value="' + escapeHtml(state.dashQuery) + '"><button type="button" class="ap-ghost' + (state.branchSort === 'count' ? ' is-on' : '') + '" data-sort="count">לפי כמות</button><button type="button" class="ap-ghost' + (state.branchSort === 'avg' ? ' is-on' : '') + '" data-sort="avg">לפי ממוצע</button><button type="button" class="ap-ghost' + (state.dashMin >= 5 ? ' is-on' : '') + '" data-min="5">לפחות 5</button></div>' +
            '<p class="ap-muted">לחיצה על שורה פותחת את התשובות של הסניף.</p>' +
            (sorted.length ? '<div class="ap-table-wrap"><table class="ap-table"><thead><tr><th>סניף</th><th>נבחנים</th><th>ממוצע</th><th>100</th><th>מתחת ל-60</th></tr></thead><tbody>' +
            sorted.map(function (branch) {
                return '<tr data-branch-jump="' + escapeHtml(branch.name) + '"><td>' + escapeHtml(branch.name) + branchDirectoryHint(branch.name) + '</td><td>' + branch.count + '</td><td><span class="ap-score ' + scoreClass(branch.avg) + '">' + fmtScore(branch.avg) + '</span> <span class="ap-meter"><span style="width:' + Math.max(0, Math.min(100, branch.avg)) + '%"></span></span></td><td>' + branch.perfect + '</td><td>' + branch.low + '</td></tr>';
            }).join('') + '</tbody></table></div>' : '<p>' + ((selected.branches || []).length ? 'אין סניפים שמתאימים לסינון.' : 'עדיין אין תשובות.') + '</p>') +
            '</section>' +
            '<section class="ap-card"><strong>שאלות</strong>' +
            (hardest ? '<p>הכי קשה: ' + escapeHtml(hardest.question) + '</p>' : '') +
            ((selected.questions || []).length ? '<ol class="ap-qstats">' + selected.questions.map(function (q, index) {
                return '<li><span>' + (index + 1) + '. ' + escapeHtml(q.question) + '</span><b class="ap-score ' + scoreClass(q.rate) + '">' + fmtScore(q.rate) + '%</b><span class="ap-meter"><span style="width:' + Math.max(0, Math.min(100, q.rate)) + '%"></span></span><span class="ap-muted">' + q.correctCount + '/' + q.total + '</span></li>';
            }).join('') + '</ol>' : '<p>אין שאלות משויכות לשבוע.</p>') +
            '</section></div>' +
            '<section class="ap-card"><strong>התפלגות ציונים</strong>' +
            (scored ? '<div class="ap-bar">' + bars.map(function (bar) {
                return '<i class="' + bar[0] + '" style="width:' + (bar[1] / scored * 100) + '%"></i>';
            }).join('') + '</div><div class="ap-legend">' + bars.map(function (bar) {
                return '<span><b>' + bar[1] + '</b> ' + bar[2] + '</span>';
            }).join('') + '</div>' : '<p>עדיין אין ציונים בשבוע הזה.</p>') +
            (selected.duplicatePhones ? '<p>יש ' + selected.duplicatePhones + ' טלפונים שהגישו יותר מפעם אחת.</p>' : '') +
            '<div class="ap-actions"><button type="button" class="ap-ghost" data-open-answers="100">ציון מלא, לבחירת זוכים</button><button type="button" class="ap-ghost" data-open-answers="low">מתחת ל-60</button>' +
            (selected.duplicatePhones ? '<button type="button" class="ap-ghost" data-open-answers="dup">כפולים</button>' : '') +
            '</div></section>' +
            '<div class="ap-pair">' +
            insightBlock(selected, weeks) +
            hoursSection() +
            '<section class="ap-card"><strong>השוואת שבועות</strong><div class="ap-table-wrap"><table class="ap-table"><thead><tr><th>שבוע</th><th>סטטוס</th><th>נבחנים</th><th>ממוצע</th></tr></thead><tbody>' +
            weeks.map(function (week) {
                return '<tr><td>' + escapeHtml(weekTitle(week)) + '</td><td>' + chip(week.status) + '</td><td>' + week.count + '</td><td class="ap-score ' + scoreClass(week.avg) + '">' + fmtScore(week.avg) + '</td></tr>';
            }).join('') + '</tbody></table></div></section>' +
            '<section class="ap-card"><strong>הגשות אחרונות</strong>' +
            ((selected.recent || []).length ? '<ul class="ap-feed">' + selected.recent.map(function (row, index) {
                return '<li><span class="ap-person"><strong>' + escapeHtml(row.name) + '</strong><span class="ap-muted">' + escapeHtml(row.branch) + '</span></span><b class="ap-score ' + scoreClass(row.score) + '">' + fmtScore(row.score) + '</b><span class="ap-phone">' + escapeHtml(prettyPhone(row.phone)) + '</span><button type="button" class="ap-ghost ap-mini ap-edit" data-recent-winner="' + index + '">לזוכים</button></li>';
            }).join('') + '</ul>' : '<p>אין הגשות.</p>') +
            '</section>' +
            '<section class="ap-card ap-span"><strong>נרשמו ועדיין לא נבחנו</strong><p>' + (regs.quietCount || 0) + ' סניפים עם רישום ובלי תשובה בשבוע המוצג.</p>' +
            ((regs.quiet || []).length ? '<div class="ap-chips">' + regs.quiet.map(function (row) {
                return '<button type="button" data-quiet="' + escapeHtml(row.name) + '">' + escapeHtml(row.name) + ' · ' + row.count + '</button>';
            }).join('') + '</div>' : '<p>כל הסניפים שנרשמו כבר נבחנו, או שעדיין אין רישום.</p>') +
            '</section></div>' +
            '<section class="ap-card"><div class="ap-status"><strong>החידון באתר</strong>' + quizStatusChip(data.quizOpen) + '</div><p>' + quizText(data.quizOpen) + '</p><div class="ap-actions ap-edit">' +
            (data.quizOpen === true ? '' : '<button type="button" class="ap-primary" data-quiz="true">פתיחת החידון</button>') +
            (data.quizOpen === false ? '' : '<button type="button" class="ap-ghost" data-quiz="false">סגירת החידון</button>') +
            '</div>' +
            (selected.status === 'פעיל' ? '<details class="ap-advanced ap-edit"><summary>ארכוב תשובות</summary><p class="ap-help">הארכוב מעתיק את גיליון התשובות לגיליון «ארכיון תשובות» ומרוקן אותו. השאלות נשארות באוויר עד שמפרסמים שבוע אחר.</p><button type="button" class="ap-danger" data-archive>ארכוב וניקוי הגיליון</button></details>' : '') +
            '</section>'
        );
    }

    function stat(label, value, hint, kind) {
        return '<article class="ap-stat ' + kind + '"><span>' + label + '</span><strong>' + escapeHtml(value) + '</strong><span>' + escapeHtml(hint) + '</span></article>';
    }

    function quizText(open) {
        if (open === true) return 'הנערים יכולים להיכנס לחידון.';
        if (open === false) return 'הנערים רואים שהחידון סגור.';
        return 'עדיין לא נבחר כאן. עד אז האתר ממשיך לפי ההגדרה בקובץ.';
    }

    function quizStatusChip(open) {
        if (open === true) return '<span class="ap-chip is-live">פתוח</span>';
        if (open === false) return '<span class="ap-chip is-archive">סגור</span>';
        return '<span class="ap-chip">לפי הקובץ</span>';
    }

    function parseSheetDate(value) {
        var match = String(value || '').match(/(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
        if (!match) return null;
        return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]), Number(match[4] || 0), Number(match[5] || 0));
    }

    function trendPhrase(diff, unit) {
        var amount = Math.round(Math.abs(diff) * 10) / 10;
        var text = String(amount).replace(/\.0$/, '');
        if (amount < 0.05) return '<span>בלי שינוי ב' + unit + '</span>';
        if (diff > 0) return '<span class="ap-up">עלייה של ' + text + ' ב' + unit + '</span>';
        return '<span class="ap-down">ירידה של ' + text + ' ב' + unit + '</span>';
    }

    function previousWeek(weeks, selectedId) {
        var index = -1;
        weeks.forEach(function (week, i) {
            if (week.id === selectedId) index = i;
        });
        return index > 0 ? weeks[index - 1] : null;
    }

    function duplicatePlan(attempts) {
        var groups = {};
        (attempts || []).forEach(function (row) {
            if (row.source === 'archive') return;
            var phone = String(row.phone || '').replace(/\D/g, '');
            if (!phone) return;
            groups[phone] = (groups[phone] || 0) + 1;
        });
        var remove = 0;
        var phones = 0;
        Object.keys(groups).forEach(function (phone) {
            if (groups[phone] > 1) {
                phones++;
                remove += groups[phone] - 1;
            }
        });
        return { phones: phones, remove: remove };
    }

    function activityStats(attempts) {
        var hours = {};
        var days = {};
        var dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
        var dated = 0;
        (attempts || []).forEach(function (row) {
            var when = parseSheetDate(row.date);
            if (!when) return;
            dated++;
            var hour = when.getHours();
            var day = when.getDay();
            hours[hour] = (hours[hour] || 0) + 1;
            days[day] = (days[day] || 0) + 1;
        });
        function bars(map, label) {
            var keys = Object.keys(map).map(Number).sort(function (a, b) { return a - b; });
            var peak = keys.slice().sort(function (a, b) { return map[b] - map[a]; })[0];
            var max = peak === undefined ? 0 : map[peak];
            return {
                peak: peak,
                max: max,
                html: keys.map(function (key) {
                    var width = max ? Math.round(map[key] / max * 100) : 0;
                    return '<div><span>' + label(key) + '</span><i' + (key === peak ? ' class="is-peak"' : '') + '><span style="width:' + width + '%"></span></i><b>' + map[key] + '</b></div>';
                }).join('')
            };
        }
        return {
            dated: dated,
            hours: bars(hours, function (hour) { return (hour < 10 ? '0' : '') + hour + ':00'; }),
            days: bars(days, function (day) { return dayNames[day]; })
        };
    }

    function insightBlock(selected, weeks) {
        var prev = previousWeek(weeks, selected.id);
        var trend = prev
            ? '<p>' + trendPhrase(selected.avg - prev.avg, 'ממוצע') + ' · ' + trendPhrase(selected.attempts - prev.count, 'נבחנים') + ' מול ' + escapeHtml(prev.name) + '</p>'
            : '<p class="ap-muted">ההשוואה לשבוע הקודם תופיע כשיהיה שבוע שני: ממוצע ומספר נבחנים, עלייה או ירידה.</p>';
        var participated = {};
        (selected.branches || []).forEach(function (branch) { participated[branch.name] = true; });
        var seenBranch = {};
        var branchList = [];
        state.branches.forEach(function (name) {
            if (seenBranch[name]) return;
            seenBranch[name] = true;
            branchList.push(name);
        });
        var absent = branchList.filter(function (name) { return !participated[name]; });
        var known = branchList.length;
        var participation = known
            ? '<p>' + selected.branches.length + ' סניפים נבחנו מתוך ' + known + ' ברשימה.</p>'
            : '<p class="ap-muted">טוען את רשימת הסניפים...</p>';
        var absentButton = '';
        var absentList = '';
        if (known) {
            absentButton = '<button type="button" class="ap-ghost' + (state.showAbsent ? ' is-on' : '') + '" data-absent>' + (state.showAbsent ? 'הסתרת סניפים שלא נבחנו' : 'סניפים שלא נבחנו') + ' · ' + absent.length + '</button>';
            if (state.showAbsent) {
                absentList = absent.length
                    ? '<div class="ap-chips ap-absent">' + absent.map(function (name) {
                        return '<span>' + escapeHtml(name) + '</span>';
                    }).join('') + '</div>'
                    : '<p>כל הסניפים שברשימה נבחנו השבוע.</p>';
            }
        }
        var plan = state.insightAttempts ? duplicatePlan(state.insightAttempts) : null;
        var dup = '';
        if (selected.duplicatePhones) {
            dup = '<p>' + selected.duplicatePhones + ' טלפונים הגישו יותר מפעם אחת' + (plan ? '. ניקוי ימחק ' + plan.remove + ' שורות מהגיליון הפתוח וישאיר לכל טלפון את הציון הגבוה' : '') + '.</p>' +
                '<button type="button" class="ap-danger ap-edit" data-clear-dup>ניקוי כפילויות</button>';
        }
        return '<section class="ap-card"><strong>מגמת השתתפות</strong>' + trend + participation +
            '<div class="ap-actions">' + absentButton + '</div>' + absentList + dup + '</section>';
    }

    function hoursSection() {
        if (!state.insightAttempts) return '<section class="ap-card"><strong>שעות פעילות</strong><p class="ap-muted">מחשב שעות פעילות...</p></section>';
        var stats = activityStats(state.insightAttempts);
        if (!stats.dated) return '<section class="ap-card"><strong>שעות פעילות</strong><p class="ap-muted">אין שעה שמורה על ההגשות.</p></section>';
        var peakHour = stats.hours.peak;
        var peakDay = stats.days.peak;
        var dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
        return '<section class="ap-card"><strong>שעות פעילות</strong><p>שיא: ' + (peakHour < 10 ? '0' : '') + peakHour + ':00 · ' + stats.hours.max + ' הגשות. היום העמוס: יום ' + dayNames[peakDay] + ' · ' + stats.days.max + '.</p>' +
            '<div class="ap-hours">' + stats.hours.html + '</div><p class="ap-muted">לפי יום</p><div class="ap-hours">' + stats.days.html + '</div></section>';
    }

    function weekTitle(week) {
        var words = ['', 'ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שביעי', 'שמיני', 'תשיעי', 'עשירי', 'אחד עשר', 'שנים עשר'];
        var match = String(week && (week.name || week.id) || '').match(/(\d+)/);
        var n = match ? Number(match[1]) : 0;
        if (words[n]) return 'שבוע ' + words[n];
        return (week && week.name) || 'השבוע';
    }

    function weekGuessStats(week) {
        var match = String(week && (week.name || week.id) || '').match(/(\d+)/);
        var n = match ? String(Number(match[1])) : '';
        var guesses = (state.guesses || []).filter(function (guess) {
            if (!n) return false;
            return String(guess.week) === n || String(guess.imageId || '').indexOf('week' + n + '-') === 0;
        });
        var images = galleryImages().filter(function (image) { return String(image.week) === n; });
        return { guesses: guesses.length, images: images.length, ready: !!state.guessesLoaded };
    }

    function projectBranchCount(weeks, selected) {
        var names = {};
        var named = false;
        (weeks || []).forEach(function (week) {
            if (!week.branchNames) return;
            named = true;
            week.branchNames.forEach(function (name) { if (name) names[name] = true; });
        });
        if (!named && selected) (selected.branches || []).forEach(function (branch) { names[branch.name] = true; });
        return Object.keys(names).length;
    }

    function strongestWeek(weeks) {
        var pool = (weeks || []).filter(function (week) { return week.count > 0; });
        if (!pool.length) return null;
        return pool.slice().sort(function (a, b) {
            if ((a.count >= 5) !== (b.count >= 5)) return (b.count >= 5) - (a.count >= 5);
            return b.avg - a.avg || b.count - a.count;
        })[0];
    }

    function loadQuestions() {
        return api('adminListQuestions').then(function (result) {
            state.weeks = result.weeks || [];
            state.questions = (result.questions || []).map(function (q) {
                q.clientKey = q.id;
                return q;
            });
            if (!state.questionWeek) {
                var active = state.weeks.filter(function (week) { return week.status === 'פעיל'; })[0];
                state.questionWeek = active ? active.id : (state.weeks[0] ? state.weeks[0].id : '');
            }
            renderQuestions();
        });
    }

    function renderQuestions() {
        var week = state.weeks.filter(function (item) { return item.id === state.questionWeek; })[0];
        var list = state.questions.filter(function (q) { return q.weekId === state.questionWeek; });
        var unassigned = state.questions.filter(function (q) { return !q.weekId; }).length;
        var lock = can('admin') ? '' : ' disabled';
        view(
            head('שאלות החידון', 'מספר השאלות יכול להשתנות משבוע לשבוע, וכל שאלה יכולה להיות עם 3 או 4 אפשרויות. רק שבוע אחד פעיל באתר.') +
            '<div class="ap-weeks">' + (unassigned ? '<button type="button" class="ap-week' + (state.questionWeek === '' ? ' is-on' : '') + '" data-week=""><strong>בלי שבוע</strong><span>' + unassigned + ' שאלות</span></button>' : '') + state.weeks.map(function (item) {
                var count = state.questions.filter(function (q) { return q.weekId === item.id; }).length;
                return '<button type="button" class="ap-week' + (item.id === state.questionWeek ? ' is-on' : '') + '" data-week="' + escapeHtml(item.id) + '"><strong>' + escapeHtml(item.name) + '</strong><span>' + chip(item.status) + ' · ' + count + ' שאלות</span></button>';
            }).join('') + '</div>' +
            (week ? '<section class="ap-card ap-weekbar"><label class="ap-field">שם השבוע<input id="ap-week-name" value="' + escapeHtml(week.name) + '" maxlength="40"' + lock + '></label><label class="ap-field">נושא<input id="ap-week-topic" value="' + escapeHtml(week.topic) + '" maxlength="80" placeholder="למשל: לחם משנה"' + lock + '></label><label class="ap-field ap-check ap-span"><input id="ap-week-opening-show" type="checkbox"' + (week.openingShow ? ' checked' : '') + lock + '> הצג הודעה בתחילת החידון</label><label class="ap-field ap-span">הודעת פתיחה<textarea id="ap-week-opening" maxlength="600" rows="3" placeholder="מוצגת רק אם הסימון למעלה דולק"' + lock + '>' + escapeHtml(week.openingText || '') + '</textarea></label><label class="ap-field ap-span">הודעת סיום<textarea id="ap-week-closing" maxlength="600" rows="3" placeholder="מוצגת אחרי שהתשובות נקלטו. שורה חדשה נשמרת."' + lock + '>' + escapeHtml(week.closingText || '') + '</textarea></label><div class="ap-actions ap-edit"><button type="button" class="ap-ghost" data-rename-week>שמירת השבוע</button>' +
            (week.status !== 'פעיל' ? '<button type="button" class="ap-primary" data-publish>פרסום השבוע באתר</button>' : '<span class="ap-chip is-live">השבוע באוויר</span>') +
            '<button type="button" class="ap-ghost" data-duplicate>שכפול לטיוטה</button>' +
            (week.status === 'טיוטה' ? '<button type="button" class="ap-danger" data-delete-week>מחיקת הטיוטה</button>' : '') +
            '<button type="button" class="ap-primary" data-add-question>שאלה חדשה</button><button type="button" class="ap-ghost" data-new-week>שבוע חדש</button></div></section>' : '<div class="ap-actions ap-edit" style="margin-bottom:12px"><button type="button" class="ap-primary" data-add-question>שאלה חדשה</button><button type="button" class="ap-ghost" data-new-week>שבוע חדש</button></div>') +
            (unassigned ? '<p class="ap-error">יש ' + unassigned + ' שאלות בלי שיוך לשבוע. הן לא ייכנסו לחידון עד שמשייכים אותן.</p>' : '') +
            (list.length ? list.map(questionCard).join('') : '<p class="ap-empty">אין שאלות בשבוע הזה.</p>') +
            '<p class="ap-help">אפשר גם לערוך בגיליון «שאלות»: עמודה «פעיל» קובעת מה הנערים רואים, ועמודה «שבוע» משייכת לשבוע. פרסום מכאן מסמן פעילות רק לשאלות של השבוע שנבחר.</p>'
        );
    }

    function questionCard(q, index) {
        var lock = can('admin') ? '' : ' disabled';
        var options = (q.options && q.options.length ? q.options : ['', '', '']).slice(0, 4);
        var open = q.type === 'פתוחה';
        return '<article class="ap-q" data-key="' + escapeHtml(q.clientKey) + '"><div class="ap-q__top"><div><strong>שאלה ' + (index + 1) + '</strong>' +
            (q.correctAnswer ? '<span class="ap-muted">התשובה הנכונה: ' + escapeHtml(q.correctAnswer) + '</span>' : '<span class="ap-muted">עדיין אין תשובה מסומנת</span>') +
            '</div><div class="ap-actions"><button type="button" class="ap-ghost ap-mini ap-edit" data-move="up">למעלה</button><button type="button" class="ap-ghost ap-mini ap-edit" data-move="down">למטה</button></div></div>' +
            '<label class="ap-field">נוסח<textarea name="question"' + lock + '>' + escapeHtml(q.question || '') + '</textarea></label>' +
            '<div class="ap-fields"><label class="ap-field">סוג<select name="type"' + lock + '><option value="אמריקאי"' + (open ? '' : ' selected') + '>אמריקאי</option><option value="פתוחה"' + (open ? ' selected' : '') + '>פתוחה</option></select></label>' +
            '<label class="ap-field">שבוע<select name="week"' + lock + '>' + (q.weekId ? '' : '<option value="">בחירת שבוע</option>') + state.weeks.map(function (week) {
                return '<option value="' + escapeHtml(week.id) + '"' + (week.id === q.weekId ? ' selected' : '') + '>' + escapeHtml(week.name) + '</option>';
            }).join('') + '</select></label></div>' +
            (open ? '<label class="ap-field">תשובה לציון<input name="openCorrect" value="' + escapeHtml(q.correctAnswer || '') + '"' + lock + '></label>' :
                '<div class="ap-options">' + options.map(function (option, i) {
                    var checked = option && option === q.correctAnswer ? ' checked' : '';
                    return '<div class="ap-option"><input type="radio" name="correct-' + escapeHtml(q.clientKey) + '" value="' + i + '"' + checked + lock + '><input name="option" type="text" value="' + escapeHtml(option) + '" placeholder="אפשרות ' + (i + 1) + '"' + lock + '>' +
                    (options.length > 2 ? '<button type="button" class="ap-ghost ap-mini ap-edit" data-remove-option="' + i + '">הסרה</button>' : '<span></span>') + '</div>';
                }).join('') + (options.length < 4 ? '<button type="button" class="ap-ghost ap-mini ap-edit" data-add-option>אפשרות נוספת</button>' : '') + '</div>') +
            '<div class="ap-actions ap-edit"><button type="button" class="ap-primary" data-save-question>' + (q.id ? 'שמירה' : 'הוספה לחידון') + '</button>' +
            (q.id ? '<button type="button" class="ap-danger" data-delete-question>מחיקה</button>' : '<button type="button" class="ap-ghost" data-discard>ביטול</button>') +
            '</div></article>';
    }

    function findQuestion(key) {
        for (var i = 0; i < state.questions.length; i++) {
            if (state.questions[i].clientKey === key) return state.questions[i];
        }
        return null;
    }

    function flushCard(card) {
        var q = findQuestion(card.getAttribute('data-key'));
        if (!q) return null;
        q.question = card.querySelector('[name=question]').value;
        q.type = card.querySelector('[name=type]').value;
        q.weekId = card.querySelector('[name=week]').value;
        if (q.type === 'פתוחה') {
            var openInput = card.querySelector('[name=openCorrect]');
            q.options = [];
            q.correctAnswer = openInput ? openInput.value.trim() : q.correctAnswer;
        } else {
            var raw = Array.prototype.map.call(card.querySelectorAll('[name=option]'), function (input) {
                return input.value.trim();
            });
            q.options = raw;
            var marked = card.querySelector('input[type=radio]:checked');
            q.correctAnswer = marked ? (raw[Number(marked.value)] || '') : '';
        }
        return q;
    }

    function payloadQuestion(q) {
        return {
            id: q.id || '',
            weekId: q.weekId,
            question: String(q.question || '').trim(),
            type: q.type || 'אמריקאי',
            options: (q.options || []).map(function (option) { return String(option || '').trim(); }).filter(Boolean),
            correctAnswer: String(q.correctAnswer || '').trim()
        };
    }

    function loadParticipants() {
        return api('adminListParticipants').then(function (result) {
            state.people = result;
            renderParticipants();
        });
    }

    function peopleStamp(value) {
        var match = String(value || '').match(/(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
        if (!match) return 0;
        return Date.UTC(Number(match[3]), Number(match[2]) - 1, Number(match[1]), Number(match[4] || 0), Number(match[5] || 0));
    }

    function weekQuizzes(person) {
        if (state.peopleWeek === 'all') return person.quizzes || [];
        return (person.quizzes || []).filter(function (quiz) {
            return String(quiz.id) === String(state.peopleWeek);
        });
    }

    function weekScore(person) {
        var scores = weekQuizzes(person).map(function (quiz) { return Number(quiz.score); }).filter(function (score) {
            return isFinite(score);
        });
        if (!scores.length) return null;
        return Math.max.apply(null, scores);
    }

    function filteredPeople() {
        var pack = state.people || { participants: [] };
        var query = state.peopleQuery.trim();
        var rows = (pack.participants || []).filter(function (person) {
            if (state.peopleWeek !== 'all' && !weekQuizzes(person).length) return false;
            if (state.peopleBranch !== 'all' && (person.branches || [person.branch]).indexOf(state.peopleBranch) === -1) return false;
            if (state.peopleWon && !person.won) return false;
            if (state.peopleDup && !person.duplicate) return false;
            var score = state.peopleWeek === 'all' ? Number(person.avg) : weekScore(person);
            if (state.peopleScore === 'perfect' && !(isFinite(score) && score >= 99.5)) return false;
            if (state.peopleScore === 'high' && !(isFinite(score) && score >= 80)) return false;
            if (state.peopleScore === 'low' && !(isFinite(score) && score < 60)) return false;
            if (!query) return true;
            var haystack = [person.name, person.phone, String(person.phone || '').replace(/\D/g, ''), person.branch, (person.branches || []).join(' '), person.coordinator, person.city, person.area, person.prizes].join(' ');
            return haystack.indexOf(query) !== -1;
        });
        rows.sort(function (a, b) {
            if (state.peopleSort === 'name') return String(a.name).localeCompare(String(b.name), 'he');
            if (state.peopleSort === 'avg') return (Number(b.avg) || -1) - (Number(a.avg) || -1);
            if (state.peopleSort === 'weeks') return b.weeks - a.weeks || (Number(b.avg) || 0) - (Number(a.avg) || 0);
            if (state.peopleSort === 'best') return (Number(b.best) || -1) - (Number(a.best) || -1);
            return peopleStamp(b.lastDate) - peopleStamp(a.lastDate);
        });
        return rows;
    }

    function peopleMeta(rows) {
        var scores = rows.map(function (person) {
            return state.peopleWeek === 'all' ? Number(person.avg) : weekScore(person);
        }).filter(function (score) { return isFinite(score); });
        var sum = scores.reduce(function (total, score) { return total + score; }, 0);
        var avg = scores.length ? fmtScore(sum / scores.length) : '—';
        var perfect = scores.filter(function (score) { return score >= 99.5; }).length;
        var winners = rows.filter(function (person) { return person.won; }).length;
        return '<span><b>' + rows.length + '</b> משתתפים</span><span><b>' + avg + '</b> ממוצע</span><span><b>' + perfect + '</b> ציון מלא</span><span><b>' + winners + '</b> זוכים</span>';
    }

    function peopleRows(rows) {
        if (!rows.length) return '<tr><td class="ap-empty" colspan="10">אין משתתפים לפי הסינון הזה.</td></tr>';
        return rows.map(function (person) {
            var open = state.peopleOpen === person.id;
            var quizzes = person.quizzes || [];
            var shownScore = state.peopleWeek === 'all' ? person.avg : weekScore(person);
            var detail = quizzes.map(function (quiz) {
                return '<li><strong>' + escapeHtml(quiz.name) + '</strong><b class="ap-score ' + scoreClass(quiz.score) + '">' + fmtScore(quiz.score) + '</b><span>' + escapeHtml(quiz.date || '') + '</span><span>' + escapeHtml(quiz.branch || '') + '</span>' + (quiz.duplicate ? '<em>כפול</em>' : '') + '</li>';
            }).join('');
            return '<tr class="ap-person-row' + (open ? ' is-open' : '') + '" data-person="' + escapeHtml(person.id) + '">' +
                '<td><strong>' + escapeHtml(person.name) + '</strong>' + (person.duplicate ? '<em class="ap-person-flag">כפול</em>' : '') + (person.registered ? '<em class="ap-person-flag is-reg">נרשם</em>' : '') + '</td>' +
                '<td class="ap-phone">' + escapeHtml(prettyPhone(person.phone) || '—') + '</td>' +
                '<td>' + escapeHtml(person.branch || '—') + (person.branches && person.branches.length > 1 ? '<span class="ap-muted"> +' + (person.branches.length - 1) + '</span>' : '') + '</td>' +
                '<td>' + escapeHtml(person.coordinator || '—') + (person.city ? '<span class="ap-muted"> · ' + escapeHtml(person.city) + '</span>' : '') + '</td>' +
                '<td>' + person.weeks + '</td>' +
                '<td><b class="ap-score ' + scoreClass(shownScore) + '">' + fmtScore(shownScore) + '</b></td>' +
                '<td>' + fmtScore(person.best) + '</td>' +
                '<td>' + fmtScore(person.lastScore) + '</td>' +
                '<td>' + escapeHtml(shortWhen(person.lastDate) || '—') + '</td>' +
                '<td>' + (person.won ? escapeHtml(person.prizes || 'זכה') : '—') + '</td>' +
                '</tr>' +
                (open ? '<tr class="ap-person-more"><td colspan="10"><ul>' + detail + '</ul>' +
                    (person.coordinatorPhone ? '<p>טלפון רכז: <span class="ap-phone">' + escapeHtml(prettyPhone(person.coordinatorPhone)) + '</span></p>' : '') +
                    (person.area ? '<p>אזור: ' + escapeHtml(person.area) + '</p>' : '') +
                    '</td></tr>' : '');
        }).join('');
    }

    function renderParticipants() {
        var pack = state.people || { weeks: [], branches: [], participants: [] };
        var rows = filteredPeople();
        var weeks = (pack.weeks || []).slice().sort(function (a, b) {
            var an = parseInt(a.id, 10);
            var bn = parseInt(b.id, 10);
            if (isFinite(an) && isFinite(bn) && an !== bn) return an - bn;
            return String(a.name).localeCompare(String(b.name), 'he');
        });
        view(head('משתתפים', 'כל נער שהגיש חידון. אותו טלפון נספר פעם אחת, גם אם השתתף בכמה שבועות. לחיצה על שורה פותחת את הפירוט.') +
            '<div class="ap-people-meta" id="ap-people-meta">' + peopleMeta(rows) + '</div>' +
            '<div class="ap-search ap-people-filters">' +
            '<input id="ap-people-query" placeholder="חיפוש שם, טלפון, סניף או רכז" value="' + escapeHtml(state.peopleQuery) + '">' +
            '<select id="ap-people-week"><option value="all">כל החידונים</option>' + weeks.map(function (week) {
                return '<option value="' + escapeHtml(week.id) + '"' + (String(state.peopleWeek) === String(week.id) ? ' selected' : '') + '>' + escapeHtml(week.name) + '</option>';
            }).join('') + '</select>' +
            '<select id="ap-people-branch"><option value="all">כל הסניפים</option>' + (pack.branches || []).map(function (name) {
                return '<option value="' + escapeHtml(name) + '"' + (state.peopleBranch === name ? ' selected' : '') + '>' + escapeHtml(name) + '</option>';
            }).join('') + '</select>' +
            '<select id="ap-people-score"><option value="all">כל הציונים</option><option value="perfect">ציון מלא</option><option value="high">80 ומעלה</option><option value="low">מתחת ל-60</option></select>' +
            '<select id="ap-people-sort"><option value="recent">לפי תאריך</option><option value="name">לפי שם</option><option value="avg">לפי ממוצע</option><option value="weeks">לפי מספר חידונים</option><option value="best">לפי ציון גבוה</option></select>' +
            '<label class="ap-check"><input id="ap-people-won" type="checkbox"' + (state.peopleWon ? ' checked' : '') + '> רק זוכים</label>' +
            '<label class="ap-check"><input id="ap-people-dup" type="checkbox"' + (state.peopleDup ? ' checked' : '') + '> רק כפילויות</label>' +
            '<button type="button" class="ap-primary" data-export="participants">ייצוא לאקסל</button>' +
            '</div>' +
            '<div class="ap-table-wrap ap-people"><table class="ap-table"><thead><tr><th>שם</th><th>טלפון</th><th>סניף</th><th>רכז</th><th>חידונים</th><th>' + (state.peopleWeek === 'all' ? 'ממוצע' : 'ציון בחידון') + '</th><th>גבוה</th><th>אחרון</th><th>תאריך</th><th>זכייה</th></tr></thead><tbody id="ap-people-body">' +
            peopleRows(rows) + '</tbody></table></div>');
        ['ap-people-score', 'ap-people-sort'].forEach(function (id) {
            var box = document.getElementById(id);
            if (!box) return;
            box.value = id === 'ap-people-score' ? state.peopleScore : state.peopleSort;
        });
    }

    function exportParticipants() {
        var rows = filteredPeople();
        var weekName = 'כל-החידונים';
        if (state.peopleWeek !== 'all' && state.people) {
            (state.people.weeks || []).forEach(function (week) {
                if (String(week.id) === String(state.peopleWeek)) weekName = week.name;
            });
        }
        var header = ['שם', 'טלפון', 'סניף', 'סניפים נוספים', 'רכז', 'טלפון רכז', 'עיר', 'אזור', 'מספר חידונים', 'הגשות', 'ממוצע', 'ציון גבוה', 'ציון אחרון', 'תאריך אחרון'];
        if (state.peopleWeek !== 'all') header.push('ציון בחידון הנבחר');
        header.push('פירוט חידונים', 'זכייה', 'פרסים', 'כפילות באותו חידון', 'נרשם באתר');
        var table = [header].concat(rows.map(function (person) {
            var extra = (person.branches || []).filter(function (name) { return name !== person.branch; }).join(', ');
            var detail = (person.quizzes || []).map(function (quiz) {
                return quiz.name + ': ' + fmtScore(quiz.score) + (quiz.date ? ' (' + quiz.date + ')' : '') + (quiz.duplicate ? ' כפול' : '');
            }).join(' | ');
            var line = [
                person.name,
                prettyPhone(person.phone),
                person.branch,
                extra,
                person.coordinator,
                prettyPhone(person.coordinatorPhone),
                person.city,
                person.area,
                person.weeks,
                person.attempts,
                fmtScore(person.avg),
                fmtScore(person.best),
                fmtScore(person.lastScore),
                person.lastDate
            ];
            if (state.peopleWeek !== 'all') line.push(fmtScore(weekScore(person)));
            line.push(detail, person.won ? 'כן' : 'לא', person.prizes, person.duplicate ? 'כן' : 'לא', person.registered ? 'כן' : 'לא');
            return line;
        }));
        downloadExcel('משתתפים-' + String(weekName).replace(/[\\/:*?"<>|]/g, '-') + '.xls', table);
        toast('הקובץ ירד עם ' + rows.length + ' שורות, לפי הסינון שעל המסך');
    }

    function loadAnswers() {
        return api('adminListAnswers', { weekId: state.weekId, source: state.answerSource }).then(function (result) {
            state.answers = result;
            if (result.week) state.weekId = result.week.id;
            renderAnswers();
            return ensureDirectory().then(function () {
                if (state.section === 'answers') renderAnswers();
            });
        });
    }

    function phoneCounts(attempts) {
        var counts = {};
        (attempts || []).forEach(function (row) {
            var phone = String(row.phone || '').replace(/\D/g, '');
            if (phone) counts[phone] = (counts[phone] || 0) + 1;
        });
        return counts;
    }

    function filteredAnswers() {
        var data = state.answers || { attempts: [] };
        var counts = phoneCounts(data.attempts);
        var query = state.answerQuery.trim();
        return data.attempts.slice().reverse().filter(function (row) {
            var phone = String(row.phone || '').replace(/\D/g, '');
            row.duplicate = !!(phone && counts[phone] > 1);
            if (state.answerScore === 'dup' && !row.duplicate) return false;
            if (state.answerScore === '100' && !(Number(row.score) >= 99.5)) return false;
            if (state.answerScore === 'low' && !(Number(row.score) < 60)) return false;
            if (query && (row.name + ' ' + row.branch + ' ' + row.phone + ' ' + prettyPhone(row.phone)).indexOf(query) === -1) return false;
            return true;
        });
    }

    function answerListHtml(rows, questions) {
        return rows.length ? rows.map(function (row) {
            return answerCard(row, questions || []);
        }).join('') : '<p class="ap-empty">אין תשובות להצגה.</p>';
    }

    function renderAnswers() {
        var data = state.answers || { attempts: [], questions: [], week: {} };
        var rows = filteredAnswers();
        var filters = [
            ['all', 'הכל'],
            ['100', 'ציון מלא'],
            ['low', 'מתחת ל-60'],
            ['dup', 'כפולים']
        ];
        view(
            head('תשובות', 'החדשות למעלה. תשובה ירוקה נכונה, ואדומה לא. מכאן אפשר להעביר נבחן לרשימת הזוכים.') +
            '<div class="ap-search"><select id="ap-answer-source"><option value="all">הכול</option><option value="live">גיליון פתוח</option><option value="archive">ארכיון</option></select><input id="ap-answer-query" placeholder="חיפוש שם, סניף או טלפון" value="' + escapeHtml(state.answerQuery) + '"><button type="button" class="ap-ghost" data-copy-names>העתקת הרשימה</button><button type="button" class="ap-ghost" data-export="answers">ייצוא</button><button type="button" class="ap-ghost" data-export-image>שמור כתמונה</button></div>' +
            answersDirectoryHtml() +
            '<div class="ap-actions">' + filters.map(function (item) {
                return '<button type="button" class="ap-ghost' + (state.answerScore === item[0] ? ' is-on' : '') + '" data-score="' + item[0] + '">' + item[1] + '</button>';
            }).join('') + (duplicatePlan(data.attempts || []).remove ? '<button type="button" class="ap-danger ap-edit" data-clear-dup>ניקוי כפילויות</button>' : '') + '</div>' +
            '<p class="ap-muted" id="ap-answer-count">' + escapeHtml(answerMeta(rows)) + ' · לחיצה על שורה פותחת את התשובות</p>' +
            '<div class="ap-roster" id="ap-answer-list">' + answerListHtml(rows, data.questions) + '</div>'
        );
        var source = document.getElementById('ap-answer-source');
        if (source) source.value = state.answerSource;
    }

    function answerMeta(rows) {
        var data = state.answers || {};
        return ((data.week && data.week.name) || '') + ' · ' + rows.length + ' שורות · ' + (data.liveCount || 0) + ' פתוחות · ' + (data.archiveCount || 0) + ' בארכיון';
    }

    function answerCard(row, questions) {
        var items = (row.answers || []).map(function (answer, index) {
            var correct = questions[index] && questions[index].correctAnswer;
            var good = correct && String(answer || '').trim() === String(correct).trim();
            return '<li class="' + (good ? 'is-right' : 'is-wrong') + '">' + escapeHtml(answer || 'ללא מענה') + (good || !correct ? '' : ' · הנכון: ' + escapeHtml(correct)) + '</li>';
        }).join('');
        return '<article class="ap-roster__row" data-toggle-answer><strong>' + escapeHtml(row.name) + (row.duplicate ? ' · כפול' : '') + '</strong><span>' + escapeHtml(row.branch) + '</span><b class="ap-score ' + scoreClass(row.score) + '">' + fmtScore(row.score) + '</b><span class="ap-muted">' + escapeHtml(shortWhen(row.date)) + '</span><button type="button" class="ap-ghost ap-mini ap-edit" data-make-winner data-name="' + escapeHtml(row.name) + '" data-branch="' + escapeHtml(row.branch) + '" data-phone="' + escapeHtml(prettyPhone(row.phone)) + '" data-dup="' + (row.duplicate ? '1' : '') + '">לזוכים</button><div class="ap-roster__more" hidden><p class="ap-phone">' + escapeHtml(prettyPhone(row.phone)) + ' · ' + (row.source === 'archive' ? 'ארכיון' : 'גיליון פתוח') + '</p><ol>' + items + '</ol></div></article>';
    }

    function loadBranches() {
        return api('adminListBranches').then(function (result) {
            state.branches = result.branches || [];
            renderBranches();
        });
    }

    function shortBranch(name) {
        return String(name || '').trim().length <= 3;
    }

    function renderBranches() {
        var query = state.branchQuery.trim();
        var shortCount = state.branches.filter(shortBranch).length;
        var rows = state.branches.filter(function (name) {
            if (state.branchShort && !shortBranch(name)) return false;
            return !query || name.indexOf(query) !== -1;
        });
        view(
            head('סניפים', 'הרשימה הזו מופיעה בטופס החידון ובהרשמה. שינוי שם לא משנה תשובות שכבר נשמרו.') +
            '<div class="ap-toolbar"><form class="ap-edit" id="ap-add-branch"><input name="name" placeholder="שם סניף חדש" maxlength="60" required><button class="ap-primary" type="submit">הוספה</button></form>' +
            '<input id="ap-branch-query" placeholder="חיפוש סניף" value="' + escapeHtml(query) + '">' +
            '<button type="button" class="ap-ghost' + (state.branchShort ? ' is-on' : '') + '" data-short>שמות קצרים' + (shortCount ? ' · ' + shortCount : '') + '</button>' +
            '<span class="ap-muted">' + rows.length + ' מתוך ' + state.branches.length + '</span></div>' +
            '<div class="ap-list" id="ap-branch-list">' + (rows.length ? rows.map(function (name) {
                var short = shortBranch(name);
                return '<article class="ap-branch' + (short ? ' is-odd' : '') + '"><span>' + escapeHtml(name) + (short ? ' <span class="ap-chip">קצר</span>' : '') + '</span><span class="ap-actions ap-edit"><button type="button" class="ap-ghost ap-mini" data-rename-branch="' + escapeHtml(name) + '">שינוי שם</button><button type="button" class="ap-danger ap-mini" data-delete-branch="' + escapeHtml(name) + '">מחיקה</button></span></article>';
            }).join('') : '<p class="ap-empty">אין סניפים שמתאימים לסינון.</p>') + '</div>'
        );
    }

    function loadRegistrations() {
        return api('adminListRegistrations').then(function (result) {
            state.registrations = result;
            renderRegistrations();
        });
    }

    function filteredRegistrations() {
        var data = state.registrations || { registrations: [] };
        var query = state.regQuery.trim();
        return data.registrations.slice().reverse().filter(function (row) {
            if (state.regDupOnly && !row.duplicate) return false;
            if (!query) return true;
            return (row.name + ' ' + row.branch + ' ' + row.phone + ' ' + prettyPhone(row.phone)).indexOf(query) !== -1;
        });
    }

    function renderRegistrations() {
        var data = state.registrations || { registrations: [], total: 0, unique: 0 };
        var query = state.regQuery.trim();
        var rows = filteredRegistrations();
        view(
            head('נרשמים', data.total + ' רשומות · ' + data.unique + ' טלפונים שונים. החדשים למעלה, וטלפון כפול מסומן.') +
            '<div class="ap-search"><input id="ap-reg-query" placeholder="חיפוש שם, סניף או טלפון" value="' + escapeHtml(query) + '"><button type="button" class="ap-ghost' + (state.regDupOnly ? ' is-on' : '') + '" data-reg-dup>כפולים בלבד</button><button type="button" class="ap-ghost" data-export="registrations">ייצוא</button></div>' +
            '<p class="ap-muted" id="ap-reg-count">' + rows.length + ' שורות מוצגות</p>' +
            '<div class="ap-table-wrap"><table class="ap-table"><thead><tr><th>תאריך</th><th>שם</th><th>סניף</th><th>טלפון</th></tr></thead><tbody>' +
            rows.map(function (row) {
                return '<tr><td>' + escapeHtml(row.date) + '</td><td>' + escapeHtml(row.name) + (row.duplicate ? ' · כפול' : '') + '</td><td>' + escapeHtml(row.branch) + '</td><td dir="ltr">' + escapeHtml(prettyPhone(row.phone)) + '</td></tr>';
            }).join('') + '</tbody></table></div>'
        );
    }

    function loadUpdates() {
        return api('adminListUpdates').then(function (result) {
            state.updates = result.updates || [];
            state.updateDraft = { row: '', date: todayLabel(), title: '', content: '', type: 'עדכון רגיל' };
            renderUpdates();
        });
    }

    function renderUpdates() {
        var draft = state.updateDraft;
        view(
            head('עדכוני האתר', 'עדכון חדש נשמר בתחתית הגיליון ומופיע בראש האתר.') +
            '<form class="ap-card ap-edit" id="ap-update-form"><div class="ap-fields"><label class="ap-field">תאריך<input name="date" value="' + escapeHtml(draft.date) + '" maxlength="30"></label><label class="ap-field">סוג<select name="type">' +
            UPDATE_TYPES.map(function (type) {
                return '<option' + (type === draft.type ? ' selected' : '') + '>' + type + '</option>';
            }).join('') + '</select></label><label class="ap-field ap-span">כותרת<input name="title" value="' + escapeHtml(draft.title) + '" maxlength="80" required></label><label class="ap-field ap-span">תוכן<textarea name="content" maxlength="1800">' + escapeHtml(draft.content) + '</textarea></label></div><input type="hidden" name="row" value="' + escapeHtml(draft.row) + '"><button class="ap-primary" type="submit">' + (draft.row ? 'עדכון' : 'פרסום עדכון') + '</button></form>' +
            '<div class="ap-list">' + (state.updates.length ? state.updates.map(function (update) {
                return '<article class="ap-update"><header><div><strong>' + escapeHtml(update.title) + '</strong><p>' + escapeHtml(update.date) + ' · ' + escapeHtml(update.type) + '</p></div><span class="ap-actions ap-edit"><button type="button" class="ap-ghost" data-edit-update="' + update.row + '">עריכה</button><button type="button" class="ap-danger" data-delete-update="' + update.row + '" data-title="' + escapeHtml(update.title) + '">מחיקה</button></span></header><p>' + escapeHtml(update.content) + '</p></article>';
            }).join('') : '<p class="ap-empty">אין עדכונים בגיליון.</p>') + '</div>'
        );
    }

    function loadWinners() {
        return Promise.all([api('adminListWinners'), state.branches.length ? Promise.resolve({ branches: state.branches }) : api('adminListBranches')]).then(function (results) {
            state.winners = results[0].winners || [];
            state.branches = results[1].branches || state.branches;
            if (!state.prefillWinner) state.winnerNote = '';
            state.winnerDraft = state.prefillWinner || { row: '', name: '', branch: '', prize: '', quiz: '', date: todayLabel(), phone: '' };
            state.prefillWinner = null;
            renderWinners();
        });
    }

    function renderWinners() {
        var draft = state.winnerDraft;
        view(
            head('זוכים', 'הרשימה מופיעה בדף הזוכים. הטלפון נשמר בגיליון ולא מוצג לנערים. הסדר כאן הוא הסדר באתר.') +
            (state.winnerNote ? '<p class="ap-error">' + escapeHtml(state.winnerNote) + '</p>' : '') +
            '<form class="ap-card ap-edit" id="ap-winner-form"><div class="ap-fields"><label class="ap-field">שם<input name="name" value="' + escapeHtml(draft.name) + '" required maxlength="60"></label><label class="ap-field">סניף<input name="branch" list="ap-branch-list-data" value="' + escapeHtml(draft.branch) + '" maxlength="60"></label><label class="ap-field">פרס<input name="prize" value="' + escapeHtml(draft.prize) + '" maxlength="80"></label><label class="ap-field">חידון<input name="quiz" value="' + escapeHtml(draft.quiz) + '" maxlength="80"></label><label class="ap-field">תאריך<input name="date" value="' + escapeHtml(draft.date) + '" maxlength="30"></label><label class="ap-field">טלפון לניהול<input name="phone" value="' + escapeHtml(draft.phone) + '" maxlength="20"></label></div><input type="hidden" name="row" value="' + escapeHtml(draft.row) + '"><button class="ap-primary" type="submit">' + (draft.row ? 'עדכון זוכה' : 'הוספת זוכה') + '</button></form>' +
            '<datalist id="ap-branch-list-data">' + state.branches.map(function (name) { return '<option value="' + escapeHtml(name) + '">'; }).join('') + '</datalist>' +
            '<div class="ap-list">' + (state.winners.length ? state.winners.map(function (winner, index) {
                return '<article class="ap-branch"><div><strong>' + escapeHtml(winner.name) + '</strong><p>' + escapeHtml(winner.branch) + (winner.prize ? ' · ' + escapeHtml(winner.prize) : '') + (winner.quiz ? ' · ' + escapeHtml(winner.quiz) : '') + '</p></div><span class="ap-actions ap-edit"><button type="button" class="ap-ghost" data-move-winner="up" data-row="' + winner.row + '"' + (index === 0 ? ' disabled' : '') + '>למעלה</button><button type="button" class="ap-ghost" data-move-winner="down" data-row="' + winner.row + '"' + (index === state.winners.length - 1 ? ' disabled' : '') + '>למטה</button><button type="button" class="ap-ghost" data-edit-winner="' + winner.row + '">עריכה</button><button type="button" class="ap-danger" data-delete-winner="' + winner.row + '">מחיקה</button></span></article>';
            }).join('') : '<p class="ap-empty">אין זוכים בגיליון.</p>') + '</div>'
        );
    }

    function loadStaff() {
        var branchesJob = state.branches.length ? Promise.resolve({ branches: state.branches }) : api('adminListBranches');
        return Promise.all([api('adminListStaff'), branchesJob]).then(function (results) {
            state.staff = results[0].staff || [];
            state.branches = results[1].branches || state.branches;
            state.staffDraft = { originalName: '', name: '', role: 'viewer', active: true, pin: '', branches: [] };
            renderStaff();
        });
    }

    function branchPicker(selected) {
        var chosen = {};
        (selected || []).forEach(function (name) { chosen[name] = true; });
        var names = state.branches.slice().sort(function (a, b) { return a.localeCompare(b, 'he'); });
        return '<div class="ap-field ap-span"><span>סניפים שהרכז רואה</span><input id="ap-staff-branch-query" placeholder="סינון סניפים" autocomplete="off"><div class="ap-branch-pick">' +
            names.map(function (name) {
                return '<label data-branch-option="' + escapeHtml(name) + '"><input type="checkbox" name="branches" value="' + escapeHtml(name) + '"' + (chosen[name] ? ' checked' : '') + '> ' + escapeHtml(name) + '</label>';
            }).join('') +
            '</div><p class="ap-help">אפשר לסמן כמה סניפים. הרכז נכנס עם השם והסיסמה, ורואה רק אותם.</p></div>';
    }

    function renderStaff() {
        var draft = state.staffDraft;
        view(
            head('צוות', 'סופר אדמין מנהל קודים. אדמין עורך תוכן. מורשה צפייה רואה הכול בלי לשנות. רכז סניף רואה רק את הסניפים שלו.') +
            '<form class="ap-card ap-super" id="ap-staff-form"><div class="ap-fields"><label class="ap-field">שם משתמש<input name="name" value="' + escapeHtml(draft.name) + '" required maxlength="40"></label><label class="ap-field">תפקיד<select name="role"><option value="super"' + (draft.role === 'super' ? ' selected' : '') + '>סופר אדמין</option><option value="admin"' + (draft.role === 'admin' ? ' selected' : '') + '>אדמין</option><option value="viewer"' + (draft.role === 'viewer' ? ' selected' : '') + '>צפייה</option><option value="coordinator"' + (draft.role === 'coordinator' ? ' selected' : '') + '>רכז סניף</option></select></label><label class="ap-field">סיסמה<input name="pin" type="password" placeholder="' + (draft.originalName ? 'השאירו ריק כדי לא לשנות' : 'לפחות 6 תווים') + '" maxlength="40" autocomplete="new-password"></label><label class="ap-field ap-check"><input name="active" type="checkbox"' + (draft.active ? ' checked' : '') + '> פעיל</label>' +
            (draft.role === 'coordinator' ? branchPicker(draft.branches) : '') +
            '</div><input type="hidden" name="originalName" value="' + escapeHtml(draft.originalName) + '"><button class="ap-primary" type="submit">' + (draft.originalName ? 'עדכון' : 'הוספת משתמש') + '</button></form>' +
            '<div class="ap-list">' + state.staff.map(function (user) {
                var branches = (user.branches || []).join(' · ');
                return '<article class="ap-branch"><div><strong>' + escapeHtml(user.name) + '</strong><p>' + escapeHtml(ROLE_LABEL[user.role] || user.role) + (branches ? ' · ' + escapeHtml(branches) : '') + (user.active ? '' : ' · מושבת') + '</p></div><span class="ap-actions"><button type="button" class="ap-ghost" data-edit-staff="' + escapeHtml(user.name) + '">עריכה</button><button type="button" class="ap-danger" data-delete-staff="' + escapeHtml(user.name) + '">מחיקה</button></span></article>';
            }).join('') + '</div>'
        );
    }

    function loadMine() {
        return Promise.all([
            api('coordinatorOverview', { weekId: state.weekId }),
            ensureDirectory()
        ]).then(function (results) {
            var result = results[0];
            state.mine = result;
            if (result.selected) state.weekId = result.selected.id;
            state.answers = {
                week: { name: (result.selected && result.selected.name) || 'הסניף שלי' },
                attempts: result.attempts || []
            };
            renderMine();
        }).catch(function (error) {
            if ((error.message || '').indexOf('פאנל הניהול') !== -1) {
                throw new Error('מסך הרכז יעבוד אחרי פרסום Code.gs המעודכן.');
            }
            throw error;
        });
    }

    function renderMine() {
        var data = state.mine || {};
        var selected = data.selected;
        var weeks = data.weeks || [];
        var allowed = data.branches || [];
        if (!allowed.length) {
            view(head('הסניף שלי', 'לחשבון הזה עדיין לא שויכו סניפים.') + '<p class="ap-empty">צריך שמנהל יסמן לפחות סניף אחד.</p>');
            return;
        }
        if (!selected) {
            view(head('הסניף שלי', allowed.join(' · ') || 'עדיין אין סניף משויך.') + '<p class="ap-empty">אין שבוע להצגה, או שהחשבון בלי סניפים.</p>');
            return;
        }
        var dist = selected.distribution || { perfect: 0, high: 0, mid: 0, low: 0 };
        var scored = dist.perfect + dist.high + dist.mid + dist.low;
        var bars = [
            ['is-perfect', dist.perfect, '100'],
            ['is-high', dist.high, '80–99'],
            ['is-mid', dist.mid, '60–79'],
            ['is-low', dist.low, 'מתחת ל-60']
        ];
        var attempts = data.attempts || [];
        var counts = phoneCounts(attempts);
        var duplicatePhones = 0;
        Object.keys(counts).forEach(function (phone) { if (counts[phone] > 1) duplicatePhones++; });
        attempts.forEach(function (row) {
            var phone = String(row.phone || '').replace(/\D/g, '');
            row.duplicate = !!(phone && counts[phone] > 1);
        });
        var quiet = data.quiet || [];
        view(
            head('הסניף שלי', allowed.join(' · ')) +
            '<header class="ap-weekhead"><div><p class="ap-muted">סקירה שבועית</p><h3>הצגת נתונים של ' + escapeHtml(weekTitle(selected)) + '</h3></div><div class="ap-actions"><label class="ap-field">בחירת שבוע<select id="ap-dash-week">' +
            weeks.map(function (week) {
                return '<option value="' + escapeHtml(week.id) + '"' + (week.id === selected.id ? ' selected' : '') + '>' + escapeHtml(week.name) + '</option>';
            }).join('') +
            '</select></label>' + chip(selected.status) + '</div></header>' +
            '<section class="ap-stats">' +
            stat('נבחנים', selected.attempts, 'מהסניפים שלך', '') +
            stat('ממוצע', fmtScore(selected.avg), 'השבוע', 'is-gold') +
            stat('ציון מלא', selected.perfect, selected.attempts ? Math.round(selected.perfect / selected.attempts * 100) + '% מהנבחנים' : 'אין נבחנים', 'is-green') +
            stat('נרשמו ולא נבחנו', quiet.length, 'בסניפים שלך', 'is-rose') +
            '</section>' +
            (allowed.length > 1 ? '<section class="ap-card"><strong>לפי סניף</strong><div class="ap-table-wrap"><table class="ap-table"><thead><tr><th>סניף</th><th>נבחנים</th><th>ממוצע</th><th>100</th></tr></thead><tbody>' +
            (selected.branches || []).map(function (branch) {
                return '<tr><td>' + escapeHtml(branch.name) + '</td><td>' + branch.count + '</td><td>' + fmtScore(branch.avg) + '</td><td>' + branch.perfect + '</td></tr>';
            }).join('') + '</tbody></table></div></section>' : '') +
            '<div class="ap-pair">' +
            '<section class="ap-card"><strong>התפלגות ציונים</strong>' +
            (scored ? '<div class="ap-bar">' + bars.map(function (bar) {
                return '<i class="' + bar[0] + '" style="width:' + (bar[1] / scored * 100) + '%"></i>';
            }).join('') + '</div><div class="ap-legend">' + bars.map(function (bar) {
                return '<span><b>' + bar[1] + '</b> ' + bar[2] + '</span>';
            }).join('') + '</div>' : '<p>עדיין אין ציונים בשבוע הזה.</p>') +
            (duplicatePhones ? '<p>' + duplicatePhones + ' טלפונים הגישו יותר מפעם אחת. הם מסומנים ברשימה.</p>' : '') +
            '</section>' +
            (quiet.length ? '<section class="ap-card"><strong>נרשמו ועדיין לא נבחנו</strong><div class="ap-chips">' + quiet.map(function (row) {
                return '<span>' + escapeHtml(row.name) + '</span>';
            }).join('') + '</div></section>' : '') +
            ((data.guesses || []).length ? '<section class="ap-card"><strong>חידת התמונה</strong><p>' + data.guesses.length + ' ניחושים מהסניפים שלך השבוע.</p><ul class="ap-feed">' + data.guesses.slice(0, 12).map(function (guess) {
                return '<li><span class="ap-person"><strong>' + escapeHtml(guess.name) + '</strong><span class="ap-muted">' + escapeHtml(guess.text) + '</span></span></li>';
            }).join('') + '</ul></section>' : '') +
            '</div>' +
            '<section class="ap-card"><div class="ap-actions"><strong>משתתפים</strong><button type="button" class="ap-ghost" data-export-image>שמור כתמונה</button></div>' +
            '<p class="ap-muted">' + attempts.length + ' שורות · לחיצה פותחת את התשובות</p>' +
            (attempts.length ? '<div class="ap-roster">' + attempts.map(mineRow).join('') + '</div>' : '<p>אין הגשות מהסניפים שלך בשבוע הזה.</p>') +
            '</section>'
        );
    }

    function mineRow(row) {
        var items = (row.answers || []).map(function (answer) {
            var text = typeof answer === 'string' ? answer : answer.text;
            var good = typeof answer === 'object' && answer.correct;
            return '<li class="' + (good ? 'is-right' : 'is-wrong') + '">' + escapeHtml(text || 'ללא מענה') + '</li>';
        }).join('');
        return '<article class="ap-roster__row" data-toggle-answer><strong>' + escapeHtml(row.name) + (row.duplicate ? ' · כפול' : '') + '</strong><span>' + escapeHtml(row.branch) + '</span><b class="ap-score ' + scoreClass(row.score) + '">' + fmtScore(row.score) + '</b><span class="ap-muted">' + escapeHtml(shortWhen(row.date)) + '</span><span></span><div class="ap-roster__more" hidden><p class="ap-phone">' + escapeHtml(prettyPhone(row.phone)) + '</p><ol>' + items + '</ol></div></article>';
    }

    function galleryImages() {
        return (window.AI_GALLERY && AI_GALLERY.images) || [];
    }

    function galleryImage(id) {
        return galleryImages().filter(function (image) { return image.id === id; })[0];
    }

    function loadGallery() {
        return Promise.all([
            fetchFromAPI('getAiGuesses', 'GET', { pin: state.pin }),
            fetchFromAPI('getAiLikeAudit', 'GET', { pin: state.pin }),
            typeof loadAiGallery === 'function' ? loadAiGallery() : Promise.resolve([])
        ]).then(function (results) {
            var guesses = results[0] || {};
            var likes = results[1] || {};
            if (guesses.error === 'unauthorized' || likes.error === 'unauthorized') {
                view(head('תמונות', 'ניחושים ולייקים.') + '<p class="ap-error">הקוד של הפאנל עדיין לא מורשה למסך הזה. צריך לפרסם את Code.gs המעודכן על אותה פריסה.</p>');
                return;
            }
            if (guesses.error === 'Invalid action') {
                view(head('תמונות', 'ניחושים ולייקים.') + '<p class="ap-error">הסקריפט בגוגל עדיין בלי הפעולה הזו.</p>');
                return;
            }
            state.guessesLoaded = true;
            state.guesses = guesses.data || [];
            state.likeAudit = likes.success === false ? { error: likes.error, likes: [], counts: {}, raw: {}, fixes: {} } : likes;
            renderGallery();
        });
    }

    function filteredGuesses() {
        var query = state.galleryQuery.trim();
        return (state.guesses || []).filter(function (guess) {
            if (state.galleryFilter !== 'all' && guess.imageId !== state.galleryFilter) return false;
            if (!query) return true;
            return (guess.name + ' ' + guess.branch + ' ' + guess.phone + ' ' + guess.text + ' ' + prettyPhone(guess.phone)).indexOf(query) !== -1;
        });
    }

    function likeFlags(imageId, likes) {
        var active = likes.filter(function (like) {
            return like.imageId === imageId && like.active && like.ip;
        });
        var byIp = {};
        active.forEach(function (like) {
            byIp[like.ip] = (byIp[like.ip] || 0) + 1;
        });
        var messages = [];
        Object.keys(byIp).forEach(function (ip) {
            if (byIp[ip] >= 2) messages.push((can('admin') ? 'הכתובת ' + ip + ' מופיעה ' : 'אותה כתובת מופיעה ') + byIp[ip] + ' פעמים');
        });
        var times = likes.filter(function (like) {
            return like.imageId === imageId && like.active && like.timeMs;
        }).map(function (like) { return like.timeMs; }).sort(function (a, b) { return a - b; });
        var burst = 0;
        for (var i = 0; i < times.length; i++) {
            var count = 1;
            for (var j = i + 1; j < times.length && times[j] - times[i] <= 180000; j++) count++;
            if (count > burst) burst = count;
        }
        if (burst >= 6) messages.push(burst + ' לייקים בתוך שלוש דקות');
        return messages;
    }

    function renderGallery() {
        var tab = state.galleryTab === 'manage' ? 'manage' : (state.galleryTab === 'likes' ? 'likes' : 'guesses');
        var audit = state.likeAudit || { likes: [], counts: {}, raw: {}, fixes: {} };
        var likeTotal = 0;
        Object.keys(audit.counts || {}).forEach(function (id) { likeTotal += Number(audit.counts[id]) || 0; });
        var images = galleryImages();
        var content = '';
        
        if (tab === 'manage') {
            content = typeof window.GalleryAdmin !== 'undefined' ? window.GalleryAdmin.render(state.pin) : '<p class="ap-error">מודול הניהול לא נטען</p>';
        } else if (tab === 'likes') {
            content = renderLikes(images, audit);
        } else {
            content = renderGuesses(images);
        }
        
        view(
            head('תמונות', 'הניחושים והלייקים נשמרים בגיליון. השם והטלפון לא מופיעים באתר לנערים.') +
            '<div class="ap-actions">' +
            '<button type="button" class="ap-ghost' + (tab === 'guesses' ? ' is-on' : '') + '" data-gallery-tab="guesses">ניחושים · ' + (state.guesses || []).length + '</button>' +
            '<button type="button" class="ap-ghost' + (tab === 'likes' ? ' is-on' : '') + '" data-gallery-tab="likes">לייקים · ' + likeTotal + '</button>' +
            '<button type="button" class="ap-ghost' + (tab === 'manage' ? ' is-on' : '') + '" data-gallery-tab="manage">ניהול תמונות · ' + images.length + '</button>' +
            '</div>' +
            content
        );
        
        var filter = document.getElementById('ap-gallery-filter');
        if (filter) filter.value = state.galleryFilter;
        
        // Event listeners לטאב ניהול תמונות
        if (tab === 'manage') {
            initGalleryManageListeners();
        }
    }
    
    function initGalleryManageListeners() {
        var uploadForm = document.getElementById('ap-upload-form');
        if (uploadForm) {
            uploadForm.addEventListener('submit', function (e) {
                window.GalleryAdmin.submitUploadForm(e, state.pin);
            });
        }
        
        var fileInput = document.getElementById('ap-image-file');
        if (fileInput) {
            fileInput.addEventListener('change', window.GalleryAdmin.handleFileSelect);
        }
        
        document.querySelectorAll('[data-edit]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                window.GalleryAdmin.editImage(this.getAttribute('data-edit'), state.pin);
            });
        });
        
        document.querySelectorAll('[data-delete]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                window.GalleryAdmin.deleteImage(this.getAttribute('data-delete'), state.pin);
            });
        });
    }
    
    window.reloadGalleryAdmin = function (pin) {
        if (typeof loadAiGallery === 'function') {
            window.AI_GALLERY.loaded = false;
            loadAiGallery().then(function () {
                loadGallery().then(function () {
                    renderGallery();
                });
            });
        }
    };

    function renderGuesses(images) {
        var rows = filteredGuesses();
        return '<div class="ap-search"><label class="ap-field">תמונה<select id="ap-gallery-filter"><option value="all">כל התמונות</option>' +
            images.map(function (image) {
                return '<option value="' + escapeHtml(image.id) + '">' + escapeHtml(aiWeekLabel(image.week) + ' · ' + image.id) + '</option>';
            }).join('') +
            '</select></label><input id="ap-guess-query" placeholder="חיפוש שם, סניף, טלפון או ניחוש" value="' + escapeHtml(state.galleryQuery) + '"></div>' +
            '<p class="ap-muted">' + rows.length + ' ניחושים מוצגים</p>' +
            '<div class="ap-list" id="ap-guess-list">' + (rows.length ? rows.map(guessCard).join('') : '<p class="ap-empty">אין ניחושים להצגה.</p>') + '</div>';
    }

    function guessCard(guess) {
        var image = galleryImage(guess.imageId);
        var week = guess.week && window.aiWeekLabel ? aiWeekLabel(guess.week) : '';
        return '<article class="ap-guess"><div class="ap-guess__thumb">' +
            (image ? '<img src="' + escapeHtml(image.src) + '" alt="">' : '') +
            '</div><div><p class="ap-muted">' + escapeHtml(week) + (image ? ' · ' + escapeHtml(image.id) : '') + ' · ' + escapeHtml(guess.time) + '</p><p class="ap-guess__text">' + escapeHtml(guess.text) + '</p><p>' + escapeHtml(guess.name) + ' · ' + escapeHtml(guess.branch) + '</p><p class="ap-phone">' + escapeHtml(prettyPhone(guess.phone)) + '</p></div></article>';
    }

    function renderLikes(images, audit) {
        var likes = audit.likes || [];
        var counts = audit.counts || {};
        var raw = audit.raw || {};
        var fixes = audit.fixes || {};
        var known = {};
        var rows = images.map(function (image) {
            known[image.id] = true;
            return image;
        });
        Object.keys(counts).forEach(function (id) {
            if (!known[id]) rows.push({ id: id, week: '' });
        });
        rows.sort(function (a, b) { return (counts[b.id] || 0) - (counts[a.id] || 0); });
        if (audit.error) return '<p class="ap-error">' + escapeHtml(audit.error) + '</p>';
        return '<p class="ap-muted">המספר באתר יכול להיות מתוקן. השורות בגיליון נשארות, ולייקים חדשים ממשיכים להיספר מעל התיקון. כתובת ה-IP עוזרת לראות דפוס, ואפשר גם לזייף אותה.</p>' +
            '<div class="ap-list">' + (rows.length ? rows.map(function (image) {
                return likeCard(image, likes, counts, raw, fixes);
            }).join('') : '<p class="ap-empty">עדיין אין לייקים.</p>') + '</div>';
    }

    function likeCard(image, likes, counts, raw, fixes) {
        var display = counts[image.id] || 0;
        var sheetCount = raw[image.id] || 0;
        var fix = fixes[image.id];
        var flags = likeFlags(image.id, likes);
        var mine = likes.filter(function (like) { return like.imageId === image.id; });
        var title = image.week && window.aiWeekLabel ? aiWeekLabel(image.week) + ' · ' + image.id : image.id;
        var log = mine.map(function (like) {
            return '<li class="' + (like.active ? '' : 'is-off') + '"><div><span class="ap-phone">' + escapeHtml(like.ip || 'בלי IP') + '</span> · ' + escapeHtml(like.time) + (like.active ? '' : ' · בוטל') + '</div><p class="ap-muted">' + escapeHtml(like.device || '') + (like.timeZone ? ' · ' + escapeHtml(like.timeZone) : '') + '</p></li>';
        }).join('');
        return '<article class="ap-like' + (flags.length ? ' is-hot' : '') + '"><div class="ap-like__head"><strong>' + escapeHtml(title) + '</strong><b>' + display + '</b></div>' +
            '<p class="ap-muted">בגיליון ' + sheetCount + ' לייקים פעילים' + (fix ? ' · תוקן ב-' + escapeHtml(fix.updated) : '') + (fix && fix.note ? ' · ' + escapeHtml(fix.note) : '') + '</p>' +
            flags.map(function (flag) { return '<p class="ap-down">' + escapeHtml(flag) + '</p>'; }).join('') +
            '<form class="ap-fields ap-edit ap-like-fix" data-image="' + escapeHtml(image.id) + '"><label class="ap-field">מספר באתר<input name="count" type="number" min="0" max="100000" value="' + display + '" required></label><label class="ap-field ap-span">הערה<input name="note" type="text" maxlength="120" value="' + escapeHtml(fix ? fix.note : '') + '" placeholder="למשל: אותה כתובת כמה פעמים"></label><div class="ap-actions ap-span"><button class="ap-primary" type="submit">עדכון המספר</button>' +
            (fix ? '<button type="button" class="ap-ghost" data-clear-like="' + escapeHtml(image.id) + '">חזרה לספירה מהגיליון</button>' : '') +
            '</div><p class="ap-error ap-span" data-status hidden></p></form>' +
            (mine.length && can('admin') ? '<details class="ap-advanced"><summary>פירוט ' + mine.length + ' רשומות</summary><ul class="ap-like-log">' + log + '</ul></details>' : '') +
            '</article>';
    }

    function downloadExcel(filename, rows) {
        function cell(value) {
            return '<Cell><Data ss:Type="String">' + String(value == null ? '' : value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;') + '</Data></Cell>';
        }
        var xml = '<?xml version="1.0" encoding="UTF-8"?>' +
            '<?mso-application progid="Excel.Sheet"?>' +
            '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">' +
            '<Worksheet ss:Name="משתתפים" ss:RightToLeft="1"><Table>' +
            rows.map(function (row, index) {
                return '<Row>' + row.map(cell).join('') + '</Row>';
            }).join('') +
            '</Table></Worksheet></Workbook>';
        var blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        setTimeout(function () { URL.revokeObjectURL(link.href); }, 1000);
    }

    function downloadCsv(filename, rows) {
        var csv = rows.map(function (row) {
            return row.map(function (cell) {
                return '"' + String(cell == null ? '' : cell).replace(/"/g, '""') + '"';
            }).join(',');
        }).join('\n');
        var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }

    function exportRosterImage(rows) {
        var list = rows.slice(0, 200);
        if (!list.length) {
            toast('אין שורות לתמונה');
            return;
        }
        var width = 820;
        var rowH = 34;
        var headH = 78;
        var height = headH + list.length * rowH + 24;
        var canvas = document.createElement('canvas');
        var scale = 2;
        canvas.width = width * scale;
        canvas.height = height * scale;
        var ctx = canvas.getContext('2d');
        ctx.scale(scale, scale);
        ctx.fillStyle = '#f4f7fb';
        ctx.fillRect(0, 0, width, height);
        ctx.direction = 'rtl';
        ctx.textAlign = 'right';
        ctx.fillStyle = '#12294A';
        ctx.font = '800 22px Heebo, Rubik, sans-serif';
        var weekName = (state.answers && state.answers.week && state.answers.week.name) || 'תשובות';
        var query = state.answerQuery.trim();
        ctx.fillText(query ? weekName + ' · ' + query : weekName, width - 24, 36);
        ctx.font = '600 14px Heebo, sans-serif';
        ctx.fillStyle = '#546e7a';
        ctx.fillText(list.length + ' משתתפים' + (rows.length > list.length ? ' מתוך ' + rows.length : ''), width - 24, 58);
        list.forEach(function (row, index) {
            var y = headH + index * rowH;
            ctx.fillStyle = index % 2 ? '#ffffff' : '#eef3f8';
            ctx.fillRect(16, y, width - 32, rowH - 4);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#0b1e36';
            ctx.font = '700 15px Heebo, sans-serif';
            ctx.fillText(String(row.name || '') + (row.duplicate ? ' · כפול' : ''), width - 28, y + 22);
            ctx.fillStyle = '#546e7a';
            ctx.font = '500 14px Heebo, sans-serif';
            ctx.fillText(String(row.branch || ''), width - 280, y + 22);
            ctx.textAlign = 'left';
            ctx.fillStyle = Number(row.score) >= 99.5 ? '#4B8A2B' : '#12294A';
            ctx.font = '800 15px Heebo, sans-serif';
            ctx.fillText(String(fmtScore(row.score)), 28, y + 22);
        });
        canvas.toBlob(function (blob) {
            if (!blob) {
                toast('לא הצלחנו ליצור תמונה');
                return;
            }
            var imageLink = document.createElement('a');
            imageLink.href = URL.createObjectURL(blob);
            imageLink.download = 'participants.png';
            imageLink.click();
            toast(rows.length > list.length ? 'התמונה כוללת 200 שורות. סננו סניף כדי לצלם רכז.' : 'התמונה ירדה');
        }, 'image/png');
    }

    function enterApp() {
        document.body.classList.add('is-in');
        document.getElementById('ap-gate').hidden = true;
        document.getElementById('ap-app').hidden = false;
        sessionStorage.setItem(SESSION, JSON.stringify({
            pin: state.pin,
            loginName: state.loginName,
            name: state.name,
            role: state.role,
            sheetsUrl: state.sheetsUrl
        }));
        openSection(state.section || 'dashboard');
        history.pushState(navSnapshot(state.section), '');
    }

    function logout() {
        state.pin = '';
        state.loginName = '';
        state.assigned = [];
        state.role = 'viewer';
        state.section = 'dashboard';
        sessionStorage.removeItem(SESSION);
        document.body.classList.remove('is-in');
        document.getElementById('ap-app').hidden = true;
        document.getElementById('ap-gate').hidden = false;
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.getElementById('ap-login').addEventListener('submit', function (event) {
            event.preventDefault();
            var pin = document.getElementById('ap-pin').value.trim();
            var loginName = document.getElementById('ap-user').value.trim();
            var button = event.currentTarget.querySelector('button');
            var error = document.getElementById('ap-login-error');
            error.hidden = true;
            button.disabled = true;
            fetchFromAPI('adminLogin', 'GET', { pin: pin, loginName: loginName }).then(function (result) {
                if (!result || result.error === 'Invalid action') {
                    throw new Error('הסקריפט בגוגל עדיין בלי פאנל הניהול. עדכנו את Code.gs ופרסמו גרסה חדשה על אותה פריסה.');
                }
                if (!result || result.error === 'unauthorized') throw new Error('הקוד לא נכון.');
                if (result.success === false) throw new Error(result.error || 'לא הצלחנו להיכנס.');
                state.pin = pin;
                state.loginName = loginName;
                state.name = result.name;
                state.role = result.role;
                state.sheetsUrl = result.sheetsUrl || SHEETS;
                state.assigned = result.role === 'coordinator' ? (result.branches || []) : [];
                if (result.role === 'coordinator') state.section = 'mine';
                enterApp();
            }).catch(function (err) {
                error.hidden = false;
                error.textContent = err.message || 'לא הצלחנו להיכנס.';
            }).finally(function () {
                button.disabled = false;
            });
        });

        var galleryLink = document.getElementById('ap-open-gallery');
        if (galleryLink) galleryLink.addEventListener('click', function () { openSection('gallery'); });
        var backButton = document.getElementById('ap-back');
        if (backButton) backButton.addEventListener('click', function () {
            if (state.depth > 0) history.back();
        });
        window.addEventListener('popstate', function (event) {
            if (!state.pin) return;
            var snap = event.state;
            if (!snap || !snap.admin || state.depth < 1) {
                history.pushState(navSnapshot(state.section), '');
                return;
            }
            state.depth--;
            state.weekId = snap.weekId || state.weekId;
            state.answerQuery = snap.answerQuery || '';
            state.answerScore = snap.answerScore || 'all';
            state.galleryTab = snap.galleryTab || state.galleryTab;
            openSection(snap.section || 'dashboard', { back: true });
        });

        document.getElementById('ap-nav').addEventListener('click', function (event) {
            var button = event.target.closest('[data-section]');
            if (!button) return;
            openSection(button.getAttribute('data-section'));
        });
        document.getElementById('ap-logout').addEventListener('click', logout);
        var sheetRefresh = document.getElementById('ap-sheet-refresh');
        if (sheetRefresh) sheetRefresh.addEventListener('click', reloadFromSheet);
        document.getElementById('ap-pin-open').addEventListener('click', function () {
            document.getElementById('ap-pin-modal').hidden = false;
        });
        document.getElementById('ap-pin-cancel').addEventListener('click', function () {
            document.getElementById('ap-pin-modal').hidden = true;
        });
        document.getElementById('ap-pin-modal').addEventListener('submit', function (event) {
            event.preventDefault();
            var next = event.currentTarget.elements.next.value.trim();
            var again = event.currentTarget.elements.again.value.trim();
            var error = event.currentTarget.querySelector('[data-pin-error]');
            if (next !== again) {
                error.hidden = false;
                error.textContent = 'הקודים לא זהים.';
                return;
            }
            api('adminSetOwnPin', { nextPin: next }).then(function () {
                event.currentTarget.hidden = true;
                event.currentTarget.reset();
                toast('הקוד הוחלף. בכניסה הבאה משתמשים בקוד החדש.');
            }).catch(function (err) {
                error.hidden = false;
                error.textContent = err.message;
            });
        });

        document.getElementById('ap-view').addEventListener('click', function (event) {
            var target = event.target;
            if (target.closest('[data-refresh]')) {
                reloadFromSheet();
                return;
            }
            if (target.closest('[data-add-day]') || target.closest('[data-remove-day]')) {
                onDirectoryDay(target);
                return;
            }
            var dirJump = target.closest('[data-dir-jump]');
            if (dirJump) {
                openDirectoryAt(dirJump.getAttribute('data-dir-jump'));
                return;
            }
            if (target.closest('[data-open-directory]')) {
                state.dirDay = 'today';
                state.dirPart = 'all';
                state.dirStatus = 'all';
                state.dirArea = 'all';
                state.dirMissingPhone = false;
                state.dirQuery = '';
                state.dirOpen = '';
                state.dirDraft = null;
                state.dirFocus = '';
                openSection('directory');
                return;
            }
            if (target.closest('[data-clear-dup]')) {
                clearDuplicates();
                return;
            }
            if (state.section === 'dashboard') onDashboardClick(target);
            if (state.section === 'questions') onQuestionsClick(target);
            if (target.closest('summary button')) event.preventDefault();
            if (state.section === 'answers') onAnswersClick(target);
            if (state.section === 'participants') onParticipantsClick(target);
            if (state.section === 'branches') onBranchesClick(target);
            if (state.section === 'updates') onUpdatesClick(target);
            if (state.section === 'winners') onWinnersClick(target);
            if (state.section === 'staff') onStaffClick(target);
            if (state.section === 'mine') onMineClick(target);
            if (state.section === 'registrations') onExportClick(target);
            if (state.section === 'gallery') onGalleryClick(target);
            if (state.section === 'directory') onDirectoryClick(target);
            if (state.section === 'profile') onProfileClick(target);
        });

        document.getElementById('ap-view').addEventListener('input', function (event) {
            if (event.target.id !== 'ap-staff-branch-query') return;
            var query = event.target.value.trim();
            Array.prototype.forEach.call(document.querySelectorAll('[data-branch-option]'), function (label) {
                var box = label.querySelector('input');
                var name = label.getAttribute('data-branch-option') || '';
                label.hidden = !!(query && name.indexOf(query) === -1 && !(box && box.checked));
            });
        });
        document.getElementById('ap-view').addEventListener('keydown', function (event) {
            if (event.target.id === 'ap-staff-branch-query' && event.key === 'Enter') event.preventDefault();
        });

        document.getElementById('ap-view').addEventListener('change', function (event) {
            if (event.target.id === 'ap-dash-week') {
                state.weekId = event.target.value;
                openSection(state.role === 'coordinator' ? 'mine' : 'dashboard');
            }
            if (event.target.name === 'role' && event.target.form && event.target.form.id === 'ap-staff-form') {
                captureStaffDraft(event.target.form);
                renderStaff();
            }
            if (event.target.id === 'ap-people-week' || event.target.id === 'ap-people-branch' || event.target.id === 'ap-people-score' || event.target.id === 'ap-people-sort' || event.target.id === 'ap-people-won' || event.target.id === 'ap-people-dup') {
                state.peopleWeek = document.getElementById('ap-people-week').value;
                state.peopleBranch = document.getElementById('ap-people-branch').value;
                state.peopleScore = document.getElementById('ap-people-score').value;
                state.peopleSort = document.getElementById('ap-people-sort').value;
                state.peopleWon = document.getElementById('ap-people-won').checked;
                state.peopleDup = document.getElementById('ap-people-dup').checked;
                renderParticipants();
                var focus = document.getElementById(event.target.id);
                if (focus) focus.focus();
            }
            if (event.target.id === 'ap-answer-source') {
                state.answerSource = event.target.value;
                openSection('answers');
            }
            if (event.target.id === 'ap-gallery-filter') {
                state.galleryFilter = event.target.value;
                renderGallery();
            }
            if (event.target.id === 'ap-dir-part' || event.target.id === 'ap-dir-day' || event.target.id === 'ap-dir-status' || event.target.id === 'ap-dir-area' || event.target.id === 'ap-dir-phone') {
                state.dirPart = document.getElementById('ap-dir-part').value;
                state.dirDay = document.getElementById('ap-dir-day').value;
                state.dirStatus = document.getElementById('ap-dir-status').value;
                var area = document.getElementById('ap-dir-area');
                state.dirArea = area ? area.value : 'all';
                state.dirMissingPhone = document.getElementById('ap-dir-phone').checked;
                captureDirForm();
                renderDirectory();
            }
            var card = event.target.closest('[data-key]');
            if (!card) return;
            if (event.target.name === 'type' || event.target.name === 'week') {
                var q = flushCard(card);
                if (event.target.name === 'week') state.questionWeek = q.weekId;
                renderQuestions();
            }
        });

        document.getElementById('ap-view').addEventListener('input', function (event) {
            if (event.target.id === 'ap-people-query') {
                state.peopleQuery = event.target.value;
                var peopleBody = document.getElementById('ap-people-body');
                var peopleMetaBox = document.getElementById('ap-people-meta');
                var shownPeople = filteredPeople();
                if (peopleBody) peopleBody.innerHTML = peopleRows(shownPeople);
                if (peopleMetaBox) peopleMetaBox.innerHTML = peopleMeta(shownPeople);
            }
            if (event.target.id === 'ap-answer-query') {
                state.answerQuery = event.target.value;
                var shown = filteredAnswers();
                var list = document.getElementById('ap-answer-list');
                var count = document.getElementById('ap-answer-count');
                if (list) list.innerHTML = answerListHtml(shown, (state.answers && state.answers.questions) || []);
                if (count) count.textContent = answerMeta(shown);
            }
            if (event.target.id === 'ap-dash-branch') {
                state.dashQuery = event.target.value;
                renderDashboard();
                var dashBox = document.getElementById('ap-dash-branch');
                if (dashBox) {
                    dashBox.focus();
                    dashBox.setSelectionRange(dashBox.value.length, dashBox.value.length);
                }
            }
            if (event.target.id === 'ap-dir-query') {
                state.dirQuery = event.target.value;
                captureDirForm();
                renderDirectory();
                var dirBox = document.getElementById('ap-dir-query');
                if (dirBox) {
                    dirBox.focus();
                    dirBox.setSelectionRange(dirBox.value.length, dirBox.value.length);
                }
            }
            if (event.target.id === 'ap-branch-query') {
                state.branchQuery = event.target.value;
                renderBranches();
                document.getElementById('ap-branch-query').focus();
            }
            if (event.target.id === 'ap-guess-query') {
                state.galleryQuery = event.target.value;
                var guessList = document.getElementById('ap-guess-list');
                if (guessList) {
                    var shown = filteredGuesses();
                    guessList.innerHTML = shown.length ? shown.map(guessCard).join('') : '<p class="ap-empty">אין ניחושים להצגה.</p>';
                    var guessCount = guessList.previousElementSibling;
                    if (guessCount) guessCount.textContent = shown.length + ' ניחושים מוצגים';
                }
            }
            if (event.target.id === 'ap-reg-query') {
                state.regQuery = event.target.value;
                renderRegistrations();
                var box = document.getElementById('ap-reg-query');
                if (box) {
                    box.focus();
                    box.setSelectionRange(box.value.length, box.value.length);
                }
            }
            var card = event.target.closest('[data-key]');
            if (card && event.target.name !== 'type') flushCard(card);
        });

        document.getElementById('ap-view').addEventListener('submit', function (event) {
            var form = event.target;
            if (form.id === 'ap-add-branch') {
                event.preventDefault();
                api('adminAddBranch', { name: form.elements.name.value.trim() }).then(function () {
                    toast('הסניף נוסף');
                    return loadBranches();
                }).catch(showError);
            }
            if (form.id === 'ap-update-form') {
                event.preventDefault();
                api('adminSaveUpdate', { update: {
                    row: form.elements.row.value,
                    date: form.elements.date.value.trim(),
                    title: form.elements.title.value.trim(),
                    content: form.elements.content.value.trim(),
                    type: form.elements.type.value
                } }).then(function () {
                    toast('העדכון נשמר');
                    return loadUpdates();
                }).catch(showError);
            }
            if (form.id === 'ap-winner-form') {
                event.preventDefault();
                api('adminSaveWinner', { winner: {
                    row: form.elements.row.value,
                    name: form.elements.name.value.trim(),
                    branch: form.elements.branch.value.trim(),
                    prize: form.elements.prize.value.trim(),
                    quiz: form.elements.quiz.value.trim(),
                    date: form.elements.date.value.trim(),
                    phone: form.elements.phone.value.trim()
                } }).then(function () {
                    toast('הזוכה נשמר');
                    return loadWinners();
                }).catch(showError);
            }
            if (form.classList.contains('ap-like-fix')) {
                event.preventDefault();
                var status = form.querySelector('[data-status]');
                var button = form.querySelector('button[type="submit"]');
                status.hidden = true;
                button.disabled = true;
                fetchFromAPI('setAiLikeCount', 'GET', {
                    pin: state.pin,
                    imageId: form.getAttribute('data-image'),
                    count: form.elements.count.value,
                    note: form.elements.note.value
                }).then(function (result) {
                    if (!result || result.error === 'Invalid action') throw new Error('עדכון המספר יעבוד אחרי פרסום Code.gs.');
                    if (!result || result.success === false || result.error) throw new Error((result && result.error) || 'העדכון לא נשמר.');
                    toast('מספר הלייקים עודכן');
                    return loadGallery();
                }).catch(function (err) {
                    status.hidden = false;
                    status.textContent = err.message || 'העדכון לא נשמר.';
                    button.disabled = false;
                });
            }
            if (form.classList.contains('ap-dir-form')) {
                event.preventDefault();
                var saveDir = form.querySelector('[type="submit"]');
                if (saveDir) saveDir.disabled = true;
                var branchPayload = directoryPayload(form);
                if (state.role === 'coordinator' && !coordinatorNames().some(function (name) { return normName(name) === normName(branchPayload.name); })) {
                    if (saveDir) saveDir.disabled = false;
                    showError(new Error('אפשר לערוך רק סניף שמשויך אליך.'));
                    return;
                }
                api('adminSaveDirectory', { branch: branchPayload }).then(function () {
                    toast('פרטי הסניף נשמרו');
                    state.dirDraft = null;
                    state.dirOpen = '';
                    if (state.section === 'profile') return loadProfile();
                    return loadDirectory();
                }).catch(function (err) {
                    if (saveDir) saveDir.disabled = false;
                    showError(err);
                });
            }
            if (form.id === 'ap-staff-form') {
                event.preventDefault();
                var branches = [];
                Array.prototype.forEach.call(form.querySelectorAll('input[name="branches"]:checked'), function (box) {
                    branches.push(box.value);
                });
                api('adminSaveStaff', { staff: {
                    originalName: form.elements.originalName.value,
                    name: form.elements.name.value.trim(),
                    role: form.elements.role.value,
                    pin: form.elements.pin.value.trim(),
                    active: form.elements.active.checked,
                    branches: branches
                } }).then(function () {
                    toast('איש הצוות נשמר');
                    return loadStaff();
                }).catch(showError);
            }
        });

        var saved = null;
        try { saved = JSON.parse(sessionStorage.getItem(SESSION) || 'null'); } catch (e) { saved = null; }
        if (saved && saved.pin) {
            state.pin = saved.pin;
            state.loginName = saved.loginName || '';
            state.name = saved.name;
            state.role = saved.role;
            state.sheetsUrl = saved.sheetsUrl || SHEETS;
            if (saved.role === 'coordinator') state.section = 'mine';
            api('adminLogin', { loginName: state.loginName }).then(function (result) {
                state.name = result.name;
                state.role = result.role;
                state.sheetsUrl = result.sheetsUrl || state.sheetsUrl;
                state.assigned = result.role === 'coordinator' ? (result.branches || []) : [];
                if (result.role === 'coordinator') state.section = 'mine';
                enterApp();
            }).catch(function (err) {
                logout();
                var error = document.getElementById('ap-login-error');
                error.hidden = false;
                error.textContent = err.message || 'לא הצלחנו להיכנס.';
            });
        }
    });

    function showError(error) {
        toast(error.message || 'הפעולה לא הושלמה');
    }

    function clearDuplicates() {
        var plan = duplicatePlan(state.insightAttempts || (state.answers && state.answers.attempts) || []);
        var detail = plan.remove ? ' יימחקו ' + plan.remove + ' שורות.' : '';
        ask('לכל טלפון כפול בגיליון הפתוח תישאר ההגשה עם הציון הגבוה. אם הציון זהה, תישאר המוקדמת.' + detail + ' הארכיון לא משתנה.', 'ניקוי').then(function (ok) {
            if (!ok) return;
            api('adminClearDuplicateAnswers').then(function (result) {
                toast('נמחקו ' + (result.removed || 0) + ' כפילויות');
                state.insightWeek = '';
                state.answers = null;
                return loadDashboard();
            }).catch(function (error) {
                if ((error.message || '').indexOf('פאנל הניהול') !== -1) {
                    toast('ניקוי הכפילויות יעבוד אחרי פרסום Code.gs המעודכן.');
                    return;
                }
                showError(error);
            });
        });
    }

    function onGalleryClick(target) {
        var tab = target.closest('[data-gallery-tab]');
        if (tab) {
            state.galleryTab = tab.getAttribute('data-gallery-tab');
            renderGallery();
            return;
        }
        var clear = target.closest('[data-clear-like]');
        if (!clear) return;
        clear.disabled = true;
        fetchFromAPI('setAiLikeCount', 'GET', {
            pin: state.pin,
            imageId: clear.getAttribute('data-clear-like'),
            clear: true
        }).then(function (result) {
            if (!result || result.success === false || result.error) throw new Error((result && result.error) || 'לא הצלחנו לבטל את התיקון.');
            toast('הספירה חזרה לגיליון');
            if (typeof invalidateSheetCache === 'function') invalidateSheetCache();
            return loadGallery();
        }).catch(function (err) {
            clear.disabled = false;
            showError(err);
        });
    }

    function onDashboardClick(target) {
        if (target.closest('[data-open-gallery]')) {
            openSection('gallery');
            return;
        }
        if (target.closest('[data-absent]')) {
            state.showAbsent = !state.showAbsent;
            renderDashboard();
            return;
        }
        var sort = target.closest('[data-sort]');
        if (sort) {
            state.branchSort = sort.getAttribute('data-sort');
            renderDashboard();
            return;
        }
        var quiz = target.closest('[data-quiz]');
        if (quiz) {
            api('adminSetQuizOpen', { open: quiz.getAttribute('data-quiz') === 'true' }).then(function () {
                toast('סטטוס החידון עודכן');
                return loadDashboard();
            }).catch(showError);
            return;
        }
        var branchJump = target.closest('[data-branch-jump]');
        if (branchJump) {
            state.answerScore = 'all';
            state.answerQuery = branchJump.getAttribute('data-branch-jump');
            openSection('answers');
            return;
        }
        var quiet = target.closest('[data-quiet]');
        if (quiet) {
            state.regQuery = quiet.getAttribute('data-quiet');
            state.regDupOnly = false;
            openSection('registrations');
            return;
        }
        var jump = target.closest('[data-open-answers]');
        if (jump) {
            state.answerScore = jump.getAttribute('data-open-answers');
            state.answerQuery = '';
            openSection('answers');
            return;
        }
        var min = target.closest('[data-min]');
        if (min) {
            state.dashMin = state.dashMin >= 5 ? 1 : 5;
            renderDashboard();
            return;
        }
        var recentWinner = target.closest('[data-recent-winner]');
        if (recentWinner && state.overview && state.overview.selected) {
            queueWinner(state.overview.selected.recent[Number(recentWinner.getAttribute('data-recent-winner'))], false);
            return;
        }
        if (target.closest('[data-archive]')) {
            ask('להעביר את התשובות שבגיליון הפתוח לארכיון ולרוקן אותו? השאלות באתר לא משתנות.', 'ארכוב').then(function (ok) {
                if (!ok) return;
                api('adminArchiveAnswers').then(function (result) {
                    toast('הועברו ' + (result.archived || 0) + ' תשובות לארכיון');
                    return loadDashboard();
                }).catch(showError);
            });
        }
    }

    function onQuestionsClick(target) {
        var weekBtn = target.closest('[data-week]');
        if (weekBtn) {
            state.questionWeek = weekBtn.getAttribute('data-week');
            renderQuestions();
            return;
        }
        var card = target.closest('[data-key]');
        if (target.closest('[data-add-question]')) {
            var key = 'new-' + Date.now();
            state.questions.push({ clientKey: key, id: '', weekId: state.questionWeek, question: '', type: 'אמריקאי', options: ['', '', ''], correctAnswer: '' });
            renderQuestions();
            return;
        }
        if (target.closest('[data-new-week]')) {
            api('adminCreateWeek', { name: '', topic: '' }).then(function (result) {
                state.questionWeek = result.id;
                toast('נוספה טיוטה');
                return loadQuestions();
            }).catch(showError);
            return;
        }
        if (target.closest('[data-rename-week]')) {
            api('adminUpdateWeek', {
                id: state.questionWeek,
                name: document.getElementById('ap-week-name').value.trim(),
                topic: document.getElementById('ap-week-topic').value.trim(),
                openingShow: document.getElementById('ap-week-opening-show').checked,
                openingText: document.getElementById('ap-week-opening').value.trim(),
                closingText: document.getElementById('ap-week-closing').value.trim()
            }).then(function () {
                toast('השבוע עודכן');
                return loadQuestions();
            }).catch(showError);
            return;
        }
        if (target.closest('[data-publish]')) {
            publishWeek(false);
            return;
        }
        if (target.closest('[data-duplicate]')) {
            duplicateWeek();
            return;
        }
        if (target.closest('[data-delete-week]')) {
            ask('למחוק את הטיוטה? השאלות שלה יישארו בגיליון בלי שיוך.', 'מחיקה').then(function (ok) {
                if (!ok) return;
                api('adminDeleteWeek', { id: state.questionWeek }).then(function () {
                    state.questionWeek = '';
                    return loadQuestions();
                }).catch(showError);
            });
            return;
        }
        if (!card) return;
        if (target.closest('[data-add-option]')) {
            var growing = flushCard(card);
            if (growing.options.length < 4) growing.options.push('');
            renderQuestions();
            return;
        }
        var remove = target.closest('[data-remove-option]');
        if (remove) {
            var shrinking = flushCard(card);
            shrinking.options.splice(Number(remove.getAttribute('data-remove-option')), 1);
            renderQuestions();
            return;
        }
        var move = target.closest('[data-move]');
        if (move) {
            var moving = findQuestion(card.getAttribute('data-key'));
            if (!moving || !moving.id) return;
            api('adminMoveQuestion', { id: moving.id, direction: move.getAttribute('data-move') }).then(loadQuestions).catch(showError);
            return;
        }
        if (target.closest('[data-discard]')) {
            var key = card.getAttribute('data-key');
            state.questions = state.questions.filter(function (item) { return item.clientKey !== key; });
            renderQuestions();
            return;
        }
        if (target.closest('[data-save-question]')) {
            var q = flushCard(card);
            api('adminSaveQuestion', { question: payloadQuestion(q) }).then(function () {
                toast('השאלה נשמרה');
                return loadQuestions();
            }).catch(showError);
            return;
        }
        if (target.closest('[data-delete-question]')) {
            var removing = findQuestion(card.getAttribute('data-key'));
            ask('למחוק את השאלה מהגיליון?', 'מחיקה').then(function (ok) {
                if (!ok || !removing) return;
                api('adminDeleteQuestion', { id: removing.id }).then(loadQuestions).catch(showError);
            });
        }
    }

    function publishWeek(force) {
        if (state.questions.some(function (q) { return q.weekId === state.questionWeek && !q.id; })) {
            toast('יש שאלה חדשה שעוד לא נשמרה.');
            return;
        }
        api('adminPublishWeek', { weekId: state.questionWeek, force: force }).then(function (result) {
            toast(result.archived ? 'השבוע פורסם, ו-' + result.archived + ' תשובות עברו לארכיון' : 'השבוע פורסם. החידון באתר מציג אותו עכשיו.');
            return loadQuestions();
        }).catch(function (error) {
            if (error.code === 'needs-archive') {
                ask(error.message, 'פרסום וארכוב').then(function (ok) {
                    if (ok) publishWeek(true);
                });
                return;
            }
            showError(error);
        });
    }

    function duplicateWeek() {
        var source = state.questions.filter(function (q) { return q.weekId === state.questionWeek && q.id; });
        var week = state.weeks.filter(function (item) { return item.id === state.questionWeek; })[0];
        var copyName = ((week ? week.name : 'שבוע') + ' עותק').slice(0, 40);
        api('adminCreateWeek', {
            name: copyName,
            topic: week ? week.topic : '',
            openingShow: week ? week.openingShow : false,
            openingText: week ? week.openingText : '',
            closingText: week ? week.closingText : ''
        }).then(function (created) {
            var chain = Promise.resolve();
            source.forEach(function (q) {
                chain = chain.then(function () {
                    var copy = payloadQuestion(q);
                    copy.id = '';
                    copy.weekId = created.id;
                    return api('adminSaveQuestion', { question: copy });
                });
            });
            return chain.then(function () {
                state.questionWeek = created.id;
                toast('נוצרה טיוטה עם השאלות');
                return loadQuestions();
            });
        }).catch(showError);
    }

    function queueWinner(person, duplicate) {
        if (!person) return;
        state.prefillWinner = {
            row: '',
            name: person.name || '',
            branch: person.branch || '',
            phone: prettyPhone(person.phone),
            prize: '',
            quiz: (state.overview && state.overview.selected && state.overview.selected.name) || '',
            date: todayLabel()
        };
        state.winnerNote = duplicate ? 'הטלפון הזה מופיע יותר מפעם אחת בחידון. כדאי לבדוק לפני שמפרסמים זכייה.' : '';
        openSection('winners');
    }

    function copyText(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
        var area = document.createElement('textarea');
        area.value = text;
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        area.remove();
        return Promise.resolve();
    }

    function onAnswersClick(target) {
        if (target.closest('[data-copy-names]')) {
            var lines = filteredAnswers().map(function (row) {
                return row.name + '\t' + row.branch + '\t' + prettyPhone(row.phone) + '\t' + row.score;
            });
            copyText(lines.join('\n')).then(function () {
                toast(lines.length ? 'הועתקו ' + lines.length + ' שורות' : 'אין שורות להעתקה');
            }).catch(function () { toast('לא הצלחנו להעתיק'); });
            return;
        }
        var score = target.closest('[data-score]');
        if (score) {
            state.answerScore = score.getAttribute('data-score');
            renderAnswers();
            return;
        }
        var winner = target.closest('[data-make-winner]');
        if (winner) {
            queueWinner({
                name: winner.getAttribute('data-name'),
                branch: winner.getAttribute('data-branch'),
                phone: winner.getAttribute('data-phone')
            }, winner.getAttribute('data-dup') === '1');
            return;
        }
        if (target.closest('[data-export-image]')) {
            exportRosterImage(filteredAnswers());
            return;
        }
        var rowToggle = target.closest('[data-toggle-answer]');
        if (rowToggle) {
            var more = rowToggle.querySelector('.ap-roster__more');
            if (more) {
                more.hidden = !more.hidden;
                rowToggle.classList.toggle('is-open', !more.hidden);
            }
            return;
        }
        if (!target.closest('[data-export="answers"]') || !state.answers) return;
        var questions = state.answers.questions || [];
        var header = ['תאריך', 'שם', 'סניף', 'טלפון', 'ציון', 'מקור'].concat(questions.map(function (q, i) { return 'תשובה ' + (i + 1); }));
        var rows = [header].concat(filteredAnswers().map(function (row) {
            return [row.date, row.name, row.branch, prettyPhone(row.phone), row.score, row.duplicate ? 'כפול' : (row.source === 'archive' ? 'ארכיון' : 'פתוח')].concat(row.answers || []);
        }));
        downloadCsv('answers.csv', rows);
    }

    function onBranchesClick(target) {
        if (target.closest('[data-short]')) {
            state.branchShort = !state.branchShort;
            renderBranches();
            return;
        }
        var rename = target.closest('[data-rename-branch]');
        if (rename) {
            var from = rename.getAttribute('data-rename-branch');
            var to = window.prompt('שם חדש לסניף', from);
            if (!to || to.trim() === from) return;
            api('adminRenameBranch', { from: from, to: to.trim() }).then(function () {
                toast('השם עודכן');
                return loadBranches();
            }).catch(showError);
        }
        var remove = target.closest('[data-delete-branch]');
        if (remove) {
            var name = remove.getAttribute('data-delete-branch');
            ask('להסיר את «' + name + '» מרשימת הסניפים? תשובות ישנות יישארו עם השם הקודם.', 'הסרה').then(function (ok) {
                if (!ok) return;
                api('adminDeleteBranch', { name: name }).then(loadBranches).catch(showError);
            });
        }
    }

    function onUpdatesClick(target) {
        var edit = target.closest('[data-edit-update]');
        if (edit) {
            var row = Number(edit.getAttribute('data-edit-update'));
            var update = state.updates.filter(function (item) { return item.row === row; })[0];
            if (!update) return;
            state.updateDraft = update;
            renderUpdates();
        }
        var remove = target.closest('[data-delete-update]');
        if (remove) {
            ask('למחוק את העדכון?', 'מחיקה').then(function (ok) {
                if (!ok) return;
                api('adminDeleteUpdate', { row: remove.getAttribute('data-delete-update'), title: remove.getAttribute('data-title') }).then(loadUpdates).catch(showError);
            });
        }
    }

    function onWinnersClick(target) {
        var edit = target.closest('[data-edit-winner]');
        if (edit) {
            var row = Number(edit.getAttribute('data-edit-winner'));
            var winner = state.winners.filter(function (item) { return item.row === row; })[0];
            if (!winner) return;
            state.winnerNote = '';
            state.winnerDraft = winner;
            renderWinners();
        }
        var move = target.closest('[data-move-winner]');
        if (move) {
            api('adminMoveWinner', { row: move.getAttribute('data-row'), direction: move.getAttribute('data-move-winner') }).then(loadWinners).catch(showError);
        }
        var remove = target.closest('[data-delete-winner]');
        if (remove) {
            ask('להסיר את הזוכה מדף הזוכים?', 'הסרה').then(function (ok) {
                if (!ok) return;
                api('adminDeleteWinner', { row: remove.getAttribute('data-delete-winner') }).then(loadWinners).catch(showError);
            });
        }
    }

    function captureStaffDraft(form) {
        var branches = [];
        Array.prototype.forEach.call(form.querySelectorAll('input[name="branches"]:checked'), function (box) {
            branches.push(box.value);
        });
        state.staffDraft = {
            originalName: form.elements.originalName.value,
            name: form.elements.name.value,
            role: form.elements.role.value,
            pin: form.elements.pin.value,
            active: form.elements.active.checked,
            branches: branches
        };
    }

    function onMineClick(target) {
        if (target.closest('[data-export-image]')) {
            var previous = state.answerQuery;
            state.answerQuery = ((state.mine && state.mine.branches) || []).join(' · ');
            exportRosterImage((state.mine && state.mine.attempts) || []);
            state.answerQuery = previous;
            return;
        }
        var rowToggle = target.closest('[data-toggle-answer]');
        if (!rowToggle) return;
        var more = rowToggle.querySelector('.ap-roster__more');
        if (!more) return;
        more.hidden = !more.hidden;
        rowToggle.classList.toggle('is-open', !more.hidden);
    }

    function onStaffClick(target) {
        var edit = target.closest('[data-edit-staff]');
        if (edit) {
            var name = edit.getAttribute('data-edit-staff');
            var user = state.staff.filter(function (item) { return item.name === name; })[0];
            if (!user) return;
            state.staffDraft = { originalName: user.name, name: user.name, role: user.role, active: user.active, pin: '', branches: user.branches || [] };
            renderStaff();
        }
        var remove = target.closest('[data-delete-staff]');
        if (remove) {
            ask('למחוק את המשתמש?', 'מחיקה').then(function (ok) {
                if (!ok) return;
                api('adminDeleteStaff', { name: remove.getAttribute('data-delete-staff') }).then(loadStaff).catch(showError);
            });
        }
    }

    function onParticipantsClick(target) {
        if (target.closest('[data-export="participants"]')) {
            exportParticipants();
            return;
        }
        var row = target.closest('[data-person]');
        if (!row) return;
        var id = row.getAttribute('data-person');
        state.peopleOpen = state.peopleOpen === id ? '' : id;
        var body = document.getElementById('ap-people-body');
        if (body) body.innerHTML = peopleRows(filteredPeople());
    }

    function onExportClick(target) {
        if (target.closest('[data-reg-dup]')) {
            state.regDupOnly = !state.regDupOnly;
            renderRegistrations();
            var box = document.getElementById('ap-reg-query');
            if (box) box.focus();
            return;
        }
        if (!target.closest('[data-export="registrations"]') || !state.registrations) return;
        var rows = [['תאריך', 'שם', 'סניף', 'טלפון']].concat(filteredRegistrations().map(function (row) {
            return [row.date, row.name, row.branch, prettyPhone(row.phone)];
        }));
        downloadCsv('registrations.csv', rows);
    }

    function normName(value) {
        return String(value || '').replace(/\s+/g, ' ').trim();
    }

    function ensureDirectory() {
        return api('adminListDirectory', { weekId: state.weekId }).then(function (result) {
            result.weekId = state.weekId;
            state.directory = limitDirectory(result);
            return state.directory;
        }).catch(function (error) {
            var message = error && error.message || '';
            state.directory = {
                missing: true,
                needsPublish: message.indexOf('Code.gs') !== -1 || message.indexOf('פאנל') !== -1,
                branches: [],
                error: message,
                weekId: state.weekId,
                today: '',
                todayName: ''
            };
            return state.directory;
        });
    }

    function directoryRecord(name) {
        var key = normName(name);
        var list = (state.directory && state.directory.branches) || [];
        for (var i = 0; i < list.length; i++) {
            if (normName(list[i].name) === key) return list[i];
        }
        return null;
    }

    function statusChip(status) {
        if (!status) return '';
        var kind = status === 'בעניין' ? 'is-interest' : status === 'לא בעניין' ? 'is-cold' : status === 'צריך דירבון' ? 'is-nudge' : 'is-mute';
        return '<span class="ap-chip ' + kind + '">' + escapeHtml(status) + '</span>';
    }

    function ltr(value) {
        return '<bdi dir="ltr">' + escapeHtml(value) + '</bdi>';
    }

    function dayChip(day, today) {
        var time = (day.from || day.to) ? ' ' + ltr((day.from || '…') + '–' + (day.to || '…')) : '';
        return '<span class="ap-chip' + (day.day && day.day === today ? ' is-today' : '') + '">' + escapeHtml(day.day || '') + time + '</span>';
    }

    function waHref(phone, name) {
        var digits = String(phone || '').replace(/\D/g, '');
        if (!digits) return '';
        if (digits.charAt(0) === '0') digits = '972' + digits.slice(1);
        if (digits.length < 11) return '';
        return 'https://wa.me/' + digits + '?text=' + encodeURIComponent('שלום' + (name ? ' ' + name : '') + ', כאן מצוות תוכנית שבת.');
    }

    function peopleOf(rec) {
        var people = [];
        if (rec.lead || rec.phone || rec.email) people.push({ name: rec.lead, phone: rec.phone, email: rec.email });
        if (rec.lead2 || rec.phone2 || rec.email2) people.push({ name: rec.lead2, phone: rec.phone2, email: rec.email2 });
        return people;
    }

    function dayTitle(letter) {
        var found = DAY_OPTIONS.filter(function (option) { return option[0] === letter; })[0];
        return found ? found[1] : letter;
    }

    function contactActions(rec) {
        var people = peopleOf(rec);
        if (!people.length) return '';
        return '<div class="ap-contact-list">' + people.map(function (person) {
            var tel = String(person.phone || '').replace(/\D/g, '');
            var wa = waHref(person.phone, person.name);
            var phone = prettyPhone(person.phone);
            return '<div class="ap-contact"><div><strong>' + escapeHtml(person.name || 'רכז') + '</strong>' +
                (phone ? '<span>' + escapeHtml(phone) + '</span>' : '<span class="ap-muted">אין טלפון</span>') +
                (person.email ? '<span class="ap-muted">' + escapeHtml(person.email) + '</span>' : '') +
                '</div><div class="ap-contact__actions">' +
                (tel ? '<a class="ap-ghost" href="tel:' + escapeHtml(tel) + '">חיוג</a>' : '') +
                (wa ? '<a class="ap-ghost" href="' + wa + '" target="_blank" rel="noopener">וואטסאפ</a>' : '') +
                (person.email ? '<a class="ap-ghost" href="mailto:' + escapeHtml(person.email) + '">מייל</a>' : '') +
                '</div></div>';
        }).join('') + '</div>';
    }

    function scheduleList(rec) {
        var today = (state.directory && state.directory.today) || '';
        var days = (rec.days || []).filter(function (day) { return day.day; });
        if (!days.length) return '<p class="ap-muted">אין ימי פעילות רשומים.</p>';
        return '<ul class="ap-schedule">' + days.map(function (day) {
            var hours = (day.from || day.to) ? ltr((day.from || '…') + '–' + (day.to || '…')) : '';
            return '<li' + (day.day === today ? ' class="is-today"' : '') + '><b>יום ' + escapeHtml(dayTitle(day.day)) + '</b><span>' + hours + (day.day === today ? ' · היום' : '') + '</span></li>';
        }).join('') + '</ul>';
    }

    function directoryCard(rec) {
        var today = (state.directory && state.directory.today) || '';
        var days = (rec.days || []).filter(function (day) { return day.day; });
        var people = peopleOf(rec);
        var place = [rec.address, rec.city, rec.area].filter(Boolean).join(' · ');
        return '<section class="ap-dir-card"><div class="ap-dir-card__head"><strong>' + escapeHtml(rec.name || 'פרטי הסניף') + '</strong>' + statusChip(rec.status) + (rec.activeToday ? '<span class="ap-chip is-today">פעיל היום</span>' : '') + (rec.participated ? '<span class="ap-chip is-interest">נבחנו השבוע</span>' : '<span class="ap-chip">לא נבחנו השבוע</span>') + '</div>' +
            (place ? '<p>' + escapeHtml(place) + '</p>' : '') +
            (days.length ? '<div class="ap-dir-meta">' + days.map(function (day) { return dayChip(day, today); }).join('') + '</div>' : '<p class="ap-muted">אין ימי פעילות רשומים.</p>') +
            (people.length ? contactActions(rec) : '<p class="ap-muted">אין עדיין פרטי רכז.</p>') +
            (rec.notes ? '<p class="ap-dir-notes">' + escapeHtml(rec.notes) + '</p>' : '') +
            '</section>';
    }

    function branchDirectoryHint(name) {
        var rec = directoryRecord(name);
        if (!rec || !rec.hasInfo) return '';
        var today = (state.directory && state.directory.today) || '';
        var days = (rec.days || []).filter(function (day) { return day.day; }).slice(0, 4);
        var who = rec.lead ? '<span>' + escapeHtml(rec.lead) + '</span>' : '';
        return '<div class="ap-branch-meta">' + days.map(function (day) { return dayChip(day, today); }).join('') +
            statusChip(rec.status) +
            (rec.activeToday ? '<span class="ap-chip is-today">היום</span>' : '') +
            who +
            '<button type="button" class="ap-ghost ap-mini" data-dir-jump="' + escapeHtml(rec.name) + '">פרטים</button></div>';
    }

    function directoryDashNote() {
        var pack = state.directory;
        if (!pack || pack.needsPublish || pack.missing) return '';
        var today = (pack.branches || []).filter(function (rec) { return rec.activeToday; });
        if (!today.length) return '';
        var examined = today.filter(function (rec) { return rec.participated; }).length;
        var waiting = today.filter(function (rec) { return !rec.participated; });
        var nudge = today.filter(function (rec) { return rec.status === 'צריך דירבון' || rec.status === 'לא עונה'; });
        var noPhone = today.filter(function (rec) { return !rec.phone && !rec.phone2; });
        var chips = waiting.slice(0, 8).map(function (rec) {
            return '<button type="button" data-dir-jump="' + escapeHtml(rec.name) + '">' + escapeHtml(rec.name) + '</button>';
        }).join('');
        var more = waiting.length > 8 ? '<span>ועוד ' + (waiting.length - 8) + '</span>' : '';
        return '<div class="ap-today"><p class="ap-dir-note"><strong>היום יום ' + escapeHtml(pack.todayName || '') + ' · ' + today.length + ' סניפים פעילים לפי הלוז · ' + examined + ' מהם כבר נבחנו.</strong> <button type="button" class="ap-ghost ap-mini" data-open-directory="today">לאלפון</button></p>' +
            '<div class="ap-today__stats"><span><b>' + waiting.length + '</b> פעילים היום ועוד לא נבחנו</span><span><b>' + nudge.length + '</b> לדירבון או לא עונים</span><span><b>' + noPhone.length + '</b> בלי טלפון</span></div>' +
            (chips ? '<div class="ap-chips ap-today__chips">' + chips + more + '</div>' : '') +
            '</div>';
    }

    function answersDirectoryHtml() {
        var query = normName(state.answerQuery);
        if (!query || !state.directory || state.directory.needsPublish) return '';
        var rec = directoryRecord(query);
        if (!rec) return '';
        if (!rec.hasInfo) {
            return '<section class="ap-card ap-dir-card"><strong>פרטי קשר</strong><p>אין עדיין פרטים על ' + escapeHtml(rec.name) + '.</p>' +
                (can('admin') ? '<button type="button" class="ap-ghost" data-dir-jump="' + escapeHtml(rec.name) + '">מילוי באלפון</button>' : '') + '</section>';
        }
        return directoryCard(rec) + (can('admin') ? '<div class="ap-actions"><button type="button" class="ap-ghost" data-dir-jump="' + escapeHtml(rec.name) + '">עריכה באלפון</button></div>' : '');
    }

    function draftFrom(rec) {
        rec = rec || {};
        return {
            name: rec.name || '',
            city: rec.city || '',
            address: rec.address || '',
            area: rec.area || '',
            lead: rec.lead || '',
            phone: rec.phone || '',
            email: rec.email || '',
            lead2: rec.lead2 || '',
            phone2: rec.phone2 || '',
            email2: rec.email2 || '',
            status: rec.status || '',
            notes: rec.notes || '',
            days: (rec.days || []).filter(function (day) { return day.day || day.from || day.to; }).map(function (day) {
                return { row: day.row || '', day: day.day || 'א', from: day.from || '', to: day.to || '' };
            })
        };
    }

    function dayRowHtml(day) {
        return '<div class="ap-dir-day" data-day-row data-row="' + escapeHtml(day.row || '') + '"><select name="day">' +
            DAY_OPTIONS.map(function (option) {
                return '<option value="' + option[0] + '"' + (day.day === option[0] ? ' selected' : '') + '>' + option[1] + '</option>';
            }).join('') +
            '</select><input name="from" dir="ltr" value="' + escapeHtml(day.from || '') + '" placeholder="משעה" inputmode="numeric" maxlength="5"><input name="to" dir="ltr" value="' + escapeHtml(day.to || '') + '" placeholder="עד שעה" inputmode="numeric" maxlength="5"><button type="button" class="ap-ghost ap-mini" data-remove-day>הסרת יום</button></div>';
    }

    function directoryForm(rec) {
        var data = state.dirDraft && state.dirOpen === rec.name ? state.dirDraft : draftFrom(rec);
        var secondOpen = !!(data.lead2 || data.phone2 || data.email2);
        var withId = state.section === 'directory' || state.section === 'profile';
        var statusField = state.role === 'coordinator' ? '' : '<label class="ap-field">סטטוס<select name="status"><option value="">בלי סטטוס</option>' + DIR_STATUSES.map(function (status) {
            return '<option value="' + status + '"' + (data.status === status ? ' selected' : '') + '>' + status + '</option>';
        }).join('') + '</select></label>';
        return '<form class="ap-dir-form' + (state.role === 'coordinator' ? '' : ' ap-edit') + '"' + (withId ? ' id="ap-dir-form"' : '') + ' data-name="' + escapeHtml(rec.name) + '">' +
            '<div class="ap-fields"><label class="ap-field">עיר<input name="city" maxlength="40" value="' + escapeHtml(data.city) + '"></label><label class="ap-field">אזור<input name="area" maxlength="40" value="' + escapeHtml(data.area) + '"></label><label class="ap-field">כתובת<input name="address" maxlength="120" value="' + escapeHtml(data.address) + '"></label>' +
            '<label class="ap-field">רכז<input name="lead" maxlength="40" value="' + escapeHtml(data.lead) + '"></label><label class="ap-field">נייד<input name="phone" maxlength="20" value="' + escapeHtml(data.phone) + '" inputmode="tel"></label><label class="ap-field">אימייל<input name="email" maxlength="80" value="' + escapeHtml(data.email) + '" inputmode="email"></label>' +
            statusField + (state.role === 'coordinator' ? '' : '<label class="ap-field ap-span">הערה<textarea name="notes" maxlength="500" rows="2">' + escapeHtml(data.notes) + '</textarea></label>') + '</div>' +
            '<details class="ap-dir-more"' + (secondOpen ? ' open' : '') + '><summary>רכז נוסף</summary><div class="ap-fields"><label class="ap-field">שם<input name="lead2" maxlength="40" value="' + escapeHtml(data.lead2) + '"></label><label class="ap-field">נייד<input name="phone2" maxlength="20" value="' + escapeHtml(data.phone2) + '" inputmode="tel"></label><label class="ap-field">אימייל<input name="email2" maxlength="80" value="' + escapeHtml(data.email2) + '" inputmode="email"></label></div></details>' +
            '<p class="ap-dir-label">ימי פעילות</p><div class="ap-dir-days">' + (data.days || []).map(dayRowHtml).join('') + '</div><div class="ap-actions"><button type="button" class="ap-ghost" data-add-day>הוספת יום</button><button class="ap-primary" type="submit">שמירת הפרטים</button>' +
            (can('admin') ? '<button type="button" class="ap-danger" data-dir-delete="' + escapeHtml(rec.name) + '">הסרת הנתונים</button>' : '') +
            '</div></form>';
    }

    function directoryBody(rec) {
        var editable = state.role === 'coordinator' || can('admin');
        if (!editable) return directoryCard(rec);
        var lead = rec.hasInfo
            ? (state.role === 'coordinator' ? scheduleList(rec) + contactActions(rec) : contactActions(rec))
            : '<p class="ap-muted">אין עדיין פרטים על ' + escapeHtml(rec.name) + '. אפשר למלא אותם כאן.</p>';
        return lead + directoryForm(rec);
    }

    function coordinatorNames() {
        if (state.assigned && state.assigned.length) return state.assigned.slice();
        if (state.mine && state.mine.branches && state.mine.branches.length) return state.mine.branches.slice();
        return [];
    }

    function limitDirectory(result) {
        if (!result || state.role !== 'coordinator') return result;
        var allowed = coordinatorNames();
        var kept = [];
        var seen = {};
        allowed.forEach(function (name) {
            var key = normName(name);
            if (!key || seen[key]) return;
            seen[key] = true;
            var found = (result.branches || []).filter(function (rec) { return normName(rec.name) === key; })[0];
            if (found) {
                found.name = name;
                found.notes = '';
                kept.push(found);
            } else {
                kept.push({ name: name, hasInfo: false, days: [], inList: true, notes: '', city: '', area: '', address: '', lead: '', phone: '', email: '', lead2: '', phone2: '', email2: '', status: '' });
            }
        });
        result.branches = kept;
        return result;
    }

    function coordinatorBranchNames(pack) {
        if (state.role !== 'coordinator') return ((pack && pack.branches) || []).map(function (rec) { return rec.name; });
        return coordinatorNames();
    }

    function loadProfile() {
        return ensureDirectory().then(function () {
            renderProfile();
        });
    }

    function renderProfile() {
        var pack = state.directory || { branches: [] };
        if (pack.needsPublish) {
            view(head('פרטי הסניף', '') + '<p class="ap-error">פרטי הסניף יופיעו אחרי פרסום הסקריפט המעודכן.</p>');
            return;
        }
        var allowed = coordinatorBranchNames(pack);
        if (!allowed.length) {
            view(head('פרטי הסניף', '') + '<p class="ap-empty">לחשבון הזה עדיין לא שויכו סניפים.</p>');
            return;
        }
        if (allowed.indexOf(state.profileBranch) === -1) state.profileBranch = allowed[0];
        var rec = directoryRecord(state.profileBranch) || { name: state.profileBranch, hasInfo: false, days: [] };
        if (state.dirOpen !== rec.name || !state.dirDraft) {
            state.dirOpen = rec.name;
            state.dirDraft = draftFrom(rec);
        }
        var switcher = allowed.length > 1 ? '<div class="ap-profile-switch">' + allowed.map(function (name) {
            return '<button type="button" class="ap-ghost' + (name === state.profileBranch ? ' is-on' : '') + '" data-profile-branch="' + escapeHtml(name) + '">' + escapeHtml(name) + '</button>';
        }).join('') + '</div>' : '';
        view(
            head('פרטי הסניף', allowed.length > 1 ? 'בחרו סניף ועדכנו את הימים, הכתובת ופרטי הרכזים.' : 'ימי הפעילות ופרטי הקשר. השמירה מעדכנת את הלוז.') +
            (pack.missing ? '<p class="ap-error">' + escapeHtml(pack.error || 'גיליון הלוז לא נמצא') + '</p>' : '') +
            switcher +
            '<section class="ap-card ap-profile"><h3>' + escapeHtml(rec.name) + '</h3>' + directoryBody(rec) + '</section>'
        );
    }

    function onProfileClick(target) {
        var button = target.closest('[data-profile-branch]');
        if (!button) return;
        var name = button.getAttribute('data-profile-branch');
        if (state.role === 'coordinator' && !coordinatorNames().some(function (item) { return normName(item) === normName(name); })) return;
        state.profileBranch = name;
        state.dirOpen = name;
        state.dirDraft = draftFrom(directoryRecord(name) || { name: name, days: [] });
        renderProfile();
    }

    function isNudge(rec) {
        if (rec.status === 'לא בעניין') return false;
        if (!rec.phone && !rec.phone2) return false;
        if (rec.participated) return false;
        return !!(rec.hasInfo || rec.status === 'צריך דירבון' || rec.status === 'לא עונה');
    }

    function filteredDirectory() {
        var query = state.dirQuery.trim();
        return ((state.directory && state.directory.branches) || []).filter(function (rec) {
            if (state.dirPart === 'week' && !rec.participated) return false;
            if (state.dirPart === 'absent' && rec.participated) return false;
            if (state.dirPart === 'never' && rec.ever) return false;
            if (state.dirPart === 'quiet' && !rec.quiet) return false;
            if (state.dirPart === 'nudge' && !isNudge(rec)) return false;
            if (state.dirPart === 'empty' && rec.hasInfo) return false;
            if (state.dirDay === 'today' && !rec.activeToday) return false;
            if (state.dirDay !== 'all' && state.dirDay !== 'today' && !(rec.days || []).some(function (day) { return day.day === state.dirDay; })) return false;
            if (state.dirStatus === 'none' && rec.status) return false;
            if (state.dirStatus !== 'all' && state.dirStatus !== 'none' && rec.status !== state.dirStatus) return false;
            if (state.dirArea !== 'all' && rec.area !== state.dirArea) return false;
            if (state.dirMissingPhone && (rec.phone || rec.phone2 || !rec.hasInfo)) return false;
            if (!query) return true;
            var blob = [rec.name, rec.city, rec.area, rec.address, rec.lead, rec.lead2, rec.phone, rec.phone2, rec.email, rec.email2, rec.notes, rec.status, prettyPhone(rec.phone), prettyPhone(rec.phone2)].join(' ');
            return blob.indexOf(query) !== -1;
        });
    }

    function loadDirectory() {
        return ensureDirectory().then(function () {
            if (state.dirFocus) {
                var rec = directoryRecord(state.dirFocus) || { name: state.dirFocus, days: [] };
                state.dirOpen = rec.name;
                state.dirDraft = draftFrom(rec);
                state.dirFocus = '';
            }
            renderDirectory();
            var open = document.getElementById('ap-dir-open');
            if (open && open.scrollIntoView) open.scrollIntoView({ block: 'nearest' });
        });
    }

    function renderDirectory() {
        var pack = state.directory || { branches: [] };
        if (pack.needsPublish) {
            view(head('אלפון', '') + '<p class="ap-error">האלפון ייפתח אחרי פרסום Code.gs המעודכן על אותה פריסה.</p>');
            return;
        }
        var rows = filteredDirectory();
        var all = pack.branches || [];
        var areas = [];
        all.forEach(function (rec) {
            if (rec.area && areas.indexOf(rec.area) === -1) areas.push(rec.area);
        });
        areas.sort();
        var withInfo = all.filter(function (rec) { return rec.hasInfo; }).length;
        var todayCount = all.filter(function (rec) { return rec.activeToday; }).length;
        var nudgeCount = all.filter(isNudge).length;
        view(
            head('אלפון', 'פרטי קשר, לוז וסטטוס. הרשימה באתר נשארת גיליון «סניפים».') +
            (pack.missing ? '<p class="ap-error">' + escapeHtml(pack.error || 'גיליון הלוז לא נמצא') + '</p>' : '') +
            '<section class="ap-stats">' +
            stat('עם פרטים', withInfo, 'מתוך ' + all.length + ' סניפים', '') +
            stat('פעילים היום', todayCount, pack.todayName ? 'יום ' + pack.todayName : '', 'is-green') +
            stat('כדאי ליצור קשר', nudgeCount, 'יש טלפון ועוד לא נבחנו', 'is-gold') +
            stat('בלי סטטוס', all.filter(function (rec) { return rec.hasInfo && !rec.status; }).length, 'יש פרטים בלי קטלוג', 'is-rose') +
            '</section>' +
            '<section class="ap-card ap-dir-tools"><div class="ap-actions"><button type="button" class="ap-ghost' + (state.dirDay === 'today' ? ' is-on' : '') + '" data-dir-preset="today">פעילים היום</button><button type="button" class="ap-ghost' + (state.dirPart === 'week' ? ' is-on' : '') + '" data-dir-preset="week">נבחנו השבוע</button><button type="button" class="ap-ghost' + (state.dirPart === 'absent' ? ' is-on' : '') + '" data-dir-preset="absent">לא נבחנו השבוע</button><button type="button" class="ap-ghost' + (state.dirPart === 'nudge' ? ' is-on' : '') + '" data-dir-preset="nudge">כדאי ליצור קשר</button><button type="button" class="ap-ghost' + (state.dirPart === 'empty' ? ' is-on' : '') + '" data-dir-preset="empty">בלי פרטים</button></div>' +
            '<div class="ap-search"><input id="ap-dir-query" placeholder="חיפוש שם, עיר, רכז או טלפון" value="' + escapeHtml(state.dirQuery) + '">' +
            '<select id="ap-dir-part"><option value="all">כל ההשתתפות</option><option value="week">נבחנו השבוע</option><option value="absent">לא נבחנו השבוע</option><option value="never">לא נבחנו אף פעם</option><option value="quiet">נרשמו ולא נבחנו</option><option value="nudge">כדאי ליצור קשר</option><option value="empty">בלי פרטים</option></select>' +
            '<select id="ap-dir-day"><option value="all">כל הימים</option><option value="today">פעילים היום</option>' + DAY_OPTIONS.map(function (option) {
                return '<option value="' + option[0] + '">יום ' + option[1] + '</option>';
            }).join('') + '</select>' +
            '<select id="ap-dir-status"><option value="all">כל הסטטוסים</option><option value="none">בלי סטטוס</option>' + DIR_STATUSES.map(function (status) {
                return '<option value="' + status + '">' + status + '</option>';
            }).join('') + '</select>' +
            (areas.length ? '<select id="ap-dir-area"><option value="all">כל האזורים</option>' + areas.map(function (area) {
                return '<option value="' + escapeHtml(area) + '">' + escapeHtml(area) + '</option>';
            }).join('') + '</select>' : '') +
            '<label class="ap-check"><input id="ap-dir-phone" type="checkbox"' + (state.dirMissingPhone ? ' checked' : '') + '>בלי טלפון</label></div></section>' +
            '<p class="ap-muted">' + rows.length + ' סניפים מוצגים</p>' +
            '<div class="ap-dir-list">' + (rows.length ? rows.map(function (rec) {
                var open = state.dirOpen === rec.name;
                return '<article class="ap-dir-item"' + (open ? ' id="ap-dir-open"' : '') + '>' + directorySummary(rec) + (open ? '<div class="ap-dir-body">' + directoryBody(rec) + '</div>' : '') + '</article>';
            }).join('') : '<p class="ap-empty">אין סניפים שמתאימים לסינון.</p>') + '</div>'
        );
        var part = document.getElementById('ap-dir-part');
        var day = document.getElementById('ap-dir-day');
        var status = document.getElementById('ap-dir-status');
        var areaBox = document.getElementById('ap-dir-area');
        if (part) part.value = state.dirPart;
        if (day) day.value = state.dirDay;
        if (status) status.value = state.dirStatus;
        if (areaBox) areaBox.value = state.dirArea;
    }

    function directorySummary(rec) {
        var today = (state.directory && state.directory.today) || '';
        var days = (rec.days || []).filter(function (day) { return day.day; }).slice(0, 4);
        var place = [rec.city, rec.area].filter(Boolean).join(' · ');
        var whoName = rec.lead || (rec.phone ? prettyPhone(rec.phone) : 'בלי רכז');
        return '<button type="button" class="ap-dir' + (state.dirOpen === rec.name ? ' is-open' : '') + '" data-dir-toggle="' + escapeHtml(rec.name) + '"><span class="ap-dir__main"><strong>' + escapeHtml(rec.name) + '</strong><span class="ap-muted">' + escapeHtml(place || (rec.hasInfo ? 'יש פרטים' : 'אין עדיין פרטים')) + '</span></span><span class="ap-dir-meta">' +
            days.map(function (day) { return dayChip(day, today); }).join('') + statusChip(rec.status) +
            (rec.activeToday ? '<span class="ap-chip is-today">היום</span>' : '') +
            (rec.inList ? '' : '<span class="ap-chip">לא ברשימת האתר</span>') +
            '</span><span class="ap-dir__who"><b>' + escapeHtml(whoName) + '</b>' + (rec.lead && rec.phone ? '<span>' + escapeHtml(prettyPhone(rec.phone)) + '</span>' : '') + '</span></button>';
    }

    function captureDirForm() {
        var form = document.getElementById('ap-dir-form');
        if (!form || (state.section !== 'directory' && state.section !== 'profile')) return;
        state.dirDraft = directoryPayload(form);
        state.dirDraft.days = (state.dirDraft.days || []).map(function (day) {
            return { row: day.row, day: day.day, from: day.from, to: day.to };
        });
    }

    function directoryPayload(form) {
        var days = [];
        Array.prototype.forEach.call(form.querySelectorAll('[data-day-row]'), function (row) {
            days.push({
                row: row.getAttribute('data-row') || '',
                day: row.querySelector('[name="day"]').value,
                from: row.querySelector('[name="from"]').value.trim(),
                to: row.querySelector('[name="to"]').value.trim()
            });
        });
        return {
            name: form.getAttribute('data-name'),
            city: form.elements.city.value.trim(),
            address: form.elements.address.value.trim(),
            area: form.elements.area.value.trim(),
            lead: form.elements.lead.value.trim(),
            phone: form.elements.phone.value.trim(),
            email: form.elements.email.value.trim(),
            lead2: form.elements.lead2.value.trim(),
            phone2: form.elements.phone2.value.trim(),
            email2: form.elements.email2.value.trim(),
            status: form.elements.status ? form.elements.status.value : '',
            notes: form.elements.notes ? form.elements.notes.value.trim() : '',
            days: days
        };
    }

    function onDirectoryDay(target) {
        var form = target.closest('form');
        if (!form) return;
        if (form.id === 'ap-dir-form') {
            captureDirForm();
            if (!state.dirDraft) return;
            if (target.closest('[data-add-day]')) state.dirDraft.days.push({ row: '', day: 'א', from: '', to: '' });
            else {
                var rows = form.querySelectorAll('[data-day-row]');
                var index = Array.prototype.indexOf.call(rows, target.closest('[data-day-row]'));
                if (index >= 0) state.dirDraft.days.splice(index, 1);
            }
            if (state.section === 'profile') renderProfile();
            else renderDirectory();
            return;
        }
        var box = form.querySelector('.ap-dir-days');
        if (!box) return;
        if (target.closest('[data-add-day]')) box.insertAdjacentHTML('beforeend', dayRowHtml({ row: '', day: 'א', from: '', to: '' }));
        else {
            var row = target.closest('[data-day-row]');
            if (row) row.remove();
        }
    }

    function openDirectoryAt(name) {
        state.dirQuery = '';
        state.dirPart = 'all';
        state.dirDay = 'all';
        state.dirStatus = 'all';
        state.dirArea = 'all';
        state.dirMissingPhone = false;
        state.dirOpen = '';
        state.dirDraft = null;
        state.dirFocus = name || '';
        openSection('directory');
    }

    function onDirectoryClick(target) {
        var preset = target.closest('[data-dir-preset]');
        if (preset) {
            var kind = preset.getAttribute('data-dir-preset');
            state.dirPart = 'all';
            state.dirDay = 'all';
            state.dirStatus = 'all';
            state.dirArea = 'all';
            state.dirQuery = '';
            state.dirMissingPhone = false;
            if (kind === 'today') state.dirDay = 'today';
            else state.dirPart = kind;
            captureDirForm();
            renderDirectory();
            return;
        }
        var toggle = target.closest('[data-dir-toggle]');
        if (toggle) {
            var name = toggle.getAttribute('data-dir-toggle');
            captureDirForm();
            if (state.dirOpen === name) {
                state.dirOpen = '';
                state.dirDraft = null;
            } else {
                state.dirOpen = name;
                state.dirDraft = draftFrom(directoryRecord(name) || { name: name });
            }
            renderDirectory();
            return;
        }
        var remove = target.closest('[data-dir-delete]');
        if (remove && can('admin')) {
            var branchName = remove.getAttribute('data-dir-delete');
            ask('להסיר את פרטי «' + branchName + '» מהאלפון? השם יישאר ברשימת הסניפים של האתר.', 'הסרה').then(function (ok) {
                if (!ok) return;
                api('adminDeleteDirectory', { name: branchName }).then(function () {
                    toast('הפרטים הוסרו מהאלפון');
                    state.dirOpen = '';
                    state.dirDraft = null;
                    return loadDirectory();
                }).catch(showError);
            });
        }
    }
})();

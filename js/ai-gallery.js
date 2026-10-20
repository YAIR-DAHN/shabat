(function () {
    var SENT_KEY = 'aiGuessSent';

    function gallery() {
        return (window.AI_GALLERY && AI_GALLERY.images) || [];
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function savedMap() {
        try {
            return JSON.parse(localStorage.getItem(SENT_KEY) || '{}');
        } catch (e) {
            return {};
        }
    }

    function markSent(imageId) {
        var map = savedMap();
        map[imageId] = new Date().toISOString();
        localStorage.setItem(SENT_KEY, JSON.stringify(map));
    }

    function storedUser() {
        try {
            return JSON.parse(localStorage.getItem('userDetails') || '{}');
        } catch (e) {
            return {};
        }
    }

    function saveUser(name, branch, phone) {
        var current = storedUser();
        current.userName = name;
        current.branch = branch;
        current.phone = phone;
        localStorage.setItem('userDetails', JSON.stringify(current));
    }

    function normalizePhone(value) {
        return String(value || '').replace(/[\s-]/g, '');
    }

    function renderTeaser() {
        var box = document.getElementById('ai-teaser-photos');
        if (!box) return;
        var images = gallery().slice(0, 3);
        box.innerHTML = images
            .map(function (image, index) {
                return (
                    '<img src="' +
                    escapeHtml(image.src) +
                    '" alt="תמונה לניחוש, ' +
                    escapeHtml(aiWeekLabel(image.week)) +
                    '" width="360" height="240" loading="' +
                    (index === 0 ? 'eager' : 'lazy') +
                    '">'
                );
            })
            .join('');
    }

    function renderBoard() {
        var board = document.getElementById('guess-board');
        if (!board) return;

        var images = gallery();
        var weeks = [];
        images.forEach(function (image) {
            if (weeks.indexOf(image.week) === -1) weeks.push(image.week);
        });
        weeks.sort(function (a, b) {
            return b - a;
        });

        var indexed = images.map(function (image, index) {
            return { image: image, index: index };
        });

        var sortBar =
            '<div class="guess-sort" role="group" aria-label="סדר התמונות בתוך כל שבוע">' +
            '<button type="button" class="guess-sort__btn is-on" data-sort="new" aria-pressed="true">מהחדש לישן</button>' +
            '<button type="button" class="guess-sort__btn" data-sort="old" aria-pressed="false">מהישן לחדש</button>' +
            '<button type="button" class="guess-sort__btn" data-sort="likes" aria-pressed="false">הכי הרבה לייקים</button>' +
            '</div>' +
            '<p class="guess-sort__note" hidden>מעדכנים את הסדר לפי הלייקים, בתוך כל שבוע...</p>';

        var filters =
            weeks.length > 1
                ? '<div class="guess-filters" role="tablist">' +
                  '<button type="button" class="guess-filter is-on" data-week="all">הכל</button>' +
                  weeks
                      .map(function (week) {
                          return (
                              '<button type="button" class="guess-filter" data-week="' +
                              week +
                              '">' +
                              escapeHtml(aiWeekLabel(week)) +
                              '</button>'
                          );
                      })
                      .join('') +
                  '</div>'
                : '';

        var user = storedUser();
        var sent = savedMap();

        function cardMarkup(item, eager) {
                    var image = item.image;
                    var credit = image.credit
                        ? '<p class="guess-card__credit">קרדיט: ' + escapeHtml(image.credit) + '</p>'
                        : '';
                    var already = !!sent[image.id];
                    var closed = image.open === false;
                    var action = closed
                        ? '<p class="guess-card__closed">הניחושים לתמונה הזו נסגרו</p>'
                        : '<button type="button" class="guess-card__open">' +
                          (already ? 'לשלוח ניחוש נוסף' : 'מה ההלכה כאן?') +
                          '</button>' +
                          (already ? '<p class="guess-card__saved">הניחוש שלך כבר נשמר אצל הצוות</p>' : '');

                    return (
                        '<article class="guess-card" data-week="' +
                        image.week +
                        '" data-index="' +
                        item.index +
                        '" data-id="' +
                        escapeHtml(image.id) +
                        '">' +
                        '<div class="guess-card__frame">' +
                        '<button type="button" class="guess-card__zoom" data-src="' +
                        escapeHtml(image.src) +
                        '" aria-label="הגדלת התמונה">' +
                        '<img src="' +
                        escapeHtml(image.src) +
                        '" alt="תמונה לניחוש, ' +
                        escapeHtml(aiWeekLabel(image.week)) +
                        '" width="960" height="640" loading="' +
                        (eager ? 'eager' : 'lazy') +
                        '">' +
                        '</button></div>' +
                        '<div class="guess-card__body">' +
                        '<div class="guess-card__tools">' +
                        '<span class="guess-card__week">' +
                        escapeHtml(aiWeekLabel(image.week)) +
                        '</span>' +
                        '<button type="button" class="guess-like" data-like="' +
                        escapeHtml(image.id) +
                        '" aria-pressed="false">' +
                        '<span class="guess-like__heart" aria-hidden="true">♡</span>' +
                        '<span class="guess-like__count">0</span>' +
                        '<span class="guess-like__label">לייק</span>' +
                        '</button></div>' +
                        credit +
                        action +
                        '<form class="guess-form" hidden>' +
                        field('שם מלא', 'text', 'guess-name', user.userName || '', 'name', image.id + '-name') +
                        '<div class="guess-field branch-search-container">' +
                        '<label for="' + escapeHtml(image.id) + '-branch">סניף</label>' +
                        '<input id="' + escapeHtml(image.id) + '-branch" class="guess-branch" name="branch" type="text" autocomplete="off" required value="' +
                        escapeHtml(user.branch || '') +
                        '" placeholder="הקלידו את שם הסניף">' +
                        '<div class="branch-results" hidden></div>' +
                        '</div>' +
                        field('טלפון', 'tel', 'guess-phone', user.phone || '', 'tel', image.id + '-phone') +
                        '<div class="guess-field">' +
                        '<label for="' + escapeHtml(image.id) + '-text">איזו הלכה התמונה מייצגת?</label>' +
                        '<textarea id="' + escapeHtml(image.id) + '-text" class="guess-text" name="text" rows="3" required maxlength="400" placeholder="במילים שלכם"></textarea>' +
                        '</div>' +
                        '<p class="guess-form__private">הניחוש לא מופיע באתר. הוא נשמר רק לצוות, יחד עם השם, הסניף והטלפון.</p>' +
                        '<p class="guess-form__error" hidden></p>' +
                        '<button type="submit" class="guess-form__submit">שליחה להגרלה</button>' +
                        '</form>' +
                        '</div></article>'
                    );
        }

        var sections = weeks
            .map(function (week) {
                var items = indexed.filter(function (item) {
                    return Number(item.image.week) === Number(week);
                });
                items.sort(function (a, b) {
                    return b.index - a.index;
                });
                var heading =
                    weeks.length > 1
                        ? '<h2 class="guess-week__title">' + escapeHtml(aiWeekLabel(week)) + '</h2>'
                        : '';
                return (
                    '<section class="guess-week" data-week="' +
                    week +
                    '">' +
                    heading +
                    '<div class="guess-week__grid">' +
                    items
                        .map(function (item, index) {
                            return cardMarkup(item, week === weeks[0] && index === 0);
                        })
                        .join('') +
                    '</div></section>'
                );
            })
            .join('');

        board.innerHTML = sortBar + filters + '<div class="guess-weeks">' + sections + '</div>';

        board.addEventListener('click', onBoardClick);
        loadBranches();
        loadLikes();
    }

    function field(label, type, className, value, autocomplete, id) {
        var extra = type === 'tel' ? ' dir="ltr" inputmode="tel"' : '';
        return (
            '<div class="guess-field"><label for="' +
            escapeHtml(id) +
            '">' +
            label +
            '</label><input id="' +
            escapeHtml(id) +
            '" class="' +
            className +
            '" type="' +
            type +
            '"' +
            extra +
            ' autocomplete="' +
            autocomplete +
            '" required value="' +
            escapeHtml(value) +
            '"></div>'
        );
    }

    var sortMode = 'new';
    var likesLoaded = false;
    var likesFailed = false;

    function updateSortNote() {
        var note = document.querySelector('.guess-sort__note');
        if (!note) return;
        if (sortMode !== 'likes' || likesLoaded) {
            note.hidden = true;
            return;
        }
        note.hidden = false;
        note.textContent = likesFailed
            ? 'הלייקים עוד לא נטענו, בינתיים מהחדשה לישנה בתוך כל שבוע.'
            : 'מעדכנים את הסדר לפי הלייקים, בתוך כל שבוע...';
    }

    function sortCards() {
        document.querySelectorAll('.guess-week__grid').forEach(function (grid) {
            var cards = Array.prototype.slice.call(grid.children);
            cards.sort(function (a, b) {
                var indexA = Number(a.getAttribute('data-index')) || 0;
                var indexB = Number(b.getAttribute('data-index')) || 0;
                var likesA = likeCounts[a.getAttribute('data-id')] || 0;
                var likesB = likeCounts[b.getAttribute('data-id')] || 0;
                if (sortMode === 'likes' && likesA !== likesB) return likesB - likesA;
                if (sortMode === 'old') return indexA - indexB;
                return indexB - indexA;
            });
            cards.forEach(function (card) {
                grid.appendChild(card);
            });
        });
    }

    function onBoardClick(event) {
        var sortButton = event.target.closest('.guess-sort__btn');
        if (sortButton) {
            sortMode = sortButton.getAttribute('data-sort') || 'new';
            document.querySelectorAll('.guess-sort__btn').forEach(function (button) {
                var on = button === sortButton;
                button.classList.toggle('is-on', on);
                button.setAttribute('aria-pressed', on ? 'true' : 'false');
            });
            updateSortNote();
            sortCards();
            return;
        }

        var filter = event.target.closest('.guess-filter');
        if (filter) {
            var week = filter.getAttribute('data-week');
            document.querySelectorAll('.guess-filter').forEach(function (button) {
                button.classList.toggle('is-on', button === filter);
            });
            document.querySelectorAll('.guess-week').forEach(function (section) {
                section.hidden = week !== 'all' && section.getAttribute('data-week') !== week;
            });
            return;
        }

        var like = event.target.closest('.guess-like');
        if (like) {
            sendLike(like);
            return;
        }

        var zoom = event.target.closest('.guess-card__zoom');
        if (zoom && typeof openImageModal === 'function') {
            openImageModal(zoom.getAttribute('data-src'));
            return;
        }

        var open = event.target.closest('.guess-card__open');
        if (open) {
            var card = open.closest('.guess-card');
            var form = card.querySelector('.guess-form');
            var show = form.hidden;
            form.hidden = !show;
            var sentAlready = !!savedMap()[card.getAttribute('data-id')];
            open.textContent = show ? 'סגירה' : (sentAlready ? 'לשלוח ניחוש נוסף' : 'מה ההלכה כאן?');
            if (show) {
                var input = form.querySelector('textarea, input');
                if (input) input.focus();
            }
            return;
        }

        var option = event.target.closest('.branch-option');
        if (option) {
            var wrap = option.closest('.branch-search-container');
            wrap.querySelector('.guess-branch').value = option.textContent.trim();
            var results = wrap.querySelector('.branch-results');
            results.hidden = true;
            results.innerHTML = '';
        }
    }

    function loadBranches() {
        if (typeof fetchFromAPI !== 'function') return;
        fetchFromAPI('getBranches')
            .then(function (result) {
                var branches = (result && result.data) || [];
                document.querySelectorAll('.guess-branch').forEach(function (input) {
                    input.addEventListener('input', function () {
                        showBranches(input, branches);
                    });
                    input.addEventListener('focus', function () {
                        showBranches(input, branches);
                    });
                });
            })
            .catch(function () {});

        document.addEventListener('click', function (event) {
            if (!event.target.closest('.branch-search-container')) {
                document.querySelectorAll('.guess-card .branch-results').forEach(function (box) {
                    box.hidden = true;
                });
            }
        });
    }

    function showBranches(input, branches) {
        var box = input.parentElement.querySelector('.branch-results');
        var query = input.value.trim();
        var matches = branches.filter(function (branch) {
            return !query || String(branch).indexOf(query) !== -1;
        }).slice(0, 8);
        if (!matches.length) {
            box.hidden = true;
            box.innerHTML = '';
            return;
        }
        box.innerHTML = matches
            .map(function (branch) {
                return '<button type="button" class="branch-option">' + escapeHtml(branch) + '</button>';
            })
            .join('');
        box.hidden = false;
    }

    document.addEventListener('submit', function (event) {
        var form = event.target;
        if (!form.classList || !form.classList.contains('guess-form')) return;
        event.preventDefault();

        var card = form.closest('.guess-card');
        var image = gallery().filter(function (item) {
            return item.id === card.getAttribute('data-id');
        })[0];
        var error = form.querySelector('.guess-form__error');
        var button = form.querySelector('.guess-form__submit');
        var name = form.querySelector('.guess-name').value.trim();
        var branch = form.querySelector('.guess-branch').value.trim();
        var phone = normalizePhone(form.querySelector('.guess-phone').value);
        var text = form.querySelector('.guess-text').value.trim();

        function fail(message) {
            error.hidden = false;
            error.textContent = message;
        }

        error.hidden = true;
        if (name.length < 2) return fail('כתבו שם מלא.');
        if (branch.length < 2) return fail('בחרו סניף.');
        if (!/^0\d{8,9}$/.test(phone)) return fail('הטלפון צריך להתחיל ב-0, בלי מקף.');
        if (text.length < 2) return fail('כתבו מה לדעתכם ההלכה שבתמונה.');

        button.disabled = true;
        button.textContent = 'שולח...';

        fetchFromAPI('submitAiGuess', 'GET', {
            guess: {
                name: name,
                branch: branch,
                phone: phone,
                text: text,
                imageId: image.id,
                week: image.week
            }
        })
            .then(function (result) {
                if (!result || result.error || result.success === false) {
                    var invalid = result && result.error === 'Invalid action';
                    throw new Error(
                        invalid
                            ? 'השמירה עדיין לא מחוברת לגיליון. צריך לעדכן את הסקריפט בגוגל ולפרסם גרסה חדשה.'
                            : (result && result.error) || 'לא הצלחנו לשמור. נסו שוב.'
                    );
                }
                saveUser(name, branch, phone);
                markSent(image.id);
                form.hidden = true;
                var note = card.querySelector('.guess-card__saved');
                if (!note) {
                    note = document.createElement('p');
                    note.className = 'guess-card__saved';
                    form.before(note);
                }
                note.textContent = 'הניחוש נשמר. הוא לא מופיע לאחרים, ואתם בהגרלה על ' + AI_GALLERY.prize + '.';
                var opener = card.querySelector('.guess-card__open');
                if (opener) opener.textContent = 'לשלוח ניחוש נוסף';
            })
            .catch(function (err) {
                fail(err.message || 'לא הצלחנו לשמור. נסו שוב.');
            })
            .finally(function () {
                button.disabled = false;
                button.textContent = 'שליחה להגרלה';
            });
    });

    var LIKED_KEY = 'aiLikedImages';
    var DEVICE_KEY = 'aiDeviceId';

    function readCookie(name) {
        var parts = document.cookie ? document.cookie.split('; ') : [];
        for (var i = 0; i < parts.length; i++) {
            if (parts[i].indexOf(name + '=') === 0) return decodeURIComponent(parts[i].slice(name.length + 1));
        }
        return '';
    }

    function deviceId() {
        var id = '';
        try {
            id = localStorage.getItem(DEVICE_KEY) || '';
        } catch (e) {}
        if (!id) id = readCookie(DEVICE_KEY);
        if (!/^[A-Za-z0-9_-]{8,80}$/.test(id)) {
            id = 'd' + Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
        }
        try {
            localStorage.setItem(DEVICE_KEY, id);
        } catch (e) {}
        document.cookie = DEVICE_KEY + '=' + encodeURIComponent(id) + '; max-age=31536000; path=/; SameSite=Lax';
        return id;
    }

    function likedIds() {
        try {
            var list = JSON.parse(localStorage.getItem(LIKED_KEY) || '[]');
            return Array.isArray(list) ? list : [];
        } catch (e) {
            return [];
        }
    }

    function rememberLike(imageId) {
        var list = likedIds();
        if (list.indexOf(imageId) === -1) list.push(imageId);
        localStorage.setItem(LIKED_KEY, JSON.stringify(list));
    }

    function forgetLike(imageId) {
        localStorage.setItem(
            LIKED_KEY,
            JSON.stringify(
                likedIds().filter(function (id) {
                    return id !== imageId;
                })
            )
        );
    }

    function paintLike(button, count, liked) {
        button.setAttribute('aria-pressed', liked ? 'true' : 'false');
        button.classList.toggle('is-on', liked);
        button.querySelector('.guess-like__heart').textContent = liked ? '♥' : '♡';
        button.querySelector('.guess-like__count').textContent = String(count || 0);
        button.setAttribute(
            'aria-label',
            (liked ? 'לבטל את הלייק. ' : 'לייק לתמונה. ') + (count || 0) + ' לייקים'
        );
    }

    function applyLikeState(counts) {
        var mine = likedIds();
        var max = 0;
        Object.keys(counts || {}).forEach(function (id) {
            if (counts[id] > max) max = counts[id];
        });
        document.querySelectorAll('.guess-like').forEach(function (button) {
            var id = button.getAttribute('data-like');
            var count = counts && counts[id] ? counts[id] : 0;
            paintLike(button, count, mine.indexOf(id) !== -1);
            var card = button.closest('.guess-card');
            var badge = card.querySelector('.guess-like__lead');
            if (max > 0 && count === max) {
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'guess-like__lead';
                    badge.textContent = 'מובילה';
                    card.querySelector('.guess-card__body').prepend(badge);
                }
            } else if (badge) {
                badge.remove();
            }
        });
        if (sortMode === 'likes') sortCards();
    }

    var likeCounts = {};
    var likesSettled = false;

    function popLike(button) {
        button.classList.remove('is-pop');
        void button.offsetWidth;
        button.classList.add('is-pop');
    }

    function showLikeStatus(button, message) {
        var card = button.closest('.guess-card');
        var status = card.querySelector('.guess-like__status');
        if (!message) {
            if (status) status.remove();
            return;
        }
        if (!status) {
            status = document.createElement('p');
            status.className = 'guess-like__status';
            card.querySelector('.guess-card__body').prepend(status);
        }
        status.textContent = message;
    }

    function likeMeta() {
        var nav = window.navigator || {};
        var screenText = '';
        try {
            screenText = screen.width + 'x' + screen.height + '@' + (window.devicePixelRatio || 1);
        } catch (e) {}
        var parts = [
            nav.platform || '',
            nav.hardwareConcurrency ? nav.hardwareConcurrency + ' ליבות' : '',
            nav.deviceMemory ? nav.deviceMemory + 'GB' : '',
            typeof nav.maxTouchPoints === 'number' ? 'מגע ' + nav.maxTouchPoints : '',
            screenText,
            nav.language || ''
        ].filter(Boolean);
        var clientTime = '';
        try {
            clientTime = new Date().toLocaleString('he-IL', { hour12: false });
        } catch (e2) {}
        var zone = '';
        try {
            zone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        } catch (e3) {}
        return {
            clientTime: String(clientTime).slice(0, 40),
            timeZone: String(zone).slice(0, 60),
            device: parts.join(' · ').slice(0, 160),
            browser: String(nav.userAgent || '').slice(0, 180)
        };
    }

    function lookupIp() {
        if (lookupIp.promise) return lookupIp.promise;
        var cached = '';
        try {
            cached = sessionStorage.getItem('aiLikeIp') || '';
        } catch (e) {}
        if (cached) {
            lookupIp.promise = Promise.resolve(cached);
            return lookupIp.promise;
        }
        lookupIp.promise = new Promise(function (resolve) {
            var done = false;
            var timer = setTimeout(function () {
                if (done) return;
                done = true;
                resolve('');
            }, 1500);
            fetch('https://api.ipify.org?format=json')
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    var ip = data && data.ip ? String(data.ip).slice(0, 45) : '';
                    if (ip) {
                        try {
                            sessionStorage.setItem('aiLikeIp', ip);
                        } catch (e2) {}
                    }
                    if (!done) {
                        done = true;
                        clearTimeout(timer);
                        resolve(ip);
                    }
                })
                .catch(function () {
                    if (!done) {
                        done = true;
                        clearTimeout(timer);
                        resolve('');
                    }
                });
        });
        return lookupIp.promise;
    }

    function loadLikes() {
        if (!document.querySelector('.guess-like') || typeof fetchFromAPI !== 'function') return;
        lookupIp();
        document.querySelectorAll('.guess-like').forEach(function (button) {
            var on = likedIds().indexOf(button.getAttribute('data-like')) !== -1;
            button.dataset.saved = on ? '1' : '0';
            button.dataset.want = button.dataset.saved;
        });
        applyLikeState(likeCounts);
        fetchFromAPI('getAiLikes')
            .then(function (result) {
                if (!result || result.success === false || !result.counts) {
                    likesFailed = true;
                    updateSortNote();
                    return;
                }
                likesLoaded = true;
                likesFailed = false;
                document.querySelectorAll('.guess-like').forEach(function (button) {
                    var id = button.getAttribute('data-like');
                    var server = result.counts[id] || 0;
                    if (button.dataset.pending === '1') {
                        if (!button.dataset.serverCount) button.dataset.serverCount = String(server);
                        var delta = (button.dataset.want === '1' ? 1 : 0) - (button.dataset.saved === '1' ? 1 : 0);
                        likeCounts[id] = Math.max(0, Number(button.dataset.serverCount || 0) + delta);
                    } else if (!(likesSettled && button.dataset.serverCount)) {
                        button.dataset.serverCount = String(server);
                        likeCounts[id] = server;
                    }
                });
                applyLikeState(likeCounts);
                updateSortNote();
            })
            .catch(function () {
                likesFailed = true;
                updateSortNote();
            });
    }

    function sendLike(button) {
        var imageId = button.getAttribute('data-like');
        var turningOn = button.getAttribute('aria-pressed') !== 'true';
        likesSettled = true;
        button.dataset.want = turningOn ? '1' : '0';
        likeCounts[imageId] = Math.max(0, (likeCounts[imageId] || 0) + (turningOn ? 1 : -1));
        if (turningOn) rememberLike(imageId);
        else forgetLike(imageId);
        applyLikeState(likeCounts);
        popLike(button);
        showLikeStatus(button, '');
        if (button.dataset.pending === '1') return;
        button.dataset.pending = '1';
        syncLike(button);
    }

    function syncLike(button) {
        var imageId = button.getAttribute('data-like');
        var wantOn = button.dataset.want === '1';
        if (wantOn === (button.dataset.saved === '1')) {
            button.dataset.pending = '';
            return;
        }
        var sentWant = wantOn ? '1' : '0';
        var meta = likeMeta();
        lookupIp().then(function (ip) {
            return fetchFromAPI('submitAiLike', 'GET', {
                like: {
                    imageId: imageId,
                    deviceId: deviceId(),
                    remove: !wantOn,
                    ip: ip,
                    clientTime: meta.clientTime,
                    timeZone: meta.timeZone,
                    device: meta.device,
                    browser: meta.browser
                }
            });
        })
            .then(function (result) {
                if (!result || result.error === 'Invalid action') {
                    throw new Error('הלייקים עדיין לא מחוברים לגיליון.');
                }
                if (!result || result.success === false) {
                    throw new Error((result && result.error) || 'לא הצלחנו לשמור את הלייק.');
                }
                if (sentWant === '0' && typeof result.liked !== 'boolean') {
                    throw new Error('ביטול הלייק יישמר אחרי עדכון הסקריפט בגוגל.');
                }
                var liked = typeof result.liked === 'boolean' ? result.liked : true;
                if (liked) rememberLike(imageId);
                else forgetLike(imageId);
                button.dataset.saved = liked ? '1' : '0';
                if (typeof result.count === 'number') {
                    likeCounts[imageId] = result.count;
                    button.dataset.serverCount = String(result.count);
                }
                if (button.dataset.want !== sentWant) {
                    syncLike(button);
                    return;
                }
                button.dataset.want = button.dataset.saved;
                if (button.dataset.saved === '1') rememberLike(imageId);
                else forgetLike(imageId);
                applyLikeState(likeCounts);
                button.dataset.pending = '';
            })
            .catch(function (err) {
                if (button.dataset.saved === '1') rememberLike(imageId);
                else forgetLike(imageId);
                button.dataset.want = button.dataset.saved || '0';
                likeCounts[imageId] = Number(button.dataset.serverCount || 0);
                applyLikeState(likeCounts);
                showLikeStatus(button, err.message || 'הלייק לא נשמר. נסו שוב.');
                button.dataset.pending = '';
            });
    }

    function initPhotoGuide() {
        var go = document.getElementById('photo-guide-go');
        if (go) {
            var note = 'שלום!\nשם: \nסניף: \nההלכה שהתמונה מייצגת: \nלהציג את השם ליד התמונה: כן / לא';
            go.href = 'https://wa.me/972583730000?text=' + encodeURIComponent(note);
        }
        var guide = document.getElementById('photo-guide');
        var open = document.getElementById('open-photo-guide');
        var close = document.getElementById('close-photo-guide');
        if (!guide || !open) return;

        function show() {
            guide.hidden = false;
            document.body.style.overflow = 'hidden';
            if (go) go.focus();
        }

        function hide() {
            guide.hidden = true;
            document.body.style.overflow = '';
            open.focus();
        }

        open.addEventListener('click', show);
        if (close) close.addEventListener('click', hide);
        guide.addEventListener('click', function (event) {
            if (event.target === guide) hide();
        });
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && !guide.hidden) hide();
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        if (typeof loadAiGallery === 'function') {
            loadAiGallery().then(function () {
                renderTeaser();
                renderBoard();
                initPhotoGuide();
            });
        } else {
            renderTeaser();
            renderBoard();
            initPhotoGuide();
        }
    });
})();

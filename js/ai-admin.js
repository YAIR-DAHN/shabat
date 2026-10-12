(function () {
    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function images() {
        return (window.AI_GALLERY && AI_GALLERY.images) || [];
    }

    function imageById(id) {
        return images().filter(function (image) {
            return image.id === id;
        })[0];
    }

    function render(guesses) {
        var list = document.getElementById('admin-list');
        var summary = document.getElementById('admin-summary');
        var filter = document.getElementById('admin-filter').value;
        var rows = guesses.filter(function (guess) {
            return filter === 'all' || guess.imageId === filter;
        });

        summary.textContent = rows.length + ' ניחושים' + (filter === 'all' ? '' : ' לתמונה הזו');
        if (!rows.length) {
            list.innerHTML = '<p class="admin-empty">עדיין אין ניחושים להצגה.</p>';
            return;
        }

        list.innerHTML = rows
            .map(function (guess) {
                var image = imageById(guess.imageId);
                var thumb = image
                    ? '<img src="' + escapeHtml(image.src) + '" alt="">'
                    : '';
                var week = guess.week ? aiWeekLabel(guess.week) : '';
                var phone = String(guess.phone || '');
                return (
                    '<article class="admin-card">' +
                    '<div class="admin-card__thumb">' +
                    thumb +
                    '</div>' +
                    '<div>' +
                    '<p class="admin-card__meta">' +
                    escapeHtml(week) +
                    ' · ' +
                    escapeHtml(guess.time) +
                    '</p>' +
                    '<p class="admin-card__guess">' +
                    escapeHtml(guess.text) +
                    '</p>' +
                    '<p class="admin-card__who">' +
                    escapeHtml(guess.name) +
                    ' · ' +
                    escapeHtml(guess.branch) +
                    '</p>' +
                    '<a class="admin-card__phone" dir="ltr" href="tel:' +
                    escapeHtml(phone) +
                    '">' +
                    escapeHtml(phone) +
                    '</a>' +
                    '</div></article>'
                );
            })
            .join('');
    }

    document.addEventListener('DOMContentLoaded', function () {
        var gate = document.getElementById('admin-gate');
        var panel = document.getElementById('admin-panel');
        var error = document.getElementById('admin-error');
        var guesses = [];

        function fillFilters() {
            var select = document.getElementById('admin-filter');
            images().forEach(function (image) {
                var option = document.createElement('option');
                option.value = image.id;
                option.textContent = aiWeekLabel(image.week) + ' · ' + image.id;
                select.appendChild(option);
            });
        }

        fillFilters();

        document.getElementById('admin-filter').addEventListener('change', function () {
            render(guesses);
        });

        var adminPin = '';

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
                if (byIp[ip] >= 2) {
                    messages.push('הכתובת ' + ip + ' מופיעה ' + byIp[ip] + ' פעמים');
                }
            });
            var times = likes
                .filter(function (like) {
                    return like.imageId === imageId && like.active && like.timeMs;
                })
                .map(function (like) {
                    return like.timeMs;
                })
                .sort(function (a, b) {
                    return a - b;
                });
            var burst = 0;
            for (var i = 0; i < times.length; i++) {
                var count = 1;
                for (var j = i + 1; j < times.length && times[j] - times[i] <= 180000; j++) count++;
                if (count > burst) burst = count;
            }
            if (burst >= 6) messages.push(burst + ' לייקים בתוך שלוש דקות');
            return messages;
        }

        function renderLikes(audit) {
            var box = document.getElementById('admin-likes');
            var likes = (audit && audit.likes) || [];
            var counts = (audit && audit.counts) || {};
            var raw = (audit && audit.raw) || {};
            var fixes = (audit && audit.fixes) || {};
            var known = {};
            var rows = images().map(function (image) {
                known[image.id] = true;
                return image;
            });
            Object.keys(counts).forEach(function (id) {
                if (!known[id]) rows.push({ id: id, week: '' });
            });
            rows.sort(function (a, b) {
                return (counts[b.id] || 0) - (counts[a.id] || 0);
            });

            box.innerHTML =
                '<h2>לייקים</h2>' +
                '<p class="like-audit__note">כל לייק נשמר בגיליון עם שעה, כתובת IP ופרטי מכשיר. כתובת ה-IP מגיעה מהדפדפן, אז היא עוזרת לראות דפוס אבל אפשר גם לזייף אותה. עדכון המספר מוריד או מעלה את מה שמוצג באתר, והשורות בגיליון נשארות. לייקים חדשים ממשיכים להיספר מעל המספר המתוקן.</p>' +
                rows
                    .map(function (image) {
                        var display = counts[image.id] || 0;
                        var sheetCount = raw[image.id] || 0;
                        var fix = fixes[image.id];
                        var flags = likeFlags(image.id, likes);
                        var mine = likes.filter(function (like) {
                            return like.imageId === image.id;
                        });
                        var log = mine
                            .map(function (like) {
                                return (
                                    '<li class="' +
                                    (like.active ? '' : 'is-off') +
                                    '">' +
                                    '<div><span class="like-log__ip">' +
                                    escapeHtml(like.ip || 'בלי IP') +
                                    '</span> · ' +
                                    escapeHtml(like.time) +
                                    (like.active ? '' : ' · בוטל') +
                                    '</div>' +
                                    '<p class="like-log__meta">' +
                                    escapeHtml(like.device || '') +
                                    (like.timeZone ? ' · ' + escapeHtml(like.timeZone) : '') +
                                    (like.clientTime ? ' · שעת מכשיר ' + escapeHtml(like.clientTime) : '') +
                                    '</p>' +
                                    '<p class="like-log__meta" dir="ltr">' +
                                    escapeHtml(like.browser || '') +
                                    '</p></li>'
                                );
                            })
                            .join('');
                        return (
                            '<article class="like-card' +
                            (flags.length ? ' is-hot' : '') +
                            '">' +
                            '<div class="like-card__head"><h3>' +
                            escapeHtml(image.week ? aiWeekLabel(image.week) + ' · ' + image.id : image.id) +
                            '</h3><span class="like-card__count">' +
                            display +
                            '</span></div>' +
                            '<p class="like-card__raw">בגיליון ' +
                            sheetCount +
                            ' לייקים פעילים' +
                            (fix ? ' · תוקן ב-' + escapeHtml(fix.updated) : '') +
                            (fix && fix.note ? ' · ' + escapeHtml(fix.note) : '') +
                            '</p>' +
                            flags
                                .map(function (flag) {
                                    return '<p class="like-flag">' + escapeHtml(flag) + '</p>';
                                })
                                .join('') +
                            '<form class="like-fix" data-image="' +
                            escapeHtml(image.id) +
                            '">' +
                            '<label>מספר שיוצג באתר<input name="count" type="number" min="0" max="100000" value="' +
                            display +
                            '" required></label>' +
                            '<label>הערה<input name="note" type="text" maxlength="120" value="' +
                            escapeHtml(fix ? fix.note : '') +
                            '" placeholder="למשל: אותה כתובת כמה פעמים"></label>' +
                            '<div class="like-fix__actions"><button type="submit">עדכון המספר</button>' +
                            (fix
                                ? '<button type="button" class="like-fix__clear" data-clear="' +
                                  escapeHtml(image.id) +
                                  '">חזרה לספירה מהגיליון</button>'
                                : '') +
                            '</div><p class="like-flag" data-status hidden></p></form>' +
                            (mine.length
                                ? '<details class="like-log"><summary>פירוט ' +
                                  mine.length +
                                  ' רשומות</summary><ul>' +
                                  log +
                                  '</ul></details>'
                                : '') +
                            '</article>'
                        );
                    })
                    .join('');
        }

        function loadLikeAudit() {
            var box = document.getElementById('admin-likes');
            box.innerHTML = '<p class="like-audit__note">טוען לייקים...</p>';
            fetchFromAPI('getAiLikeAudit', 'GET', { pin: adminPin })
                .then(function (result) {
                    if (!result || result.error === 'unauthorized') {
                        throw new Error('הקוד לא נכון.');
                    }
                    if (!result || result.error === 'Invalid action') {
                        throw new Error('כדי לראות פירוט ולתקן מספר, צריך להדביק את Code.gs ולפרסם גרסה חדשה.');
                    }
                    if (result.success === false) {
                        throw new Error(result.error || 'לא הצלחנו לטעון את הלייקים.');
                    }
                    renderLikes(result);
                })
                .catch(function (err) {
                    box.innerHTML = '<p class="admin-error">' + escapeHtml(err.message || 'לא הצלחנו לטעון את הלייקים.') + '</p>';
                });
        }

        document.getElementById('admin-likes').addEventListener('submit', function (event) {
            var form = event.target.closest('.like-fix');
            if (!form) return;
            event.preventDefault();
            var status = form.querySelector('[data-status]');
            var button = form.querySelector('button[type="submit"]');
            status.hidden = true;
            button.disabled = true;
            fetchFromAPI('setAiLikeCount', 'GET', {
                pin: adminPin,
                imageId: form.getAttribute('data-image'),
                count: form.querySelector('[name="count"]').value,
                note: form.querySelector('[name="note"]').value
            })
                .then(function (result) {
                    if (!result || result.error === 'Invalid action') {
                        throw new Error('עדכון המספר יעבוד אחרי פרסום הגרסה החדשה של הסקריפט.');
                    }
                    if (!result || result.success === false || result.error) {
                        throw new Error((result && result.error) || 'העדכון לא נשמר.');
                    }
                    loadLikeAudit();
                })
                .catch(function (err) {
                    status.hidden = false;
                    status.textContent = err.message || 'העדכון לא נשמר.';
                    button.disabled = false;
                });
        });

        document.getElementById('admin-likes').addEventListener('click', function (event) {
            var clear = event.target.closest('[data-clear]');
            if (!clear) return;
            clear.disabled = true;
            fetchFromAPI('setAiLikeCount', 'GET', {
                pin: adminPin,
                imageId: clear.getAttribute('data-clear'),
                clear: true
            }).then(function (result) {
                if (!result || result.success === false || result.error) {
                    throw new Error((result && result.error) || 'לא הצלחנו לבטל את התיקון.');
                }
                loadLikeAudit();
            }).catch(function (err) {
                clear.disabled = false;
                var form = clear.closest('.like-fix');
                var status = form && form.querySelector('[data-status]');
                if (status) {
                    status.hidden = false;
                    status.textContent = err.message || 'לא הצלחנו לבטל את התיקון.';
                }
            });
        });

        gate.addEventListener('submit', function (event) {
            event.preventDefault();
            var pin = document.getElementById('admin-pin').value.trim();
            adminPin = pin;
            var button = gate.querySelector('button');
            error.hidden = true;
            button.disabled = true;

            fetchFromAPI('getAiGuesses', 'GET', { pin: pin })
                .then(function (result) {
                    if (!result || result.error === 'unauthorized') {
                        throw new Error('הקוד לא נכון.');
                    }
                    if (!result || result.error === 'Invalid action' || result.success === false) {
                        throw new Error('הסקריפט בגוגל עדיין בלי הפעולה החדשה. צריך לעדכן את Code.gs ולפרסם גרסה.');
                    }
                    guesses = result.data || [];
                    gate.hidden = true;
                    panel.hidden = false;
                    render(guesses);
                    loadLikeAudit();
                })
                .catch(function (err) {
                    error.hidden = false;
                    error.textContent = err.message || 'לא הצלחנו לטעון.';
                })
                .finally(function () {
                    button.disabled = false;
                });
        });
    });
})();

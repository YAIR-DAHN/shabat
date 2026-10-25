document.addEventListener('DOMContentLoaded', () => {
    initDarkMode();
    fetchAndDisplayWinners();
});

let currentWinners = [];

async function fetchAndDisplayWinners() {
    try {
        showLoading();
        const response = await fetchFromAPI('getWinners');
        
        if (response && response.data && Array.isArray(response.data)) {
            currentWinners = response.data;
            displayWinners(currentWinners);
        } else {
            throw new Error('שגיאה בטעינת רשימת הזוכים');
        }
    } catch (error) {
        console.error('שגיאה:', error);
        displayError('אירעה שגיאה בטעינת רשימת הזוכים. אנא נסה שוב מאוחר יותר.');
    } finally {
        hideLoading();
    }
}

const HEBREW_WEEK_LETTERS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י'];
let selectedWeekLabel = '';

function escapeHtml(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function formatWinnerDate(value) {
    const text = String(value || '').trim();
    if (!text) return '';
    if (/^\d{1,2}[./]\d{1,2}[./]\d{2,4}$/.test(text)) return text;
    if (!/^\d{4}-\d{2}-\d{2}/.test(text)) return text;
    const date = new Date(text);
    if (isNaN(date.getTime())) return text;
    return new Intl.DateTimeFormat('he-IL', {
        timeZone: 'Asia/Jerusalem',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(date);
}

function winnerTime(value) {
    const text = String(value || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}/.test(text)) return 0;
    const date = new Date(text);
    return isNaN(date.getTime()) ? 0 : date.getTime();
}

function weekRank(label) {
    const text = String(label || '');
    const number = text.match(/(\d+)/);
    if (number) return Number(number[1]);
    const letter = text.match(/[אבגדהוזחטי]/);
    if (!letter) return 0;
    const index = HEBREW_WEEK_LETTERS.indexOf(letter[0]);
    return index >= 0 ? index + 1 : 0;
}

function weekIdentity(raw) {
    const label = String(raw || '').trim() || 'ללא שיוך';
    if (label === 'ללא שיוך') return { key: label, title: label, rank: -1 };
    const rank = weekRank(label);
    const weekLike = rank > 0 && (/^\d+$/.test(label) || /^שבוע\s*/.test(label));
    if (!weekLike) return { key: label, title: label, rank: 0 };
    return { key: 'week-' + rank, title: 'שבוע ' + rank, rank: rank };
}

function groupWinners(winners) {
    const groups = [];
    const byLabel = {};
    winners.forEach(function (winner, index) {
        const identity = weekIdentity(winner.quiz);
        if (!byLabel[identity.key]) {
            byLabel[identity.key] = {
                label: identity.key,
                title: identity.title,
                items: [],
                order: index,
                rank: identity.rank,
                latest: 0
            };
            groups.push(byLabel[identity.key]);
        }
        byLabel[identity.key].items.push(winner);
        const time = winnerTime(winner.date);
        if (time > byLabel[identity.key].latest) byLabel[identity.key].latest = time;
    });
    groups.sort(function (a, b) {
        if (a.rank > 0 && b.rank > 0 && a.rank !== b.rank) return b.rank - a.rank;
        if (a.latest !== b.latest) return b.latest - a.latest;
        if (a.rank !== b.rank) return b.rank - a.rank;
        return a.order - b.order;
    });
    return groups;
}

function winnerCard(winner) {
    const date = formatWinnerDate(winner.date);
    return '<article class="winner-card">' +
        '<div class="winner-card__top">' +
            '<h3>' + escapeHtml(winner.name || 'לא צוין שם') + '</h3>' +
            '<span class="winner-medal" aria-hidden="true"><span class="material-icons">emoji_events</span></span>' +
        '</div>' +
        '<div class="winner-details">' +
            '<p class="winner-detail"><span class="material-icons" aria-hidden="true">location_on</span><span>' + escapeHtml(winner.branch || 'לא צוין סניף') + '</span></p>' +
            (winner.prize ? '<p class="winner-prize">' + escapeHtml(winner.prize) + '</p>' : '') +
        '</div>' +
        (date ? '<p class="winner-date"><span class="material-icons" aria-hidden="true">event</span>' + escapeHtml(date) + '</p>' : '') +
    '</article>';
}

function renderWeek(groups) {
    const winnersList = document.getElementById('winnersList');
    const title = document.getElementById('winnersWeekTitle');
    const meta = document.getElementById('winnersWeekMeta');
    const tabs = document.getElementById('weekTabs');
    const group = groups.filter(function (item) { return item.label === selectedWeekLabel; })[0] || groups[0];
    if (!group) return;
    selectedWeekLabel = group.label;
    const count = group.items.length;
    const countLabel = count === 1 ? 'זוכה אחד' : count + ' זוכים';
    if (title) title.textContent = group.title === 'ללא שיוך' ? 'זוכי השעשועון' : group.title;
    if (meta) meta.textContent = countLabel;
    if (tabs) {
        const showTabs = groups.length > 1;
        tabs.hidden = !showTabs;
        tabs.innerHTML = showTabs ? groups.map(function (item) {
            const selected = item.label === group.label;
            const countLabel = item.items.length === 1 ? 'זוכה אחד' : item.items.length + ' זוכים';
            return '<button type="button" class="week-tab' + (selected ? ' is-on' : '') + '" role="tab" data-week="' + escapeHtml(item.label) + '" aria-selected="' + (selected ? 'true' : 'false') + '" aria-label="' + escapeHtml(item.title + ', ' + countLabel) + '">' +
                escapeHtml(item.title) + '<span>' + item.items.length + '</span></button>';
        }).join('') : '';
    }
    if (winnersList) {
        winnersList.hidden = false;
        winnersList.innerHTML = group.items.map(winnerCard).join('');
    }
}

function displayWinners(winners) {
    const winnersList = document.getElementById('winnersList');
    const noWinners = document.getElementById('noWinners');
    const tabs = document.getElementById('weekTabs');
    const groups = groupWinners(winners || []);

    if (!groups.length) {
        if (winnersList) winnersList.hidden = true;
        if (tabs) tabs.hidden = true;
        if (noWinners) noWinners.hidden = false;
        return;
    }

    if (noWinners) noWinners.hidden = true;
    if (!groups.some(function (group) { return group.label === selectedWeekLabel; })) {
        selectedWeekLabel = groups[0].label;
    }
    renderWeek(groups);
}

document.addEventListener('click', function (event) {
    const tab = event.target.closest('.week-tab');
    if (!tab) return;
    selectedWeekLabel = tab.getAttribute('data-week') || '';
    renderWeek(groupWinners(currentWinners));
});

document.addEventListener('keydown', function (event) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    if (!event.target.closest('.week-tabs')) return;
    const groups = groupWinners(currentWinners);
    const index = groups.findIndex(function (group) { return group.label === selectedWeekLabel; });
    if (index < 0) return;
    const next = event.key === 'ArrowLeft' ? index + 1 : index - 1;
    if (next < 0 || next >= groups.length) return;
    event.preventDefault();
    selectedWeekLabel = groups[next].label;
    renderWeek(groups);
    const selected = document.querySelector('.week-tab.is-on');
    if (selected) selected.focus();
});

function displayError(message) {
    const winnersList = document.getElementById('winnersList');
    const noWinners = document.getElementById('noWinners');
    
    if (winnersList) {
        winnersList.hidden = false;
        winnersList.innerHTML = '<div class="error-message"><span class="material-icons">error</span><p>' + escapeHtml(message) + '</p></div>';
    }
    if (noWinners) noWinners.hidden = true;
} 
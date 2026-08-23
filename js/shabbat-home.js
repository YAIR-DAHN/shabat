/**
 * רינדור כרטיסי שבועות בדף הבית
 */
document.addEventListener('DOMContentLoaded', function () {
    if (typeof WEEKS === 'undefined') return;

    const container = document.getElementById('weeks-grid');
    if (!container) return;

    container.innerHTML = WEEKS.map(function (week) {
        const cls = [
            'week-card',
            week.current ? 'week-card--current' : '',
            week.available ? '' : 'week-card--locked'
        ]
            .filter(Boolean)
            .join(' ');

        const href = week.available ? week.url : '#';
        const arrow = week.available ? '←' : '🔒';

        return (
            '<a href="' +
            href +
            '" class="' +
            cls +
            '"' +
            (week.available ? '' : ' aria-disabled="true" tabindex="-1"') +
            '>' +
            '<span class="week-card__num">' +
            week.id +
            '</span>' +
            '<div class="week-card__body">' +
            '<p class="week-card__label">' +
            week.label +
            (week.current ? ' · השבוע' : '') +
            '</p>' +
            '<h3 class="week-card__title">' +
            week.title +
            '</h3>' +
            '<p class="week-card__sub">' +
            week.subtitle +
            '</p>' +
            '<div class="week-card__meta">' +
            (week.melachot
                ? '<span class="week-card__tag">📖 ' + week.melachot + ' מלאכות</span>'
                : '') +
            (week.minutes
                ? '<span class="week-card__tag">⏱ ' + week.minutes + ' דק׳</span>'
                : '') +
            '</div>' +
            '</div>' +
            '<span class="week-card__arrow" aria-hidden="true">' +
            arrow +
            '</span>' +
            '</a>'
        );
    }).join('');
});

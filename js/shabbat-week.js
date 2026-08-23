(function () {
    'use strict';

    const KEY = 'shabat.w1';
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const $ = (s, r) => (r || document).querySelector(s);
    const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

    function load() {
        try {
            return JSON.parse(localStorage.getItem(KEY)) || {};
        } catch (e) {
            return {};
        }
    }

    function save(s) {
        try {
            localStorage.setItem(KEY, JSON.stringify(s));
        } catch (e) {}
    }

    let state = load();
    state.seen = state.seen || [];

    let tt;
    function toast(msg) {
        const t = $('#toast');
        if (!t) return;
        $('span', t).textContent = msg;
        t.classList.add('on');
        clearTimeout(tt);
        tt = setTimeout(() => t.classList.remove('on'), 2200);
    }

    const fill = $('#fill');
    const pct = $('#pct');
    const chapter = $('#chapter');

    function onScroll() {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        const p = h > 0 ? Math.min(100, Math.max(0, Math.round((window.scrollY / h) * 100))) : 0;
        if (fill) fill.style.width = p + '%';
        if (pct) pct.textContent = p + '%';
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();

    const marks = $$('[data-chapter]');
    if ('IntersectionObserver' in window) {
        const co = new IntersectionObserver(
            (es) => {
                es.forEach((e) => {
                    if (e.isIntersecting) {
                        if (chapter) chapter.textContent = e.target.dataset.chapter;
                        e.target.classList.add('is-open');
                    }
                });
            },
            { rootMargin: '-45% 0px -50% 0px' }
        );
        marks.forEach((m) => co.observe(m));

        const ro = new IntersectionObserver(
            (es) => {
                es.forEach((e) => {
                    if (e.isIntersecting) {
                        e.target.classList.add('in');
                        ro.unobserve(e.target);
                    }
                });
            },
            { rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
        );
        $$('.rise').forEach((el) => ro.observe(el));
    } else {
        $$('.rise').forEach((el) => el.classList.add('in'));
    }

    $$('[data-quiz]').forEach((q) => {
        const id = q.dataset.quiz;
        const right = +q.dataset.answer;
        const opts = $$('.opt', q);
        const target = $('[data-reveal="' + id + '"]');

        opts.forEach((o) =>
            o.addEventListener('click', () => {
                if (q.dataset.locked) return;
                const i = +o.dataset.i;
                const ok = i === right;
                if (!ok) {
                    o.classList.add('shake');
                    setTimeout(() => o.classList.remove('shake'), 340);
                }
                q.dataset.locked = '1';
                opts.forEach((x) => {
                    x.disabled = true;
                    const xi = +x.dataset.i;
                    if (xi === right) x.classList.add('is-right');
                    else if (xi === i) x.classList.add('is-wrong');
                    else x.classList.add('is-dim');
                });
                const verdict = $('[data-v="' + (ok ? 'yes' : 'no') + '"]', q);
                if (verdict) verdict.classList.add('show');
                setTimeout(
                    () => {
                        if (target) {
                            target.classList.add('open');
                            if (!reduce) {
                                setTimeout(() => {
                                    const r = target.getBoundingClientRect();
                                    if (r.top > window.innerHeight * 0.85) {
                                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }
                                }, 420);
                            }
                        }
                    },
                    ok ? 420 : 700
                );
                state['q' + id] = ok;
                save(state);
            })
        );
    });

    const done = $('#done');
    function paintDone() {
        if (done && state.done) {
            done.classList.add('is-done');
            done.textContent = '✓ שבוע א׳ הושלם';
        }
    }
    paintDone();

    if (done) {
        done.addEventListener('click', () => {
            state.done = !state.done;
            save(state);
            if (state.done) {
                paintDone();
                toast('כל הכבוד! נתראה בשבוע הבא 🕯️');
            } else {
                done.classList.remove('is-done');
                done.textContent = 'סיימתי את שבוע א׳';
            }
        });
    }

    const shareBtn = $('#share');
    if (shareBtn) {
        const shareText =
            'למדתי את שבוע א׳ במיזם השבת של אור ישראלי - מלאכות שבת נפוצות. מתכוננים לשבת האחרונה של השנה 🕯️';
        shareBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const url = location.href;
            if (navigator.share) {
                navigator.share({ title: 'מיזם השבת · אור ישראלי', text: shareText, url }).catch(() => {});
            } else {
                window.open('https://wa.me/?text=' + encodeURIComponent(shareText + '\n' + url), '_blank', 'noopener');
            }
        });
    }

    const cv = $('#trail');
    if (cv && cv.getContext && !reduce) {
        const ctx = cv.getContext('2d');
        let W = 0,
            H = 0,
            dots = [],
            raf;

        function ridge(y, amp, seed) {
            const pts = [];
            for (let i = 0; i <= 12; i++) {
                const x = (W * i) / 12;
                pts.push([x, y + Math.sin(i * 1.7 + seed) * amp + Math.cos(i * 0.9 + seed * 2) * amp * 0.6]);
            }
            return pts;
        }

        function drawRidge(pts, col) {
            ctx.beginPath();
            ctx.moveTo(0, H);
            ctx.lineTo(pts[0][0], pts[0][1]);
            for (let i = 1; i < pts.length; i++) {
                const p = pts[i - 1];
                const c = pts[i];
                ctx.quadraticCurveTo(p[0], p[1], (p[0] + c[0]) / 2, (p[1] + c[1]) / 2);
            }
            ctx.lineTo(W, H);
            ctx.closePath();
            ctx.fillStyle = col;
            ctx.fill();
        }

        function setup() {
            const r = cv.getBoundingClientRect();
            const dpr = Math.min(2, window.devicePixelRatio || 1);
            W = r.width;
            H = r.height;
            cv.width = W * dpr;
            cv.height = H * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            dots = [];
            for (let i = 0; i < 26; i++) {
                dots.push({
                    x: Math.random() * W,
                    y: Math.random() * H * 0.6,
                    r: Math.random() * 1.3 + 0.4,
                    p: Math.random() * 6.28,
                    s: Math.random() * 0.9 + 0.3
                });
            }
            draw(0);
        }

        function draw(t) {
            ctx.clearRect(0, 0, W, H);
            for (const d of dots) {
                const a = 0.28 + 0.28 * Math.sin(t * 0.0012 * d.s + d.p);
                ctx.beginPath();
                ctx.arc(d.x, d.y, d.r, 0, 6.284);
                ctx.fillStyle = 'rgba(228,182,94,' + a.toFixed(3) + ')';
                ctx.fill();
            }
            drawRidge(ridge(H * 0.72, 18, 1.2), 'rgba(255,255,255,0.045)');
            drawRidge(ridge(H * 0.84, 13, 3.4), 'rgba(255,255,255,0.06)');
            raf = requestAnimationFrame(draw);
        }

        setup();
        window.addEventListener('resize', () => {
            cancelAnimationFrame(raf);
            setup();
        });
    }
})();

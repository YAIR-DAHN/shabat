/**
 * מנוע אינטראקטיביות, אנימציות וחוויית משתמש - "מידות טובות"
 * אור ישראלי · תנועת נוער בערכי היהדות
 */

(function () {
    'use strict';

    // מילון המידות הטובות - כולל תובנות, טיפים מעשיים וקטגוריות
    const VIRTUES_DATA = {
        'ענווה': {
            category: 'heart',
            icon: 'spa',
            badge: 'מידות הלב',
            quote: 'איזהו מכובד? המכבד את הבריות',
            tip: 'פרגן למישהו אחר על הצלחה בלי לחפש קרדיט לעצמך. ענווה היא הכוח לראות את האחר בגובה העיניים.'
        },
        'יושר': {
            category: 'responsibility',
            icon: 'verified',
            badge: 'יוזמה ואחריות',
            quote: 'מדבר שקר תרחק',
            tip: 'עמוד במילה שהבטחת, גם כשזה דורש מאמץ או ויתור. אמינות היא כרטיס הביקור של האדם.'
        },
        'אמת': {
            category: 'people',
            icon: 'balance',
            badge: 'בין אדם לחברו',
            quote: 'חותמו של הקב״ה אמת',
            tip: 'שמור על כנות פנימית עם עצמך ועם הסובבים. אמור תמיד את האמת בעדינות ובנועם.'
        },
        'חסד': {
            category: 'people',
            icon: 'volunteer_activism',
            badge: 'בין אדם לחברו',
            quote: 'עולם חסד יבנה',
            tip: 'עשה מעשה טוב מפתיע למישהו בלי שהוא ביקש ובלי לצפות לתמורה.'
        },
        'אמונה': {
            category: 'heart',
            icon: 'wb_sunny',
            badge: 'מידות הלב',
            quote: 'צדיק באמונתו יחיה',
            tip: 'התמקד בטוב שקורה היום ודע שכל אתגר מגיע כדי לחזק אותנו ולצמוח ממנו.'
        },
        'רחמים': {
            category: 'people',
            icon: 'favorite',
            badge: 'בין אדם לחברו',
            quote: 'כל המרחם על הבריות - מרחמין עליו מן השמים',
            tip: 'שים לב למי שיושב בצד או מתקשה, ופתח איתו בשיחה חמה ומעודדת.'
        },
        'סבלנות': {
            category: 'heart',
            icon: 'hourglass_empty',
            badge: 'מידות הלב',
            quote: 'טוב ארך רוח מגבור',
            tip: 'נשום עמוק וספור עד 3 לפני שאתה מגיב ברגע של כעס או ויכוח.'
        },
        'כבוד': {
            category: 'people',
            icon: 'handshake',
            badge: 'בין אדם לחברו',
            quote: 'יהי כבוד חברך חביב עליך כשלך',
            tip: 'פנה לכל אדם - להורים, לחברים ולעוברים ושבים - בטון מכבד ובמאור פנים.'
        },
        'דרך ארץ': {
            category: 'people',
            icon: 'directions_walk',
            badge: 'בין אדם לחברו',
            quote: 'דרך ארץ קדמה לתורה',
            tip: 'התחשב בסביבה: פתח את הדלת למי שמאחוריך, וותר בתור, ואמור תודה ושבת שלום.'
        },
        'נדיבות': {
            category: 'people',
            icon: 'card_giftcard',
            badge: 'בין אדם לחברו',
            quote: 'טוב עין הוא יבורך',
            tip: 'חלוק משהו שיש לך בשמחה - חטיף טעים, עזרה בחומר לימודי או מחמאה אמיתית.'
        },
        'אהבת הבריות': {
            category: 'people',
            icon: 'groups',
            badge: 'בין אדם לחברו',
            quote: 'הוי מתלמידיו של אהרן - אוהב שלום ורודף שלום, אוהב את הבריות',
            tip: 'ראה את הנקודות היפות בכל אדם שאתה פוגש היום.'
        },
        'הכרת הטוב': {
            category: 'heart',
            icon: 'loyalty',
            badge: 'מידות הלב',
            quote: 'בור ששתית ממנו אל תזרוק בו אבן',
            tip: 'שלח היום הודעת תודה אישית לאבא, לאמא, למורה או לחבר על משהו טוב שעשו עבורך.'
        },
        'שמחה': {
            category: 'heart',
            icon: 'sentiment_very_satisfied',
            badge: 'מידות הלב',
            quote: 'מצווה גדולה להיות בשמחה תמיד',
            tip: 'הכנס חיוך ואנרגיה חיובית לכל מקום שאתה נכנס אליו - שמחה מדבקת!'
        },
        'איפוק': {
            category: 'responsibility',
            icon: 'shield',
            badge: 'יוזמה ואחריות',
            quote: 'איזהו גיבור? הכובש את יצרו',
            tip: 'התאפק מלהגיב מיד כשמתחשק לכעוס או להקניט. שליטה עצמית היא עוצמה אדירה.'
        },
        'אחריות': {
            category: 'responsibility',
            icon: 'task_alt',
            badge: 'יוזמה ואחריות',
            quote: 'במקום שאין אנשים - השתדל להיות איש',
            tip: 'קח אחריות על משימה בסניף או בבית ובצע אותה עד הסוף בצורה הטובה ביותר.'
        },
        'חריצות': {
            category: 'responsibility',
            icon: 'bolt',
            badge: 'יוזמה ואחריות',
            quote: 'הוי עז כנמר וקל כנשר ורץ כצבי וגיבור כארי',
            tip: 'אל תדחה למחר משימה שאתה יכול לעשות עכשיו. עשייה מוקדמת מביאה סיפוק ושלווה.'
        },
        'חכמה': {
            category: 'responsibility',
            icon: 'psychology',
            badge: 'יוזמה ואחריות',
            quote: 'איזהו חכם? הרואה את הנולד',
            tip: 'חשוב צעד אחד קדימה לפני כל מעשה או מילה. התייעץ עם אנשים מנוסים.'
        },
        'התמדה': {
            category: 'responsibility',
            icon: 'trending_up',
            badge: 'יוזמה ואחריות',
            quote: 'יגעת ומצאת - תאמין',
            tip: 'גם כשקשה או נמאס, המשך עוד קצת. ההצלחה האמיתית מגיעה דרך צעדים קטנים ועקביים.'
        },
        'מסירות': {
            category: 'people',
            icon: 'self_improvement',
            badge: 'בין אדם לחברו',
            quote: 'כל ישראל ערבים זה בזה',
            tip: 'היה שם מכל הלב בשביל חבר שזקוק לעזרה, בלי לחסוך מאמץ וזמן.'
        },
        'הקשבה': {
            category: 'people',
            icon: 'hearing',
            badge: 'בין אדם לחברו',
            quote: 'חכמים מקשיבים תחילה',
            tip: 'הקשב לחבר בלי לקטוע אותו ובלי להסתכל בטלפון. הקשבה אמיתית היא מתנה ענקית.'
        },
        'אמינות': {
            category: 'responsibility',
            icon: 'lock',
            badge: 'יוזמה ואחריות',
            quote: 'נאמן רוח מכסה דבר',
            tip: 'שמור על סוד שנאמר לך באמון מלא. אדם אמין הוא עוגן לחבריו.'
        },
        'רגישות': {
            category: 'heart',
            icon: 'psychology_alt',
            badge: 'מידות הלב',
            quote: 'הלב יודע מרת נפשו',
            tip: 'שים לב לרגשות של הסובבים אותך - מילה טובה בזמן הנכון יכולה לשנות יום שלם.'
        },
        'טוב לב': {
            category: 'heart',
            icon: 'favorite_border',
            badge: 'מידות הלב',
            quote: 'רואה אני את דברי אלעזר בן ערך - לב טוב',
            tip: 'חפש בכל מצב איך להוסיף טוב ולעזור לסובבים אותך.'
        },
        'סלחנות': {
            category: 'people',
            icon: 'recycling',
            badge: 'בין אדם לחברו',
            quote: 'המעביר על מידותיו - מעבירין לו על כל פשעיו',
            tip: 'ותר על משקעים מהעבר, אמור למי שפגע בך שהכל בסדר ופתח דף חדש בלב שלם.'
        },
        'אהבת התורה': {
            category: 'heart',
            icon: 'menu_book',
            badge: 'מידות הלב',
            quote: 'דרכיה דרכי נועם וכל נתיבותיה שלום',
            tip: 'קח לך 5 דקות היום ללימוד משהו מחכים או הלכה קצרה שמאירה את הדרך.'
        },
        'שלווה': {
            category: 'heart',
            icon: 'air',
            badge: 'מידות הלב',
            quote: 'דברי חכמים בנחת נשמעים',
            tip: 'שמור על נחת רוח וטון רגוע, גם בבית וגם בסניף.'
        },
        'רוח טובה': {
            category: 'heart',
            icon: 'mood',
            badge: 'מידות הלב',
            quote: 'הוי מקבל את כל האדם בסבר פנים יפות',
            tip: 'האר פנים לכל מי שפוגש בך - חיוך שלך שווה המון לאחרים.'
        },
        'עין טובה': {
            category: 'people',
            icon: 'visibility',
            badge: 'בין אדם לחברו',
            quote: 'עין טובה - תלמידיו של אברהם אבינו',
            tip: 'פרש מעשים של אחרים לטובה. אל תמהר לשפוט לחומרה אלא מצא נקודת זכות.'
        },
        'שלום': {
            category: 'people',
            icon: 'diversity_1',
            badge: 'בין אדם לחברו',
            quote: 'גדול השלום ששמו של הקב״ה שלום',
            tip: 'היה גורם מגשר ומפייס בין חברים כשיש ויכוח או אי-הסכמה.'
        },
        'אחדות': {
            category: 'people',
            icon: 'hub',
            badge: 'בין אדם לחברו',
            quote: 'כאיש אחד בלב אחד',
            tip: 'חבר בין חברים שונים והרגש שכולנו משפחה אחת גדולה.'
        },
        'שמירת הלשון': {
            category: 'people',
            icon: 'record_voice_over',
            badge: 'בין אדם לחברו',
            quote: 'נצור לשונך מרע ושפתיך מדבר מרמה',
            tip: 'עצור שיחה שגולשת לדיבור על אחרים, והשתמש בכוח הדיבור רק לעידוד, מחמאות וטוב.'
        },
        'אהבת ישראל': {
            category: 'people',
            icon: 'star',
            badge: 'בין אדם לחברו',
            quote: 'ואהבת לרעך כמוך - זה כלל גדול בתורה',
            tip: 'אהוב כל יהודי באשר הוא ודאג לטובתו בדיוק כפי שהיית רוצה שידאגו לך.'
        }
    };

    // משימות שבועיות ברירת מחדל
    const WEEKLY_MISSIONS = [
        {
            id: 'm1',
            title: 'לדון לכף זכות',
            desc: 'למצוא נקודת זכות במישהו שפעל בצורה שלא הבנת',
            icon: '🤝'
        },
        {
            id: 'm2',
            title: 'שלא לשנוא ולשמור טינה',
            desc: 'למחול בלב שלם ולא לנטור טינה',
            icon: '❤️'
        },
        {
            id: 'm3',
            title: 'איך מבקשים מחילה',
            desc: 'לומר מילת סליחה אמיצה או להודות בטעות',
            icon: '🙏'
        },
        {
            id: 'm4',
            title: 'הארת פנים ומחמאה',
            desc: 'לתת מחמאה כנה וחמה להורים או לחבר',
            icon: '✨'
        }
    ];

    /* ========================================================
       1. Sparkle & Floating Ambient Light Particles Canvas
       ======================================================== */
    function initAmbientCanvas() {
        let canvas = document.getElementById('ambientCanvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'ambientCanvas';
            canvas.className = 'ambient-canvas';
            document.body.prepend(canvas);
        }

        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        const particleCount = window.innerWidth < 600 ? 18 : 32;

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }

        window.addEventListener('resize', resize);
        resize();

        const colors = [
            'rgba(255, 64, 129, 0.4)',  // rose glow
            'rgba(2, 136, 209, 0.35)',  // cyan/sky glow
            'rgba(255, 193, 7, 0.35)',  // gold sparkle
            'rgba(0, 188, 212, 0.35)'   // turquoise
        ];

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 3 + 1,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4 - 0.2, // drift upwards
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: Math.random() * 0.7 + 0.2,
                pulseSpeed: Math.random() * 0.02 + 0.01
            });
        }

        function draw() {
            ctx.clearRect(0, 0, width, height);

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                p.alpha += Math.sin(Date.now() * p.pulseSpeed) * 0.005;
                p.alpha = Math.max(0.15, Math.min(0.85, p.alpha));

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 10;
                ctx.fill();
            });

            requestAnimationFrame(draw);
        }

        draw();
    }

    /* ========================================================
       2. Confetti Cannon
       ======================================================== */
    function triggerConfetti(originX, originY) {
        const count = 35;
        const container = document.createElement('div');
        container.className = 'confetti-container';
        document.body.appendChild(container);

        const colors = ['#ff4081', '#0288d1', '#ffc107', '#00e676', '#7c4dff', '#ff5722'];

        for (let i = 0; i < count; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            piece.style.left = (originX || window.innerWidth / 2) + 'px';
            piece.style.top = (originY || window.innerHeight / 2) + 'px';

            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 180 + 80;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity - 100;
            const rot = Math.random() * 720 - 360;

            piece.style.setProperty('--tx', `${tx}px`);
            piece.style.setProperty('--ty', `${ty}px`);
            piece.style.setProperty('--rot', `${rot}deg`);

            container.appendChild(piece);
        }

        setTimeout(() => {
            container.remove();
        }, 1800);
    }

    /* ========================================================
       3. 3D Tilt Effect on Interactive Cards
       ======================================================== */
    function init3DTilt() {
        const cards = document.querySelectorAll('.hero-program__visual, .weekly-card, .nav-card, .prize-showcase-card');
        
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -7;
                const rotateY = ((x - centerX) / centerX) * 7;

                card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    /* ========================================================
       4. Virtues Explorer Modal & Interaction
       ======================================================== */
    function initVirtuesExplorer() {
        // יצירת מודאל
        let modal = document.getElementById('virtueModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'virtueModal';
            modal.className = 'virtue-modal-overlay hidden';
            modal.innerHTML = `
                <div class="virtue-modal-card">
                    <button class="virtue-modal-close" aria-label="סגירה">&times;</button>
                    <div class="virtue-modal-header">
                        <div class="virtue-modal-icon-badge" id="modalVirtueIcon">
                            <span class="material-icons">auto_awesome</span>
                        </div>
                        <span class="virtue-modal-badge" id="modalVirtueBadge">מידת הלב</span>
                        <h3 class="virtue-modal-title" id="modalVirtueTitle">ענווה</h3>
                    </div>
                    <div class="virtue-modal-body">
                        <blockquote class="virtue-quote" id="modalVirtueQuote">
                            "איזהו מכובד? המכבד את הבריות"
                        </blockquote>
                        <div class="virtue-practical-tip">
                            <div class="tip-header">
                                <span class="material-icons">tips_and_updates</span>
                                <strong>איך מיישמים היום?</strong>
                            </div>
                            <p id="modalVirtueTip">פרגן למישהו אחר על הצלחה בלי לחפש קרדיט לעצמך.</p>
                        </div>
                    </div>
                    <div class="virtue-modal-footer">
                        <button type="button" class="virtue-commit-btn" id="modalCommitBtn">
                            <span class="material-icons">check_circle</span>
                            <span>קבלתי על עצמי להיום! ✨</span>
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // סגירה
            modal.querySelector('.virtue-modal-close').addEventListener('click', () => {
                modal.classList.add('hidden');
            });
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.add('hidden');
            });

            // כפתור קבלה
            modal.querySelector('#modalCommitBtn').addEventListener('click', (e) => {
                const title = document.getElementById('modalVirtueTitle').textContent;
                const rect = e.target.getBoundingClientRect();
                triggerConfetti(rect.left + rect.width / 2, rect.top);
                
                // שמירה בזיכרון מקומי
                try {
                    const adopted = JSON.parse(localStorage.getItem('midot_adopted') || '[]');
                    if (!adopted.includes(title)) {
                        adopted.push(title);
                        localStorage.setItem('midot_adopted', JSON.stringify(adopted));
                    }
                } catch (err) {}

                e.target.innerHTML = `<span class="material-icons">task_alt</span> <span>כל הכבוד! נשמר בהצלחה! 🌟</span>`;
                e.target.style.background = 'linear-gradient(135deg, #00c853 0%, #009624 100%)';

                setTimeout(() => {
                    modal.classList.add('hidden');
                    // שחזור כפתור
                    setTimeout(() => {
                        e.target.innerHTML = `<span class="material-icons">check_circle</span> <span>קבלתי על עצמי להיום! ✨</span>`;
                        e.target.style.background = '';
                    }, 400);
                }, 1000);
            });
        }

        // חיבור לחיצות על תגיות המידות
        const tags = document.querySelectorAll('.virtue-tag');
        tags.forEach(tag => {
            const name = tag.textContent.trim();
            tag.style.cursor = 'pointer';
            tag.setAttribute('role', 'button');
            tag.setAttribute('tabindex', '0');
            tag.setAttribute('title', 'לחצו לקריאה וקבלה אישית');

            tag.addEventListener('click', (e) => {
                openVirtueModal(name, e);
            });
            tag.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openVirtueModal(name, e);
                }
            });
        });

        // סינון מידות לפי קטגוריה
        const filterButtons = document.querySelectorAll('.virtue-filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.getAttribute('data-filter');
                tags.forEach(tag => {
                    const name = tag.textContent.trim();
                    const data = VIRTUES_DATA[name];
                    if (!data) return;

                    if (filter === 'all' || data.category === filter) {
                        tag.style.display = 'inline-block';
                        tag.classList.add('animate-pop');
                        setTimeout(() => tag.classList.remove('animate-pop'), 400);
                    } else {
                        tag.style.display = 'none';
                    }
                });
            });
        });
    }

    function openVirtueModal(name, e) {
        const data = VIRTUES_DATA[name] || {
            category: 'heart',
            icon: 'auto_awesome',
            badge: 'מידות טובות',
            quote: 'דרך ארץ קדמה לתורה',
            tip: 'הוסף מעשה טוב והאר פנים לסובבים אותך במידת ' + name + '.'
        };

        const modal = document.getElementById('virtueModal');
        if (!modal) return;

        document.getElementById('modalVirtueTitle').textContent = name;
        document.getElementById('modalVirtueBadge').textContent = data.badge;
        document.getElementById('modalVirtueQuote').textContent = `"${data.quote}"`;
        document.getElementById('modalVirtueTip').textContent = data.tip;
        
        const iconContainer = document.getElementById('modalVirtueIcon');
        iconContainer.innerHTML = `<span class="material-icons">${data.icon}</span>`;

        modal.classList.remove('hidden');

        if (e && e.clientX) {
            triggerConfetti(e.clientX, e.clientY);
        }
    }

    /* ========================================================
       5. Gamified Weekly Mission Tracker
       ======================================================== */
    function initWeeklyTracker() {
        const trackerContainer = document.getElementById('weeklyMissionTracker');
        if (!trackerContainer) return;

        let completed = [];
        try {
            completed = JSON.parse(localStorage.getItem('midot_missions_done') || '[]');
        } catch (e) {}

        function renderTracker() {
            const total = WEEKLY_MISSIONS.length;
            const doneCount = completed.length;
            const percent = Math.round((doneCount / total) * 100);

            trackerContainer.innerHTML = `
                <div class="tracker-header">
                    <div class="tracker-info">
                        <span class="tracker-badge">אתגר השבוע</span>
                        <h3 class="tracker-title">משימת השבוע שלי</h3>
                    </div>
                    <div class="tracker-progress-wrapper">
                        <div class="tracker-progress-text">
                            <span>השלמת <strong>${doneCount}</strong> מתוך ${total} משימות</span>
                            <span class="tracker-percent">${percent}%</span>
                        </div>
                        <div class="tracker-progress-track">
                            <div class="tracker-progress-fill" style="width: ${percent}%;"></div>
                        </div>
                    </div>
                </div>
                <div class="tracker-tasks-grid">
                    ${WEEKLY_MISSIONS.map(m => {
                        const isDone = completed.includes(m.id);
                        return `
                            <div class="tracker-task-item ${isDone ? 'is-done' : ''}" data-id="${m.id}" role="button" tabindex="0">
                                <div class="task-checkbox">
                                    <span class="material-icons">${isDone ? 'check' : ''}</span>
                                </div>
                                <div class="task-content">
                                    <div class="task-header-line">
                                        <span class="task-emoji">${m.icon}</span>
                                        <strong>${m.title}</strong>
                                    </div>
                                    <p class="task-subtext">${m.desc}</p>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                ${doneCount === total ? `
                    <div class="tracker-completion-celebration">
                        <span class="material-icons">emoji_events</span>
                        <span>אלופים! השלמתם את כל משימות השבוע! 🎉</span>
                    </div>
                ` : ''}
            `;

            // חיבור לחיצות
            trackerContainer.querySelectorAll('.tracker-task-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    const id = item.getAttribute('data-id');
                    if (completed.includes(id)) {
                        completed = completed.filter(x => x !== id);
                    } else {
                        completed.push(id);
                        const rect = item.getBoundingClientRect();
                        triggerConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
                    }

                    try {
                        localStorage.setItem('midot_missions_done', JSON.stringify(completed));
                    } catch (err) {}

                    renderTracker();
                });
            });
        }

        renderTracker();
    }

    /* ========================================================
       6. Daily Fortune / Random Virtue Spinner
       ======================================================== */
    function initDailyFortune() {
        const fortuneBtn = document.getElementById('randomVirtueBtn');
        if (!fortuneBtn) return;

        fortuneBtn.addEventListener('click', (e) => {
            const keys = Object.keys(VIRTUES_DATA);
            const randomKey = keys[Math.floor(Math.random() * keys.length)];
            
            fortuneBtn.classList.add('spinning');
            setTimeout(() => {
                fortuneBtn.classList.remove('spinning');
                openVirtueModal(randomKey, e);
            }, 300);
        });
    }

    /* ========================================================
       7. Header Scroll-Shrink
       ======================================================== */
    function initHeaderScrollEffect() {
        const header = document.querySelector('.modern-header');
        if (!header) return;

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    if (window.scrollY > 60) {
                        header.classList.add('header--compact');
                    } else {
                        header.classList.remove('header--compact');
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    /* ========================================================
       8. IntersectionObserver Scroll Reveal
       ======================================================== */
    function initScrollReveal() {
        const animatedEls = document.querySelectorAll('.animate-on-scroll');
        if (!animatedEls.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target); // fire once
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        });

        animatedEls.forEach(el => observer.observe(el));
    }

    /* ========================================================
       9. Hero Text Reveal Classes
       ======================================================== */
    function initHeroReveal() {
        const eyebrow = document.querySelector('.hero-program__eyebrow');
        const title = document.querySelector('.hero-program__title');
        const cycle = document.querySelector('.hero-program__cycle');
        const lead = document.querySelector('.hero-program__lead');
        const chips = document.querySelector('.hero-program__chips');

        const revealMap = [
            [eyebrow, 'hero-reveal hero-reveal--delay-1'],
            [title,   'hero-reveal hero-reveal--delay-2'],
            [cycle,   'hero-reveal hero-reveal--delay-3'],
            [lead,    'hero-reveal hero-reveal--delay-3'],
            [chips,   'hero-reveal hero-reveal--delay-4'],
        ];

        revealMap.forEach(([el, classes]) => {
            if (el) classes.split(' ').forEach(c => el.classList.add(c));
        });
    }

    /* ========================================================
       10. Initialization
       ======================================================== */
    document.addEventListener('DOMContentLoaded', () => {
        initAmbientCanvas();
        init3DTilt();
        initVirtuesExplorer();
        initWeeklyTracker();
        initDailyFortune();
        initHeaderScrollEffect();
        initScrollReveal();
        initHeroReveal();
        initGlobalRipple();
        initHeroTypewriter();
    });

    /* ========================================================
       11. Global Click Ripple Effect
       ======================================================== */
    function initGlobalRipple() {
        document.addEventListener('click', (e) => {
            const target = e.target.closest('button, .nav-card, .hero-chip, .virtue-tag, .dock-item, .virtue-commit-btn, .random-virtue-btn, .share-button');
            if (!target) return;

            const ripple = document.createElement('span');
            const rect = target.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height) * 1.5;

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                top: ${e.clientY - rect.top - size / 2}px;
                left: ${e.clientX - rect.left - size / 2}px;
                background: rgba(255, 255, 255, 0.35);
                border-radius: 50%;
                transform: scale(0);
                animation: rippleExpand 0.55s ease-out forwards;
                pointer-events: none;
                z-index: 9999;
            `;

            const existingPos = getComputedStyle(target).position;
            if (existingPos === 'static') target.style.position = 'relative';
            target.style.overflow = 'hidden';
            target.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        }, true);
    }

    /* ========================================================
       12. Hero Title Typewriter
       ======================================================== */
    function initHeroTypewriter() {
        const title = document.querySelector('.hero-program__title');
        if (!title) return;

        const text = title.textContent.trim();
        if (!text) return;

        // only run on first visit within session
        if (sessionStorage.getItem('heroTyped')) return;
        sessionStorage.setItem('heroTyped', '1');

        title.textContent = '';
        title.style.minHeight = '1.2em';
        title.style.display = 'block';

        let i = 0;
        const speed = 75;
        const cursor = document.createElement('span');
        cursor.style.cssText = 'display:inline-block;width:3px;background:#ff4081;border-radius:2px;animation:cursorBlink 0.75s steps(1) infinite;vertical-align:text-bottom;';
        title.appendChild(cursor);

        const interval = setInterval(() => {
            title.insertBefore(document.createTextNode(text[i]), cursor);
            i++;
            if (i >= text.length) {
                clearInterval(interval);
                setTimeout(() => cursor.remove(), 900);
            }
        }, speed);
    }

})();


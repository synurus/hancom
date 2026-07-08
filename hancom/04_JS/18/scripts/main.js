/* ============================================
   흑기사 BLACK_KNIGHT — 메인 스크립트
   1) 배경 별 + 별똥별   2) 바닥 꽃밭   3) 입장 버튼
   4) 스킨 갤러리(3D 뒤집기 · 카테고리 필터)   5) 스크롤 등장
   6) 방명록(form · 글자수 · 평균 · 최신순)   7) localStorage
   8) 밤하늘 다크모드   9) 배경음악   10) 진행바 · 맨위로
   ============================================ */

'use strict';

/* ---------- 데이터 ---------- */

// 별 색상 (채도 높은 선명한 색)
const STAR_COLORS = ['#ff1744', '#2979ff', '#00e676', '#ffea00', '#d500f9', '#ff6d00', '#00e5ff', '#ff1aa8'];

// 섹션별 꽃 색 (data-flower 속성과 매칭)
const FLOWER_COLORS = {
    red:    '#ff1744',
    blue:   '#2979ff',
    green:  '#00e676',
    yellow: '#ffea00',
    purple: '#d500f9'
};

// 캐릭터 클래스 (STEP15: class / constructor / new / this)
class Character {
    constructor(id, name, group, videoUrl, desc, img = '') {
        this.id = id;
        this.name = name;
        this.group = group;
        this.videoUrl = videoUrl;
        this.desc = desc;
        this.img = img;
    }
}

// 섹션4 콜라보 스킨 캐릭터 (class 인스턴스 배열)
const characters = [
    new Character('rumi',   '루미',     '케데헌',   'https://www.youtube.com/@black_knight', '케이팝 데몬 헌터스의 카리스마 리더 보컬', 'assets/Rumi_Portrait.png'),
    new Character('mira',   '미라',     '케데헌',   'https://www.youtube.com/@black_knight', '냉철하고 시크한 데몬 헌터', 'assets/Mira_Portrait.png'),
    new Character('zoey',   '조이',     '케데헌',   'https://www.youtube.com/shorts/RcMWYNlCauk', '팀의 분위기 메이커 막내', 'assets/Zoey_Portrait.png'),
    new Character('dva',    'D.Va',     '오버워치', 'https://www.youtube.com/@black_knight', '메카를 모는 프로게이머 출신 영웅', 'assets/OW2_Dva.jpg'),
    new Character('tracer', '트레이서', '오버워치', 'https://www.youtube.com/@black_knight', '시간을 넘나드는 스피드스터', 'assets/OW2_Tracer.png'),
    new Character('mercy',  '메르시',   '오버워치', 'https://www.youtube.com/@black_knight', '전장을 지키는 천사, 최고의 힐러', 'assets/OW2_Mercy.png')
];

const STORAGE_KEY = 'blackKnightPixel';       // 방문/관람/테마 상태
const GUESTBOOK_KEY = 'blackKnightGuestbook'; // 방명록

/* ---------- 유틸 ---------- */

function rand(min, max) {
    return Math.random() * (max - min) + min;
}

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// HTML 특수문자 이스케이프 (방명록 입력 안전 처리)
function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

/* ============================================
   1. 배경 별 + 별똥별
   ============================================ */

function createStars(count) {
    const field = document.getElementById('starfield');
    if (!field) return;

    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'star';

        const color = pick(STAR_COLORS);
        const size = Math.floor(rand(1, 4)) * 4;

        star.style.left = rand(0, 100) + 'vw';
        star.style.top = rand(0, 100) + 'vh';
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.color = color;
        star.style.background = color;
        star.style.animationDelay = rand(0, 2) + 's';

        field.appendChild(star);
    }
}

function setupShootingStars() {
    const field = document.getElementById('starfield');
    if (!field) return;

    function spawn() {
        const s = document.createElement('div');
        s.className = 'shooting-star';
        s.style.setProperty('--sc', pick(STAR_COLORS));
        s.style.left = rand(10, 90) + 'vw';
        s.style.top = rand(-5, 40) + 'vh';
        field.appendChild(s);

        const dx = rand(220, 440);
        const dy = rand(160, 340);
        const anim = s.animate([
            { transform: 'translate(0, 0)', opacity: 1 },
            { transform: `translate(${dx}px, ${dy}px)`, opacity: 0 }
        ], { duration: rand(700, 1200), easing: 'ease-in' });
        anim.onfinish = () => s.remove();
    }

    // 2.5~6초마다 별똥별 하나
    (function loop() {
        spawn();
        setTimeout(loop, rand(2500, 6000));
    })();
}

/* ============================================
   2. 바닥 픽셀 꽃밭
   ============================================ */

function createFlowers() {
    document.querySelectorAll('.section').forEach(section => {
        const bed = section.querySelector('.flowerbed');
        if (!bed) return;

        const color = FLOWER_COLORS[section.dataset.flower] || FLOWER_COLORS.red;

        for (let i = 0; i < 48; i++) {
            const flower = document.createElement('div');
            flower.className = 'pixel-flower';
            flower.style.setProperty('--c', color);
            flower.style.left = rand(0, 98) + '%';
            flower.style.bottom = rand(20, 130) + 'px';

            const p = Math.floor(rand(5, 10)); // 5~9px
            flower.style.setProperty('--pixel', p + 'px');
            flower.style.width = p + 'px';
            flower.style.height = p + 'px';
            flower.style.zIndex = String(p);

            bed.appendChild(flower);
        }
    });
}

/* ============================================
   3. 입장 버튼
   ============================================ */

function setupEnterButton() {
    const btn = document.getElementById('enterBtn');
    const content = document.getElementById('content');
    if (!btn || !content) return;

    btn.addEventListener('click', () => {
        content.scrollIntoView({ behavior: 'smooth' });
        saveState({ entered: true });
    });
}

/* ============================================
   4. 스킨 갤러리 (3D 뒤집기 + 카테고리 필터)
   ============================================ */

function renderSkinGallery(filter) {
    const gallery = document.getElementById('skinGallery');
    if (!gallery) return;

    gallery.innerHTML = '';
    const watched = loadState().watched || [];

    // 필터: 배열 filter 메서드 (STEP13)
    const list = (filter && filter !== 'all')
        ? characters.filter(c => c.group === filter)
        : characters;

    list.forEach(char => {
        const frame = document.createElement('div');
        frame.className = 'skin-frame';
        frame.dataset.id = char.id;
        if (watched.includes(char.id)) frame.classList.add('watched');

        const portraitInner = char.img
            ? `<img src="${char.img}" alt="${char.name}">`
            : '로고<br>준비중';
        const portraitClass = char.img ? 'skin-portrait has-img' : 'skin-portrait';

        frame.innerHTML = `
            <div class="skin-card">
                <div class="skin-face skin-front">
                    <div class="${portraitClass}">${portraitInner}</div>
                    <div class="skin-name">${char.name}</div>
                    <div class="skin-group">${char.group}</div>
                </div>
                <div class="skin-face skin-back">
                    <p class="skin-desc">${escapeHtml(char.desc)}</p>
                    <span class="skin-play">▶ 영상 보기</span>
                </div>
            </div>
        `;

        frame.addEventListener('click', () => {
            window.open(char.videoUrl, '_blank', 'noopener');
            markWatched(char.id);
            frame.classList.add('watched');
        });

        gallery.appendChild(frame);
    });
}

function setupSkinFilter() {
    const buttons = document.querySelectorAll('.filter-btn');
    if (!buttons.length) return;

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderSkinGallery(btn.dataset.filter);
        });
    });
}

/* ============================================
   5. 스크롤 등장 애니메이션
   ============================================ */

function setupScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                saveState({ lastSection: entry.target.id });
            }
        });
    }, { threshold: 0.25 });

    document.querySelectorAll('.section').forEach(s => observer.observe(s));
}

/* ============================================
   6. 방명록 (form · 글자수 · 평균 · 최신순)
   ============================================ */

function loadGuestbook() {
    try {
        return JSON.parse(localStorage.getItem(GUESTBOOK_KEY)) || [];
    } catch (e) {
        console.error('방명록 불러오기 실패:', e);
        return [];
    }
}

function saveGuestbook(list) {
    localStorage.setItem(GUESTBOOK_KEY, JSON.stringify(list));
}

function setupGuestbook() {
    const form = document.getElementById('guestbookForm');
    const listEl = document.getElementById('guestbookList');
    const countEl = document.getElementById('gbCount');
    const avgEl = document.getElementById('gbAverage');
    const msgEl = document.getElementById('gbMessage');
    if (!form || !listEl) return;

    let entries = loadGuestbook();

    // 글자수 카운터
    if (msgEl && countEl) {
        msgEl.addEventListener('input', () => {
            countEl.textContent = `${msgEl.value.length} / 100`;
        });
    }

    // 평균 별점 표시
    function renderAverage() {
        if (!avgEl) return;
        if (entries.length === 0) { avgEl.textContent = ''; return; }
        const sum = entries.reduce((acc, e) => acc + e.rating, 0);
        const avg = (sum / entries.length).toFixed(1);
        avgEl.innerHTML = `평균 별점 ★ ${avg} <span class="gb-avg-sub">(${entries.length}개)</span>`;
    }

    // 목록 렌더 (최신순 정렬 + map)
    function render() {
        renderAverage();

        if (entries.length === 0) {
            listEl.innerHTML = '<li class="gb-empty">아직 방명록이 없어요. 첫 응원을 남겨보세요!</li>';
            return;
        }

        const sorted = [...entries].sort((a, b) => b.ts - a.ts); // 최신순
        listEl.innerHTML = sorted.map((e) => `
            <li class="gb-item">
                <div class="gb-head">
                    <span class="gb-name">${escapeHtml(e.name)}</span>
                    <span class="gb-stars">${'★'.repeat(e.rating)}${'☆'.repeat(5 - e.rating)}</span>
                    <button class="gb-del" data-id="${e.id}" aria-label="삭제">✕</button>
                </div>
                <p class="gb-msg">${escapeHtml(e.message)}</p>
                <span class="gb-date">${escapeHtml(e.date)}</span>
            </li>
        `).join('');
    }

    // 제출 → .value 읽어 배열에 push
    form.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const name = document.getElementById('gbName').value.trim();
        const message = msgEl.value.trim();
        const rating = Number(document.getElementById('gbRating').value);
        if (name === '' || message === '') return;

        entries.push({
            id: Date.now() + '-' + Math.random().toString(36).slice(2, 6),
            ts: Date.now(),
            name: name,
            message: message,
            rating: rating,
            date: new Date().toLocaleDateString('ko-KR')
        });

        saveGuestbook(entries);
        render();
        form.reset();
        if (countEl) countEl.textContent = '0 / 100';
    });

    // 삭제 → 배열 filter 로 제거
    listEl.addEventListener('click', (ev) => {
        const btn = ev.target.closest('.gb-del');
        if (!btn) return;
        entries = entries.filter(e => e.id !== btn.dataset.id);
        saveGuestbook(entries);
        render();
    });

    render();
}

/* ============================================
   7. localStorage 헬퍼
   ============================================ */

function loadState() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
        console.error('상태 불러오기 실패:', e);
        return {};
    }
}

function saveState(patch) {
    try {
        const next = Object.assign({}, loadState(), patch);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
        console.error('상태 저장 실패:', e);
    }
}

function markWatched(id) {
    const watched = loadState().watched || [];
    if (!watched.includes(id)) watched.push(id);
    saveState({ watched: watched });
}

/* ============================================
   8. 밤하늘 다크모드 토글
   ============================================ */

function setupTheme() {
    const btn = document.getElementById('themeToggle');
    if (loadState().theme === 'night') {
        document.body.classList.add('night');
        if (btn) btn.textContent = '☀️';
    }
    if (!btn) return;

    btn.addEventListener('click', () => {
        const night = document.body.classList.toggle('night');
        btn.textContent = night ? '☀️' : '🌙';
        saveState({ theme: night ? 'night' : 'day' });
    });
}

/* ============================================
   9. 배경음악 (자동재생 + 반복)
   ============================================ */

function setupMusic() {
    const bgm = document.getElementById('bgm');
    const btn = document.getElementById('musicToggle');
    if (!bgm) return;

    bgm.volume = 0.4;
    bgm.muted = true;                 // 음소거면 자동재생 허용됨
    bgm.play().catch(() => {});

    // 첫 상호작용에서 소리 켜기 (음악 버튼 클릭은 버튼 핸들러가 처리)
    function unmute(ev) {
        if (btn && ev && (ev.target === btn || btn.contains(ev.target))) return;
        bgm.muted = false;
        bgm.play().catch(() => {});
        ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(e =>
            window.removeEventListener(e, unmute));
    }
    ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(e =>
        window.addEventListener(e, unmute, { passive: true }));

    // 음악 버튼: 음소거 ↔ 재생 토글
    if (btn) {
        btn.addEventListener('click', () => {
            if (bgm.muted) {
                bgm.muted = false;
                bgm.play().catch(() => {});
                btn.textContent = '🔊';
            } else {
                bgm.muted = true;
                btn.textContent = '🔇';
            }
        });
    }
}

/* ============================================
   10. 스크롤 진행 바 + 맨 위로 버튼
   ============================================ */

function setupScrollUI() {
    const bar = document.getElementById('progressBar');
    const toTop = document.getElementById('toTop');

    function onScroll() {
        const el = document.documentElement;
        const max = el.scrollHeight - el.clientHeight;
        const pct = max > 0 ? (el.scrollTop / max) * 100 : 0;
        if (bar) bar.style.width = pct + '%';
        if (toTop) toTop.classList.toggle('show', el.scrollTop > 500);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (toTop) {
        toTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

/* ============================================
   초기화
   ============================================ */

function init() {
    createStars(120);
    setupShootingStars();
    createFlowers();
    setupEnterButton();
    renderSkinGallery('all');
    setupSkinFilter();
    setupScrollReveal();
    setupGuestbook();
    setupTheme();
    setupMusic();
    setupScrollUI();

    console.log('저장된 상태:', loadState());
}

document.addEventListener('DOMContentLoaded', init);

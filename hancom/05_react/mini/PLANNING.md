# 🎵 K-POP 인기 차트 앱 — 기획서 (최종)

> 한컴 수업 [42. 미니 프로젝트(React)]의 주제 변경 버전
> 원래 주제: React 용어 사전 앱 → 변경 주제: **K-POP 인기 차트 앱 (실시간 API 연동)**
> **상태: 전체 완료 ✅** (Phase 1~5 + 도전과제 + 추가 기능)

---

## 1. 프로젝트 개요

**Apple Music 공식 차트 피드**에서 실시간 인기곡 데이터를 받아와 보여주는 앱.
홈에서 곡 카드 목록을 보고, 카드를 클릭하면 그 곡의 상세 페이지로 이동한다.

| 항목 | 내용 |
|------|------|
| 앱 이름 | K-POP 차트 |
| 작업 폴더 | `hancom/05_react/mini` |
| 개발 도구 | Vite + React + React Router |
| 데이터 | Apple Music 차트 피드 (실시간, 인증 불필요) |

---

## 2. 데이터 소스: Apple Music 차트 피드

### 2-1. 왜 이걸 쓰나
- Apple이 공개한 **공식 마케팅 피드** → 약관 문제 없음 ✅
- **회원가입, API 키, 토큰 전부 불필요** ✅
- 곡명·가수명 **한글 그대로** 내려옴 ✅
- Apple Music 실제 인기차트라 **실시간 데이터** 요건 충족 ✅

### 2-2. 주소 구조

```
https://rss.marketingtools.apple.com/api/v2/kr/music/most-played/100/songs.json
                                          │            │           │    │
                                       국가(kr/us)   차트 종류    개수  형식(songs/albums)
```

### 2-3. 응답 데이터 (곡 1개의 모양)

```js
{
  id: "1887671067",              // 곡 고유 ID → 상세 페이지 주소에 사용
  name: "REDRED",                // 곡 제목
  artistName: "코르티스",         // 가수명 (한글)
  releaseDate: "2026-04-20",     // 발매일
  artworkUrl100: "https://...",  // 앨범 이미지 (100x100)
  genres: [{ name: "K-Pop" }],   // 장르 배열
  url: "https://music.apple.com/..." // Apple Music 링크
}
```

> 💡 이미지 주소의 `100x100`을 `600x600`으로 문자열 치환하면 고화질 이미지 (상세 페이지에서 사용).

### 2-4. ⚠️ CORS 문제와 해결 (구현 중 발견)
이 피드는 CORS를 허용하지 않아서 브라우저가 직접 fetch할 수 없다.
→ **Vite 프록시**로 해결: `vite.config.js`에서 `/apple-api/...` 요청을
개발 서버가 대신 Apple 서버로 전달해준다. (브라우저 → 내 서버는 같은 출처라 문제 없음)

### 2-5. 피드의 한계와 대응 (구현 중 확인)

| 원하는 것 | 피드 지원 | 대응 방법 |
|------|------|------|
| 전 세계 통합 차트 | ❌ 국가별만 제공 | Global = 미국(us) 차트 사용 (관례) |
| 신곡 전용 피드 | ❌ most-played만 제공 | TOP100 중 최근 발매곡 필터링 |
| K-POP만 골라내기 | ❌ 국적 정보 없음 | 장르 + 가수명 한글 여부로 필터링 |
| 공식 편집 플레이리스트 (인기 신곡 룸 등) | ❌ 유료 개발자 계정 필요 | 데이터 기반 근사치로 대체 |

---

## 3. 완성된 기능

### 3-1. 홈 페이지 (`/`)
- **🇰🇷 K-POP ↔ 🌍 Global 차트 전환** (상단 큰 탭)
- **🎵 곡 / 💿 앨범 / ✨ 신곡** 차트 종류 전환
- **TOP10 / 25 / 50** 개수 전환
- **검색 필터** — 곡 제목·가수명으로 즉시 필터링 (controlled input + `filter()`)
- **NEW 뱃지** — 최근 30일 이내 발매곡에 표시 (모든 탭 공통, 안내 문구 상시 표시)
- 로딩 중(스켈레톤 카드 — `[...Array(n)]` 반복 패턴) / 에러 / 검색 결과 없음 각각 조건부 렌더링
- 차트 선택 상태(country, chartType, limit, keyword)는 **App이 보관** (상태 끌어올리기)
  → 상세 페이지 갔다 와도 보던 탭·검색어 유지

### 3-2. 상세 페이지 (`/:country/:type/:id`)
- `useParams()`로 국가·종류·id를 읽어 해당 곡(앨범) 표시
- 앨범 이미지(600x600), 곡명, 가수, 장르, 차트(K-POP/Global), 현재 순위, 발매일
- **Apple Music에서 듣기** 외부 링크
- 곡을 못 찾으면 안내 문구 (조건부 렌더링)
- 상세 페이지에서 새로고침해도 동작 (페이지 자체에서 fetch)

### 3-3. K-POP 필터 (`isKoreanTrack`)
한국 스토어 차트에는 외국곡도 섞여 있어서 두 조건 중 하나면 K-POP으로 인정:
1. 장르에 `K-Pop`이 있거나
2. **가수명 또는 곡 제목**에 한글이 있으면 (`/[가-힣]/`)
   - 가수명 한글: 로제·악뮤처럼 장르가 록/팝인 한국 가수 대비
   - 제목 한글: 가수명은 영어지만 제목이 한글인 곡 대비

> 한계: 가수명·제목이 모두 영어이고 장르도 K-Pop이 아닌 한국 곡(예: MEOVV의 영어 제목 곡)은 못 잡음.
> 피드에 국적 데이터가 없어서 생기는 한계로, 과제 수준에서는 충분한 근사치.

### 3-4. 신곡 목록 로직
1. TOP100을 받아온다 (차트 자체가 이미 인기순)
2. 최근 60일 내 발매곡만 `filter()` → **순서가 그대로 "신곡 인기순"**
3. 선택한 개수(TOP50 등)를 못 채우면 기간을 30일씩 자동 확장 (`while`, 최대 1년)

---

## 4. 폴더 구조 (42번 정석 구조)

```
mini/
├── PLANNING.md              # 이 기획서
├── vite.config.js           # 프록시 설정 (/apple-api)
└── src/
    ├── main.jsx             # 진입점, <BrowserRouter>로 감싸기
    ├── App.jsx              # 라우트 정의 (주소 ↔ 페이지)
    ├── App.css              # 전역 레이아웃
    ├── index.css            # 리셋 + CSS 변수 (색상 한 곳 관리)
    ├── services/
    │   └── chartApi.js      # fetchChart(country, type, limit) + K-POP/신곡 필터
    ├── components/          # 재사용 부품
    │   ├── Navbar.jsx       # 공통 상단 바 (sticky + 그라디언트 로고)
    │   ├── Navbar.css
    │   ├── TrackCard.jsx    # 곡 카드 (props: track, rank, country, type) + NEW 뱃지
    │   ├── TrackCard.css
    │   ├── SkeletonCard.jsx # 로딩 중 회색 카드 (스켈레톤 UI)
    │   └── SkeletonCard.css
    └── pages/               # 화면 단위
        ├── HomePage.jsx     # 차트 목록 (탭·검색·조건부 렌더링)
        ├── HomePage.css
        ├── TrackPage.jsx    # 곡 상세 (useParams + 조건부 렌더링)
        ├── TrackPage.css
        ├── FavoritesPage.jsx # 즐겨찾기 목록 (localStorage 연동)
        ├── FavoritesPage.css
        ├── NotFoundPage.jsx # 404 페이지 (path="*")
        └── NotFoundPage.css
```

---

## 5. 라우트 설계

| 주소 | 페이지 | 설명 |
|------|--------|------|
| `/` | HomePage | 차트 카드 목록 |
| `/favorites` | FavoritesPage | ♥ 즐겨찾기한 곡 모음 (localStorage) |
| `/:country/:type/:id` | TrackPage | 곡(앨범) 상세 — 예: `/kr/songs/1887671067` |
| `*` | NotFoundPage | 없는 주소 → 404 안내 |

> 처음 설계는 `/track/:id`였지만, 곡/앨범 차트와 K-POP/Global 구분이 생기면서
> 상세 페이지도 어느 차트에서 왔는지 알아야 해서 주소를 확장했다.

---

## 6. 수업 내용 ↔ 실제 사용처

| 배운 내용 (단원) | 이 프로젝트에서 쓰인 곳 |
|------|------|
| 컴포넌트 + CSS 짝 (17~18번) | 모든 컴포넌트가 같은 이름 .css와 짝 |
| props (19~26번) | TrackCard가 track, rank, country, type을 받음 |
| 배열 map + key (26번) | 곡 배열 → 카드 렌더링, `key={track.id}` |
| 조건부 렌더링 (22번) | 로딩/에러/검색 결과 없음/NEW 뱃지/TOP3 강조/안내 문구 |
| useState (29~33번) | tracks, loading, error, country, chartType, limit, keyword |
| 폼 입력 관리 (32번) | 검색창 (controlled component) |
| useEffect (34~37번) | `[country, chartType, limit]` — 값 바뀔 때마다 다시 fetch |
| fetch + async/await (38~39번, JS 17번) | chartApi.js의 API 호출 |
| React Router (40번) | `<Link>`, `<Route>`, `useParams` |
| 배열 filter/sort/some (JS 수업) | 검색 필터, K-POP 필터, 신곡 필터 |
| CSS 변수/Grid/미디어쿼리/애니메이션 (CSS 수업) | 전체 스타일링 |

---

## 7. 개발 진행 기록

- [x] **Phase 1** — Vite 프로젝트 생성, react-router-dom, 폴더 구조, 라우터 뼈대
- [x] **Phase 2** — 더미 데이터로 UI 완성 (카드, 목록, 상세, 조건부 렌더링)
- [x] **Phase 3** — 실시간 API 연동 (CORS 발견 → Vite 프록시로 해결)
- [x] **Phase 4** — 스타일링 (CSS 변수, sticky 상단바, 카드 애니메이션, Grid 2열 반응형)
- [x] **Phase 5** — 도전과제: 검색 필터, 곡/앨범 전환, TOP10/25/50 전환
- [x] **추가 1** — K-POP ↔ Global 차트 전환 (라우트에 country 추가)
- [x] **추가 2** — 신곡 탭 (최근 발매곡 인기순 + 기간 자동 확장)
- [x] **추가 3** — NEW 뱃지 (30일 이내 발매곡, 전 탭 공통 + 안내 문구)
- [x] **추가 4** — K-POP 차트에서 외국곡 제외 (장르 + 한글 가수명 필터)
- [x] **버그 수정** — 긴 제목이 Grid 칸을 밀어내는 문제 → `minmax(0, 1fr)`
- [x] **추가 5** — 404 페이지 (`path="*"` + NotFoundPage)
- [x] **추가 6** — 상세 페이지 뒤로가기를 `useNavigate(-1)`로 변경 (보던 탭 상태 유지)
- [x] **추가 7** — 탭 라벨을 객체 매핑 패턴으로 리팩토링 (수업 24번)
- [x] **추가 8** — 차트 선택 상태를 App으로 끌어올리기 → 상세에서 돌아와도 탭 유지
  (navigate(-1)만으로는 부족했음: 페이지 컴포넌트가 새로 만들어지며 state가 리셋되기 때문)
- [x] **추가 9** — 로딩 스켈레톤 카드 (`[...Array(limit)]` 반복 — 수업 25번 패턴)
- [x] **추가 10** — 즐겨찾기 기능
  - 카드 ♥ 버튼 (Link 안의 버튼이라 `e.preventDefault()`로 카드 클릭과 분리)
  - localStorage 저장/복원 (JS 수업 16번 연계) — 새로고침해도 유지
  - `/favorites` 페이지 + Navbar에 개수 뱃지
  - 배열 state 불변성 지키기: 추가는 `[...favorites, 새항목]`, 삭제는 `filter()`
- [x] **추가 11** — 다크 모드
  - Navbar의 🌙/☀️ 토글 버튼 (삼항 연산자로 아이콘 전환)
  - `body.dark`에서 CSS 변수 값만 갈아끼우는 방식 — 색을 변수로 모아둔 덕분에 CSS 몇 줄로 끝
  - localStorage에 저장 → 새로고침해도 유지
- [x] **추가 12** — 마무리 점검 3종
  - useEffect **cleanup** (수업 35번): 탭 연타 시 이전 요청이 새 화면을 덮어쓰는 경합 방지 (`ignore` 표시)
  - **함수형 업데이트** (수업 29번): `setDarkMode(prev => !prev)`, `setFavorites(prev => ...)` 정석 패턴으로
  - **파일 정리**: 미사용 mockTracks.js(Phase 2 흔적), Vite 기본 assets/아이콘 삭제
- [x] **추가 13** — Netlify 배포 대응 (`public/_redirects`)
  - 프록시 규칙: `/apple-api/* → Apple 서버` (Vite 프록시의 배포판)
  - SPA 규칙: `/* → /index.html` (라우터 주소에서 새로고침 시 404 방지)
- [x] **추가 14** — 배포 후 개선
  - **캐시**: 같은 차트 데이터를 다시 다운로드하지 않음 (TOP10↔50 전환 즉시 반응)
  - **이미지 lazy 로딩**: `loading="lazy"` — TOP50에서 보이는 카드의 이미지만 먼저 로드
  - **탭 상태 localStorage 저장**: 새로고침해도 보던 차트 유지
- [x] **추가 15** — 데이터 출처(Apple Music) 표기
  - Navbar 로고: "APPLE MUSIC K-POP 차트"
  - 모든 페이지 하단 푸터: "차트 데이터 출처: Apple Music 공식 인기 차트 피드 (실시간)" + 링크

---

## 8. 주의사항 / 배운 점

| 항목 | 내용 |
|------|------|
| CORS | 서버가 허용 안 하면 브라우저 fetch 불가 → 개발 서버 프록시로 우회 |
| Grid `1fr` 함정 | 내용물 최소 크기 이하로 안 줄어듦 → 말줄임에는 `minmax(0, 1fr)` 필수 |
| useEffect 의존성 | `[]`=처음 1번, `[값]`=값 바뀔 때마다 — 탭 전환에 활용 |
| 페이지 이동과 state | 라우트가 바뀌면 페이지 컴포넌트는 사라지고 state도 초기화됨 → 유지하려면 안 사라지는 부모(App)로 **상태 끌어올리기** |
| localStorage + state | 시작할 때 `useState(() => 저장값 읽기)`, 바뀔 때 `useEffect`로 저장 — 새로고침에도 살아남는 상태 (즐겨찾기·다크 모드에 사용) |
| CSS 변수의 힘 | 색을 `:root` 변수로 모아두면 다크 모드가 "변수 값 교체" 몇 줄로 구현됨 |
| fetch + cleanup | 값이 바뀌어 새 요청이 시작되면 이전 요청은 cleanup에서 무시 처리 — 응답 순서가 꼬여도 안전 |
| 버튼·입력창 글자색 | `<button>`·`<input>`은 body 색을 상속 안 함 → 다크 모드에서 검정 글자 함정, `color` 직접 지정 필요 |
| 즐겨찾기의 한계 | 차트에서 빠진 곡은 상세 페이지에서 못 찾을 수 있음 (상세가 차트 TOP100에서 검색하므로) |
| API 호출 횟수 | 항상 100개를 받아 프론트에서 필터링 (필터 후에도 limit을 채우기 위해) |
| 데이터의 현실 | 공개 API가 원하는 모양 그대로 주는 경우는 드물다 — 필터/정렬로 가공하는 게 실무 |
| 프록시는 개발용 | `npm run dev`에서만 동작 → 배포 시 실제로 겪음. Netlify에선 `public/_redirects`의 프록시 규칙으로 해결 |
| SPA 배포와 새로고침 | React Router 주소(`/favorites` 등)에서 새로고침하면 서버엔 그 파일이 없어 404 → `/* /index.html 200` 규칙 필요 |

---

**작성일**: 2026-07-13 · **완성일**: 2026-07-13

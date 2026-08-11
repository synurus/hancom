# Zeteo · PART C 인수인계

> 새 대화에서 이어가기 위한 문서. 이 파일 하나만 읽으면 맥락이 복원되도록 작성.
> 최종 갱신: 2026-08-03 (Day 0)

---

## 0. 새 대화 시작할 때

이 파일과 아래 파일들을 같이 올리고 시작하면 된다.

| 파일 | 역할 |
|---|---|
| `Zeteo_PARTC_인수인계.md` | **이 문서** |
| `Zeteo — 기술 구현 기획서.html` | **최상위 기준 문서** |
| `Zeteo — 라이어 게임 룰북 & 화면 설계.html` | 화면 설계 원본 |
| `Zeteo_PARTC_작업계획서.md` | 파트 C 상세 계획 |
| `zeteo-partc.zip` | 현재까지의 코드 |

시작 프롬프트 예시:

> Zeteo 프론트엔드 팀 프로젝트의 PART C(게임 화면)를 맡고 있어. 인수인계 문서 읽고 이어서 진행해줘.

---

## 1. 프로젝트 개요

**Zeteo** — 라이어 게임 안에 봇 1명을 섞어두고, 게임이 끝나면 *"이 중 누가 사람이 아니었나"*를 지목하는 웹 게임. 프론트엔드 팀 프로젝트.

| 항목 | 값 |
|---|---|
| 착수 | 2026-08-03(월) |
| 1차 MVP | 2026-08-09(일) |
| 완성 목표 | 2026-08-23(일) |
| 인원 | 5인 게임 = **사람 4 + 봇 1** |
| 스택 | TypeScript · React + Vite · Node + Express + **raw `ws`** · 서버메모리→SQLite · Alibaba Token Plan(LLM) |

### 파트 분담

| 파트 | 담당 | 범위 |
|---|---|---|
| A · 서버 | **유민성** | WS 서버, 상태머신, 투표 집계, 타이머, 상태 필터링(`view.ts`) |
| B · 봇 | **김정현** | LLM 클라이언트, 프롬프트, 발언 타이밍 |
| **C · 게임 화면** | **이현우 (나)** | S0~S5 화면 6개 + 공통 컴포넌트 4개 |
| D · 공통 | **박진** | 랜딩, 방 입장, S6 봇 지목, S7 결과, 디자인 토큰, 버튼 |

### ⚠️ 문서 우선순위

`기술구현_및_협업가이드_v2.md`와 `Zeteo — 기술 구현 기획서.html`이 **서로 충돌**한다
(Socket.IO vs raw `ws` / OpenAI vs Alibaba / Supabase vs 메모리→SQLite / Railway vs 미정).

**→ `Zeteo — 기술 구현 기획서` 기준으로 진행하기로 확정.** 협업가이드 v2는 참고용.

---

## 2. PART C 범위와 경계

### 한 줄 정의

> 서버가 내려준 `GameState` 하나를 받아, 지금 무엇을 보여주고 무엇을 잠글지 결정해 그린다.

### 절대 하지 않는 것

- 게임 로직 판단 (승패·과반·다음 페이즈) → A
- 카운트다운 계산 소유 → 서버가 `deadlineAt`(절대 시각)만 준다
- 증분 상태 관리 → 상태는 바뀔 때마다 **전체가** 온다. "받으면 다시 그린다"
- 랜딩/방입장/S6/S7/디자인토큰/버튼 → D

### 담당 화면·컴포넌트

```
screens/  RoleReveal(S0) Describe(S1) Debate(S2) FinalDefense(S3) LifeVote(S4) Reveal(S5+S5a)
          GameScreen ← 파트 C 단일 진입점
components/  Chat  VotePanel  PlayerList  Timer
mock/  states.ts (C·D 공유)  MockHarness.tsx
```

---

## 3. 현재 상태 — 완료된 것

### 코드 (`zeteo-partc.zip`)

31개 파일. **바로 실행 가능**:

```bash
cd zeteo-partc
npm install
npm run dev     # http://localhost:5173/
```

- `/` → mock 16개 목록
- `/?mock=debate-round2-spared` → 해당 화면 직행

### 검증 상태

- `tsc --noEmit` (strict + noUnusedLocals + noUnusedParameters) 통과
- `vite build` 성공
- **mock 16개 전부 렌더 확인, 콘솔 에러 0건** (Playwright 자동 검증)

### mock 16개

| 그룹 | 키 |
|---|---|
| S0 | `roleReveal-citizen` `roleReveal-liar` |
| S1 | `describe-myturn` `describe-waiting` |
| S2 | `debate-novote` `debate-voted` **`debate-round2-revote`** **`debate-round2-spared`** |
| S3 | `finalDefense-other` `finalDefense-accused` |
| S4 | `lifeVote-voter` `lifeVote-accused` |
| S5 | `reveal-citizen` **`reveal-liar`** `guessWord-liar` `guessWord-watcher` |

굵은 글씨 3개는 유민성 리뷰 요청으로 추가한 것.

### ⚠️ 임시 파일 — Day 0 통합 시 버릴 것

혼자 화면 확인하려고 만든 것들. 팀 저장소 스캐폴드가 나오면 대체한다.

`package.json` `vite.config.ts` `tsconfig.json` `.gitignore` `client/index.html` `client/src/main.tsx` `client/src/base.css`

**가져갈 것은 `client/src/{screens,components,mock}` 과 `shared/types.ts` 뿐.**

---

## 4. 확정된 설계 결정 (근거 포함)

나중에 "왜 이렇게 했지?"가 나오면 이 표로 답한다.

| # | 결정 | 근거 |
|---|---|---|
| 1 | **`Timer`는 `deadlineAt - Date.now()`를 매 틱 재계산** | `remaining--` 누적 방식은 탭 백그라운드 시 `setInterval` throttle로 시간이 밀린다. 기획서 9절 검증항목 4(4탭 1초 이내 일치)에서 확정적으로 실패 |
| 2 | **`game.css`는 `var(--토큰, fallback)`만 사용** | D의 `tokens.css`가 늦어도 렌더된다. 나오면 fallback만 지우면 끝 — 되돌릴 코드가 없음 |
| 3 | **과반·투표자 수는 전부 `players.length`에서 계산** | 기획서 1절: 투표자 = 참가자−1, 과반 = ⌊투표자/2⌋+1. 인원이 바뀌어도 안 깨짐 |
| 4 | **`GameScreen.tsx` 단일 진입점** | D의 `App.tsx`는 이것 하나만 마운트하면 되고 C의 화면 6개를 몰라도 된다. 공유 폴더 충돌 감소 |
| 5 | **`Reveal.tsx`가 `reveal`+`guessWord` 둘 다 담당** | 룰북상 "처형자가 라이어일 때만" 추측이 붙는 연속 흐름. 쪼개면 전환이 끊겨 보임 |
| 6 | **`Chat`은 잠금 여부를 prop으로 받음** | 컴포넌트가 룰을 알지 않는다. 잠금 판단은 화면이 한다 |
| 7 | **`VotePanel`은 정렬하지 않음** | 표가 바뀔 때마다 순서가 튀면 클릭 대상이 흔들린다 |
| 8 | **자기 자신도 투표 후보에 포함** | 룰북: 자기 자신에게 투표 가능, 제한 없음 |
| 9 | **재투표·복귀 시 이전 채팅 유지** | 룰북 S4 *"매 라운드 정보가 누적되어 자연히 수렴한다는 전제"*. 지우면 전제가 깨짐 |
| 10 | **`round`는 헤더 배지, 사건 설명은 시스템 메시지** | `round`=상태(항상 보임), 시스템 메시지=사건(왜 돌아왔나). 대체 관계가 아님 |
| 11 | **`.is-system`에 위아래 구분선** | 로그를 지우지 않으므로 시스템 메시지가 라운드 경계선 역할을 한다 |
| 12 | **`reveal-liar`의 `liarGameResult`는 `null`** | 적발 시점엔 승패 미정. 추측 결과가 나와야 확정 |

---

## 5. Day 0 안건 — 계약 구멍 ★1~★6

`shared/types.ts`에 ★ 주석으로 근거까지 달아둔 상태. **유민성님이 6개 전부 타당하다고 판단, 오늘 회의에서 "승인이 아니라 확정"으로 처리 예정.**

| ★ | 필드 | 왜 필요한가 |
|---|---|---|
| **★1** | `myId: string` | 클라이언트가 자기 id를 알 방법이 계약에 **아예 없었다**. `currentTurn === 내 id`(S1 잠금), `accused === 내 id`(S4 분기)를 못 함. `ServerEvent`가 `state`/`error` 둘뿐이라 join 응답으로도 못 받음. **유민성님이 "기획서 초안의 실수"로 인정** |
| ★2 | `round: number` | 재투표·"살린다" 복귀 시 `phase`가 그대로 `debate`라 화면이 라운드를 모름 |
| ★3 | `myLifeVote: boolean \| null` | `myVote`는 S2 지목용(`string\|null`). kill/spare를 담을 자리가 없음 |
| ★4 | `lifeVoteCounts: {kill, spare}` | `voteCounts`는 `Record<playerId, number>`. 두 값이 안 들어감 |
| ★5 | `revealedRole` + `liarGameResult` | `PublicPlayer`엔 `role`이 없고 `myRole`은 내 것뿐. "박진은 시민이었습니다"를 그릴 근거가 없음 |
| ★6 | `speakerId: 'system'` 예약 | 시스템 안내가 `players`에서 이름 매칭 실패 |

### ★7 후보 → **폐기 결론**

유민성님이 *"동점 재투표와 살린다 복귀를 화면에서 구분할 건가"*를 물었고, `returnReason: 'tie' | 'spared'` 같은 필드가 필요하면 ★7이 되는 상황이었다.

**결론: 필요 없다. ★6(시스템 메시지)로 충분.** 근거 2가지:

1. 필드로 만들면 화면이 그걸 문구로 번역해야 해서 **카피가 프론트에 하드코딩**된다. 시스템 메시지는 서버가 문장까지 만들어 보내니 A가 한 곳에서 관리
2. *"박진님이 살아남았습니다"*처럼 **이름이 들어간 문장은 필드로 표현 불가**

실물 렌더로 검증 완료 (`partc_round2_compare.png`). 살린다 쪽은 최후 변론 단계를 거쳐왔기 때문에 **로그의 모양 자체가 다르다** — 구분선 2개 사이에 변론 발언이 들어간다.

### ★7 신규 후보 — `guessedWord`

라이어가 **뭐라고 찍었는지**를 결과 화면에 보여주려면 필요 (6절 참고). 아직 제기 안 함.

---

## 6. 미해결 — 룰북의 빈 구멍

### 제시어 추측 **결과** 화면이 없다

룰북 S5의 두 칸이 비대칭이다.

- `라이어가 아니었을 때` → 판정 **결과**까지 보여줌 ("박진은 시민이었습니다 / 라이어 승리")
- `라이어였을 때 → 추측` → **입력 화면에서 끝남.** 맞혔을 때/틀렸을 때가 없음

규칙엔 *"추측 성공 → 라이어 승 / 실패 → 시민 승"*이 있는데 대응 화면이 없다. `Phase` 타입도:

```
'reveal' → 'guessWord' → 'botVote' → 'result'
```

`guessWord` 다음이 곧바로 `botVote`. **추측 결과를 띄울 페이즈 자체가 없다.**

결과는 S7(파트 D)에서 나오지만 그 사이에 S6 봇 지목이 통째로 끼어서 두 문제가 생긴다:
1. 라이어 게임이 끝났다는 감각 없이 봇 지목을 하게 됨
2. S6의 *"라이어 게임인 줄 알았지?"* 반전 연출이 약해짐

**제안 A (추천): `guessWord` → `reveal`(결과) → `botVote`로 `reveal`을 한 번 더 거치게 한다.**
타입 변경 없음. A의 상태머신 전이 하나 추가. `Reveal.tsx` 그대로 동작.
단, 라이어가 찍은 단어를 보여주려면 `guessedWord: string | null` 필요.

제안 B: `guessResult` 페이즈 신설 → `[types]` PR 필요.

**상태: 유민성님께 제기함. 답변 대기 중.**

---

## 7. 확인 대기 중인 것들

| 항목 | 현재 구현 | 상태 |
|---|---|---|
| `guessWord` 입력 권한자 | `myRole==='liar' && accused===myId`인 사람만 | A 확인 대기 |
| S4 생사 투표 번복 허용 | 허용 (S2와 동일하게) | 룰북에 명시 없음 |
| "살린다" 이후 **재지목** 가능 | 가능 (후보에 다시 올라옴) | 룰북에 금지 규칙 없음 |
| 최후 변론 발언이 토론 로그에 섞임 | 그대로 표시 (정보 누적) | A 확인 대기 |
| 각 단계 제한시간 5개 값 | mock에 임시값 | Day 2 결정 |
| 묘사 턴 조기 종료("넘기기") 버튼 | 없음 | 넣으려면 `ClientEvent` 추가 = **types 변경** |

### 문서 정합성 TODO

`shared/types.ts`의 ★ 번호(1~6)와 `Zeteo_PARTC_작업계획서.md` 3절의 번호(1~8)가 **서로 다르다.**
유민성님이 "★1 myId"라고 부른 걸 보면 **types.ts 번호가 통용되고 있으니**, 작업계획서 3절을 거기 맞춰 정리할 것.

---

## 8. 유민성(A)과의 진행 상황

### 받은 리뷰 (어젯밤)

확인된 것: mock에 `: GameState` 타입 붙인 것 / `var(--토큰, fallback)` 방식 / 과반 계산식 / `GameScreen` 단일 진입점 + `default: return null`

**★ 6개 전부 타당 판정. ★1 `myId`는 기획서 초안의 실수로 인정. 오늘 회의에서 확정 처리 예정.**

요청 2건:
1. `reveal-liar` mock 없음 → **완료** (`liarGameResult`는 `null`로 수정해서 추가)
2. `round: 2` 화면 요청 + 세 질문 → **완료**

### 보낸 답장 (초안 작성 완료, 발송 여부 미확인)

- Q1 채팅 남김 / Q2 헤더 배지 / Q3 시스템 메시지로 충분, ★7 불필요
- `round` 필드는 유지 필요 (스크롤 문제)
- 추가 질문 2건: 최후 변론 발언이 로그에 섞이는 게 의도인지, "살린다" 이후 재지목 가능한지

첨부 스크린샷: `partc_mock_14screens.png`, `partc_round2_compare.png`

---

## 9. 다음 할 일

**Day 0 (8/3, 오늘)**
- [ ] 오전 회의에서 ★1~★6 확정
- [ ] 6절(추측 결과 화면) 결론 내기 → A안이면 `guessedWord` 필드도 함께
- [ ] 박진님과 **디자인 토큰 이름 목록** 합의 (`--color-bg --color-surface --color-line --color-text --color-muted --color-accent --color-danger --space-2 --space-4 --radius --font-body`)
- [ ] 팀 저장소 스캐폴드에 `client/src/{screens,components,mock}` 이식
- [ ] `feat/game-ui` 브랜치 첫 커밋

**Day 1 (8/3 오후)**
- [ ] `Chat` `PlayerList` 실 데이터 연동 준비
- [ ] 저녁: 봇 발화 블라인드 테스트 참여 (전원)

**남은 작업**
- [ ] A의 `net/socket.ts` / `useGameState` 훅 연동 자리
- [ ] Day 3(8/5) 1차 통합 대비
- [ ] Day 4(8/6) 타이머 4탭 동기화 검증

---

## 10. Git 운영 (C 해당분)

| 항목 | 규칙 |
|---|---|
| 브랜치 | `feat/game-ui` |
| 병합 | `dev`로 PR + 1명 승인. 30분 내 리뷰 없으면 병합 후 Discord 알림 |
| 매일 아침 | `git checkout dev && git pull` → 자기 브랜치에서 `git merge dev` |
| 커밋 | `feat(ui): 투표 패널 득표 수 표시` / `fix(ui): 타이머 백그라운드 복귀 시 튐` |
| 이슈 | `part:C` 라벨. 커밋에 `#12`, 종료는 `fixes #12` |
| types 변경 | Discord 공지 후, PR 제목에 `[types]` |
| `main` | 김정현만 병합 |

---

## 11. 완료 판정 (8/9)

> 서버 없이 mock 데이터만으로 6개 화면이 전부 렌더되고, URL로 페이즈를 바꿔 전환을 확인할 수 있다.

**→ 이미 충족.** 남은 것은 실제 서버 연동 후:

- [ ] 실제 서버 연결로 S0→S5 전환이 mock 없이 동작
- [ ] 4개 탭이 서버 페이즈 전환 시 동시에 같은 화면으로 넘어감
- [ ] 타이머 4탭 1초 이내 일치, 탭 전환 후 안 튐
- [ ] 어느 화면에서도 `isBot` · 타인의 `role` · 타인의 투표 대상이 노출되지 않음

# Zeteo · PART C 인수인계

> 새 대화에서 이어가기 위한 문서. 이 파일 하나만 읽으면 맥락이 복원되도록 작성.
> 최종 갱신: **2026-08-04 저녁 (Day 1 · 4차)** · 이전판: 같은 날 저녁·오후·오전 · 2026-08-03 (Day 0)

---

## 0. 새 대화 시작할 때

이 파일과 아래를 같이 올리고 시작한다.

| 파일 | 역할 |
| --- | --- |
| `Zeteo_PARTC_인수인계.md` | **이 문서** |
| `Zeteo 기술 구현 기획서 v2.0.html` | **최상위 기준 문서** (v1.0은 참고용) |
| — | 코드는 저장소에서 clone (아래 1절) |

시작 프롬프트 예시:

> Zeteo 프론트엔드 팀 프로젝트의 PART C(게임 화면)를 맡고 있어. 인수인계 문서 읽고 이어서 진행해줘.

**호칭**: 파트 A(서버) 담당자는 실명 대신 **"관리자"** 로 부른다.

> ⚠️ 저장된 HTML 기획서는 껍데기다. 본문은 `<파일명>_files/saved_resource.html` 에 들어 있다.

### 🔴 시작하면 이것부터

`dev` 는 후행 지표다. 이 팀은 PR 승인이 늦어 작업이 브랜치에 쌓인 채 머물고,
**반나절 단위로 크게 바뀐다.** Day 1 오전에 본 상태가 오후에 이미 틀렸다.

```bash
git fetch origin --prune
for b in feat/server feat/bot feat/layout; do
  echo "=== $b"; git log --oneline origin/dev..origin/$b
done
git branch -avv
```

**그리고 남의 브랜치가 내 파일을 지우고 있지 않은지 본다.** Day 1에 실제로 일어났다(7절 R8).

```bash
git ls-tree -r --name-only origin/feat/server -- apps/frontend | wc -l   # 27이어야 정상
```

---

## 1. 프로젝트 개요

**Zeteo** — 라이어 게임 안에 봇 1명을 섞어두고, 게임이 끝나면 *"이 중 누가 사람이 아니었나"* 를 지목하는 웹 게임.

| 항목 | 값 |
| --- | --- |
| 착수 | 2026-08-03(월) |
| 1차 MVP | 2026-08-09(일) |
| 완성 목표 | 2026-08-23(일) |
| 인원 | 5인 게임 = **사람 4 + 봇 1** |
| 스택 | TypeScript · React + Vite · Node + Express + **socket.io** · 서버메모리 · Anthropic 프로토콜 호환 LLM |
| 저장소 | `https://github.com/Scalmia/Zeteo.git` (**public**) |

### 파트 분담

| 파트 | 담당 | GitHub | 범위 |
| --- | --- | --- | --- |
| A · 서버 | **관리자** | `Yooharii` | 소켓 서버, 상태머신, 투표 집계, 타이머, `view.ts` 유출 차단 |
| B · 봇 | 김정현 | `Scalmia` (저장소 소유자) | LLM 클라이언트, 프롬프트, 발언 타이밍, **`shared-types` 관리** |
| **C · 게임 화면** | **나 (이현우)** | `synurus` | S0~S5 화면 6개 + 공통 컴포넌트 4개 |
| D · 공통·결과 | 박진 | — | 랜딩, 대기실, S6 봇 지목, S7 결과, 디자인 토큰 |

---

## 2. PART C 범위와 경계

### 한 줄 정의

> 서버가 내려준 `GameState` 하나를 받아, 지금 무엇을 보여주고 무엇을 잠글지 결정해 그린다.

### 절대 하지 않는 것

- 게임 로직 판단 (승패·과반·다음 페이즈) → A
- 카운트다운 계산 소유 → 서버가 `deadlineAt`(절대 시각)만 준다
- 증분 상태 관리 → 상태는 바뀔 때마다 **전체가** 온다
- 랜딩/대기실/S6/S7/디자인토큰/버튼 → D

### 담당 파일

```
apps/frontend/src/
  screens/  RoleReveal(S0) Describe(S1) Debate(S2)
            FinalDefense(S3) LifeVote(S4) Reveal(S5+S5a)
  screens/GameScreen.tsx      ← 파트 C 단일 진입점
  screens/game.css
  components/  Chat  VotePanel  PlayerList  Timer
  mock/  states.ts (C·D 공동)  MockHarness.tsx
```

**연결 규약**: D는 게임 페이즈일 때 `<GameScreen state onEvent />` 하나만 마운트한다.
→ **실제로 배선됐다.** `feat/layout` 의 `App.tsx` 가 `GameScreen` 과 `MOCK_STATES` 를 import 한다 (3절).

---

## 3. 현재 상태 (2026-08-04 저녁)

### 내 브랜치 `feat/game-ui`

```
5224861  fix(ui): 토큰 이름을 Day 0 합의값으로 되돌림 (--color-line, --radius)   ← 최신
e321066  fix(ui): 토큰 이름을 D의 tokens.css에 맞춤 (--color-divider, --radius-md)  ← 잘못된 판단, 위에서 상쇄
52fe0b1  fix(ui): 시스템 메시지 가독성 — 배경 띠 + 본문 등급 상향
6693395  chore: 줄바꿈을 LF로 통일 (.gitattributes)   ← 관리자
63e04ca  fix(ui): reveal-citizen의 liarGameResult를 null로 정정 (기획서 v2.0 §4)
82a0c0b  feat(ui): 라운드 배지 · 재투표/살린다 mock · reveal-liar 추가
```

원격과 동기화됨. `e321066` + `5224861` 은 서로 상쇄되어 **52fe0b1 대비 순변화는 상단 주석뿐**이다.

**PR #1** `feat/game-ui` → `dev` · Open · 승인 대기
`https://github.com/Scalmia/Zeteo/pull/1`

> 🔴 브랜치 보호로 **승인 1건이 없으면 병합 불가**.

### 전 브랜치 현황

| 브랜치 | HEAD | 상태 |
| --- | --- | --- |
| `dev` | `c73df21` | 착수(`e887783`) + `.gitattributes` **뿐** |
| `main` | `c5ec793` | dev와 **갈라져 있음**. docs 커밋 4개가 main에만 |
| `feat/server` | `ff304bb` | R2 완료 · 계약 확정분 반영 · 🔴 **apps/frontend 삭제** |
| `feat/layout` | `182681c` | 랜딩·대기실·S6·S7·다크토큰·**GameScreen 배선** |
| `feat/bot` | `b49b10b` | `.gitattributes` 하나뿐. B 작업분은 dev에만 |
| `feat/game-ui` | `5224861` | 내 것 |

### `feat/server` — 잘 된 것과 사고

```
861fa8c  feat: 라이어게임 서버 로직 이식        ← R2 + bot/ 삭제
81117da  v2 기획안 적용
129c42f  v2 기획안 누락 해결                     ← label 도입
458588e  최종 수정
1360583  fix(backend): assignLabel 오타 수정
4943704  discord 요구사항 반영                   ← 계약 확정분 + 🔴 apps/frontend 삭제
ff304bb  discord 요구사항 수정
```

**된 것**: `vote.ts` 집계, `stateMachine.ts` 루프 2개, `index.ts` 소켓·봇 호출·botVote·survey,
`view.ts` 가 신규 5필드를 전부 result-only로 게이팅. 파트 C의 설계 판단을 그대로 지킨다.

**사고**: `4943704` 가 `apps/frontend` 27개 파일을 통째로 삭제했다 (7절 R8).

### `feat/layout` — 파트 D가 GameScreen을 배선했다

`App.tsx` 가 랜딩 → 대기실 → **게임 6단계** → 봇지목 → 결과를 "다음 단계" 버튼으로 잇는다.

**파트 C가 지켜야 할 결합 2개** (D 파일에 주석으로 명시돼 있다):

| 결합 | 내용 |
| --- | --- |
| `PLAYTHROUGH_SEQUENCE` | mock 키 6개 하드코딩. **키 이름을 바꾸면 D가 깨진다** |
| `myId = 'p3'` | mock 16개가 전부 p3 기준. D의 대기실도 여기 맞췄다 |

### 완료 판정 (8/9 기준)

> 서버 없이 mock 데이터만으로 6개 화면이 전부 렌더되고, URL로 페이즈를 바꿔 전환을 확인할 수 있다.

**→ 충족.** 기획서 §5는 파트 C를 **90%** 로 기재.

### mock 16개

```bash
npm run dev -w frontend      # http://localhost:5173/?mock=
```

| 그룹 | 키 |
| --- | --- |
| S0 | `roleReveal-citizen` `roleReveal-liar` |
| S1 | `describe-myturn` `describe-waiting` |
| S2 | `debate-novote` `debate-voted` `debate-round2-revote` `debate-round2-spared` |
| S3 | `finalDefense-other` `finalDefense-accused` |
| S4 | `lifeVote-voter` `lifeVote-accused` |
| S5 | `reveal-citizen` `reveal-liar` `guessWord-liar` `guessWord-watcher` |

---

## 4. 확정된 설계 결정 (근거 포함)

| # | 결정 | 근거 |
| --- | --- | --- |
| 1 | `Timer` 는 `deadlineAt - Date.now()` 를 **매 틱 재계산** | `remaining--` 누적은 탭 백그라운드 시 throttle로 밀린다 |
| 2 | `game.css` 는 `var(--토큰, fallback)` 만 사용 | D의 `tokens.css` 가 늦어도 렌더된다 |
| 3 | 과반·투표자 수는 전부 `players.length` 에서 계산 | 인원이 바뀌어도 안 깨짐 |
| 4 | `GameScreen.tsx` 단일 진입점 | D는 이것 하나만 마운트 |
| 5 | `Reveal.tsx` 가 `reveal`+`guessWord` 둘 다 담당 | 연속 흐름. 쪼개면 전환이 끊겨 보임 |
| 6 | `Chat` 은 잠금 여부를 prop으로 받음 | 컴포넌트가 룰을 알지 않는다 |
| 7 | `VotePanel` 은 정렬하지 않음 | 순서가 튀면 클릭 대상이 흔들린다 |
| 8 | 자기 자신도 투표 후보에 포함 | 룰북: 자기 자신에게 투표 가능 |
| 9 | 재투표·복귀 시 이전 채팅 유지 | 룰북 S4 *"매 라운드 정보가 누적되어 자연히 수렴한다"* |
| 10 | `round` 는 헤더 배지, 사건 설명은 시스템 메시지 | `round`=상태, 시스템 메시지=사건. 대체 관계가 아님 |
| 11 | 시스템 메시지에 배경 띠 + 본문 등급 상향 | 테두리만으로는 대비가 낮아 경계가 안 읽혔다(실측). **목적은 긴 로그에서 라운드 경계를 찾는 것** |
| 12 | `reveal` 에서 `liarGameResult` 는 **항상** `null` | 5절 참조 |
| 13 | **토큰 이름은 Day 0 합의 11개를 쓴다. 바꾸지 않는다** | 한 번 `--color-divider`/`--radius-md` 로 바꿨다가 되돌렸다(`e321066`→`5224861`). D의 **라이트 초안에만** 있던 이름이었다. **남의 소유 파일에서 확정 전 이름을 따라가면 안 된다** |

---

## 5. 계약 (`packages/shared-types`) — 🔒 동결됨

**2026-08-04, 파트 B(저장소 소유자)가 이 파일을 잠갔다.** 변경이 필요하면 고치지 말고 그쪽에 말한다.
그리고 혼동 방지를 위해 **더 이상 변경하지 않기로** 확정됐다.

> **귀결**: 파트 C가 화면 그리다 필드가 더 필요해져도 못 넣는다.
> ★1~★6이 그렇게 나온 걸 생각하면 감수하는 리스크다.

### ★1~★6 확정 (v2.0) — 파트 C가 발견한 것들

| ★ | 필드 | 왜 필요했나 |
| --- | --- | --- |
| **★1** | `myId: string` | 클라이언트가 자기 id를 알 방법이 계약에 **아예 없었다**. 기획서가 "v1.0의 명백한 누락"으로 명기 |
| ★2 | `round: number` | 재투표·복귀 시 `phase` 가 그대로 `debate` 라 화면이 라운드를 모름 |
| ★3 | `myLifeVote: boolean \| null` | `myVote` 는 S2 지목용. kill/spare 자리가 없음 |
| ★4 | `lifeVoteCounts: {kill, spare}` | `voteCounts` 는 `Record<playerId, number>` |
| ★5 | `revealedRole` + `liarGameResult` | "박진은 시민이었습니다"를 그릴 근거가 없음 |
| ★6 | `speakerId: 'system'` 예약 | 시스템 안내가 `players` 에서 이름 매칭 실패 |

### 동결에 포함된 변경 (`feat/server` 에 있음, dev 미반영)

| 변경 | 파트 C 영향 |
| --- | --- |
| **`PublicPlayer.name` → `label`** | 🔴 **14곳** — Chat 1 · PlayerList 1 · VotePanel 2 · Describe 1 · FinalDefense 1 · LifeVote 1 · Reveal 2 · mock 5 |
| `GameState` 신규 5필드 | 🔴 **1곳** — `mock/states.ts` 의 `base` (TS2739) |
| `SurveyReason { id, label }` 신설 | 없음 |
| `Phase` 에 `'survey'` | 없음. `default: return null` 이 받아낸다 |
| `ClientEvent` 에 `survey` | 없음 (파트 D용) |
| `BotAction` `speak` → `describe`/`chat` 분리 | 없음 (파트 A·B 계약). **아직 미반영** |

**`label` 은 의도된 결정이다.** 게임 중에는 실명/아이디가 아니라 서버가 임의 배정한 닉네임
("참가자 7")으로 진행한다 — **아이디만으로도 봇 판별에 영향을 주기 때문**이다.

신규 5필드와 기본값:

```ts
botVoteCounts: { voted: number; total: number };  // S6 진행도 — 스포일러 아님, 항상 실제 값
botVoteCorrectCount: number;                      // result 이전엔 0
revealedBotId:  string | null;                    // result 이전엔 null
revealedLiarId: string | null;                    // result 이전엔 null
reasons: SurveyReason[];                          // result 이전엔 []
```

`view.ts` 가 이미 전부 result-only로 게이팅하고 있다(확인함). 설계원칙 5 그대로다.

**파트 C가 할 일** — `mock/states.ts` 의 `base` 에 위 기본값 5줄 + `name` → `label` 14곳.

> **⚠️ 순서 제약 — 미리 하면 안 된다.** 현재 dev 계약 기준으로는 `TS2353` 으로 **반대로 깨진다**.
> 계약이 dev에 들어오는 **그 머지에서 같이** 한다. 양방향 다 실측 확인했다.

### 시스템 메시지 — `label` 로 수정 완료

`view.ts` 는 `label` 만 내보내는데 `stateMachine.ts` 가 실명을 쓰고 있었다.
**지목이 일어날 때마다 실명↔라벨 매핑이 로그로 새는 구멍**이었다(봇이 지목되면 `"테스트봇"` 이 그대로 노출).
`4943704` 에서 `.label` 로 수정됨(확인함).

확정 문안 3종도 이렇게 바뀐다:

```
동점입니다. 재투표를 시작합니다.
참가자 7님이 최다 득표로 지목되었습니다.
참가자 7님이 살아남았습니다. 토론을 재개합니다.
```

> **규칙**: 앞으로 추가되는 시스템 메시지도 **사람을 가리킬 때는 `label` 만 쓴다.**
> 이 버그는 "익명화는 `view.ts` 가 한다"고 정해놓고 문장 생성이 그 밖에 있어서 났다.
> D3(문안 전체 목록)이 아직 열려 있어 같은 자리에서 재발할 수 있다.

봇이 `"테스트봇"` 으로 입장하는 것(`index.ts:203`)은 **테스트용 의도**다.
시스템 메시지가 `label` 을 쓰면 `name` 이 클라이언트에 도달하는 경로가 없어지므로 무해하다.

### ★7 (`returnReason` 필드) — **기각 확정**

동점 재투표와 "살린다" 복귀 구분은 **서버가 만든 시스템 메시지 문장**이 한다.

1. 필드로 만들면 화면이 문구로 번역해야 해서 **카피가 프론트에 하드코딩**된다
2. *"참가자 7님이 살아남았습니다"* 처럼 **대상이 들어간 문장은 필드로 표현 불가**

> `label` 로 바뀌어도 **기각 근거는 그대로 유지된다.** 라벨이 들어가도 필드로는 표현이 안 된다.
>
> ⚠️ **이 결정의 귀결**: 두 경로의 **화면 구조는 동일하다.** 채팅 로그의 문장만 다르다.
> 스크린샷을 나란히 놓고 구분하려 하면 안 된다 — 플레이어는 한쪽만 겪는다. (10절)

### `reveal` 의 `liarGameResult` — **항상 `null`**

라이어 적발이든 시민 오인 처형이든 **둘 다** `reveal` 에서는 `null` 이고 `result` 직전에만 채워진다.

> 라이어 잡은 경우만 결과를 숨기면 — **"결과가 안 뜬다"는 사실 자체가 스포일러**가 된다.

- `Reveal.tsx` 의 `{state.liarGameResult && (...)}` 블록은 **지우지 않는다**
- **서버 구현 완료.** `pendingLiarGameResult` 에 예약 → `botVote → result` 에서만 옮김 →
  `view.ts` 가 한 번 더 `null` 로 감싼다. 이중 방어

---

## 6. 미결정 / 확인 대기

| 항목 | 상태 |
| --- | --- |
| **페이즈별 제한시간 5종** | **D2 · 미결정.** 한 판 돌려보고 정하기로. MVP 시점 안건 |
| **시스템 메시지 문안 전체 목록** | **D3 · 미결정.** 3종만 확정. 추가 시 `label` 규칙 적용 |
| `guessWord` 입력 권한자 | `myRole==='liar' && accused===myId` · A 확인 대기 |
| 최후 변론 발언이 토론 로그에 섞임 | 그대로 표시 (정보 누적) · A 확인 대기 |
| "살린다" 이후 재지목 가능 | `feat/server` 가 횟수 제한 없이 구현 — 일치 |
| S4 생사 투표 번복 | 허용. 룰북에 명시 없음 |
| ~~묘사 턴 조기 종료 버튼~~ | ❌ **불가.** `ClientEvent` 추가가 필요한데 계약이 동결됐다 |

### 디자인 토큰 — ✅ 해결됨

박진님이 `d42ce1a` 로 **Day 0 합의 이름 11개를 다크 값으로 전부 정의**했다.
`game.css` 참조 이름과 100% 일치(대조 확인). 색상값은 1차 초안이라 조율 후 재조정 예정.

```
--color-bg #0d0d0f       --color-surface #19181b   --color-line color-mix(#f2efe9 14%)
--color-text #f2efe9     --color-muted color-mix(#f2efe9 55%)
--color-accent #b3261e   --color-danger #ff5449
--space-2 8px  --space-4 16px  --radius 6px  --font-body "Lora"
```

> **fallback 은 `feat/layout` 이 dev 에 병합될 때까지 유지한다.**
> 지금 지우면 `?mock=` 이 색 없이 렌더된다.

---

## 7. 팀 현황

| 파트 | 된 것 | 남은 것 |
| --- | --- | --- |
| A 서버 | 소켓·역할 배정·유출 차단 · **R2 3종** · botVote/survey · 신규 필드 result-only | **dev 병합**, `apps/frontend` 복구, `BotAction` 분리 대응 |
| B 봇 | 발화 생성 코드·프롬프트·봇 티 방지 · **계약 관리** | **실제 API 호출 0회**, 블라인드 테스트 |
| **C 화면** | 화면 6종·mock 16개·라운드 배지·시스템 메시지·토큰 정합 | `name→label` 14곳 + mock base 1곳, 서버 연결 검증 |
| D 공통 | 랜딩·대기실·S6·S7·설문·**다크 토큰**·**GameScreen 배선** | GameState 실연결 |

### 리스크

- **R8 (신규 · 최우선)** 🔴 **`feat/server`(4943704)가 `apps/frontend` 27개 파일을 통째로 지운다.**
  트리에 0개(dev는 27개). 병합하면 **3개만 충돌로 뜨고 24개는 조용히 사라진다** —
  내가 고친 파일(`states.ts`·`Debate.tsx`·`game.css`)만 git이 묻고, 나머지는 안 묻는다.
  같은 커밋에 좋은 작업(`.label` 수정·신규 필드·`SurveyReason`)이 들어 있어 **통째로 revert하면 안 된다.**
  복구는 `git checkout origin/dev -- apps/frontend` 한 줄. 복구 후 시험 병합 = 삭제 0·충돌 0 확인함
- **R1 (최우선)** 봇 발화 품질이 한 번도 실측되지 않았다. 봇이 사람처럼 안 보이면 프로젝트가 실패
- **R5 (높음)** **`feat/server`(861fa8c)가 파트 B 봇 코드 275줄을 빈 파일로 만든다.**
  `llm.ts` 61 · `prompts.ts` 99 · `playground.ts` 115줄 + `package.json` 에서
  `npm run bot`·`@anthropic-ai/sdk`·`dotenv`·`ts-node`. **R1 검증 수단이 사라진다.** 구두 전달됨
- **R3** 5인 동시 접속을 실제 화면으로 해본 적이 없다
- **R6** `shared-types` 주석 수동 정렬 → prettier가 되돌린다. `npm run format` 한 번이면 정리

---

## 8. 협업 운영

### Git 규약

| 항목 | 규칙 |
| --- | --- |
| 브랜치 | `feat/game-ui` |
| 병합 | `dev` 로 PR. **승인 1건 필수** |
| 매일 아침 | `git fetch origin --prune` → `git branch -avv` → 필요하면 `git merge dev` |
| 커밋 | `feat(ui): …` / `fix(ui): …` / `chore: …` |
| **`shared-types`** | 🔒 **잠김.** 파트 B를 거친다 |
| `main` | 김정현만 병합. 직접 push 금지 |

> ⚠️ `main` 과 `dev` 가 **갈라져 있다**(main에만 docs 커밋 4개, `.gitattributes` 는 양쪽에 각각).
> 계약을 `main` 에 반영하면 `main` → `feat/*` 방향이 되어 규약과 반대가 된다.
> **제안해둔 순서**: main을 dev에 병합 → 계약은 dev에 → 각자 `git merge dev`.
>
> 로컬 `main` 이 `behind 1` 인 건 정상이다. 체크아웃한 적이 없어서다.

### 커밋 전에 반드시

```powershell
git status
git diff --stat
```

**예상한 파일 수·줄 수와 다르면 커밋하지 말고 원인부터 찾는다.**
`git add -A` 보다 파일을 직접 지정하는 편이 낫다.

### 시험 병합 — 남의 브랜치를 미리 확인하는 법

```bash
git checkout -b trial origin/feat/game-ui
git merge --no-commit --no-ff origin/feat/server

git diff --cached --diff-filter=D --name-only   # ★ 조용히 삭제되는 파일
git diff --name-only --diff-filter=U            #   충돌로 뜨는 파일
npm run build -w frontend

git merge --abort
```

**`--diff-filter=D` 를 꼭 본다.** 충돌만 보면 24개가 조용히 사라지는 걸 놓친다(R8).
이 절차로 R5·R8·`name→label`·`revealedBotId` 를 전부 병합 전에 찾았다.

### 푸시된 커밋을 되돌려야 할 때

`git revert` **도 커밋을 하나 더 만든다.** 커밋 없이 없애려면 `reset --hard` + `push --force` 뿐이다.

| 상황 | 방법 |
| --- | --- |
| 혼자 쓰는 브랜치, 아직 아무도 안 봄 | `git reset --hard <이전>` + `git push --force` |
| **PR이 열려 있거나 남이 볼 수 있음** | **새 커밋으로 되돌린다** |

PR에는 "두 커밋이 상쇄되며 순변화는 X뿐"을 확인 명령과 함께 남긴다.

### 줄바꿈(CRLF/LF) — 해결됨

| 증상 | `.gitattributes` 를 pull 했는데도 `npm run format` 후 40개 파일이 modified |
| --- | --- |
| 원인 | `git pull` 은 **이미 디스크에 있는 파일을 다시 깔지 않는다** |
| 진단 | `git ls-files --eol <파일>` → `i/` `w/` `attr/` 비교 |
| 해결 | `git restore .` **미커밋 작업이 있으면 commit/stash 먼저** |
| 아님 | `git add --renormalize .` 는 **필요 없었다.** blob이 원래 LF였다 |

### 푸시가 안 될 때

`Could not resolve host: github.com` — **DNS 문제이고 git 문제가 아니다.**

| 확인 | 의미 |
| --- | --- |
| `ping 1.1.1.1` 성공 | 회선은 살아 있다 |
| `nslookup github.com 1.1.1.1` 성공 | 네트워크로 나가는 질의는 정상 |
| `Resolve-DnsName github.com` 실패 | Windows DNS 클라이언트 계층 문제 |

`Set-DnsClientServerAddress -InterfaceAlias "이더넷" -ResetServerAddresses` 로 풀렸다.
**수동으로 박기 전에 자동으로 되돌리는 것부터.**

### 자잘한 것

- `git fetch` 는 받아올 게 있을 때만 출력한다. **조용한 게 정상**
- `git rev-parse --short` 는 리비전을 **하나만** 받는다. 여러 개면 `git branch -avv`

---

## 9. 다음 할 일

**지금 — 가장 급한 것**
- [ ] 🔴 `apps/frontend` 삭제 알리기 (R8). **`feat/server` 가 병합 흐름을 타기 전에**
- [ ] 봇 코드 275줄 소실(R5) — 구두로 말했지만 **스레드에 글로도 남긴다.** 병합 때 잊으면 그대로 사라진다
- [ ] 📌 순서 제안 — 계약을 `main` 이 아니라 `dev` 에
- [ ] PR #1에 코멘트 — 커밋 2개가 상쇄된다는 안내

**계약이 dev에 오면 (한 번의 머지에서)**
- [ ] `git merge dev`
- [ ] `name` → `label` 14곳
- [ ] `mock/states.ts` 의 `base` 에 신규 5필드 기본값
- [ ] `npm run build -w frontend` 로 0 오류 확인

**`feat/layout` 이 dev에 오면**
- [ ] `game.css` 의 fallback 제거

**서버가 dev에 오면**
- [ ] A의 `net/socket.ts` · `useGameState` 훅 연동
- [ ] 실제 서버로 S0→S5 전환이 mock 없이 동작
- [ ] **타이머 4탭 1초 이내 일치**, 탭 전환 후 안 튐 (Day 4 검증)
- [ ] 어느 화면에서도 `isBot` · 타인의 `role` · 타인의 투표 대상이 노출되지 않음
- [ ] 루프 2개 실제 확인 — `round` 증가와 시스템 메시지

**팀 일정**
- 8/9 MVP — 5인이 한 판을 끝까지 진행
- 8/23 완성 · 설문 저장 · 배포

---

## 10. 배운 것

### 통합 누락은 조용히 일어난다 — 그리고 반복된다

Day 0: 내 작업분이 저장소에 없었다(옛날 zip을 받은 것).
Day 1: 남의 브랜치가 **파트 B 봇 코드 275줄**을 지웠다(R5).
Day 1 저녁: 같은 브랜치가 **`apps/frontend` 27개 파일 전부**를 지웠다(R8).

세 번 다 `git log --all` / `git show --stat` / 시험 병합으로 직접 훑어야만 보였다.

**그리고 삭제는 충돌로 안 뜬다.** R8에서 27개 중 3개만 충돌이었다 —
내가 고친 파일만 git이 묻고, 나머지 24개는 묻지 않고 삭제를 적용한다.
**`git diff --cached --diff-filter=D` 를 반드시 본다.**

### dev만 보면 팀 상태를 오판한다 — 그리고 반나절이면 낡는다

Day 1 오전까지 "R2가 비어 있어 파트 C가 당길 게 없다"고 적혀 있었으나 이미 구현돼 있었다.
오후에 다시 보니 또 달랐다 — `feat/layout` 14커밋, `feat/server` 5커밋이 그 사이 늘었다.
**남의 브랜치를 근거로 뭔가 고치기 전에 `git fetch --prune` 부터.**

### 원격만 봐서는 남의 로컬 작업을 못 본다

`stateMachine.ts` 의 실명 누출과 `SurveyReason` 미정의를 "없다"고 단정했는데,
둘 다 **이미 로컬에서 처리 중**이었다. 이 팀은 로컬에 쌓아두고 늦게 push한다.

**→ "없습니다"가 아니라 "원격 기준으로는 안 보입니다"로 말한다.**
다만 **말은 한다** — 비용은 한 줄이고, 정말 빠졌으면 4명이 동시에 멈춘다.
최종 안전망은 시험 병합 + 빌드다.

### 남의 소유 파일에서 확정 전 이름을 따라가지 않는다

D의 **라이트 초안**에 있던 `--color-divider`/`--radius-md` 로 `game.css` 를 맞췄다(`e321066`).
몇 시간 뒤 D가 다크로 다시 짜며 **Day 0 합의 이름으로 돌아왔고**, 그 커밋은 되돌려야 했다(`5224861`).
당시 *"헛돌 위험이 있다"* 고 스스로 경고까지 해놓고 진행한 게 문제였다.
**위험을 인지했으면 그 위험이 해소될 때까지 기다린다.**

### "받기만 하면 된다"를 검증 없이 쓰지 않는다

이전판에 *"union/필드 추가라 `GameScreen` 은 그대로 동작한다"* 고 적었다. 절반만 맞았다.
`revealedBotId` 는 필수였고, `PublicPlayer.name` → `label` 이라는 **이름 변경**까지 들어왔다.
**→ 시험 병합 + 빌드로 확인한다.**

### 진단 없이 처방하지 않는다

지금까지 다섯 번 빗나갔다.

1. *"blob이 CRLF라 정규화 커밋이 필요하다"* → blob은 LF였고 `git restore .` 한 줄이면 됐다
2. *"두 mock을 나란히 놓으면 ★7 기각 근거가 그림으로 남는다"* → **두 화면은 구조가 같도록 설계됐다**
3. *"푸시가 막혔으니 핫스팟으로 우회"* → 네트워크가 아니라 DNS 설정 문제였다
4. *"D의 tokens.css에 이 이름이 있으니 맞추면 된다"* → 폐기될 초안이었다
5. *"`label` 이 목록에서 빠졌다"* → 누락이 아니라 **의도된 결정**이었다. 아이디만으로도 봇 판별에 영향을 준다

**→ 가설을 세웠으면 확인 명령부터 돌린다.** 그리고 **남의 결정을 실수로 단정하지 않는다.**

### 정보를 지고 있는 요소를 부가 요소로 그리지 않는다

★7을 기각하며 *"구분은 문장이 한다"* 고 정해놓고, 정작 그 문장을 `0.8rem` + `--color-muted` 로
참가자 이름표와 같은 등급으로 그렸다. **읽히지 않으면 구분도 없다.**

같은 문제가 계약 층에서도 났다 — 익명화는 `view.ts` 가 한다고 정해놓고 문장 생성이 그 밖에 있어서,
지목할 때마다 실명이 로그로 샜다. **규칙을 정했으면 그 규칙이 닿지 않는 곳이 있는지 본다.**

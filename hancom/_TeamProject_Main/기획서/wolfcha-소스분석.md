# wolfcha 소스 분석

> 봇 마피아 프로젝트의 선행 사례 조사 — 소스 코드 직접 분석 결과
> 인수인계 문서 9.1의 "읽는 순서" 5개 항목에 대응

- **분석일**: 2026-07-30
- **대상**: [oil-oil/wolfcha](https://github.com/oil-oil/wolfcha)
- **기준 커밋**: `986c6f0` (2026-07-27)
- **분석 방식**: 소스 정적 분석 (shallow clone, 최근 20커밋). **로컬 실행 없음 → LLM 호출 0회**

---

## 0. 한 줄 결론

**아키텍처는 가져올 게 없고, 프롬프트 계층은 가져올 게 많다.**

스택 차이(Next.js+Jotai vs Vite+Zustand) 때문이 아니라 **푸는 문제가 다르기** 때문이다. wolfcha는 "사람 1명이 AI 인랑과 싸우는 게임"이고, 봇 마피아는 "AI가 사람 흉내를 얼마나 내는지 측정하는 실험"이다. 겹치는 층은 **컨텍스트 조립** 하나뿐이며, 그 층은 품질이 높아 참고 가치가 크다.

---

## 1. 프로젝트 개요

사람 1명 + LLM 7~11명이 한 테이블에 앉는 AI 인랑(마피아) 게임. Next.js 16 App Router 기반 풀스택 웹앱이며 프로덕션 서비스(wolf-cha.com)로 실제 운영 중이다. Watcha × ModelScope 해커톤 산물.

| 항목 | 값 |
|---|---|
| 코드량 | TS/TSX 210개 파일, **약 59,600 LOC** |
| 프레임워크 | Next.js 16 (App Router, **webpack 강제** — Turbopack 아님), React 19, React Compiler |
| 상태관리 | Jotai (atom 단일 소스, localStorage 24h TTL 영속화) |
| UI | Tailwind 4, Radix UI, Framer Motion, Tiptap |
| 백엔드 | Supabase(인증/DB), Stripe(결제), API Route 20개 |
| LLM | **ZenMux 게이트웨이 주력** + DashScope + TokenDance/NewAPI 커스텀 엔드포인트 |
| 부가 | MiniMax TTS/STT 음성, next-intl 3개국어(메시지 파일 각 ~110KB) |
| 활동 | 2026-05-22 첫 커밋 → 07-27 최신. 주 기여자 4명 |
| 테스트 | **0개.** `.github/` 디렉터리 없음 → CI 없음 |

### 계층 구조

```
game-master.ts     (순수함수: 역할배분, 승패판정, 개표 + LLM 액션 생성 12종)
      ↑
PhaseManager  →  GamePhase 추상클래스  →  NightPhase / DaySpeechPhase /
                 (onEnter/getPrompt/     VotePhase / BadgePhase /
                  handleAction/onExit)   HunterPhase / WhiteWolfKingBoomPhase
      ↑
useGameLogic.ts  (React 오케스트레이션) → useDayPhase / useBadgePhase / useSpecialEvents
      ↑
game-flow-controller.ts (AsyncFlowController + FlowToken)
```

---

## 2. 인수인계 문서 정정 사항

분석 과정에서 기존 기재와 다른 점 3가지를 발견했다.

| 항목 | 기존 기재 (인수인계 9.1) | 실제 확인 결과 |
|---|---|---|
| **라이선스** | Apache-2.0 | `LICENSE` 파일은 **Apache-2.0**이 맞으나, **README 3종(en/zh/ko-없음) 전부 "MIT"로 표기.** 상충 상태 |
| **LLM 연동** | "TokenDance (제공자 통합 인터페이스)" | **주력은 ZenMux 게이트웨이.** provider enum은 `zenmux \| dashscope \| tokendance`이며 TokenDance는 스폰서로 나중에 추가된 선택지 |
| **별 617개** | 확인 시점 617개 | **이번 분석 환경에서 GitHub API 접근이 차단되어 확인 못 함.** 발표 자료 사용 전 직접 확인 필요 |

### 라이선스 상충 대응

`LICENSE`(Apache-2.0)와 `README`(MIT)가 다르다. 부분 재사용 시 **더 엄격한 Apache-2.0 기준으로 고지**(NOTICE 파일 + 변경 사항 명시)하는 것이 안전하다. 프롬프트 문안을 참고만 하고 직접 작성하면 고지 의무는 없으나, 포트폴리오 심사에서는 참고 사실을 밝히는 편이 유리하다.

---

## 3. 읽기 우선순위 항목별 분석 결과

### ① LLM 호출 지점과 1게임당 호출 횟수

**결론: 봇 마피아의 "1게임 40회 이하" 예산은 구조적으로 타당하다.**

모든 LLM 호출은 `src/lib/llm.ts`의 3개 함수(`generateCompletion` / `generateCompletionBatch` / `generateCompletionStream`)를 거쳐 `/api/chat` 프록시로 나간다. 게임 로직 측 진입점은 `game-master.ts`의 `generate*` 함수 12종이다.

**9인 게임(사람1 + AI8, 4일 진행) 정적 추정:**

| 항목 | 횟수 |
|---|---|
| 경찰 선거 (신청 배치 8 + 선거 발언 ~5 + 배지 투표 8) | ~21 |
| 낮 발언 (AI 8명 × 4일) | ~32 |
| 투표 (AI 8명 × 4일) | ~32 |
| 일일 요약 (`generateDailySummary`) | 4 |
| 밤 행동 (수호/늑대/마녀/예언자) | ~16 |
| **합계** | **~105** (사망자 감소 반영 시 실측 80~100 추정) |

> ⚠️ 실행이 아닌 **호출 지점 정적 분석 기반 추정치**다. 실측값이 아니다.

**핵심은 총량이 아니라 단가다.**

| | wolfcha | 봇 마피아 계획 |
|---|---|---|
| AI 1명 × 1라운드당 호출 | **2회** (발언 1 + 투표 1) | **2회** (발언 2, 투표는 발언에 통합) |

단가가 같다. 총량 차이는 인원(AI 8명 vs 봇 4명)과 경찰 선거 유무에서 온다. 즉 40회 예산이 비현실적이라는 근거는 나오지 않았다.

**단, 전제 조건이 있다.** 이 단가는 "1발언 = 1호출"이 지켜질 때만 성립한다. wolfcha는 턴제라 생성 폐기가 원천적으로 발생하지 않아 공짜로 지켜진다. 봇 마피아는 비동기라 재생성이 발생하므로 **확정사항 4.3(발언 큐 직렬화)과 기획서 5.4(재생성 상한 5회)가 예산 전체를 떠받친다.** 1주차 검증 시 재생성 횟수를 별도 계측해야 한다.

**부수 발견**: wolfcha는 일일 요약을 **LLM으로** 생성한다(`generateDailySummary`, 하루 1회). 봇 마피아는 규칙 기반으로 잠정 결정했으나(미결 #6), 4라운드 기준 4회면 40회 예산 안에서 감당 가능하고 품질 차이가 큰 지점이다. 재검토 후보.

---

### ② LLM 프록시 / 제공자 래핑 방식

**결론: 재시도·백오프는 그대로 이식 가능. 폴백 체인은 없으므로 직접 만들어야 한다.**

```ts
// src/lib/llm.ts — fetchWithRetry()
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

// Retry-After 헤더를 우선 존중, 없으면 지수 백오프 + 지터
const base = response.status === 429 ? 1000 : 400;
const backoffMs = (retryAfterMs !== null
  ? Math.min(15000, Math.max(0, retryAfterMs))
  : base * 2 ** (attempt - 1)) + jitter;
```

기획서 7.6의 "429에 지수 백오프(1s,2s,4s,8s)"보다 두 가지가 낫다.

1. **`Retry-After` 헤더 우선 존중** — 제공자가 명시한 대기 시간을 쓰므로 불필요한 재시도가 줄어든다
2. **지터(jitter) 추가** — 봇 여러 개가 동시에 재시도하며 몰리는 현상(thundering herd)을 방지

무료 티어는 429가 일상이므로 이 두 가지가 실제 성공률에 영향을 준다.

**없는 것 — 직접 만들어야 하는 부분:**

- **제공자 폴백 체인 없음.** 모델 → 제공자 라우팅만 하고 "A 실패 → B로 재시도"는 미구현
- **규칙 기반 더미 발언 대체 없음** (기획서 7.6 항목)
- **파일 캐싱 없음** (기획서 7.4 항목)

wolfcha는 유료 게이트웨이 전제라 이것들이 필요 없었다. 무료 티어 전제인 봇 마피아에서는 오히려 차별 포인트가 된다.

**배치 처리**: `/api/chat`에 `{requests: [...]}` 배열을 보내면 서버가 `Promise.all`로 병렬 처리한다(최대 12개). 다만 **상위 제공자 호출 횟수는 줄지 않는다** — RPM 절감 효과는 없고 왕복 지연만 줄인다. 배치를 RPM 대책으로 오해하지 말 것.

---

### ③ 발언 순서 결정 로직

**결론: 완전한 동기식 턴제 확정. 미결 #9 해결. 대조할 대상 없음.**

```ts
// src/lib/game-master.ts — getSpeakingOrder()
const aliveSeats = alivePlayers.map(p => p.seat).sort((a, b) => a - b);

// 起始座位부터 시계방향으로 순회
for (let i = 0; i < aliveSeats.length; i++) {
  const seat = aliveSeats[(startIndex + i) % aliveSeats.length];
  if (sheriffLast && seat === sheriffSeat) continue;   // 警长最后发言
  order.push(seat);
}
if (sheriffLast && sheriffSeat !== null && aliveSeats.includes(sheriffSeat)) {
  order.push(sheriffSeat);   // 경찰은 항상 마지막
}
```

**근거 4가지:**

1. 발언 순서는 **좌석 번호 정렬 후 시계/반시계 방향 순회**로 완전히 결정된다
2. `SpeechDirection = "clockwise" | "counterclockwise"` 타입이 별도로 존재한다
3. 경찰(警长)은 항상 마지막 발언으로 강제 이동된다
4. 페이즈는 21개 유니온 타입 + `VALID_TRANSITIONS` 테이블로 고정 전이한다 — 끼어들 자리가 구조적으로 없다

**발언 욕구·타이밍·인터럽트에 해당하는 코드가 전무하다.** 즉 이 항목은 "참고할 구현이 없음"이 결론이며, 대신 **봇 마피아의 차별점("비동기 실시간 토론")이 소스 수준에서 검증되었다**는 성과가 남는다.

> 발표 표현 권장: "wolfcha는 좌석 순서 순회 기반 동기식 턴제임을 소스에서 확인" — 사실만 기술. "최초"는 여전히 주장하지 않는다(확정사항 4.10).

---

### ④ 컨텍스트 조립과 2중 롤플레이 프롬프트 구조

**결론: 최대 수확 지점. 성격과 역할이 타입 레벨에서 분리되어 있다.**

인수인계 9.1의 추측("1층 가상 인격 / 2층 인랑 역할")이 맞았고, 구조가 예상보다 명시적이다.

```ts
// src/types/game.ts
interface AgentProfile {
  modelRef: ModelRef;
  persona: Persona;         // 1층: 가상 인격 (역할과 무관)
  playerMind?: PlayerMind;  // 1.5층: 사고 습관
}
// player.role 은 AgentProfile 바깥의 별도 필드 = 2층
```

#### `Persona` 필드 20종

`voiceRules`, `styleLabel`, `mbti`, `gender`, `age`, `basicInfo`, `voiceId`, `relationships`,
`logicStyle`, `triggerTopics`, `socialHabit`, `humorStyle`, `werewolfExperience`,
`vocabularyStyle`, `reasoningStyle`, `speechLengthHabit`, **`pressureStyle`**(압박 시 반응),
**`uncertaintyStyle`**(불확실할 때), **`mistakePattern`**(실수 패턴), **`wolfDeceptionStyle`**(늑대일 때 기만 방식)

#### `PlayerMind` 필드 6종

`courage`, **`memoryBias`**(기억 편향), `suspicionThreshold`, `selfProtection`, `logicDepth`, `tablePresence`

#### 기획서 부록 A와의 대응 관계

| 부록 A "실제로 어려운 것" | wolfcha 대응 필드 |
|---|---|
| 논리가 과잉 | `mistakePattern`, `reasoningStyle`, `logicDepth` |
| **기억이 너무 정확** | **`memoryBias`** |
| 말수가 균일 | `speechLengthHabit`, `tablePresence` |
| 문체가 너무 완결됨 | `voiceRules`, `vocabularyStyle` |
| 뒤끝이 없음 | (대응 필드 없음 — 봇 마피아 고유 항목) |
| 침묵을 못 견딤 | (대응 필드 없음 — 동기식이라 발생하지 않음) |

**봇 마피아가 봇 티 가설로 세운 항목의 상당수를 wolfcha는 이미 페르소나 파라미터로 구현해 두었다.** 미결 #5(성격 6종 프롬프트 문안) 작성 시 이 필드 목록부터 채우고 시작하면 시간을 크게 아낀다.

단, **"뒤끝이 없음"과 "침묵을 못 견딤" 두 항목에는 대응 필드가 없다.** 후자는 동기식 구조에서는 발생조차 하지 않는 문제다. 이 두 개가 봇 마피아의 고유 기여 영역이다.

#### 숨은 섹션 처리

`buildHiddenCommunicationProfileSection()` / `buildHiddenPlayerMindSection()`이 위 필드들을 `<hidden_...>` 블록으로 감싸 **"이건 네 숨은 성향이니 직접 언급하지 마라"** 형태로 전달한다. AI가 "저는 신중형 성격이라서요"라고 말해버리는 사고를 막는 장치다.

#### 보너스 — `buildPerspectiveHint()`

플레이어마다 **다른 분석 앵글**을 주입한다. 출력 포맷을 강제하지 않으면서 발언 다양성을 만드는 접근.

```
- 너는 N번에게 지목당했다 → 대응할지 판단하라
- 너는 출국자와 좌석이 인접하다 → 그 각도로 한마디 할 수 있다
- 너는 첫 발언자다 → 참고할 게 없으니 초기 판단을 던져라
- 어제 N번과 같은 표를 던졌다 → 언급할지 판단하라
- 너는 경찰이다 / 경찰 의견에 동의하는지 밝혀라
```

- 좌석번호 + 날짜를 시드로 쓰는 **결정론적 선택**이라 리플레이와 궁합이 좋다
- 최대 2개만 선택해 초점을 유지한다
- **정보 누설 방어가 포함되어 있다**: "인접 사망자" 힌트는 경찰 선거 페이즈(밤 사망 공표 *이전*)에서 억제된다. 안 그러면 AI 발언으로 밤 결과가 미리 새어나간다

> 봇 마피아의 발언욕구 점수는 **"누가 말할까"**를 정하고, 이 앵글 주입은 **"말할 때 무엇에 꽂혀 있을까"**를 정한다. 경쟁 관계가 아니라 보완재다.

---

### ⑤ 사적 지식 격리 방식

**결론: 기획서 5.5보다 한 축 더 정밀하다. 이 항목이 가장 실용적이다.**

기획서 5.5의 격리 표는 "마피아는 동료와 밤 지목을 안다" 수준인데, wolfcha는 여기서 축을 하나 더 나눈다.

> **대상(target)을 아는 것과 결과(outcome)를 아는 것은 별개의 권한이다.**

```ts
// src/lib/prompt-utils.ts — buildRolePrivateInfo()
// 밤의 "결과"(칼이 통했는지)는 날이 밝기 전엔 행동자에게도 숨긴다.
// "대상"(누굴 찔렀는지)은 원래 그 역할이 아는 정보이므로 그대로 노출한다.
const outcomeKnownForDay = (day: number): boolean =>
  !options?.excludePendingDeaths || day < state.day;
```

**적용 예 — 수호(Guard):**

```
【昨晚守护】3번 플레이어
【守护结果】3번 守护结果待天亮公布   ← 결과는 아침 전까지 가림
```

**적용 예 — 마녀(Witch), 더 정교한 케이스:**

해독제를 **아직 들고 있던 밤까지만** 늑대의 칼 대상을 보여주고, 다 쓴 뒤에는 과거 기록조차 가린다.

```ts
const witchHadAntidoteThatNight = healUsedNight === null || Number(day) <= healUsedNight;
if (history.wolfTarget !== undefined && witchHadAntidoteThatNight) { ... }
```

이 처리가 없으면 마녀가 약을 다 쓴 뒤에도 매일 밤 칼 대상을 아는 **신의 시점**이 된다.

**적용 예 — 구조 성공/실패 표기:**

```
第2夜：救了 5번 （救援未生效，仍出局）   ← 수호+구조 중첩 시 여전히 사망
第3夜：救了 7번 （结果待天亮公布）        ← 당일 밤은 결과 가림
```

이런 함정 처리가 코드 주석으로 10군데 넘게 기록되어 있다.

---

## 4. 그 외 참고할 만한 구현

### FlowToken 패턴 — 생성 중 상태 변경 방어

```ts
// src/lib/game-flow-controller.ts
export interface FlowToken { isValid: () => boolean }

export class AsyncFlowController {
  getToken(): FlowToken {
    const capturedValue = this.tokenValue;
    return { isValid: () => this.tokenValue === capturedValue };
  }
}
```

비동기 LLM 스트리밍 도중 게임이 리셋/중단되면 stale 콜백이 상태를 오염시키는 문제를 막는다. **`await` 직후 반드시 `token.isValid()`를 확인**하는 것이 이 코드베이스의 최우선 관례다.

### 페이즈 상태머신

- `Phase` 유니온 타입 21종
- `VALID_TRANSITIONS: Record<Phase, Phase[]>` — 허용된 전이만 명시
- `PHASE_CONFIGS: Record<Phase, PhaseConfig>` — 페이즈별 UI/동작 설정
- `safeTransitionAtom` — 잘못된 전이를 런타임에서 차단

### SmartJumpManager (1,574줄)

개발자 모드에서 임의 페이즈로 점프했을 때 상태를 자가치유하는 순수 함수 모듈. 건너뛴 액션 페이즈를 채워넣고(`ACTION_PHASES`), 되감기 시 죽은 플레이어를 되살린다. 디버깅 인프라에 이 정도 투자한 오픈소스는 드물다.

### 토큰 절감 — cache_control 파트 분리

```ts
// buildCachedSystemMessageFromParts()
// 시스템 프롬프트를 캐시 가능(정적 규칙) / 불가능(동적 상태) 파트로 쪼개고
// 캐시 가능한 파트에만 cache_control: {type:"ephemeral", ttl:"1h"} 부착 (최대 4개)
```

추가로 DeepSeek용 고정 프리픽스 블록(`WOLFCHA_DEEPSEEK_CACHE_PREFIX_V1`)을 앞에 붙여 프리픽스 캐시 히트율을 올린다. 모델별로 `cache_control` / multipart content / `response_format` 지원 여부를 각각 분기한다.

> ⚠️ **Groq·Cerebras 무료 티어에는 명시적 캐싱 기능이 없다.** 이 절감분을 봇 마피아에서 기대하면 안 된다. Gemini는 암묵적 캐싱이 있으므로 1주차 실측 때 확인할 것.

---

## 5. 약점 (반면교사)

| 문제 | 내용 |
|---|---|
| **테스트 0개, CI 0개** | 6만 줄 상태머신에 회귀 테스트가 없다. `tallyVotes`·`checkWinCondition`·`getRoleConfiguration`은 이미 순수 함수로 분리되어 있는데도 미테스트 |
| **God object 3개** | `useGameLogic.ts` 2,291줄(useCallback 40개+), `game-master.ts` 2,241줄(순수 규칙 + LLM 호출 혼재), `page.tsx` 1,756줄 |
| **리팩터링 중단 흔적** | `useGameLogicRefactored.ts`가 **0바이트로 커밋**되어 있음 |
| **클라이언트 권위 구조** | 게임 상태 전체(전원 역할 포함)가 브라우저 localStorage에 24h TTL로 저장. 솔로 게임이라 성립하는 설계 |
| **크레딧 게이트 허술** | `/api/chat`은 "활성 게임 세션" 검사로 보호되는데, 호출할 때마다 `last_activity_at`을 갱신 → **크레딧 1개로 4시간 슬라이딩 윈도우가 무한 연장**되고 호출 횟수 상한 없음(배치만 12개 캡). 레이트 리밋 부재 |
| 기타 | `console.log` 35곳 잔존, `as any`/`ts-ignore` 19곳(6만 줄 치고는 양호), 프롬프트 주석 중국어 / 코드 주석 영어 혼재 |

---

## 6. 읽을 파일 우선순위

6만 줄 전체를 읽을 필요는 없다. 아래 3개면 충분하다.

| 순위 | 파일 | 줄수 | 얻는 것 |
|---|---|---|---|
| 1 | `src/lib/prompt-utils.ts` | 1,049 | 사적 지식 격리, 2중 롤플레이, 앵글 주입 |
| 2 | `src/lib/llm.ts` | 877 | 재시도·백오프, 배치, 캐시 파트 분리 |
| 3 | `src/game/phases/NightPhase.ts` | 708 | 역할별 밤 프롬프트 실제 문안 |

보조: `src/types/game.ts`(타입 전반), `src/lib/game-flow-controller.ts`(FlowToken, 40줄).

**로컬 실행은 권장하지 않는다.** 위 분석은 전부 정적 분석(LLM 호출 0회)으로 얻었고, 실행해서 추가로 얻을 정보가 거의 없다. 실행하면 무료 티어 한도만 소모된다.

---

## 부록. 분석 방법 및 한계

- **방법**: `git clone --depth 20` 후 파일 직접 읽기. 실행·네트워크 호출 없음
- **한계 1**: shallow clone이므로 전체 커밋 히스토리와 기여자 통계는 부정확할 수 있다
- **한계 2**: 호출 횟수는 **정적 분석 추정치**이며 실측이 아니다
- **한계 3**: GitHub API 접근이 차단되어 별 수·이슈 수·포크 수는 확인하지 못했다
- **한계 4**: 프롬프트 실제 문안은 i18n 메시지 파일(`src/i18n/messages/zh.json`, 108KB)에 흩어져 있어 전수 확인하지 않았다. 구조만 확인했다

출처: [oil-oil/wolfcha](https://github.com/oil-oil/wolfcha) @ `986c6f0`

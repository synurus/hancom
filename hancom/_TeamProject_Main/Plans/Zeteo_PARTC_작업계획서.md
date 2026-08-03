# Zeteo · PART C (게임 화면) 작업 계획서

> 근거 문서: `Zeteo — 기술 구현 기획서 v1`, `Zeteo — 라이어 게임 룰북 & 화면 설계 v1`
> 착수 8/3(월) · MVP 판정 8/9(일) · 브랜치 `feat/game-ui`

---

## 0. 이 파트의 한 줄 정의

**서버가 내려준 `GameState` 하나를 받아, 지금 화면에 무엇을 보여주고 무엇을 잠글지 결정해 그린다.**

절대 하지 않는 것:

- 게임 로직 판단 (누가 이겼는지, 과반인지, 다음 페이즈가 뭔지) → **파트 A**
- 카운트다운 계산의 소유 → 서버가 `deadlineAt`(절대 시각)만 준다. 화면은 표시만
- 증분 상태 관리 → 상태는 바뀔 때마다 **전체가 다시** 온다. "받으면 다시 그린다"가 전부
- 랜딩 / 방 입장 / 봇 지목(S6) / 최종 결과(S7) / 디자인 토큰 / 버튼 → **파트 D**

---

## 1. 담당 범위

### 화면 6개 (`client/src/screens/`)

| 파일 | Phase | 내용 | 상태 분기 |
|---|---|---|---|
| `RoleReveal.tsx` | `roleReveal` | S0 역할 배정 | 시민 뷰 / 라이어 뷰 |
| `Describe.tsx` | `describe` | S1 묘사 (턴제, 1바퀴) | 내 차례 / 대기 중 |
| `Debate.tsx` | `debate` | S2 토론 + 투표 (동시) | 투표함 / 안 함 |
| `FinalDefense.tsx` | `finalDefense` | S3 최후 변론 | 내가 지목됨 / 아님 |
| `LifeVote.tsx` | `lifeVote` | S4 생사 투표 | 투표자 뷰 / 지목자 뷰 |
| `Reveal.tsx` | `reveal` + `guessWord` | S5 정체 공개 · 제시어 추측 | 라이어 아님(즉시 종료) / 라이어(추측) |

> `Reveal.tsx` 하나가 `reveal`과 `guessWord` 두 페이즈를 담당한다. 룰북상 "처형자가 라이어일 때만" 추측 단계가 붙는 연속 흐름이라 화면을 쪼개면 전환이 부자연스럽다.

### 공통 컴포넌트 4개 (`client/src/components/`)

| 파일 | 쓰는 화면 | 핵심 책임 |
|---|---|---|
| `Chat.tsx` | S1·S2·S3 | `messages[]` 렌더 + 입력창. **잠금 여부를 prop으로 받는다** (자체 판단 금지) |
| `VotePanel.tsx` | S2 | `voteCounts` 표 수만 표시 + `myVote` 표시 + 변경 |
| `PlayerList.tsx` | 전 화면 | `players[]`, `turnOrder`, `currentTurn`(▶ 표시자), `isAlive` |
| `Timer.tsx` | S1~S5 | `deadlineAt` → 남은 시간 표시 |

### 공유 파일

- `client/src/mock/states.ts` — **C·D 공동 소유**. 변경 시 D(박진)에게 알린다

---

## 2. 화면별 표시 / 잠금 규칙

파트 C의 실제 작업 내용은 이 표다.

### S0 · RoleReveal (`roleReveal`)

| 요소 | 소스 | 규칙 |
|---|---|---|
| 인원 캡션 | `players.length` | "5인 · 라이어 1" (하드코딩 금지) |
| 당신의 역할 | `myRole` | `'citizen'` → 시민 / `'liar'` → 라이어 |
| 주제 | `category` | 전원 공개 |
| 제시어 | `word` | `null`이면 `? ? ?` 표시 = **라이어 뷰의 유일한 판별 기준** |
| 준비 완료 버튼 | — | 클릭 → `{ t: 'ready' }` 전송. 전송 후 비활성 |

### S1 · Describe (`describe`)

| 요소 | 소스 | 규칙 |
|---|---|---|
| 상단 | `category` · `word` | 라이어는 `word`가 `null`이므로 주제만 |
| 순서 표시자 ▶ | `turnOrder` + `currentTurn` | **전원에게 동일하게** 보임 |
| 발언 기록 | `messages` (phase `describe`) | |
| 입력창 | `currentTurn === 내 id` | **활성 조건은 이것 하나.** 아니면 잠금 + "{이름}님의 차례입니다 🔒" |

> 자유 채팅 완전 차단 구간. 잠금이 새면 룰이 깨진다.

### S2 · Debate (`debate`)

| 요소 | 소스 | 규칙 |
|---|---|---|
| 채팅 | `messages` | 자유. 항상 활성 |
| 투표 현황 | `voteCounts` | **표 수만.** 누가 누구를 찍었는지는 서버가 안 준다 — 화면에서 만들어내지 말 것 |
| 내 선택 | `myVote` | 나만 보임. `null`이면 미투표 |
| 변경 버튼 | — | 제한시간 내 번복 자유 → `{ t: 'vote', targetId }` |
| 자기 자신 투표 | — | **허용.** 내 이름을 후보에서 빼지 말 것 |
| 기권 | — | `targetId: null` 허용 → 총 표 수 < 인원일 수 있음 |

### S3 · FinalDefense (`finalDefense`)

| 요소 | 소스 | 규칙 |
|---|---|---|
| 지목 배지 | `accused` + `voteCounts[accused]` | "박진 · 2표" |
| 채팅 | `messages` | **전원 활성.** 지목자도 나머지도 모두 입력 가능 |

### S4 · LifeVote (`lifeVote`)

| 조건 | 화면 |
|---|---|
| `accused === 내 id` | "당신에 대한 투표가 진행 중입니다" + **투표 불가**. 버튼 자체를 렌더하지 않음 |
| 그 외 | 대상 표시 + [죽인다] [살린다] → `{ t: 'lifeVote', kill: boolean }` |
| 진행 표시 | "N명 중 M표 = 처형" — N = `players.length - 1`(지목자 제외), M = `⌊N/2⌋ + 1` |

> 과반 계산식을 하드코딩하지 말 것. 기획서가 "인원수에 따라 계산"으로 못박았다.

### S5 · Reveal (`reveal` / `guessWord`)

| 페이즈 | 화면 |
|---|---|
| `reveal` · 처형자가 라이어 아님 | "{이름}은 **시민**이었습니다" + "라이어 승리" → 종료 |
| `reveal` · 처형자가 라이어 | "라이어 적발" → `guessWord`로 전이 |
| `guessWord` | 주제 표시 + 제시어 입력 + 확정 → `{ t: 'guessWord', word }`. 타이머 있음 |

---

## 3. Day 0에 A(유민성)와 확정해야 할 계약 구멍 8개

`shared/types.ts`로 실제 화면을 그려보며 발견한, **지금 상태로는 렌더가 불가능한** 지점들이다.
Day 0 오전 공동 작업 때 올린다. 막히는 정도 순으로 정렬했다.

| # | 문제 | 왜 막히나 | 제안 |
|---|---|---|---|
| **1** | **클라이언트가 자기 id를 알 방법이 없음** ⚠️ 최우선 | `GameState`에 `myId`가 없다. `currentTurn === 내 id`(S1 입력 잠금), `accused === 내 id`(S4 뷰 분기)를 판정할 근거가 없고, `ServerEvent`가 `state`/`error` 둘뿐이라 join 응답으로 받을 수도 없다. **S1·S2·S4가 전부 이것 하나에 막힌다** | `myId: string` 추가 |
| **2** | **S4의 내 선택을 다시 그릴 수 없음** | `myVote`는 S2 지목용(`string \| null`). 죽인다/살린다를 담을 필드가 없어 상태가 다시 오면 내 선택이 사라짐 | `myLifeVote: boolean \| null` |
| **3** | **S4 집계를 그릴 수 없음** | `voteCounts`는 `Record<playerId, number>`. kill/spare 두 값이 들어갈 자리가 없다 | `lifeVoteCounts: { kill: number; spare: number }` |
| **4** | **S5에서 처형자의 역할을 알 수 없음** | `PublicPlayer`엔 `role`이 없고 `myRole`은 내 것뿐이다. "박진은 **시민**이었습니다"를 그릴 근거가 전혀 없다 | `revealedRole: Role \| null` |
| **5** | **S5 승패 배지의 근거가 없음** | "라이어 승리 / 시민 승리"를 판정하려면 화면이 룰을 재구현해야 한다 (= 파트 경계 위반) | `liarGameResult: 'liarWin' \| 'citizenWin' \| null` |
| **6** | **동점 재투표 · "살린다" 복귀를 인지 못 함** | 둘 다 `phase`는 그대로 `debate`. 화면 입장에선 표만 사라진 것으로 보인다 | `round: number` 추가 (+ 시스템 메시지 병행) |
| **7** | **`guessWord` 입력 권한자가 불명확** | 처형된 라이어 본인만인지, 전원인지 명시 없음 | `myRole === 'liar' && accused === myId`면 입력, 나머지는 대기 화면으로 확정 |
| **8** | **시스템 메시지의 `speakerId`** | `speakerId`로 `players`에서 이름을 찾는데 시스템 안내는 매칭 실패 | `'system'` 예약어로 합의 |

> 제안 6개(`myId` `round` `myLifeVote` `lifeVoteCounts` `revealedRole` `liarGameResult`)를 반영한
> `shared/types.ts` **Day 0 제안본**을 파트 C 스캐폴드에 포함해 두었다. ★ 주석으로 표시되어 있으니
> 그대로 놓고 논의하면 된다.

**추가 결정 필요:** S4 생사 투표의 **번복 허용 여부**. S2는 "투표 번복 자유"가 룰북에 명시돼 있으나 S4는 언급이 없다. 스캐폴드는 S2와 동일하게 번복 허용으로 구현해 두었다.

추가로 **미확정 값**(기획서 12절, Day 2 결정): 각 단계 제한시간 5개, 묘사 턴 조기 종료("넘기기") 버튼 여부. 조기 종료를 넣으려면 `ClientEvent`에 이벤트 추가가 필요하므로 **types 변경 사안**이다 — Day 2 전에 결론이 나야 한다.

---

## 4. D(박진) 의존 — 유일한 선후 관계

기획서가 "이 문서에서 유일하게 파트 간 선후 관계가 있는 지점"으로 지목한 곳이다. D의 `styles/tokens.css` + `components/Button.tsx`가 Day 0~1에 나와야 C가 안 막힌다.

**대비책 (지연 시 대응):**

- Day 0 오전에 **토큰 이름 목록만** 먼저 합의한다 (`--color-bg`, `--color-surface`, `--color-text`, `--color-accent`, `--color-danger`, `--space-1~5`, `--radius`, `--font-*` 수준)
- C는 `var(--color-accent, #7c5cff)` 처럼 **fallback 값을 넣어** 작성 → 파일이 늦어도 렌더는 된다
- 실제 `tokens.css`가 오면 fallback을 지우는 것으로 끝. 되돌릴 코드가 없다
- `Button.tsx`가 늦으면 임시로 `<button className="btn">`을 쓰되, **`components/Button.tsx` 파일을 직접 만들지 않는다** (D 소유 파일)

**파일 소유 원칙:** `screens/`와 `components/`는 C·D가 공유하는 폴더다. 남의 파일이 필요하면 직접 고치지 말고 Discord로 요청한다.

---

## 5. mock 상태 목록

완료 판정이 "서버 없이 mock만으로 6개 화면 전부 렌더 + URL로 페이즈 전환"이므로, mock이 곧 산출물이다.

`client/src/mock/states.ts` — `?mock=<key>`로 진입:

| key | 검증 대상 |
|---|---|
| `roleReveal-citizen` | `word` 있음 |
| `roleReveal-liar` | `word === null` → `? ? ?` |
| `describe-myturn` | `currentTurn === me` → 입력 활성 |
| `describe-waiting` | 입력 잠금 + 타인 이름 표시 |
| `debate-novote` | `myVote === null` |
| `debate-voted` | `myVote` 표시 + 변경 |
| `finalDefense-accused` | 내가 지목당한 뷰 |
| `finalDefense-other` | 일반 뷰 |
| `lifeVote-voter` | 죽인다/살린다 버튼 |
| `lifeVote-accused` | 투표 불가 뷰 |
| `reveal-citizen` | "시민이었습니다" → 라이어 승 |
| `guessWord-liar` | 내가 입력하는 뷰 |
| `guessWord-watcher` | 대기 뷰 |

13개. 전부 **5인 기준**(사람 4 + 봇 1)으로 만든다 — 룰북 캡션의 "4인 게임이면 3표"는 MVP 기준과 맞지 않으며, 기획서가 이미 정정했다.

> D도 같은 파일을 쓴다. 키 네이밍 규칙(`<phase>-<변형>`)을 Day 0에 함께 정한다.

---

## 6. Timer 구현 주의

기획서 9절 **최우선 검증 항목 4번(Day 4)** 이 타이머 동기화다. 판정 기준이 "4개 탭이 1초 이내 일치, 백그라운드 갔다 와도 안 튐"이므로 구현 방식이 결정된다.

- ✅ `deadlineAt - Date.now()`를 **매 틱마다 새로 계산**한다
- ❌ `remaining--` 방식의 누적 카운트다운 → 탭이 백그라운드로 가면 `setInterval`이 throttle 되어 시간이 밀린다. 이 방식으로 짜면 Day 4에 반드시 실패한다
- `deadlineAt === null`이면 타이머 영역을 숨긴다 (0:00 표시 금지)
- 음수는 `0:00`으로 클램프. 마감 판정은 서버가 하므로 화면은 표시만

---

## 7. 1주차 일정 (C열)

| Day | 날짜 | 작업 | 완료 기준 |
|---|---|---|---|
| **0** | 8/3 오전 | 전원 공동 — 저장소·스캐폴드·`types.ts` 확정·Prettier·브랜치·mock 골격 | `npm run dev` 동작 + `feat/game-ui`에 첫 커밋. **3절 계약 구멍 6개 제기** |
| **1** | 8/3 오후 | `Chat.tsx` · `PlayerList.tsx` — mock 데이터로 렌더 | mock 상태를 넣으면 메시지·참가자 목록이 그려진다 |
| 1 | 8/3 저녁 | ★ 봇 발화 블라인드 테스트 (전원 참여) | 묘사 4개(사람) + 5개(봇) 섞어 판별 |
| **2** | 8/4 | `Describe.tsx` · `Debate.tsx` — 턴 표시·입력 잠금 | `describe-myturn` / `describe-waiting` 두 mock이 다르게 렌더 |
| **3** | 8/5 | ★ 1차 통합 — 수직 슬라이스 (전원) | 랜딩 → 방 입장 → 채팅 한 줄이 실제 서버 거쳐 타인에게 보임. **계약 오류가 여기서 전부 드러난다** |
| **4** | 8/6 | `VotePanel.tsx` · `FinalDefense.tsx` · `Timer.tsx` | 득표 수·내 선택 표시. **타이머 4탭 1초 이내 일치 검증** |
| **5** | 8/7 | ★ 봇 투입 — 실제 봇 참여 첫 판 (전원) | 묘사~투표 완주. 봇 발화 지연 체감 |
| **6** | 8/8 | `RoleReveal.tsx` · `LifeVote.tsx` · `Reveal.tsx` — 잔여 화면 마감 | 6개 화면 전부 존재 |
| **7** | 8/9 | ★ 전체 완주 · MVP 판정 (전원) | MVP 5개 항목 체크, 실패분 이슈 등록 |

**작업 순서의 근거:** 컴포넌트(Day 1) → 그것을 조합하는 화면(Day 2) 순서다. 그리고 Day 3 통합 전에 채팅이 동작해야 하므로 `Chat.tsx`가 첫 파일이다. `RoleReveal`은 가장 단순하고 의존이 없어 마지막으로 미뤘다.

---

## 8. 완료 판정 체크리스트 (8/9)

기획서의 PART C 완료 판정: *"서버 없이 mock 데이터만으로 6개 화면이 전부 렌더되고, URL로 페이즈를 바꿔 전환을 확인할 수 있다."*

**화면 렌더**

- [ ] `?mock=roleReveal-citizen` — 제시어 보임
- [ ] `?mock=roleReveal-liar` — 제시어 `? ? ?`
- [ ] `?mock=describe-myturn` — 입력창 활성, ▶ 내 이름
- [ ] `?mock=describe-waiting` — 입력창 잠김, "…님의 차례입니다"
- [ ] `?mock=debate-novote` / `debate-voted` — 표 수만 보이고 내 선택만 보임
- [ ] `?mock=finalDefense-accused` / `finalDefense-other` — 둘 다 채팅 활성
- [ ] `?mock=lifeVote-voter` — 두 버튼 / `lifeVote-accused` — 버튼 없음
- [ ] `?mock=reveal-citizen` — 라이어 승 문구
- [ ] `?mock=guessWord-liar` — 입력 활성 / `guessWord-watcher` — 대기

**규칙 준수**

- [ ] 어느 화면에서도 `isBot` · 타인의 `role` · 타인의 투표 대상을 표시하지 않는다
- [ ] 인원·과반·투표자 수가 전부 `players.length`에서 계산된다 (하드코딩 0건)
- [ ] 타이머가 `Date.now()` 기반이고, 탭 전환 후에도 튀지 않는다
- [ ] 자기 자신이 투표 후보에 포함되어 있다
- [ ] `styles/tokens.css` · `components/Button.tsx` 등 D 소유 파일을 커밋하지 않았다

**통합**

- [ ] 실제 서버 연결로 S0→S5 전환이 mock 없이 동작
- [ ] 4개 탭이 서버 페이즈 전환 시 **동시에 같은 화면**으로 넘어감 (검증 항목 3)

---

## 9. Git 운영 (C 해당분)

| 항목 | 규칙 |
|---|---|
| 브랜치 | `feat/game-ui` |
| 병합 | `dev`로 PR + 1명 승인. 30분 내 리뷰 없으면 병합하고 Discord 알림 |
| 매일 아침 | `git checkout dev && git pull` → 자기 브랜치에서 `git merge dev` |
| 커밋 메시지 | `feat(ui): 투표 패널 득표 수 표시` / `fix(ui): 타이머 백그라운드 복귀 시 튐` |
| 이슈 라벨 | `part:C`. 커밋에 `#12`, 종료는 `fixes #12` |
| types 변경 | 내가 제안하더라도 **Discord 공지 후**, PR 제목에 `[types]` |

---

## 10. 리스크

| 리스크 | 대응 |
|---|---|
| D의 토큰·버튼 지연으로 착수 불가 | 4절 — 토큰 이름만 먼저 합의 + CSS fallback |
| C·D의 `components/` 파일 충돌 | 소유 표대로만. 남의 파일은 요청으로 |
| 계약 구멍(3절)이 Day 3 통합에서야 발견 | **Day 0 오전에 전부 제기.** 통합 후 발견하면 화면 재작업 |
| 서버 로직을 화면에서 재구현하는 유혹 | "받으면 다시 그린다"만 지킨다. 판단이 필요하면 A에게 필드를 요청 |
| 봇 정보 유출을 화면이 거드는 경우 | 서버가 실수로 보내도 화면이 그리지 않으면 노출 지연은 됨. 단 근본 대응은 A의 `view.ts` |

---

*작성 근거: `Zeteo — 기술 구현 기획서 v1` 4·5·7·9·11·12절, `Zeteo — 라이어 게임 룰북 & 화면 설계 v1` 3·4·5절*

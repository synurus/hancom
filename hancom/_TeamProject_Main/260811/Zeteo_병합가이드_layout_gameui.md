# `feat/layout` ↔ `feat/game-ui` 병합 가이드

> 작성: 파트 C(화면) · 2026-08-12 · 샌드박스에서 실제 `git merge` + 빌드로 검증한 결과
> 대상: 두 브랜치 중 **나중에 `dev`로 병합하는 사람**
> 목적: 충돌 3건의 배경과 권장 해소를 미리 공유. `VoteScreen.tsx` 하나는 잘못 고르면
> 조용히 되살아나므로 특히 주의.

---

## 요약

| 브랜치 | tip | dev 대비 |
| --- | --- | --- |
| `feat/game-ui` (파트 C) | `7cdfec8` | +5 · PR #5 승인 대기 |
| `feat/layout` (파트 D) | `da9bac1` | +2 · PR 미제출 |

두 브랜치 모두 8/10 시안 1을 각자 자기 파일에 반영했고, **그 겹치는 부분이 그대로
충돌로 나온다.** `git merge` 결과 충돌 3건, **조용히 삭제되는 파일은 없음**
(`git diff --cached --diff-filter=D --name-only` 비어 있음).

```
apps/frontend/src/VoteScreen.tsx          ← C가 삭제 / D가 수정  ★ 주의
apps/frontend/src/components/Avatar.tsx   ← add/add (양쪽이 각자 새로 만듦)
apps/frontend/src/styles/tokens.css       ← content
```

`App.tsx`·`types.ts`·`LobbyScreen.tsx`는 한쪽만 고쳐서 자동 병합된다 — 손댈 것 없음.

---

## ★ 1. `VoteScreen.tsx` — **삭제를 유지한다**

git이 이렇게 띄운다:

```
CONFLICT (modify/delete): apps/frontend/src/VoteScreen.tsx deleted in HEAD
and modified in origin/feat/layout.
```

**여기서 "수정본을 남긴다"를 고르면, 기획서 v3.0에 따라 없앤 화면이 되살아난다.**

- 기획서 v3.0에서 **봇 지목 소유가 파트 D → C로 이관**됐고(`bc89c99`), 독립 화면
  `VoteScreen.tsx`는 `screens/BotVote.tsx`(`GameScreen`의 5번째 팝업)로 대체됐다.
- `feat/game-ui`는 `App.tsx`의 라우팅과 `types.ts`의 `VoteScreenState`까지 같이
  정리해뒀다. 그래서 파일만 되살리면 **타입도 라우팅도 없는 고아 파일**이 된다.
- `feat/layout`의 수정분(`da9bac1`, 후보 목록의 라디오 점 → `Avatar` 교체)은
  **`BotVote.tsx`에 이미 같은 방식으로 들어가 있다** — 잃는 기능이 없다.

```bash
git rm apps/frontend/src/VoteScreen.tsx
```

> 파트 D께: `da9bac1`에서 `VoteScreen.tsx`에 넣으신 `Avatar` 적용은, 그 파일이
> 이관으로 사라지는 걸 모르신 상태에서 하신 작업으로 보입니다. 같은 개선이
> `BotVote.tsx`에 반영돼 있으니 결과물은 안 없어집니다.

---

## 2. `Avatar.tsx` — 두 변경이 서로 독립적이다. **둘 다 살린다**

`Avatar.tsx`는 `dev`에 없다. 양쪽이 각자 새로 만들어서 `add/add` 충돌이 났다.

| | `feat/layout` (D, 8/10 15:55) | `feat/game-ui` (C, 8/10 16:17) |
| --- | --- | --- |
| 이니셜 추출 | **마지막 단어의 첫 글자** | 첫 글자 |
| `dead` variant | 있음 | **제거** |

**시각이 22분 차이다.** D가 C의 제거를 되돌린 게 아니라, 두 사람이 22분 사이에
각자 다른 것을 고친 것이다. 두 변경은 충돌하지 않으므로 **둘 다 채택**한다.

- **이니셜 = 마지막 단어(D안 채택).** mock의 `"참가자 4"`가 전부 "참"으로 겹치던
  문제를 D가 잡았다. 실서버 라벨은 A~Z 한 글자라 두 방식의 결과가 같다 — 즉
  **손해 없이 mock만 좋아진다.**
- **`dead` variant는 제거(C안 채택).** 파트 D 확인으로 *"생사 투표에서 처형되면 그
  판이 즉시 끝난다 — 탈락한 채 게임이 계속되는 중간 상태는 없다"* 가 8/10에
  확정됐다(인수인계 4절 #14). 이 게임에 없는 상태다.

병합 후 `Avatar.tsx` 최종본:

```tsx
interface AvatarProps {
  /** 참가자 라벨 — 마지막 단어의 첫 글자를 이니셜로 뽑는다.
   * "참가자 4" 같은 라벨은 전부 "참가자"로 시작해 앞글자로는 구분이 안 된다 —
   * 실제 구분값은 뒤에 붙는 번호다. */
  label: string;
  variant?: "default" | "mine";
}

export default function Avatar({ label, variant = "default" }: AvatarProps) {
  const tokens = label.trim().split(/\s+/);
  const lastToken = tokens[tokens.length - 1] ?? "";
  const initial = lastToken.charAt(0) || "?";
  const classes = ["avatar", variant !== "default" && `avatar-${variant}`].filter(Boolean).join(" ");
  return (
    <span className={classes} aria-hidden="true">
      {initial}
    </span>
  );
}
```

---

## 3. `tokens.css` — **`feat/layout` 것을 통째로 채택**하고 `.avatar-dead`만 뺀다

이 파일은 **파트 D 소유**다. C가 `f06c0fa`에서 넣은 건 D의 확정값을 자기 브랜치에
따라 적은 것이라, 사실상 D 버전의 부분집합이다. D 버전에만 있는 것:

- `--font-body`에서 **Lora 제거** (`system-ui, sans-serif`)
- `.btn-primary` 아웃라인 → **솔리드 채움**

```bash
git checkout origin/feat/layout -- apps/frontend/src/styles/tokens.css
# 그런 다음 .avatar-dead { ... } 한 줄만 삭제 (위 2번 결정과 짝)
```

**파트 C의 `game.css`는 손댈 게 없다.** 색·폰트를 전부 `var(--토큰, fallback)`으로만
참조하고 있어서 Lora 제거가 자동으로 따라온다 — 8/12에 박진님이 요청하신
"리터럴 금지, 토큰만" 규칙이 실제로 작동한 사례다.

> 다만 `feat/layout`의 `--bp-mobile` 주석에 *"origin/feat/game-ui 42ea1f3 은 900px로
> 임시 적용돼 있음 — 768px로 교체 필요"* 라는 문구가 남아 있는데, **이미 `f06c0fa`에서
> 768px로 고쳤습니다.** 병합 때 그 문장만 지워주시면 됩니다.

---

## 검증 결과 (샌드박스 실측, 2026-08-12)

위 3건을 그대로 해소한 병합본으로:

- `npx tsc -b apps/frontend` — 0 오류
- `npx eslint apps/frontend/src` — 0 오류
- `npm run build -w frontend` — 성공
- Playwright 1280px / 390px 양쪽에서 `botVote`·`lifeVote-voter`·`debate-voted`·`lobby`
  렌더 확인, **콘솔 에러 0건**
- 아바타 이니셜이 실제로 `4`·`1`·`7`로 구분돼 나오는 것 확인(기존엔 전부 "참")

---

## 참고 — 이 병합과 별개인 것들

- **PR #5는 아직 Open, 승인 0건**(8/12 확인). `dev`도 `647a9eb`에서 안 움직였다 —
  이번엔 "PR은 Open인데 내용은 이미 dev" 패턴이 아니다.
- `feat/server`에 `c09d1c3`("DB연결")이 dev보다 앞서 있다. 프론트엔드 파일은 안 건드림.
- `mock/states.ts` 235행 주석이 아직 `// ── S6 봇 지목 (파트 D · VoteScreen) ──` 이다.
  C 소유 파일의 낡은 주석 — 다음 C 커밋에서 정리 예정.

# CSS 질문 분석 — z-index가 한쪽만 안 먹는 이유

**주제**: 겹친 두 박스(`.a`, `.b`)에서 `.a`를 앞으로 꺼내려고 `z-index`를 줬는데, 코드 A와 B 중 한쪽만 동작한다.

## 코드

```html
<div class="a box"></div>
<div class="b box"></div>
```

```css
/* 공통 */
.box { width: 140px; height: 90px; }
.a { background: #cde; }
.b { background: #334; margin-top: -50px; margin-left: 50px; }

/* A 코드 */
.a { z-index: 10; }

/* B 코드 */
.a { position: relative; z-index: 10; }
```

HTML 순서상 `.b`가 `.a`보다 뒤에 오므로, 기본 상태(둘 다 `position: static`)에서는 `.b`가 나중에 그려져 위에 겹칩니다. `margin-top: -50px`로 `.b`를 `.a` 위로 끌어올려 겹치게 만든 구성입니다.

## Q1. A와 B 중 어느 쪽에서 `.a`가 앞으로 나올까요?

**B 코드**에서만 `.a`가 앞(위)으로 나옵니다.

- A 코드: `.a`는 여전히 `.b` 뒤에 가려짐 (z-index 무시됨)
- B 코드: `.a`가 `.b` 위로 올라옴

## Q2. 왜 한쪽은 z-index가 안 먹을까요?

**`z-index`는 `position` 값이 `static`이 아닌 요소에만 적용됩니다.**

- CSS에서 요소의 기본 `position` 값은 `static`입니다.
- `z-index`는 `position: relative | absolute | fixed | sticky`처럼 "포지셔닝된 요소"에서만 스택 순서(쌓임 순서)를 결정합니다.
- `position: static`인 요소에 `z-index`를 줘도 브라우저는 이를 **무시**하고, 요소는 HTML 문서 순서(source order)대로만 쌓입니다.

| 코드 | `.a`의 `position` | `z-index` 적용 여부 | 결과 |
|---|---|---|---|
| A | `static` (기본값) | ❌ 무시됨 | `.b`가 나중에 그려져 위에 옴 |
| B | `relative` | ✅ 적용됨 | `.a`가 새 쌓임 맥락(stacking context)을 만들고 위로 올라옴 |

## 핵심 정리

1. `z-index`를 쓰려면 반드시 `position: relative / absolute / fixed / sticky` 중 하나를 함께 지정해야 한다.
2. `position: static`(지정 안 한 기본 상태)에서는 `z-index`가 아무 효과가 없다.
3. 같은 쌓임 맥락 안에서 `position: static`인 요소들끼리는 z-index와 무관하게 **HTML 작성 순서**대로 뒤 요소가 위에 그려진다.

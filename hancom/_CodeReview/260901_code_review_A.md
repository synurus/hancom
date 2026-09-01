# 2026-08-29 코드 리뷰 (5주차 · JD/프론트엔드) — 답변

**주제:** Hydration

---

## 문제

**Hydration 이 무엇인지 설명하시오.**

---

## 답변

### 한 줄 정의

Hydration은 **서버에서 미리 그려 보낸 HTML에, 클라이언트에서 JavaScript를 붙여 "동작하는" 페이지로 만드는 과정**이다. 마른 스펀지(정적 HTML)에 물(JS 상태·이벤트)을 부어 살아나게 하는 것에 비유해 붙은 이름이다.

### 왜 필요한가

SSR(Server-Side Rendering)로 내려온 HTML은 **화면은 보이지만 아무 동작도 하지 않는 껍데기**다. 버튼을 눌러도 반응이 없고, 상태도 없다.

- SSR만 → 첫 화면은 빠르지만 인터랙션 불가
- CSR만 → 인터랙션은 되지만 JS 로딩 전까지 빈 화면 (FCP 지연, SEO 불리)
- **SSR + Hydration** → 빠른 첫 화면 + 완전한 인터랙션

### 동작 순서

1. 서버가 컴포넌트를 렌더링해 완성된 HTML 문자열을 응답
2. 브라우저가 HTML을 즉시 그림 → 사용자는 화면을 봄 (아직 클릭 불가)
3. JS 번들 다운로드 및 실행
4. React가 같은 컴포넌트 트리를 다시 렌더링해 **기존 DOM과 대조**
5. DOM을 새로 만들지 않고 **재사용하면서 이벤트 핸들러와 상태만 연결**
6. 페이지가 완전히 인터랙티브해짐

```jsx
// 서버
renderToString(<App />)        // HTML 문자열 생성

// 클라이언트
hydrateRoot(container, <App />) // 기존 DOM에 붙이기 (createRoot 아님)
```

`createRoot`는 DOM을 새로 만들고, `hydrateRoot`는 있는 DOM을 재사용한다는 점이 핵심 차이다.

### 핵심 포인트: Hydration Mismatch

서버가 만든 HTML과 클라이언트의 첫 렌더 결과가 **다르면 안 된다.** 다르면 React가 경고를 내고 해당 부분을 버린 뒤 다시 그린다 (성능 손해 + 화면 깜빡임).

자주 발생하는 원인:

| 원인 | 예시 |
|---|---|
| 매 렌더마다 값이 바뀜 | `new Date()`, `Math.random()`, `crypto.randomUUID()` |
| 브라우저 전용 API 사용 | `window`, `localStorage`, `navigator` |
| 서버/클라이언트 환경 차이 | 타임존, 로케일 포맷팅 |
| 잘못된 HTML 중첩 | `<p>` 안의 `<div>` — 브라우저가 자동 교정하며 구조가 틀어짐 |

해결: 클라이언트 전용 값은 `useEffect`에서 세팅하거나, 해당 부분만 클라이언트에서 지연 렌더링한다.

```jsx
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
return mounted ? <ClientOnlyStuff /> : null;
```

### 한계

Hydration 완료 전까지는 **화면은 보이는데 클릭이 안 되는 구간**이 존재한다 (TTI 지연, "Uncanny Valley"). 이를 줄이려는 시도가 React 18의 Selective/Streaming Hydration, Astro 등의 Islands Architecture, RSC(React Server Components)다.

### 요약

> SSR HTML은 **정적인 뼈대**, Hydration은 그 뼈대에 **JS로 신경을 연결하는 작업**. 서버와 클라이언트의 첫 렌더 결과가 일치해야 한다는 것이 가장 중요한 제약이다.

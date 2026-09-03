# 2026-08-31 코드 리뷰 (5주차 · JD/프론트엔드) — 답변

**주제:** Throttle

---

## 문제

**Throttle 이 무엇인지 설명하시오.**

---

## 답변

### 한 줄 정의

Throttle은 **아무리 많은 호출이 들어와도 정해진 주기당 최대 1회만 함수를 실행하도록 제한하는 기법**이다. 지하철 개찰구가 사람이 아무리 몰려도 일정 간격으로만 통과시키는 것과 같다.

이름 그대로 **엔진의 스로틀(throttle, 연료 조절 밸브)** 에서 온 말이다. 흐름을 막는 게 아니라 **유량을 일정하게 조절**한다는 뉘앙스가 핵심이다.

### 왜 필요한가

`scroll`, `mousemove`, `resize` 같은 이벤트는 **초당 수십~수백 번** 발생한다. 여기에 DOM 측정이나 상태 업데이트를 그대로 붙이면 매 프레임마다 레이아웃 계산과 리렌더링이 일어나 **스크롤이 끊긴다(jank).**

그렇다고 Debounce를 쓰면 안 되는 경우가 있다. 스크롤 진행률 표시줄을 debounce로 만들면 **스크롤을 멈출 때까지 아무 반응이 없다.** 여기서는 최종 값이 아니라 **중간 과정이 계속 반영되어야** 한다.

Throttle은 "반응은 유지하되 빈도만 낮춘다"는 절충안이다.

### 동작

```
호출:   x x x x x x x x x x x x x x x x   (계속 발생)
주기:   ├─────────┼─────────┼─────────┼   (limit 200ms)
실행:   ●         ●         ●         ●   (주기당 1회)
```

Debounce가 **호출이 멈추기를 기다린다면**, Throttle은 **기다리지 않고 일정 간격으로 계속 실행한다.**

### 구현

가장 단순한 형태(timestamp 방식, leading 실행):

```js
function throttle(fn, limit) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= limit) {
      last = now;
      fn.apply(this, args);
    }
  };
}
```

이 방식은 **마지막 호출이 버려진다.** 주기 도중에 들어온 마지막 이벤트를 반드시 반영해야 한다면 trailing 처리를 추가한다.

```js
function throttle(fn, limit) {
  let last = 0;
  let timer = null;

  return function (...args) {
    const now = Date.now();
    const remaining = limit - (now - last);

    if (remaining <= 0) {          // leading: 주기가 지났으면 즉시 실행
      if (timer) { clearTimeout(timer); timer = null; }
      last = now;
      fn.apply(this, args);
    } else if (!timer) {           // trailing: 주기 끝에 마지막 값 1회 실행
      timer = setTimeout(() => {
        last = Date.now();
        timer = null;
        fn.apply(this, args);
      }, remaining);
    }
  };
}
```

`last`(마지막 실행 시각)를 **클로저**에 가둬 호출 간 상태를 유지하는 것이 구현의 핵심이다.

### requestAnimationFrame 을 쓰는 편이 나은 경우

화면 표시(스크롤 진행률, 패럴랙스, 드래그 위치 등)가 목적이라면 `setTimeout` 기반 throttle보다 **`requestAnimationFrame`이 더 정확하다.** 브라우저 렌더링 주기와 정렬되므로 화면에 그려지지 않을 계산을 하지 않고, 백그라운드 탭에서는 자동으로 멈춘다.

```js
function rafThrottle(fn) {
  let ticking = false;
  return function (...args) {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      fn.apply(this, args);
    });
  };
}

window.addEventListener('scroll', rafThrottle(() => {
  setProgress(window.scrollY / document.body.scrollHeight);
}));
```

> 값이 화면에 그려지는 것이면 `rAF`, 네트워크 요청이나 로깅처럼 시간 기준이 필요하면 `setTimeout` 기반 throttle.

### React 에서

Debounce와 동일하게, **렌더링마다 함수가 새로 생성되면 `last`도 초기화되어 throttle이 동작하지 않는다.** 참조를 고정해야 한다.

```jsx
const handleScroll = useMemo(() => throttle(onScroll, 200), []);

useEffect(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
  return () => {
    window.removeEventListener('scroll', handleScroll);
    handleScroll.cancel?.();          // 대기 중인 trailing 타이머 정리
  };
}, [handleScroll]);
```

`{ passive: true }`는 throttle과 별개지만, 스크롤 리스너에서는 함께 쓰는 것이 사실상 기본이다.

### Debounce 와의 차이

| | Throttle | Debounce |
|---|---|---|
| 기준 | 일정 주기마다 1회 | 마지막 호출 후 delay 경과 |
| 폭풍 입력 중 | 주기마다 **계속 실행** | **실행 안 함** |
| 보장 | 중간 상태가 주기적으로 반영 | 마지막 값은 반드시 반영 |
| 적합 | 스크롤 추적, 무한 스크롤, 마우스 이동, 실시간 좌표 전송 | 검색어 입력, 자동 저장, resize 완료 후 재계산 |

> **진행 과정도 중요하면 Throttle, 최종 결과만 중요하면 Debounce.**

### 주의점

1. **주기 값**: 스크롤 UI는 16~100ms(60fps ≈ 16.7ms), 서버로 나가는 요청은 500ms~1s 정도가 무난하다. 너무 길면 사용자가 "안 따라온다"고 느낀다.
2. **trailing 누락**: leading만 구현하면 **마지막 이벤트가 버려진다.** 무한 스크롤에서 바닥에 닿는 마지막 순간을 놓쳐 다음 페이지가 로드되지 않는 버그가 대표적이다.
3. **정리(cleanup)**: trailing 타이머가 남아 있으면 언마운트된 컴포넌트에 상태 업데이트가 일어난다. 리스너 해제와 함께 반드시 취소한다.
4. **Throttle이 부하를 없애주지는 않는다**: 콜백 안에서 `getBoundingClientRect()` 같은 강제 리플로우를 유발하는 호출을 하면 주기가 길어도 여전히 무겁다. 빈도를 줄이는 것과 작업 자체를 가볍게 하는 것은 별개다.
5. **직접 구현 vs 라이브러리**: 실무에서는 lodash `throttle(fn, wait, { leading, trailing })`을 쓰는 편이 안전하다. 면접에서는 직접 구현할 수 있어야 한다.

### 요약

> Throttle은 **"몰려와도 일정 간격으로만 통과시키는"** 패턴이다. 마지막 실행 시각을 클로저에 유지하며 주기가 지났을 때만 실행하는 것이 구현의 전부이고, leading/trailing 중 무엇이 필요한지가 실무의 판단 지점이다. 화면 렌더링이 목적이면 `requestAnimationFrame`이 더 적합하며, React에서는 Debounce와 마찬가지로 함수 참조를 고정하지 않으면 무용지물이 된다.

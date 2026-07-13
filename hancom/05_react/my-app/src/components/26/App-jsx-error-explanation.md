# JSX 안에서 변수 선언 시 발생하는 오류

## 문제 상황

```jsx
const App = () => {
  return (
    <>
    const list = ['react', 'props', 'map']
    <Tag tags={list} />
    </>
  )
}
```

위 코드를 실행하면 `<Tag tags={list} />` 부분에서 다음 오류가 발생한다.

```
'list' is not defined
```

## 원인

JSX의 `<>...</>` (또는 임의의 태그) 안에 들어있는 모든 내용은 **JSX 자식(children)**으로 취급된다.

- `{}`로 감싸지 않은 텍스트/코드는 **그냥 문자열(텍스트 노드)**로 파싱된다. 실제 JS 코드로 실행되지 않는다.
- 따라서 `const list = ['react', 'props', 'map']`는 변수를 선언하는 게 아니라, 그 글자 그대로를 화면에 표시하려는 텍스트로 처리된다.
- 그 다음 줄의 `{list}`는 `{}`로 감쌌기 때문에 **진짜 JS 표현식**으로 해석되는데, 이때 `list`라는 변수가 실제로 선언된 적이 없으므로 `'list' is not defined` 오류가 발생한다.

## 핵심 규칙

> JSX 안에는 **표현식(expression)**만 `{}`로 감싸서 넣을 수 있다.
> `const`, `let`, `if`, `for` 같은 **문장(statement)**은 JSX 안에 넣을 수 없다.

| 종류 | JSX 안에서 사용 가능? | 예시 |
|---|---|---|
| 표현식 (expression) | ✅ 가능 (`{}`로 감싸서) | `{list}`, `{a + b}`, `{list.map(...)}` |
| 문장 (statement) | ❌ 불가능 | `const list = [...]`, `if (...) {...}`, `for (...) {...}` |

## 해결 방법

변수 선언은 **JSX 바깥, `return` 이전**에서 해야 한다.

```jsx
const App = () => {
  const list = ['react', 'props', 'map']   // return 밖에서 선언 (문장이므로 OK)

  return (
    <>
    <Tag tags={list} />   {/* {} 안에서는 표현식이므로 OK */}
    </>
  )
}
```

이렇게 하면 `list`는 컴포넌트 함수 스코프에 정상적으로 선언되고, JSX 안에서는 `{list}`로 그 값을 참조(표현식)만 하게 되어 정상 작동한다.

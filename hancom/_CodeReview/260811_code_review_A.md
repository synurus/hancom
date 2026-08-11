# 코드리뷰: 댓글 금칙어 필터 (`maskBadWord`)

대상 파일: `260811_code_review_Q.js`

## 원본 코드

```js
function maskBadWord(comment) {
  comment.replace('바보', '**');
  return comment;
}

console.log(maskBadWord('이 바보야 답답하네'));   // 금칙어 포함 댓글
console.log(maskBadWord('오늘 영상 잘 봤어요'));  // 평범한 댓글
```

## 실행 결과

```
이 바보야 답답하네
오늘 영상 잘 봤어요
```

의도한 동작은 첫 번째 줄이 `이 **야 답답하네`로 마스킹되어 출력되는 것이지만, 실제로는 **금칙어가 전혀 가려지지 않고 원본 댓글이 그대로 출력**됩니다.

## Q1. 예상과 다르게 나온 출력은 어디인가?

1번째 `console.log` 줄입니다.

- 예상: `이 **야 답답하네`
- 실제: `이 바보야 답답하네` (마스킹 안 됨)

2번째 줄(`오늘 영상 잘 봤어요`)은 애초에 금칙어가 없으므로 예상과 실제가 동일합니다.

## Q2. 원인이 되는 코드는 어디인가? 왜 그런 결과가 나올까?

원인은 14번째 줄입니다.

```js
comment.replace('바보', '**');   // ← 반환값을 버림
```

자바스크립트의 문자열(string)은 **불변(immutable) 값**입니다. `String.prototype.replace()`는 원본 문자열을 직접 수정하는 게 아니라, 치환이 적용된 **새로운 문자열을 반환**만 합니다. 즉:

- `comment.replace(...)`를 호출해도 매개변수 `comment`가 가리키는 값 자체는 바뀌지 않습니다.
- 이 줄에서는 `replace()`가 만들어낸 새 문자열을 어떤 변수에도 담지 않고 그냥 버리고 있습니다.
- 그래서 다음 줄 `return comment;`는 처음 받은 원본 문자열을 그대로 반환하게 됩니다.

배열의 `push()`나 `sort()`처럼 원본을 직접 변경(mutate)하는 메서드에 익숙하면 `replace()`도 그럴 것이라 착각하기 쉬운데, `replace()`는 그런 부류가 아니라는 점이 이 문제의 핵심입니다.

## 수정 방법

`replace()`의 반환값을 실제로 사용해야 합니다.

```js
function maskBadWord(comment) {
  return comment.replace('바보', '**');
}
```

또는 원본 스타일을 유지하고 싶다면:

```js
function maskBadWord(comment) {
  comment = comment.replace('바보', '**');
  return comment;
}
```

### 참고: 실무에서는 이렇게도 보완이 필요함

- `replace('바보', '**')`는 **첫 번째로 매칭된 것 하나만** 치환합니다. 금칙어가 댓글에 여러 번 나오면 전역 치환을 위해 정규식 `g` 플래그가 필요합니다.

  ```js
  comment.replace(/바보/g, '**');
  ```

- 금칙어가 여러 개라면 배열/정규식 목록을 순회하며 처리하는 구조가 필요합니다.

이 부분은 이번 문제의 핵심(불변성 이해)과는 별개의 확장 포인트이므로 참고로만 남깁니다.

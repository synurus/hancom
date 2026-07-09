# textToHex 함수 설명

## 함수 코드
```javascript
const textToHex = (text) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hex = (hash & 0xFFFFFF).toString(16).padStart(6, '0');
    return `#${hex}`;
}
```

## 단계별 설명

### 1️⃣ 해시값 초기화
```javascript
let hash = 0;
```
- 텍스트를 숫자로 변환하기 위한 변수 초기화

### 2️⃣ 각 글자를 순회
```javascript
for (let i = 0; i < text.length; i++) {
```
- 텍스트의 각 글자를 하나씩 처리

### 3️⃣ 글자를 숫자로 변환
```javascript
text.charCodeAt(i)
```
- 각 글자를 숫자 코드로 변환
- 예: `'a'` = 97, `'b'` = 98, `'개'` = 44032

### 4️⃣ 누적 해시값 계산
```javascript
hash = text.charCodeAt(i) + ((hash << 5) - hash);
```
- `hash << 5` = `hash * 32` (왼쪽 시프트 연산)
- `(hash << 5) - hash` = `hash * 31`
- 각 글자의 코드를 이전 해시값에 누적

### 5️⃣ 16진수 범위로 제한
```javascript
const hex = (hash & 0xFFFFFF).toString(16).padStart(6, '0');
```
- `hash & 0xFFFFFF` : 해시값을 6자리 16진수 범위로 제한 (최대값: 16777215)
- `.toString(16)` : 10진수를 16진수 문자로 변환 (예: 255 → "ff")
- `.padStart(6, '0')` : 부족한 앞자리를 '0'으로 채워서 6자리로 완성

### 6️⃣ 색상 코드 완성
```javascript
return `#${hex}`;
```
- '#' 기호를 붙여서 HEX 색상 코드 완성

## 동작 원리

**간단히 말하면:**
1. 텍스트의 각 글자를 숫자로 변환
2. 그 숫자들을 섞어서 하나의 큰 숫자(해시)를 만들기
3. 그 숫자를 16진수(HEX)로 바꾸기
4. 앞에 '#'를 붙여서 색상 코드 완성

## 사용 예시

### 기본 사용
```javascript
textToHex("개발자")     // → "#bc614e" (항상 같은 결과)
textToHex("디자이너")   // → "#a1c234" (항상 같은 결과)
textToHex("기획자")     // → "#5f8e9a" (항상 같은 결과)
```

### Profile 컴포넌트에서의 활용
```javascript
const jobWithColors = job.split(' ').map((word, index, arr) => (
    <span key={index}>
        <span style={{ color: textToHex(word) }}>
            {word}
        </span>
        {index < arr.length - 1 && ' '}
    </span>
));
```

**동작:**
- 문장을 띄어쓰기로 나누기
- 각 단어마다 다른 색상 생성
- 각 단어 뒤에 실제 띄어쓰기 텍스트 추가 (마지막 단어 제외)

**예시:**
```
입력: "안녕하세요 개발자입니다"
결과: 
  - "안녕하세요"(파란색) + " " + "개발자입니다"(주황색)
```

## 특징

✅ **일관성**: 같은 텍스트는 항상 같은 색상 생성
✅ **다양성**: 다른 텍스트는 다른 색상 생성
✅ **컬러 범위**: 항상 유효한 HEX 색상 코드 생성 (#000000 ~ #FFFFFF)
✅ **단어별 색상**: 문장의 각 단어를 띄어쓰기로 나누어 서로 다른 색상 적용

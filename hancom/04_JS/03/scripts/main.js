const nameInput = document.querySelector("#name");
const out = document.querySelector("#out");

// 2. "인사하기" 버튼을 누르면 실행 (화살표 함수)
document.querySelector("#greet").addEventListener("click", () => {
  // 3. 입력한 글자를 myName 변수(상자)에 담기 (.value = 입력칸 글자)
  let myName = nameInput.value;
  // 4. 템플릿 리터럴 `${ }`로 값을 문장에 끼워 넣기
  out.textContent = `안녕, ${myName}!`;
});
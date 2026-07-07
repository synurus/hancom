const greet = document.querySelector("#greet");
const input = document.querySelector("#name");

const saved = localStorage.getItem("name");
if (saved) {
    greet.textContent = `안녕, ${saved}!`;
}

document.querySelector("#save").addEventListener("click", () =>{
    const myName = input.value;
    if (!myName) { return; };
    
    localStorage.setItem("name", myName);
    greet.textContent = `안녕, ${myName}!`
});

document.querySelector("#reset").addEventListener("clik", () => {
    localStorage.removeItem("name");
    greet.textContent = "안녕하세요!"
});

// • localStorage.setItem("name", 값) — 브라우저 메모장에 저장
// • localStorage.getItem("name") — 저장된 값 꺼내기, 없으면 null
// • removeItem("name") — 저장된 값 지우기
// • 인사말은 템플릿 리터럴 `안녕, ${이름}!`로 조립
// • prompt()로 물어보는 방법도 있음 (아래 참고 링크)
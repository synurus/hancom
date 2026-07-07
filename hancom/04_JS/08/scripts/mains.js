let n = 0;

const btn = document.querySelector("#btn");
const out = document.querySelector("#count");

btn.addEventListener("click", () => {
    n++;
    out.textContent = `${n}번 눌렀어요`;
});

// • addEventListener("click", 함수) — "클릭되면" 그 함수를 실행하라는 약속
// • ( ) => { ... } — 화살표 함수(ES6), 이름 없이 그 자리서 바로 쓰는 함수
// • n++ — n을 1 늘리기 (n = n + 1 과 같음)
// • click 말고도 mouseover(마우스 올림), keydown(키 누름) 등 많음
const title = document.querySelector("#title");
// . => ~의

const btn = document.querySelector("#btn");

btn.addEventListener("click", () => {
    //버튼이 눌렸을때 제목이 바뀌는 로직
    title.textContent ="Hellow world";
});
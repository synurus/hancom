const IMG_A = "https://picsum.photos/256?random=1";
const IMG_B = "https://picsum.photos/256?random=2";

const myImage = document.querySelector("#pic");

myImage.setAttribute("src", IMG_A);

// myImage.onclick = () => {
//     const mySrc = myImage.getAttribute("src");
//     if (mySrc === IMG_A) {
//         myImage.setAttribute("src", IMG_B);
//     } else {
//         myImage.setAttribute("src", IMG_A);
//     }
// };

myImage.addEventListener("click", () => {
    const mySrc = myImage.getAttribute("src");
    if (mySrc === IMG_A) {
        myImage.setAttribute("src", IMG_B);
    } else {
        myImage.setAttribute("src", IMG_A);
    }
});

// 💡
// 같은 클릭 처리, 두 방법 — onclick은 1개만 걸리고(덮어씀), addEventListener는 여러 개 걸 수 있어 실무 권장:
// myImage.addEventListener("click", () => { /* 클릭하면 실행 */ });

// 🔁
// "여러 개 건다" = 클릭 1번에 함수 여러 개를 한꺼번에 실행. onclick은 새로 쓰면 앞 함수가 지워져 마지막 1개만 남지만, addEventListener는 등록할 때마다 목록에 쌓여 등록 순서대로 전부 실행:
// // onclick — 덮어써서 마지막 1개만
// btn.onclick = 저장하기;
// btn.onclick = 알림띄우기; // 저장하기 사라짐 → 알림만 실행

// // addEventListener — 쌓여서 전부
// btn.addEventListener("click", 저장하기);
// btn.addEventListener("click", 알림띄우기); // 클릭 1번 → 저장 + 알림 둘 다
const flavor = document.querySelector("#flavor");
const result = document.querySelector("#result");

document.querySelector("#check").addEventListener("click", () => {
    if (flavor.value === "chocolate") {
        result.textContent = "와! 초코 아이스크림 좋아!";
    } else if (flavor.value === "vanilla") {
        result.textContent = "바닐라도 깔끔하니 좋지!";
    } else {
        result.textContent = "음... 그래도 초코가 최고인데...";
    }
});

// === vs == — ===는 타입까지 같아야 참, 실무는 항상 === 권장
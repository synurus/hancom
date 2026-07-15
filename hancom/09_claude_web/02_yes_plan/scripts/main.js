// ===== 상태 =====
let current = "0";     // 현재 입력 문자열
let previous = null;   // 이전 피연산자 (숫자)
let operator = null;   // 선택된 연산자 (문자열: + − × ÷)
let resetNext = false; // 다음 숫자 입력 시 디스플레이 초기화 여부

const displayEl = document.getElementById("display");

// ===== 디스플레이 갱신 =====
function updateDisplay() {
    displayEl.textContent = current;
}

// 부동소수점 오차 보정 (0.1 + 0.2 → 0.3)
function round(x) {
    return Math.round((x + Number.EPSILON) * 1e10) / 1e10;
}

// ===== 숫자 / 소수점 입력 =====
function inputNumber(n) {
    if (current === "Error") clear();

    if (resetNext) {
        current = "";
        resetNext = false;
    }

    if (n === ".") {
        if (current.includes(".")) return;     // 소수점 중복 방지
        if (current === "") current = "0";      // ".5" 대신 "0.5"
    }

    // 선행 0 처리: "0" 뒤에 숫자가 오면 교체
    if (current === "0" && n !== ".") {
        current = n;
    } else {
        current += n;
    }

    updateDisplay();
}

// ===== 연산자 선택 =====
function chooseOperator(op) {
    if (current === "Error") return;

    // 이미 대기 중인 계산이 있으면 먼저 계산 (연쇄 계산)
    if (operator !== null && !resetNext) {
        calculate();
        if (current === "Error") return;
    }

    previous = parseFloat(current);
    operator = op;
    resetNext = true;
}

// ===== 계산 =====
function calculate() {
    if (operator === null || previous === null) return;

    const a = previous;
    const b = parseFloat(current);
    let result;

    switch (operator) {
        case "+": result = a + b; break;
        case "−": result = a - b; break;
        case "×": result = a * b; break;
        case "÷":
            if (b === 0) {
                current = "Error";
                previous = null;
                operator = null;
                resetNext = true;
                updateDisplay();
                return;
            }
            result = a / b;
            break;
    }

    current = String(round(result));
    previous = null;
    operator = null;
    resetNext = true;
    updateDisplay();
}

// ===== 기능 버튼 =====
function clear() {
    current = "0";
    previous = null;
    operator = null;
    resetNext = false;
    updateDisplay();
}

function toggleSign() {
    if (current === "Error" || current === "0") return;
    current = current.startsWith("-") ? current.slice(1) : "-" + current;
    updateDisplay();
}

function percent() {
    if (current === "Error") return;
    current = String(round(parseFloat(current) / 100));
    resetNext = true;
    updateDisplay();
}

// ===== 버튼 이벤트 위임 =====
document.querySelector(".buttons").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const { action, value } = btn.dataset;
    switch (action) {
        case "number":   inputNumber(value); break;
        case "operator": chooseOperator(value); break;
        case "equals":   calculate(); break;
        case "clear":    clear(); break;
        case "sign":     toggleSign(); break;
        case "percent":  percent(); break;
    }
});

// ===== 키보드 입력 =====
document.addEventListener("keydown", (e) => {
    const key = e.key;

    if (/[0-9]/.test(key))            inputNumber(key);
    else if (key === ".")             inputNumber(".");
    else if (key === "+")             chooseOperator("+");
    else if (key === "-")             chooseOperator("−");
    else if (key === "*")             chooseOperator("×");
    else if (key === "/") { e.preventDefault(); chooseOperator("÷"); }
    else if (key === "Enter" || key === "=") { e.preventDefault(); calculate(); }
    else if (key === "Escape")        clear();
    else if (key === "Backspace") {
        if (current === "Error" || resetNext) return;
        current = current.length > 1 ? current.slice(0, -1) : "0";
        updateDisplay();
    }
});

updateDisplay();

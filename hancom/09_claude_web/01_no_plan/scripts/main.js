const currentEl = document.getElementById("current");
const historyEl = document.getElementById("history");

const state = {
  current: "0",     // 화면에 보이는 값
  previous: null,   // 이전 피연산자
  operator: null,   // 대기 중인 연산자
  justEvaluated: false, // 방금 = 를 눌렀는지
};

const OP_SYMBOL = { "+": "+", "-": "−", "*": "×", "/": "÷" };

function render() {
  currentEl.textContent = state.current;
  if (state.operator && state.previous !== null) {
    historyEl.textContent = `${state.previous} ${OP_SYMBOL[state.operator]}`;
  } else {
    historyEl.textContent = "";
  }
}

function inputNumber(num) {
  if (state.justEvaluated) {
    state.current = num;
    state.justEvaluated = false;
  } else if (state.current === "0") {
    state.current = num;
  } else {
    state.current += num;
  }
}

function inputDecimal() {
  if (state.justEvaluated) {
    state.current = "0.";
    state.justEvaluated = false;
    return;
  }
  if (!state.current.includes(".")) {
    state.current += ".";
  }
}

function chooseOperator(op) {
  if (state.operator && !state.justEvaluated && state.previous !== null) {
    // 연속 연산: 먼저 계산
    compute();
  }
  state.previous = state.current;
  state.operator = op;
  state.justEvaluated = true; // 다음 숫자 입력 시 새로 시작
}

function compute() {
  if (state.operator === null || state.previous === null) return;
  const a = parseFloat(state.previous);
  const b = parseFloat(state.current);
  let result;

  switch (state.operator) {
    case "+": result = a + b; break;
    case "-": result = a - b; break;
    case "*": result = a * b; break;
    case "/":
      if (b === 0) {
        resetAll();
        state.current = "오류";
        state.justEvaluated = true;
        return;
      }
      result = a / b;
      break;
  }

  // 부동소수점 정리
  result = Math.round((result + Number.EPSILON) * 1e10) / 1e10;

  state.current = String(result);
  state.previous = null;
  state.operator = null;
  state.justEvaluated = true;
}

function resetAll() {
  state.current = "0";
  state.previous = null;
  state.operator = null;
  state.justEvaluated = false;
}

function toggleSign() {
  if (state.current === "0" || state.current === "오류") return;
  state.current = state.current.startsWith("-")
    ? state.current.slice(1)
    : "-" + state.current;
}

function percent() {
  state.current = String(parseFloat(state.current) / 100);
  state.justEvaluated = true;
}

document.querySelector(".keys").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  if (state.current === "오류") resetAll();

  if (btn.dataset.num !== undefined) inputNumber(btn.dataset.num);
  else if (btn.dataset.op !== undefined) chooseOperator(btn.dataset.op);
  else {
    switch (btn.dataset.action) {
      case "clear": resetAll(); break;
      case "sign": toggleSign(); break;
      case "percent": percent(); break;
      case "decimal": inputDecimal(); break;
      case "equals": compute(); break;
    }
  }
  render();
});

// 키보드 지원
document.addEventListener("keydown", (e) => {
  const { key } = e;
  if (state.current === "오류") resetAll();

  if (key >= "0" && key <= "9") inputNumber(key);
  else if (["+", "-", "*", "/"].includes(key)) chooseOperator(key);
  else if (key === ".") inputDecimal();
  else if (key === "Enter" || key === "=") { e.preventDefault(); compute(); }
  else if (key === "Escape") resetAll();
  else if (key === "Backspace") {
    state.current = state.current.length > 1
      ? state.current.slice(0, -1)
      : "0";
  } else return;

  render();
});

render();

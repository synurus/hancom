// ===== 픽셀 계산기 로직 =====

const currentEl = document.getElementById('current');
const historyEl = document.getElementById('history');
const grid = document.getElementById('grid');

// 상태
let current = '0';       // 화면에 보이는 현재 입력값
let accumulator = null;  // 누적된 값 (이전 피연산자)
let pendingOp = null;    // 대기 중인 연산자 (+, -, *, /)
let startNew = false;    // true면 다음 숫자 입력 시 새 숫자 시작
let isError = false;     // 에러 상태

// 연산자 표시 기호 매핑 (화면 기록용)
const OP_SYMBOL = { '+': '+', '-': '−', '*': '×', '/': '÷' };

function updateDisplay() {
    currentEl.textContent = current;
    currentEl.classList.toggle('error', isError);

    if (pendingOp !== null && accumulator !== null) {
        historyEl.textContent = formatNumber(accumulator) + ' ' + OP_SYMBOL[pendingOp];
    } else {
        historyEl.textContent = '';
    }
}

// 부동소수점 오차 정리 + 표시용 포맷
function formatNumber(value) {
    const rounded = Math.round(value * 1e10) / 1e10;
    return String(rounded);
}

function inputDigit(d) {
    if (isError) clearAll();
    if (startNew) {
        current = d;
        startNew = false;
    } else {
        current = current === '0' ? d : current + d;
    }
    updateDisplay();
}

function inputDecimal() {
    if (isError) clearAll();
    if (startNew) {
        current = '0.';
        startNew = false;
    } else if (!current.includes('.')) {
        current += '.';
    }
    updateDisplay();
}

function compute(a, b, op) {
    switch (op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return b === 0 ? null : a / b;  // 0으로 나누기 → null
    }
}

function chooseOperator(op) {
    if (isError) return;

    // 연속 연산: 대기 연산자가 있고 방금 새 숫자를 입력했다면 먼저 계산
    if (pendingOp !== null && !startNew) {
        const result = compute(accumulator, parseFloat(current), pendingOp);
        if (result === null) return showError();
        accumulator = result;
        current = formatNumber(result);
    } else {
        accumulator = parseFloat(current);
    }

    pendingOp = op;
    startNew = true;
    updateDisplay();
}

function calculate() {
    if (isError || pendingOp === null) return;

    const result = compute(accumulator, parseFloat(current), pendingOp);
    if (result === null) return showError();

    historyEl.textContent =
        formatNumber(accumulator) + ' ' + OP_SYMBOL[pendingOp] + ' ' + current + ' =';
    current = formatNumber(result);
    accumulator = null;
    pendingOp = null;
    startNew = true;
    currentEl.textContent = current;
    currentEl.classList.remove('error');
}

function clearAll() {
    current = '0';
    accumulator = null;
    pendingOp = null;
    startNew = false;
    isError = false;
    updateDisplay();
}

function toggleSign() {
    if (isError || current === '0') return;
    current = current.startsWith('-') ? current.slice(1) : '-' + current;
    updateDisplay();
}

function percent() {
    if (isError) return;
    current = formatNumber(parseFloat(current) / 100);
    updateDisplay();
}

function showError() {
    current = 'Error';
    isError = true;
    accumulator = null;
    pendingOp = null;
    startNew = true;
    updateDisplay();
}

// ===== 버튼 클릭 (이벤트 위임) =====
grid.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    if (btn.dataset.digit !== undefined) return inputDigit(btn.dataset.digit);
    if (btn.dataset.op !== undefined) return chooseOperator(btn.dataset.op);

    switch (btn.dataset.action) {
        case 'decimal': return inputDecimal();
        case 'equals':  return calculate();
        case 'clear':   return clearAll();
        case 'sign':    return toggleSign();
        case 'percent': return percent();
    }
});

// ===== 키보드 입력 =====
document.addEventListener('keydown', (e) => {
    const k = e.key;

    if (k >= '0' && k <= '9') return inputDigit(k);
    if (k === '.') return inputDecimal();
    if (['+', '-', '*', '/'].includes(k)) return chooseOperator(k);
    if (k === 'Enter' || k === '=') {
        e.preventDefault();  // Enter가 버튼을 다시 누르지 않도록
        return calculate();
    }
    if (k === 'Escape') return clearAll();
    if (k === 'Backspace') return backspace();
    if (k === '%') return percent();
});

// 백스페이스: 마지막 글자 지우기
function backspace() {
    if (isError) return clearAll();
    if (startNew) return;
    current = current.length > 1 ? current.slice(0, -1) : '0';
    if (current === '-' || current === '') current = '0';
    updateDisplay();
}

// 초기 렌더
updateDisplay();

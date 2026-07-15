/* ============================================================
   말랑 계산기 — 계산 로직 · 키보드 · 테마 토글
   ============================================================ */
(function () {
  "use strict";

  var resultEl = document.getElementById("result");
  var expressionEl = document.getElementById("expression");
  var screenEl = document.querySelector(".screen");
  var keysEl = document.getElementById("keys");
  var themeToggle = document.getElementById("themeToggle");

  var OP_SIGN = { "+": "+", "-": "−", "*": "×", "/": "÷" };
  var MAX_DIGITS = 12; // 입력 자릿수 상한

  var current = "0"; // 현재 입력 문자열
  var previous = null; // 확정된 이전 피연산자(숫자)
  var operator = null; // 대기 중 연산자
  var justEvaluated = false; // 방금 = 를 눌렀는가
  var hasError = false;

  /* ---------- 표시 ---------- */
  function formatNumber(str) {
    if (str === "오류") return str;
    var neg = str.charAt(0) === "-";
    if (neg) str = str.slice(1);
    var parts = str.split(".");
    var intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    var out = parts.length > 1 ? intPart + "." + parts[1] : intPart;
    return (neg ? "-" : "") + out;
  }

  function render() {
    resultEl.textContent = formatNumber(current);
    screenEl.classList.toggle("screen--error", hasError);

    if (hasError) {
      expressionEl.innerHTML = "&nbsp;";
      return;
    }
    if (operator !== null && previous !== null) {
      expressionEl.textContent =
        formatNumber(String(previous)) + " " + OP_SIGN[operator];
    } else {
      expressionEl.innerHTML = "&nbsp;";
    }
  }

  /* ---------- 계산 ---------- */
  function compute(a, op, b) {
    switch (op) {
      case "+": return a + b;
      case "-": return a - b;
      case "*": return a * b;
      case "/":
        if (b === 0) return null; // 0으로 나누기
        return a / b;
    }
    return b;
  }

  // 부동소수 오차 정리 후 문자열로
  function tidy(num) {
    if (!isFinite(num)) return null;
    var rounded = parseFloat(num.toPrecision(12));
    return String(rounded);
  }

  /* ---------- 입력 핸들러 ---------- */
  function inputDigit(d) {
    if (hasError) reset();
    if (justEvaluated) {
      current = d;
      previous = null;
      operator = null;
      justEvaluated = false;
    } else if (current === "0") {
      current = d;
    } else {
      var digitsOnly = current.replace(/[-.]/g, "").length;
      if (digitsOnly >= MAX_DIGITS) return;
      current += d;
    }
    render();
  }

  function inputDot() {
    if (hasError) reset();
    if (justEvaluated) {
      current = "0";
      previous = null;
      operator = null;
      justEvaluated = false;
    }
    if (current.indexOf(".") === -1) current += ".";
    render();
  }

  function chooseOperator(op) {
    if (hasError) return;
    if (operator !== null && !justEvaluated) {
      // 연속 연산: 중간 결과 계산
      var res = compute(previous, operator, parseFloat(current));
      if (res === null) return showError();
      var tidied = tidy(res);
      if (tidied === null) return showError();
      previous = parseFloat(tidied);
      current = tidied;
    } else {
      previous = parseFloat(current);
    }
    operator = op;
    justEvaluated = false;
    current = "0";
    render();
  }

  function equals() {
    if (hasError || operator === null || previous === null) return;
    var res = compute(previous, operator, parseFloat(current));
    if (res === null) return showError();
    var tidied = tidy(res);
    if (tidied === null) return showError();

    expressionEl.textContent =
      formatNumber(String(previous)) +
      " " + OP_SIGN[operator] + " " +
      formatNumber(current) + " =";

    current = tidied;
    previous = null;
    operator = null;
    justEvaluated = true;
    resultEl.textContent = formatNumber(current);
    screenEl.classList.remove("screen--error");
  }

  function negate() {
    if (hasError || current === "0") return;
    current = current.charAt(0) === "-" ? current.slice(1) : "-" + current;
    render();
  }

  function percent() {
    if (hasError) return;
    var value = parseFloat(current);
    // 대기 연산이 있으면 이전 값 기준 퍼센트, 없으면 1/100
    var base = operator !== null && previous !== null ? previous : 1;
    var tidied = tidy((value / 100) * base);
    if (tidied === null) return showError();
    current = tidied;
    justEvaluated = false;
    render();
  }

  function backspace() {
    if (hasError) return reset();
    if (justEvaluated) return;
    if (current.length <= 1 || (current.length === 2 && current.charAt(0) === "-")) {
      current = "0";
    } else {
      current = current.slice(0, -1);
    }
    render();
  }

  function showError() {
    hasError = true;
    current = "오류";
    previous = null;
    operator = null;
    justEvaluated = false;
    resultEl.textContent = "0으로 못 나눠요";
    expressionEl.innerHTML = "&nbsp;";
    screenEl.classList.add("screen--error");
  }

  function reset() {
    current = "0";
    previous = null;
    operator = null;
    justEvaluated = false;
    hasError = false;
    render();
  }

  /* ---------- 이벤트: 클릭 ---------- */
  keysEl.addEventListener("click", function (e) {
    var btn = e.target.closest(".key");
    if (!btn) return;
    dispatch(btn);
  });

  function dispatch(btn) {
    if (btn.dataset.digit !== undefined) inputDigit(btn.dataset.digit);
    else if (btn.dataset.op !== undefined) chooseOperator(btn.dataset.op);
    else {
      switch (btn.dataset.action) {
        case "equals": equals(); break;
        case "clear": reset(); break;
        case "negate": negate(); break;
        case "percent": percent(); break;
        case "backspace": backspace(); break;
        case ".": inputDot(); break;
      }
    }
  }

  /* ---------- 이벤트: 키보드 ---------- */
  function flash(selector) {
    var btn = keysEl.querySelector(selector);
    if (!btn) return;
    btn.classList.add("is-pressed");
    setTimeout(function () { btn.classList.remove("is-pressed"); }, 110);
  }

  document.addEventListener("keydown", function (e) {
    var k = e.key;
    if (k >= "0" && k <= "9") {
      inputDigit(k);
      flash('[data-digit="' + k + '"]');
    } else if (k === ".") {
      inputDot();
      flash('[data-action="."]');
    } else if (k === "+" || k === "-" || k === "*" || k === "/") {
      chooseOperator(k);
      flash('[data-op="' + k + '"]');
    } else if (k === "Enter" || k === "=") {
      e.preventDefault();
      equals();
      flash('[data-action="equals"]');
    } else if (k === "Backspace") {
      backspace();
      flash('[data-action="backspace"]');
    } else if (k === "Escape") {
      reset();
      flash('[data-action="clear"]');
    } else if (k === "%") {
      percent();
      flash('[data-action="percent"]');
    }
  });

  /* ---------- 테마 토글 ---------- */
  themeToggle.addEventListener("click", function () {
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    var next = dark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    var nowDark = next === "dark";
    themeToggle.setAttribute("aria-pressed", String(nowDark));
    themeToggle.setAttribute(
      "aria-label",
      nowDark ? "밝은 화면으로 바꾸기" : "어두운 화면으로 바꾸기"
    );
    themeToggle.querySelector(".theme-toggle__icon").textContent = nowDark ? "☀" : "☾";
  });

  render();
})();

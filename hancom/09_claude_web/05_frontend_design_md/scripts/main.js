/* =====================================================================
   Nintendo Calc-U-Later! — basic four-function calculator
   Vanilla JS, keyboard + click, chained operations, /0 -> ERROR
   ===================================================================== */
(function () {
  'use strict';

  var MAX_DIGITS = 12;               // display width guard

  var displayEl = document.getElementById('display');
  var sublineEl = document.getElementById('subline');
  var keysEl    = document.getElementById('keys');
  var copyBtn   = document.getElementById('copyBtn');

  var OP_SYMBOL = { '+': '+', '-': '−', '*': '×', '/': '÷' };

  var state = {
    current: '0',     // string being typed / shown
    previous: null,   // stored operand (number)
    operator: null,   // pending operator
    resetNext: false, // next digit starts a fresh number
    error: false
  };

  /* ---------- rendering ------------------------------------------------ */
  function trimForDisplay(str) {
    if (str === 'ERROR') return str;
    // too long -> collapse to precision that fits
    if (str.replace('-', '').replace('.', '').length > MAX_DIGITS) {
      var n = parseFloat(str);
      str = n.toPrecision(MAX_DIGITS - 2);
      // strip trailing zeros from precision output
      if (str.indexOf('.') !== -1 && str.indexOf('e') === -1) {
        str = str.replace(/\.?0+$/, '');
      }
    }
    return str;
  }

  function updateDisplay() {
    displayEl.textContent = trimForDisplay(state.current);
    displayEl.classList.toggle('is-error', state.error);

    if (state.operator && state.previous !== null) {
      sublineEl.innerHTML =
        formatNumber(state.previous) + ' ' + OP_SYMBOL[state.operator];
    } else {
      sublineEl.innerHTML = '&nbsp;';
    }
  }

  function formatNumber(n) {
    var s = String(n);
    return trimForDisplay(s);
  }

  /* ---------- input ---------------------------------------------------- */
  function inputDigit(d) {
    if (state.error) clearAll();
    if (state.resetNext) {
      state.current = d;
      state.resetNext = false;
    } else if (state.current === '0') {
      state.current = d;
    } else {
      if (state.current.replace('-', '').replace('.', '').length >= MAX_DIGITS) return;
      state.current += d;
    }
    updateDisplay();
  }

  function inputDot() {
    if (state.error) clearAll();
    if (state.resetNext) {
      state.current = '0.';
      state.resetNext = false;
    } else if (state.current.indexOf('.') === -1) {
      state.current += '.';
    }
    updateDisplay();
  }

  function chooseOperator(op) {
    if (state.error) return;
    var input = parseFloat(state.current);

    if (state.operator && !state.resetNext) {
      // chain: fold the pending operation first
      compute();
      if (state.error) return;
      state.previous = parseFloat(state.current);
    } else {
      state.previous = input;
    }

    state.operator = op;
    state.resetNext = true;
    updateDisplay();
  }

  function compute() {
    if (state.operator === null || state.previous === null) return;
    var a = state.previous;
    var b = parseFloat(state.current);
    var result;

    switch (state.operator) {
      case '+': result = a + b; break;
      case '-': result = a - b; break;
      case '*': result = a * b; break;
      case '/':
        if (b === 0) { setError(); return; }
        result = a / b;
        break;
      default: return;
    }

    // clean float fuzz
    result = Math.round(result * 1e10) / 1e10;

    state.current = String(result);
    state.previous = null;
    state.operator = null;
    state.resetNext = true;
    updateDisplay();
  }

  function toggleSign() {
    if (state.error) return;
    if (state.current === '0') return;
    state.current = state.current.charAt(0) === '-'
      ? state.current.slice(1)
      : '-' + state.current;
    updateDisplay();
  }

  function percent() {
    if (state.error) return;
    var n = parseFloat(state.current) / 100;
    state.current = String(Math.round(n * 1e10) / 1e10);
    state.resetNext = true;
    updateDisplay();
  }

  function setError() {
    state.current = 'ERROR';
    state.previous = null;
    state.operator = null;
    state.resetNext = true;
    state.error = true;
    updateDisplay();
  }

  function clearAll() {
    state.current = '0';
    state.previous = null;
    state.operator = null;
    state.resetNext = false;
    state.error = false;
    updateDisplay();
  }

  function backspace() {
    if (state.error) { clearAll(); return; }
    if (state.resetNext) return;
    if (state.current.length <= 1 ||
        (state.current.length === 2 && state.current.charAt(0) === '-')) {
      state.current = '0';
    } else {
      state.current = state.current.slice(0, -1);
    }
    updateDisplay();
  }

  /* ---------- click handling ------------------------------------------ */
  keysEl.addEventListener('click', function (e) {
    var btn = e.target.closest('.key');
    if (!btn) return;
    dispatch(btn);
    flash(btn);
  });

  function dispatch(btn) {
    if (btn.dataset.digit !== undefined) { inputDigit(btn.dataset.digit); return; }
    if (btn.dataset.op !== undefined)    { chooseOperator(btn.dataset.op); return; }
    switch (btn.dataset.action) {
      case 'dot':     inputDot();   break;
      case 'equals':  compute();    break;
      case 'clear':   clearAll();   break;
      case 'sign':    toggleSign(); break;
      case 'percent': percent();    break;
    }
  }

  function flash(btn) {
    btn.classList.add('is-pressed');
    setTimeout(function () { btn.classList.remove('is-pressed'); }, 90);
  }

  /* ---------- keyboard ------------------------------------------------- */
  var KEY_BTN = {}; // map key -> selector for visual flash
  document.addEventListener('keydown', function (e) {
    var k = e.key;
    var selector = null;

    if (k >= '0' && k <= '9') { inputDigit(k); selector = '[data-digit="' + k + '"]'; }
    else if (k === '.')       { inputDot();    selector = '[data-action="dot"]'; }
    else if (k === '+' || k === '-' || k === '*' || k === '/') {
      chooseOperator(k); selector = '[data-op="' + cssEscapeOp(k) + '"]';
    }
    else if (k === 'Enter' || k === '=') { e.preventDefault(); compute(); selector = '[data-action="equals"]'; }
    else if (k === 'Backspace')          { e.preventDefault(); backspace(); }
    else if (k === 'Escape' || k === 'c' || k === 'C') { clearAll(); selector = '[data-action="clear"]'; }
    else if (k === '%')                  { percent(); selector = '[data-action="percent"]'; }
    else return;

    if (selector) {
      var btn = keysEl.querySelector(selector);
      if (btn) flash(btn);
    }
  });

  function cssEscapeOp(op) {
    // operators used in attribute selectors are all safe chars here
    return op;
  }

  /* ---------- rail: copy result --------------------------------------- */
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var text = displayEl.textContent;
      var done = function () {
        var original = copyBtn.querySelector('.rail-icon').nextSibling;
        copyBtn.classList.add('flash');
        setTimeout(function () { copyBtn.classList.remove('flash'); }, 500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, done);
      } else {
        done();
      }
    });
  }

  // Clear-all rail button (shares data-action)
  document.querySelectorAll('.rail-btn[data-action="clear"]').forEach(function (b) {
    b.addEventListener('click', clearAll);
  });

  /* ---------- init ----------------------------------------------------- */
  updateDisplay();
})();

/* ============================================================
   SEGMA DS-74 — calculator logic
   Basic 4-function machine with chaining, %, ±, backspace.
   ============================================================ */

(function () {
    "use strict";

    const MAX_DIGITS = 12;          // fits the LCD width
    const OP_GLYPH = { "+": "+", "-": "−", "*": "×", "/": "÷" };

    // --- machine state ---------------------------------------
    let current = "0";              // string being entered / shown
    let stored = null;              // left operand (number)
    let operator = null;            // pending operator key: + - * /
    let overwrite = true;           // next digit replaces the display
    let errored = false;

    // --- DOM -------------------------------------------------
    const valueEl = document.getElementById("value");
    const exprEl  = document.getElementById("expr");
    const lcdEl   = document.querySelector(".lcd");
    const keysEl  = document.querySelector(".keys");

    // --- rendering -------------------------------------------
    function render() {
        // 7-segment displays show no thousands separators — present the value as-is
        valueEl.textContent = current;
        lcdEl.classList.toggle("is-error", errored);
        lcdEl.classList.toggle("is-op", operator !== null && !errored);

        if (errored) {
            exprEl.textContent = " ";
        } else if (operator !== null && stored !== null) {
            exprEl.textContent = trimNum(stored) + " " + OP_GLYPH[operator];
        } else {
            exprEl.textContent = " ";
        }
    }

    function settle() {
        valueEl.classList.remove("is-settle");
        // force reflow so the animation can replay
        void valueEl.offsetWidth;
        valueEl.classList.add("is-settle");
    }

    // --- number helpers --------------------------------------
    function trimNum(n) {
        // present a JS number without float noise, within the display budget
        if (!isFinite(n)) return "Error";
        if (n === 0) n = 0;                       // kill -0
        const intDigits = Math.floor(Math.abs(n)).toString().length;
        if (intDigits > MAX_DIGITS) return "Error";   // honest overflow, no e-notation

        let s = String(n);
        if (s.includes("e") || s.replace(/[-.]/g, "").length > MAX_DIGITS) {
            // fit the fraction into whatever space the integer part leaves
            const decimals = Math.max(0, MAX_DIGITS - intDigits);
            s = n.toFixed(decimals);
            if (s.includes(".")) s = s.replace(/\.?0+$/, "");
        }
        return s;
    }

    function toError() {
        current = "Error";
        stored = null;
        operator = null;
        overwrite = true;
        errored = true;
    }

    // --- input actions ---------------------------------------
    function inputDigit(d) {
        if (errored) resetAll();
        if (overwrite) {
            current = d;
            overwrite = false;
        } else {
            if (current.replace(/[-.]/g, "").length >= MAX_DIGITS) return;
            current = current === "0" ? d : current + d;
        }
        render();
    }

    function inputDecimal() {
        if (errored) resetAll();
        if (overwrite) {
            current = "0.";
            overwrite = false;
        } else if (!current.includes(".")) {
            current += ".";
        }
        render();
    }

    function backspace() {
        if (errored) { resetAll(); render(); return; }
        if (overwrite) return;
        if (current.length <= 1 || (current.length === 2 && current.startsWith("-"))) {
            current = "0";
            overwrite = true;
        } else {
            current = current.slice(0, -1);
            if (current === "-" || current === "") { current = "0"; overwrite = true; }
        }
        render();
    }

    function negate() {
        if (errored) return;
        if (current === "0" || current === "Error") return;
        current = current.startsWith("-") ? current.slice(1) : "-" + current;
        render();
    }

    function percent() {
        if (errored) return;
        // percent of the stored operand when chaining, else percent of raw value
        let val = parseFloat(current);
        if (operator !== null && stored !== null) {
            val = stored * (val / 100);
        } else {
            val = val / 100;
        }
        current = trimNum(val);
        overwrite = true;
        render();
    }

    function compute(a, b, op) {
        switch (op) {
            case "+": return a + b;
            case "-": return a - b;
            case "*": return a * b;
            case "/": return b === 0 ? NaN : a / b;
        }
        return b;
    }

    function chooseOperator(op) {
        if (errored) return;
        const val = parseFloat(current);

        if (operator !== null && !overwrite) {
            // fold the pending operation before starting the next
            const result = compute(stored, val, operator);
            if (!isFinite(result)) { toError(); render(); return; }
            stored = result;
            current = trimNum(result);
        } else if (stored === null) {
            stored = val;
        }
        operator = op;
        overwrite = true;
        render();
    }

    function equals() {
        if (errored || operator === null || stored === null) return;
        const val = parseFloat(current);
        const result = compute(stored, val, operator);
        if (!isFinite(result)) { toError(); render(); return; }

        exprEl.textContent = trimNum(stored) + " " + OP_GLYPH[operator]
            + " " + trimNum(val) + " =";
        current = trimNum(result);
        stored = null;
        operator = null;
        overwrite = true;
        errored = false;
        lcdEl.classList.remove("is-op");
        valueEl.textContent = current;
        settle();
    }

    function resetAll() {
        current = "0";
        stored = null;
        operator = null;
        overwrite = true;
        errored = false;
    }

    function clearAll() {
        resetAll();
        render();
    }

    // --- dispatch --------------------------------------------
    function handle(btn) {
        if (btn.dataset.digit !== undefined) return inputDigit(btn.dataset.digit);
        if (btn.dataset.op !== undefined)    return chooseOperator(btn.dataset.op);
        switch (btn.dataset.action) {
            case "decimal": return inputDecimal();
            case "clear":   return clearAll();
            case "back":    return backspace();
            case "negate":  return negate();
            case "percent": return percent();
            case "equals":  return equals();
        }
    }

    // --- pointer input ---------------------------------------
    keysEl.addEventListener("click", (e) => {
        const btn = e.target.closest(".key");
        if (btn) handle(btn);
    });

    // --- keyboard input --------------------------------------
    const KEY_TO_SELECTOR = {
        "0": '[data-digit="0"]', "1": '[data-digit="1"]', "2": '[data-digit="2"]',
        "3": '[data-digit="3"]', "4": '[data-digit="4"]', "5": '[data-digit="5"]',
        "6": '[data-digit="6"]', "7": '[data-digit="7"]', "8": '[data-digit="8"]',
        "9": '[data-digit="9"]',
        "+": '[data-op="+"]', "-": '[data-op="-"]',
        "*": '[data-op="*"]', "/": '[data-op="/"]',
        ".": '[data-action="decimal"]', ",": '[data-action="decimal"]',
        "%": '[data-action="percent"]',
        "Enter": '[data-action="equals"]', "=": '[data-action="equals"]',
        "Backspace": '[data-action="back"]',
        "Escape": '[data-action="clear"]',
    };

    function flash(btn) {
        btn.classList.add("is-press");
        setTimeout(() => btn.classList.remove("is-press"), 90);
    }

    window.addEventListener("keydown", (e) => {
        const sel = KEY_TO_SELECTOR[e.key];
        if (!sel) return;
        // don't hijack browser shortcuts
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        e.preventDefault();
        const btn = keysEl.querySelector(sel);
        if (!btn) return;
        handle(btn);
        flash(btn);
    });

    // --- boot ------------------------------------------------
    render();
})();

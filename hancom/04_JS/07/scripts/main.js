const multiply = (num1, num2) => num1 * num2;

const a = document.querySelector("#a");
const b = document.querySelector("#b");
const out = document.querySelector("#out");

document.querySelector("#calc").addEventListener("click", () => {
    out.textContent = `${a.value} × ${b.value} = ${multiply(Number(a.value), Number(b.value))}`;
});


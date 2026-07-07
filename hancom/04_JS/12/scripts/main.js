const s = document.querySelector("#s");
const out = document.querySelector("#out");

document.querySelector("#go").addEventListener("click", () => {
    const text = s.value;

    out.innerHTML = 
    `글자 수(length): ${text.length}` + "<br>" +
    `대문자(toUpperCase): ${text.toUpperCase()}` + "<br>" +
    `e -> E 바꾸기(replace): ${text.replace("e", "E")}`;    
})
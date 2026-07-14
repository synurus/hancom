// 터미널에 물어보고 → 내가 입력한 문장을 서버로 보냄
const readline = require('readline')
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

rl.question('메시지: ', (message) => {   // ← 입력받기 (엔터 치면 message에 담김)
  fetch('http://192.168.10.20:3000/api/chat', {
    method: 'POST',                              // POST로 보냄 (GET은 body 못 실음)
    headers: { 'Content-Type': 'application/json' },   // "JSON 보낸다" 알림
    body: JSON.stringify({ message })             // 입력한 문장 → 문자열로 변환
  })
    .then(r => r.json())   // 서버 응답 받기 (JSON → 객체)
    .then(console.log)        // { ok: true, 받은문장: '...' } 확인
    .catch(() => console.log('❌ 서버 먼저 켜기 (node index.js)'))
    .finally(() => rl.close())   // 입력창 닫기
})
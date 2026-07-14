const express = require('express')
const app = express()

// 유저 목록 — 실무선 DB에 저장 (지금은 간단히 배열)
const users = [{ id: 1, name: '지니' }, { id: 2, name: '철수' }, { id: 3, name: '영희' }]

// :id 로 목록에서 그 번호 유저 찾기 (/api/users/3 → 영희)
app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === Number(req.params.id))   // params는 문자열 "3" → Number로 숫자 3
  if (!user) return res.status(404).json({ error: '없는 유저' })   // 목록에 없으면 404 (/api/users/9)
  res.json(user)   // 찾은 유저 응답 { id: 3, name: '영희' }
})

app.listen(3000, () => console.log('http://localhost:3000/'))
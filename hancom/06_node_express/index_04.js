const express = require("express")  // 1. 꺼내기
const app = express()               // 2. 만들기

// 3. 규칙
app.get('/api/users', (req, res) => {
    res.json([
        {id: 1, name: "KIM"},
        {id: 2, name: "LEE"},
    ])
})

// 4. 문열기
app.listen(3000, () => console.log('http://localhost:3000'))
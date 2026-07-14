const express = require('express')
const cors = require('cors')            // npm install cors (최초 1회)
const app = express()

app.use(cors())                         // 다른 포트 허용 및 규제 : cors() 내부에 작성
app.use(express.json())                 // 객체로 해석
                                        // 변환 전: "{\"name\":\"민수"}"
                                        // 변환 후: {name: "민수"}

app.use((req, res, next) => {
    console.log(req.method, req.url)
    next()                              // 다음으로 넘김 (안 부르면 여기서 멈춤)
})

app.get('/api/users', (req, res) => {
    res.json([{id: 1, name: "KIM"}])
})

app.listen(3000, () => console.log('http://localhost:3000/api/users'))
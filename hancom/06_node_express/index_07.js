const express = require('express')
const app = express()
app.use(express.json())

let users = [
    {id: 1, name: "KIM"},
    {id: 2, name: "LEE"}
]

app.put('/api/users/:id', (req, res) => {
    const u = users.find(u => u.id === Number(req.params.id))
    if (!u) return res.status(404).json({error: "없는 유저입니다."})
    u.name = req.body.name
    res.json(u)
})

app.listen(3005, async () => {
    const res = await fetch("http://localhost:3005/api/users/1", {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ name: "한컴" })
    })
    console.log(await res.json())
})
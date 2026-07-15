// Vercel Serverless Function: /api/chat
// server/index.js 의 로직을 그대로 이식 (express 없이 단일 함수로)
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST만 허용됩니다' })
    return
  }

  // Vercel 프로젝트 환경변수(Settings > Environment Variables)에서 읽음
  const key = process.env.GROQ_API_KEY
  // 키 없어도 멈추지 않게 가짜 답
  if (!key) {
    res.status(200).json({ reply: '(mock) ' + req.body.prompt })
    return
  }

  // Groq에 대신 호출
  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: '반드시 한국어로만 답변하라. 영어를 제외한 다른 언어나 문자를 절대 섞지 마라.' },
        { role: 'user', content: req.body.prompt }
      ]
    })
  })

  const data = await groqRes.json()
  res.status(200).json({ reply: data.choices?.[0]?.message?.content || '(응답 없음)' })
}

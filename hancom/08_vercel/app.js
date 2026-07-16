const messagesEl = document.getElementById('messages')
const chatPanel = document.getElementById('chatPanel')
const weatherPanel = document.getElementById('weatherPanel')
const weatherResultEl = document.getElementById('weatherResult')

// 상단 탭(챗봇/날씨) 전환
document.querySelectorAll('.tab-btn').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'))
    tab.classList.add('active')
    const target = tab.dataset.tab
    chatPanel.hidden = target !== 'chat'
    weatherPanel.hidden = target !== 'weather'
  })
})

// 대화창에 말풍선 하나 추가하고, 나중에 내용을 바꿀 수 있게 그 엘리먼트를 돌려줌
function appendMessage(text, sender) {
  const el = document.createElement('div')
  el.className = 'msg ' + sender
  el.textContent = text
  messagesEl.appendChild(el)
  messagesEl.scrollTop = messagesEl.scrollHeight
  return el
}

// 위치명으로 /api/weather 호출
function fetchWeather(location) {
  return fetch('/api/weather', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location })
  }).then(res => res.json())
}

// 날씨 응답을 대화창용 한 줄 텍스트로 변환
function formatWeatherText(w) {
  return w.location + ' 현재 ' + w.temp + '°C (체감 ' + w.feelsLike + '°C), ' + w.description + '\n'
    + '오늘 최저 ' + w.tempMin + '°C / 최고 ' + w.tempMax + '°C\n'
    + '습도 ' + w.humidity + '% · 바람 ' + w.windSpeed + 'm/s'
}

// "날씨 서울" / "서울 날씨" / "날씨" 같은 문장에서 지역명 뽑아내기 (명령어 아니면 null)
function extractWeatherLocation(text) {
  const trimmed = text.trim()
  if (trimmed === '날씨') return ''

  let m = trimmed.match(/^\/?날씨\s+(.+)$/)
  if (m) return m[1].trim()

  m = trimmed.match(/^(.+?)\s*날씨$/)
  if (m && m[1].trim()) return m[1].trim()

  return null
}

// 챗봇 대화창 안에서 날씨 명령어 처리
function handleWeatherCommand(location) {
  if (!location) {
    appendMessage('어느 지역 날씨가 궁금하세요? "날씨 서울"처럼 입력해보세요.', 'bot')
    return
  }
  const pending = appendMessage('날씨 확인 중…', 'bot pending')
  fetchWeather(location)
    .then(data => {
      pending.textContent = data.error || formatWeatherText(data)
      pending.classList.remove('pending')
    })
    .catch(() => {
      pending.textContent = '❌ 날씨 조회 실패'
      pending.classList.remove('pending')
    })
}

// 질문 보내기 동작 (버튼 클릭, 엔터 둘 다에서 재사용)
function sendPrompt() {
  const input = document.getElementById('q')
  const prompt = input.value.trim()
  if (!prompt) return

  appendMessage(prompt, 'user')
  input.value = ''

  // 날씨 명령어면 챗봇 API 대신 날씨 API로 보냄
  const weatherLocation = extractWeatherLocation(prompt)
  if (weatherLocation !== null) {
    handleWeatherCommand(weatherLocation)
    return
  }

  const pending = appendMessage('…', 'bot pending')

  fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  })
    .then(res => res.json())
    .then(data => {
      pending.textContent = data.reply || data.error
      pending.classList.remove('pending')
    })
    .catch(() => {
      pending.textContent = '❌ 요청 실패 (로컬 테스트는 vercel dev 로 실행)'
      pending.classList.remove('pending')
    })
}

document.getElementById('btn').addEventListener('click', sendPrompt)
document.getElementById('q').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendPrompt()
})

// 날씨 탭 결과 카드를 DOM으로 직접 구성 (innerHTML 대신 textContent로 XSS 방지)
function renderWeatherCard(data) {
  weatherResultEl.textContent = ''

  if (data.error) {
    const p = document.createElement('p')
    p.className = 'weather-error'
    p.textContent = data.error
    weatherResultEl.appendChild(p)
    return
  }

  const card = document.createElement('div')
  card.className = 'weather-card'

  const loc = document.createElement('p')
  loc.className = 'weather-loc'
  loc.textContent = data.location

  const temp = document.createElement('p')
  temp.className = 'weather-temp'
  temp.textContent = data.temp + '°C'

  const desc = document.createElement('p')
  desc.className = 'weather-desc'
  desc.textContent = data.description + ' · 체감 ' + data.feelsLike + '°C'

  const grid = document.createElement('div')
  grid.className = 'weather-grid'
  ;[
    ['최저', data.tempMin + '°C'],
    ['최고', data.tempMax + '°C'],
    ['습도', data.humidity + '%'],
    ['바람', data.windSpeed + 'm/s']
  ].forEach(([label, value]) => {
    const item = document.createElement('div')
    const span = document.createElement('span')
    span.textContent = label
    const b = document.createElement('b')
    b.textContent = value
    item.appendChild(span)
    item.appendChild(b)
    grid.appendChild(item)
  })

  card.appendChild(loc)
  card.appendChild(temp)
  card.appendChild(desc)
  card.appendChild(grid)
  weatherResultEl.appendChild(card)
}

// 날씨 탭 조회 버튼 / 엔터
function searchWeather() {
  const locInput = document.getElementById('locInput')
  const location = locInput.value.trim()
  if (!location) return

  weatherResultEl.textContent = ''
  const loading = document.createElement('p')
  loading.className = 'weather-loading'
  loading.textContent = '조회 중…'
  weatherResultEl.appendChild(loading)

  fetchWeather(location)
    .then(renderWeatherCard)
    .catch(() => {
      weatherResultEl.textContent = ''
      const p = document.createElement('p')
      p.className = 'weather-error'
      p.textContent = '❌ 조회 실패'
      weatherResultEl.appendChild(p)
    })
}

document.getElementById('locBtn').addEventListener('click', searchWeather)
document.getElementById('locInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') searchWeather()
})

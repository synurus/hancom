// import { useState, useEffect } from 'react'

// const Weather = () => {
//   // temp: 기온 (초기값 null — 도착 전엔 값 없음) / isLoading: 로딩 상태
//   const [temp, setTemp] = useState(null)
//   const [isLoading, setIsLoading] = useState(true)

//   useEffect(() => {
//     // 서울(위도 37.5 · 경도 127) 현재 날씨 요청 → JSON 변환 → 기온만 저장
//     fetch('https://api.open-meteo.com/v1/forecast?latitude=37.5&longitude=127&current_weather=true').then((res) => res.json()).then((data) => { setTemp(data.current_weather.temperature); setIsLoading(false) }).catch((error) => { console.error('기온 로딩 실패:', error); setIsLoading(false) })
//   }, [])   // [] = 첫 렌더 1번만 요청

//   // isLoading이면 "불러오는 중", 아니면 기온 또는 "실패" 표시
//   return <p>🌡️ 서울 기온: {isLoading ? '불러오는 중…' : (temp ? temp + '°C' : '불러올 수 없음')}</p>
// }
// export default Weather



import { useState, useEffect } from 'react'

const Weather = () => {
  const [temp, setTemp] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=37.5&longitude=127&current_weather=true')
        const data = await res.json()
        setTemp(data.current_weather.temperature)
        setIsLoading(false)
      } catch (error) {
        console.error('기온 로딩 실패:', error)
        setIsLoading(false)
      }
    }
    fetchWeather()
  }, [])

  return <p>🌡️ 서울 기온: {isLoading ? '불러오는 중…' : (temp ? temp + '°C' : '불러올 수 없음')}</p>
}
export default Weather
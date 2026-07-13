import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import HomePage from './pages/HomePage.jsx'
import TrackPage from './pages/TrackPage.jsx'
import FavoritesPage from './pages/FavoritesPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import './App.css'

function App() {
  // 차트 선택 상태를 App이 가진다 (상태 끌어올리기)
  // 페이지를 이동해도 App은 그대로 살아있어서,
  // 상세 페이지에서 돌아와도 보던 탭·검색어가 유지된다
  // + localStorage에도 저장해서 새로고침해도 유지 (즐겨찾기와 같은 패턴)
  const [country, setCountry] = useState(() => {
    return localStorage.getItem('country') || 'kr' // 'kr' | 'us'(Global)
  })
  const [chartType, setChartType] = useState(() => {
    return localStorage.getItem('chartType') || 'songs' // 'songs' | 'albums' | 'new'
  })
  const [limit, setLimit] = useState(() => {
    return Number(localStorage.getItem('limit')) || 10 // 10 | 25 | 50
  })
  const [keyword, setKeyword] = useState('') // 검색어 (이건 새로고침 시 비우는 게 자연스러움)

  // 탭 상태가 바뀔 때마다 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('country', country)
    localStorage.setItem('chartType', chartType)
    localStorage.setItem('limit', limit)
  }, [country, chartType, limit])

  // 즐겨찾기: 처음 켤 때 localStorage에서 불러오기
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites')
    return saved ? JSON.parse(saved) : []
  })

  // 즐겨찾기가 바뀔 때마다 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites))
  }, [favorites])

  // 다크 모드: 처음 켤 때 localStorage에서 불러오기
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true'
  })

  // 다크 모드가 바뀔 때마다: body에 dark 클래스 붙이기/떼기 + 저장
  // (CSS 변수 값이 통째로 바뀌면서 전체 색이 전환된다)
  useEffect(() => {
    document.body.classList.toggle('dark', darkMode)
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  // 이미 즐겨찾기한 곡인지 확인
  function isFavorite(id) {
    return favorites.some((fav) => fav.id === id)
  }

  // 즐겨찾기 추가/해제
  // 배열 state는 push 금지 → 새 배열로!
  // 이전 값 기반 갱신은 함수형 업데이트(prev => ...)가 정석
  function toggleFavorite(track, trackCountry, trackType) {
    if (isFavorite(track.id)) {
      setFavorites((prev) => prev.filter((fav) => fav.id !== track.id))
    } else {
      setFavorites((prev) => [
        ...prev,
        { ...track, country: trackCountry, type: trackType },
      ])
    }
  }

  return (
    <div className="app">
      <Navbar
        favoriteCount={favorites.length}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode((prev) => !prev)}
      />
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              country={country}
              setCountry={setCountry}
              chartType={chartType}
              setChartType={setChartType}
              limit={limit}
              setLimit={setLimit}
              keyword={keyword}
              setKeyword={setKeyword}
              isFavorite={isFavorite}
              toggleFavorite={toggleFavorite}
            />
          }
        />
        <Route
          path="/favorites"
          element={
            <FavoritesPage
              favorites={favorites}
              isFavorite={isFavorite}
              toggleFavorite={toggleFavorite}
            />
          }
        />
        <Route path="/:country/:type/:id" element={<TrackPage />} />
        {/* 위의 어떤 주소와도 안 맞으면 404 페이지 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* 모든 페이지 공통: 데이터 출처 표기 */}
      <footer className="app-footer">
        차트 데이터 출처:{' '}
        <a
          href="https://music.apple.com/kr/"
          target="_blank"
          rel="noreferrer"
        >
          Apple Music
        </a>{' '}
        공식 인기 차트 피드 (실시간)
      </footer>
    </div>
  )
}

export default App

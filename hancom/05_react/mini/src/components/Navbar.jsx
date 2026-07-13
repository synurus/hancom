import { Link } from 'react-router-dom'
import './Navbar.css'

// 모든 페이지 공통 상단 바
// props: favoriteCount = 즐겨찾기 개수,
//        darkMode = 다크 모드 여부, onToggleDark = 토글 함수
function Navbar({ favoriteCount, darkMode, onToggleDark }) {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        🎵 APPLE MUSIC K-POP 차트
      </Link>

      <div className="navbar-right">
        <Link to="/favorites" className="navbar-fav">
          ♥ 즐겨찾기
          {/* 1개 이상일 때만 개수 표시 (조건부 렌더링) */}
          {favoriteCount > 0 && (
            <span className="navbar-fav-count">{favoriteCount}</span>
          )}
        </Link>

        {/* 다크 모드 토글 (삼항 연산자로 아이콘 전환) */}
        <button className="navbar-dark" onClick={onToggleDark}>
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </nav>
  )
}

export default Navbar

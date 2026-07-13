import { Link } from 'react-router-dom'
import TrackCard from '../components/TrackCard.jsx'
import './FavoritesPage.css'

// 즐겨찾기 페이지: ♥ 누른 곡들을 모아서 보여준다 (localStorage에 저장됨)
function FavoritesPage({ favorites, isFavorite, toggleFavorite }) {
  return (
    <main className="favorites">
      <h1 className="favorites-title">♥ 내 즐겨찾기</h1>

      {/* 아직 즐겨찾기가 없을 때 (조건부 렌더링) */}
      {favorites.length === 0 && (
        <div className="favorites-empty">
          <p>아직 즐겨찾기한 곡이 없어요 🎧</p>
          <p className="favorites-empty-sub">
            차트에서 마음에 드는 곡의 ♥를 눌러보세요!
          </p>
          <Link to="/" className="favorites-go">차트 보러 가기</Link>
        </div>
      )}

      <div className="favorites-list">
        {favorites.map((track, index) => (
          <TrackCard
            key={track.id}
            track={track}
            rank={index + 1}
            country={track.country}
            type={track.type}
            favorite={isFavorite(track.id)}
            onToggleFavorite={() => toggleFavorite(track, track.country, track.type)}
          />
        ))}
      </div>
    </main>
  )
}

export default FavoritesPage

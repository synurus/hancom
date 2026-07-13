import { Link } from 'react-router-dom'
import './TrackCard.css'

// 최근 30일 이내 발매곡인지 확인
function isNewRelease(releaseDate) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 30)
  return (releaseDate || '') >= cutoff.toISOString().slice(0, 10)
}

// 곡(앨범) 카드 1개
// props: track = 곡 데이터, rank = 순위,
//        country = 'kr' | 'us', type = 'songs' | 'albums' | 'new'
//        favorite = 즐겨찾기 여부, onToggleFavorite = ♥ 눌렀을 때 실행할 함수
function TrackCard({ track, rank, country = 'kr', type = 'songs', favorite, onToggleFavorite }) {
  return (
    <Link to={`/${country}/${type}/${track.id}`} className="track-card">
      {/* TOP3는 강조 색 (조건부 className) */}
      <span className={rank <= 3 ? 'track-rank top3' : 'track-rank'}>
        {rank}
      </span>
      {/* loading="lazy": 화면에 보일 때가 되어서야 이미지를 로드 (TOP50 속도 개선) */}
      <img
        className="track-img"
        src={track.artworkUrl100}
        alt={track.name}
        loading="lazy"
      />
      <div className="track-info">
        <p className="track-name">
          {track.name}
          {/* 30일 이내 발매곡에만 NEW 뱃지 (조건부 렌더링) */}
          {isNewRelease(track.releaseDate) && (
            <span className="track-new-badge">NEW</span>
          )}
        </p>
        <p className="track-artist">
          {type === 'new'
            ? `${track.releaseDate} · ${track.artistName}`
            : track.artistName}
        </p>
      </div>

      {/* 즐겨찾기 ♥ 버튼 (onToggleFavorite를 받았을 때만 표시) */}
      {onToggleFavorite && (
        <button
          className={favorite ? 'track-heart active' : 'track-heart'}
          onClick={(e) => {
            e.preventDefault() // 카드(Link) 클릭으로 번지지 않게 막기
            onToggleFavorite()
          }}
        >
          {favorite ? '♥' : '♡'}
        </button>
      )}
    </Link>
  )
}

export default TrackCard

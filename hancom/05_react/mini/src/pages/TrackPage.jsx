import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchChart } from '../services/chartApi.js'
import './TrackPage.css'

// 상세 페이지: URL의 :country/:type/:id로 곡(앨범)을 찾아 표시
// 상세 전용 API가 없으므로 차트 전체를 받아온 뒤 id로 찾는다.
// (상세 페이지에서 새로고침해도 동작하도록 여기서도 fetch)
function TrackPage() {
  const { country, type, id } = useParams()
  const navigate = useNavigate() // 프로그래매틱 네비게이션 (40번)
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // 신곡(new)도 원본은 곡 차트이므로 songs에서 찾는다
  const feedType = type === 'albums' ? 'albums' : 'songs'

  useEffect(() => {
    // 페이지를 빠르게 이동할 때 이전 요청 결과가 덮어쓰지 않게 (cleanup)
    let ignore = false

    async function loadChart() {
      try {
        // 어떤 순위에서 클릭해도 찾을 수 있도록 TOP100 요청
        const results = await fetchChart(country, feedType, 100)
        if (!ignore) setTracks(results)
      } catch {
        if (!ignore) setError(true)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    loadChart()

    return () => {
      ignore = true
    }
  }, [country, feedType, id])

  if (loading) {
    return <p className="track-page-status">불러오는 중... 🎧</p>
  }

  if (error) {
    return (
      <main className="track-page">
        <p className="track-page-notfound">정보를 불러오지 못했습니다 😢</p>
        <button className="track-page-back" onClick={() => navigate(-1)}>
          ← 목록으로
        </button>
      </main>
    )
  }

  const track = tracks.find((t) => t.id === id)
  const rank = tracks.indexOf(track) + 1

  // 곡을 못 찾았을 때 (조건부 렌더링)
  if (!track) {
    return (
      <main className="track-page">
        <p className="track-page-notfound">
          {feedType === 'albums' ? '앨범' : '곡'}을 찾을 수 없습니다 😢
        </p>
        <button className="track-page-back" onClick={() => navigate(-1)}>
          ← 목록으로
        </button>
      </main>
    )
  }

  // 100x100 이미지를 600x600 고화질로 바꾸기
  const bigImage = track.artworkUrl100.replace('100x100', '600x600')

  return (
    <main className="track-page">
      <button className="track-page-back" onClick={() => navigate(-1)}>
        ← 목록으로
      </button>

      <img className="track-page-img" src={bigImage} alt={track.name} />

      <h1 className="track-page-name">{track.name}</h1>
      <p className="track-page-artist">
        {track.artistName} · {track.genres[0]?.name}
      </p>

      <dl className="track-page-info">
        <dt>차트</dt>
        <dd>{country === 'kr' ? '🇰🇷 K-POP' : '🌍 Global'}</dd>
        <dt>현재 순위</dt>
        <dd>{rank}위</dd>
        <dt>발매일</dt>
        <dd>{track.releaseDate || '정보 없음'}</dd>
      </dl>

      <a
        className="track-page-listen"
        href={track.url}
        target="_blank"
        rel="noreferrer"
      >
        Apple Music에서 듣기
      </a>
    </main>
  )
}

export default TrackPage

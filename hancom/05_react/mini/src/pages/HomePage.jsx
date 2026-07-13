import { useState, useEffect } from 'react'
import { fetchChart } from '../services/chartApi.js'
import TrackCard from '../components/TrackCard.jsx'
import SkeletonCard from '../components/SkeletonCard.jsx'
import './HomePage.css'

// 홈 페이지: Apple Music 실시간 차트
// 차트 선택 상태(country, chartType, limit, keyword)는 App이 가지고 있고
// props로 받는다 — 상세 페이지 갔다 와도 보던 탭이 유지되게 하기 위함
function HomePage({
  country,
  setCountry,
  chartType,
  setChartType,
  limit,
  setLimit,
  keyword,
  setKeyword,
  isFavorite,
  toggleFavorite,
}) {
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // country, chartType, limit이 바뀔 때마다 다시 불러오기
  useEffect(() => {
    // 탭을 빠르게 연타하면 이전 요청이 늦게 도착해서
    // 새 탭 화면을 덮어쓸 수 있다 → cleanup으로 이전 요청 결과를 무시
    let ignore = false

    async function loadChart() {
      setLoading(true)
      setError(false)
      try {
        const results = await fetchChart(country, chartType, limit)
        if (!ignore) setTracks(results)
      } catch {
        if (!ignore) setError(true)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    loadChart()

    // cleanup: 값이 바뀌어 새 요청이 시작되기 직전에 실행됨
    return () => {
      ignore = true
    }
  }, [country, chartType, limit])

  // 검색 필터: 곡 제목 또는 가수명에 검색어가 포함된 것만
  const filteredTracks = tracks.filter(
    (track) =>
      track.name.toLowerCase().includes(keyword.toLowerCase()) ||
      track.artistName.toLowerCase().includes(keyword.toLowerCase())
  )

  // 제목 문구: 객체 매핑 (종류를 키로 라벨을 한 번에 매칭)
  const countryLabels = { kr: 'K-POP', us: 'Global' }
  const typeLabels = { songs: '인기 곡', albums: '인기 앨범', new: '신곡' }

  const countryLabel = countryLabels[country]
  const typeLabel = typeLabels[chartType]

  return (
    <main className="home">
      {/* K-POP ↔ Global 차트 전환 */}
      <div className="home-country">
        <button
          className={country === 'kr' ? 'active' : ''}
          onClick={() => setCountry('kr')}
        >
          🇰🇷 K-POP 차트
        </button>
        <button
          className={country === 'us' ? 'active' : ''}
          onClick={() => setCountry('us')}
        >
          🌍 Global 차트
        </button>
      </div>

      <h1 className="home-title">
        오늘의 {countryLabel} {typeLabel} TOP{limit}
        {chartType === 'new' && (
          <span className="home-title-sub"> (인기순)</span>
        )}
      </h1>

      {/* 모든 탭 공통 안내 */}
      <p className="home-hint">
        <strong>NEW</strong> 뱃지는 최근 30일 이내 발매곡입니다.
        {country === 'kr' && ' · K-POP 차트는 한국 곡만 표시해요.'}
      </p>

      {/* 신곡 탭 설명 (조건부 렌더링) */}
      {chartType === 'new' && (
        <p className="home-notice">
          ✨ 차트 TOP100 중 최근 발매곡만 골라 인기순으로 보여줍니다.
          목록이 채워질 때까지 기간을 60일부터 자동으로 넓혀요.
        </p>
      )}

      {/* 차트 종류 / 개수 전환 버튼 */}
      <div className="home-toolbar">
        <div className="home-tabs">
          <button
            className={chartType === 'songs' ? 'active' : ''}
            onClick={() => setChartType('songs')}
          >
            🎵 곡
          </button>
          <button
            className={chartType === 'albums' ? 'active' : ''}
            onClick={() => setChartType('albums')}
          >
            💿 앨범
          </button>
          <button
            className={chartType === 'new' ? 'active' : ''}
            onClick={() => setChartType('new')}
          >
            ✨ 신곡
          </button>
        </div>
        <div className="home-tabs">
          {[10, 25, 50].map((n) => (
            <button
              key={n}
              className={limit === n ? 'active' : ''}
              onClick={() => setLimit(n)}
            >
              TOP{n}
            </button>
          ))}
        </div>
      </div>

      {/* 검색창 (controlled component) */}
      <input
        className="home-search"
        type="text"
        placeholder="곡 제목이나 가수를 검색해보세요"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />

      {/* 조건부 렌더링: 로딩(스켈레톤) / 에러 / 검색 결과 없음 / 정상 */}
      {loading && (
        <div className="home-list">
          {[...Array(limit)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {error && (
        <p className="home-status">
          차트를 불러오지 못했습니다 😢 잠시 후 다시 시도해주세요.
        </p>
      )}

      {!loading && !error && filteredTracks.length === 0 && (
        <p className="home-status">"{keyword}" 검색 결과가 없습니다 🔍</p>
      )}

      {!loading && !error && (
        <div className="home-list">
          {filteredTracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              rank={tracks.indexOf(track) + 1}
              country={country}
              type={chartType}
              favorite={isFavorite(track.id)}
              onToggleFavorite={() => toggleFavorite(track, country, chartType)}
            />
          ))}
        </div>
      )}
    </main>
  )
}

export default HomePage

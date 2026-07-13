// Apple Music 차트 피드에서 인기 TOP N 가져오기
// 실제 주소: https://rss.marketingtools.apple.com/api/v2/{국가}/music/most-played/{개수}/{종류}.json
// CORS 때문에 vite.config.js의 프록시(/apple-api)를 거쳐서 요청한다.
//
// country : 'kr'(K-POP) 또는 'us'(Global — Apple은 전세계 통합 차트가 없어서 미국 차트를 사용)
// type    : 'songs'(곡) | 'albums'(앨범) | 'new'(신곡)
// limit   : 10, 25, 50, 100

// 한 번 받아온 차트는 기억해뒀다가 재사용 (캐시)
// TOP10 ↔ TOP50 전환 때마다 같은 데이터를 다시 다운로드하지 않게 한다
const cache = {}

async function requestChart(country, type, limit) {
  const key = `${country}/${type}/${limit}`

  if (cache[key]) {
    return cache[key] // 이미 받아둔 게 있으면 네트워크 요청 없이 바로 반환
  }

  const res = await fetch(
    `/apple-api/api/v2/${country}/music/most-played/${limit}/${type}.json`
  )

  if (!res.ok) {
    throw new Error('차트를 불러오지 못했습니다')
  }

  const data = await res.json()
  cache[key] = data.feed.results // 다음을 위해 저장
  return cache[key]
}

// K-POP(한국) 곡인지 판단
// 한국 스토어 차트에는 외국곡도 섞여 있어서 두 가지 조건으로 거른다:
// 1) 장르에 'K-Pop'이 있거나
// 2) 가수명 또는 곡 제목에 한글이 있으면
//    (로제, 악뮤처럼 장르가 록/팝으로 된 한국 가수,
//     가수명은 영어지만 제목이 한글인 곡 대비)
function isKoreanTrack(track) {
  const hasKpopGenre = track.genres.some((genre) => genre.name === 'K-Pop')
  const hasHangul = /[가-힣]/.test(track.artistName + track.name)
  return hasKpopGenre || hasHangul
}

export async function fetchChart(country = 'kr', type = 'songs', limit = 10) {
  // 필터링 후에도 limit을 채울 수 있도록 항상 100개를 받아온다
  const feedType = type === 'new' ? 'songs' : type
  let tracks = await requestChart(country, feedType, 100)

  // K-POP 차트: 외국곡 걸러내기
  if (country === 'kr') {
    tracks = tracks.filter(isKoreanTrack)
  }

  // 신곡: 전용 피드가 없어서 최근 발매곡만 필터링
  // 차트 자체가 이미 인기순이라, 순서를 그대로 두면 "신곡 인기순"이 된다
  // 목록이 limit만큼 채워질 때까지 기간을 60일 → 90일 → ... 자동으로 넓힌다 (최대 1년)
  if (type === 'new') {
    let days = 60
    let recent = []

    while (days <= 365) {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - days)
      const cutoffText = cutoff.toISOString().slice(0, 10) // 'YYYY-MM-DD' 모양

      recent = tracks.filter((track) => (track.releaseDate || '') >= cutoffText)

      if (recent.length >= limit) break // 채워졌으면 그만 넓히기
      days = days + 30
    }

    return recent.slice(0, limit)
  }

  return tracks.slice(0, limit)
}

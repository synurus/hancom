import './SkeletonCard.css'

// 로딩 중에 카드 자리에 보여주는 회색 카드 (스켈레톤 UI)
function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <span className="skeleton-rank" />
      <span className="skeleton-img" />
      <div className="skeleton-info">
        <span className="skeleton-line wide" />
        <span className="skeleton-line" />
      </div>
    </div>
  )
}

export default SkeletonCard

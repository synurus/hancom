// 배열 tags를 map으로 펼쳐 칩 목록 그림
const Tag = ({ tags }) => {
  return (
    <div>
      {tags.map((tag) => (   // tags(복수 배열) → 요소 하나는 tag(단수)
        <span key={tag}>{'#' + tag}</span>   // '#'(샵)과 tag 값을 붙여 표시 → #react
      ))}
    </div>
  )
}
export default Tag
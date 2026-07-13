import { useState } from 'react'

// name = props(부모가 줌), count = state(자기가 기억)
const ProductItem = ({ name }) => {
  const [count, setCount] = useState(0)   // 담은 개수 기억(처음 0)
  return (
    <div>
      <div className="product">
        <h3>{name}</h3>                        {/* props 표시 */}
        <p>{count}개 담음</p>                    {/* state 표시 */}
      </div>
      <button onClick={() => setCount(c => c + 1)}>🛒 담기</button>   {/* 러닝화 카드 밖 (함수형) */}
    </div>
  )
}
export default ProductItem
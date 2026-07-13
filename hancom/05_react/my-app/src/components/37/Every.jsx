import { useState, useEffect } from 'react'

const Every = () => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    console.log('렌더링 될 때마다 실행')   // 화면 그릴 때마다 매번
  })                                    // ← 두번째 칸 없음 = 매 렌더마다 실행

  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
export default Every
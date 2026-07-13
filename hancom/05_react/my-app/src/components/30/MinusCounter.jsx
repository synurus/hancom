import { useState } from 'react'

const MinusCounter = () => {
  const [count, setCount] = useState(0)
  return (
    <>
        <span>{count}</span>
        <button onClick={() => setCount(c => c + 1)}>
            플러스 카운터
        </button>
        <button onClick={() => setCount(c => c - 1)}>
            마이너스 카운터
        </button>
    </>
  )
}
export default MinusCounter
import { useState } from 'react'

const ResetCounter = () => {
  const [count, setCount] = useState(0)
  return (
    <>
      <span>{count}</span>
      <button onClick={() => setCount(c => c + 1)}>+1</button>
      <button onClick={() => setCount(c => c - 1)}>−1</button>
      <button onClick={() => setCount(0)}>리셋</button>
    </>
  )
}
export default ResetCounter
import { useState, useEffect } from 'react'

const Counter = () => {
  // useState — React 내장 함수. 인자: 초기값(0) / 반환: [현재값, 바꾸는함수]
  const [count, setCount] = useState(0)

  // useEffect — React 내장 함수. 인자: (실행할콜백, 의존성배열)
  useEffect(() => {
    console.log('count 바뀜:', count)   // 콜백 내용 — count 변할 때마다 실행
  }, [count])                          // [count] = 두번째 인자(의존성). 이 값 바뀔 때만 콜백 재실행

  // setCount — count값 바꾸는 함수. 호출 → count 변경 → 화면 리렌더 → useEffect 재실행
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
export default Counter
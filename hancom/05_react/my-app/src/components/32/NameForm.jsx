import { useState } from 'react'

const NameForm = () => {
  const [name, setName] = useState('')   // 입력값 보관(처음 빈 문자열)
  // input: value={name}=칸에 보일 값(state) / onChange=칠 때마다 state 갱신
  return (
    <>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <p>안녕, {name}!</p>   {/* 입력 즉시 화면 반영 */}
    </>
  )
}
export default NameForm
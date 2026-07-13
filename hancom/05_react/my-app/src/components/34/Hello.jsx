import { useEffect } from 'react'

const Hello = () => {
  useEffect(() => {
    console.log('화면 뜰 때 딱 1번 실행')   // 여기에 시작 작업
  }, [])                            // [] = 처음 한 번만

  return <p>안녕하세요</p>
}
export default Hello
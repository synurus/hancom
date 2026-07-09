import './Hello.css'

const Hello = () => {   // 컴포넌트 = JSX 돌려주는 함수
  return (
    <div className="box">
      <h1>안녕!</h1>
      <p>반가워요!</p>
    </div>
  )
}                       // 여기까지가 Hello 부품 한 개

export default Hello   // 다른 파일에서 쓰도록 내보냄
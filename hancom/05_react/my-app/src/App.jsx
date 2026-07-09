import './App.css'
// import Hello from './components/18/Hello.jsx'
// import Greeting from './components/19/Greeting.jsx'
// import Profile from './components/20/Profile.jsx'
// import Card from './components/21/card.jsx'
// import Avatar from './components/22/Avatar'
import Badge from './components/23/Badge.jsx'

function App() {
  return (
    <>
    {/* <Hello/> */}

    {/* <Greeting name="React"/>
    <Greeting name="123"/> */}

    {/* <Profile name="홍길동" job="가가가 나나나 다다다"/> */}
    
    {/* <Card title="React 고수되기" desc="기초부터 차근차근" emoji="⭐"/> */}

    {/* <Avatar name="가가가" online={true}/>
    <Avatar name="나나나" online={false}/> */}

    <h1>삼항 연산자 조건식 [? True : False]</h1>
    <Badge text = "이것은 true 입니다" type="new"></Badge>
    <Badge text = "이것은 false 입니다" type="not"></Badge>
    </>
  )
}

export default App
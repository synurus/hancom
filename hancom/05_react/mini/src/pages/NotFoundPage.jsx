import { Link } from 'react-router-dom'
import './NotFoundPage.css'

// 없는 주소로 접속했을 때 보여주는 404 페이지
function NotFoundPage() {
  return (
    <main className="notfound">
      <p className="notfound-emoji">🎧❓</p>
      <h1 className="notfound-title">404</h1>
      <p className="notfound-text">페이지를 찾을 수 없습니다.</p>
      <Link to="/" className="notfound-home">차트 홈으로 가기</Link>
    </main>
  )
}

export default NotFoundPage

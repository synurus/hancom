import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  /* Error(에러, 실수)를 잡아주는 안전모드로 감싸고 */
  <StrictMode>
    <App />
  </StrictMode>,
)

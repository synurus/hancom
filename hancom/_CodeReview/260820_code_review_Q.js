/* =====================================================================
 * 2026-08-20 React 질문 (4주차 · React)
 * 주제: 항목을 지웠더니 체크가 엉뚱한 데로 옮겨간다.
 * ---------------------------------------------------------------------
 * 실행: App.jsx 를 아래 코드로 바꾸고, 콘솔(F12)을 연 채
 *       (1) 맨 위 '우유' 만 체크한다
 *       (2) '우유' 의 [삭제] 를 누른다
 *       (파일째 옮기지 말고 코드만 복사한다)
 *
 *   실행하기 전에 먼저 예상해서 적는다. (누르는 "직후" 기준)
 *   Q1. '우유' 를 지운 직후, 체크는 어디에 있나? (사라진다 / 빵에 남는다)
 *   Q2. '우유' 를 지운 직후 콘솔에 새로 찍히는 줄은? (unmount 우유 / unmount 계란)
 * ===================================================================== */

import { useState, useEffect } from 'react';

function Row({ name, onDelete }) {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    console.log('mount  ', name);
    return () => console.log('unmount', name); // 이 Row 가 사라질 때 찍힌다
  }, []);

  return (
    <li>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
      />
      {name}
      <button onClick={onDelete}>삭제</button>
    </li>
  );
}

const 초기 = [
  { id: 1, name: '우유' },
  { id: 2, name: '빵' },
  { id: 3, name: '계란' },
];

export default function App() {
  const [items, setItems] = useState(초기);
  const 삭제 = (id) => setItems(items.filter((it) => it.id !== id));

  return (
    <ul>
      {items.map((it, index) => (
        <Row key={index} name={it.name} onDelete={() => 삭제(it.id)} />
      ))}
    </ul>
  );
}

// // 선생님이 열어준 서버(192.168.10.28:5000)에서 학생 목록(id+이름) 가져오기
// fetch('http://192.168.10.28:5000/hancom/이현우/users', {
//   headers: { 'Authorization': 'HANCOM' }   // 이 헤더 없으면 401 인증 필요 에러
// })
//   .then(res => res.json())
//   .then(users => console.log(users))
//   .catch(err => console.log('❌ 서버 연결 실패:', err.message))

// 8. 강사 서버에서 학생 목록 조회 (Authorization 헤더) — 수업 자료 코드
const studentsList = [
    '강성원', '강하영', '김정아', '김정현', '김해냄', '김효인', '박진', '안치호',
    '양하은', '유민성', '이도연', '이현우', '임소정', '전욱진', '정기준', '정선민',
    '정유진', '표후동', '한유진', '한윤지'
]

fetch('http://192.168.10.28:5000/hancom/이현우/users', {
    headers: { 'Authorization': 'HANCOM' }
})
    .then(res => res.json())
    .then(students => {
        console.log(students) // 학생 목록 배열

        const serverList = students.map(s => s.name)
        const absentStudents = studentsList.filter(name => !serverList.includes(name)) // 명단엔 있는데 서버엔 없음
        const addedStudents = serverList.filter(name => !studentsList.includes(name)) // 서버엔 있는데 명단엔 없음

        console.log('없는 사람:', absentStudents)
        console.log('추가된 사람:', addedStudents)

        const fixedStudents = serverList.filter(name => !addedStudents.includes(name))
        fixedStudents.push('김대진')

        console.log(fixedStudents)
    })


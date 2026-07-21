from ultralytics import solutions
import cv2

# 1. 비디오 경로 설정
cap = cv2.VideoCapture("http://210.99.70.120:1935/live/cctv007.stream/playlist.m3u8")

# 2. 카운팅 선 설정
count_points = [(200, 200), (400, 200)]     # 좌 -> 우

# 3. 모델 로드 및 카운터 객체 생성
counter = solutions.ObjectCounter(
    model="yolo11n.pt",
    show=False,
    region=count_points
)

# 4. 프레임 처리
while cap.isOpened():
    success, frame = cap.read()
    if not success:
        print("프레임 읽기 실패")
        break

    # 4-1. 프레임 리사이즈
    re_frame = cv2.resize(frame, (640, 480))

    # 4-2. 탐지 + 트레킹 + 선 통과 판정 + IN/OUT 카운트
    results = counter(re_frame)

    # 4-3. 처리된 프레임 표시
    cv2.imshow("IN/OUT COUNT", results.plot_im)

    # 4-4. q 키로 종료
    # waitKey가 없으면 창이 갱신되지 않아 '응답 없음'이 되고 q로 끌 수도 없음
    if cv2.waitKey(1) & 0xFF == ord('q'):
        print("Q 키를 눌러서 종료")
        break

# 5. 자원 해제
cap.release()
cv2.destroyAllWindows()
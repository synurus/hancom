from ultralytics import YOLO
import cv2

# 1. CCTV 스트리밍 URL 설정
stream_url = "http://210.99.70.120:1935/live/cctv009.stream/playlist.m3u8"

cap = cv2.VideoCapture(stream_url)

# 2. YOLO 모델 로드
model = YOLO("yolo11n.pt")

# 3. 위험 판단 기준
WARNING_THRESHOLD = 5

# 4. 실시간 프레임 처리
while cap.isOpened():
    success, frame = cap.read()
    if not success:
        print("웹캠 읽기 실패")
        break

    # 4-1. YOLO 추론
    results = model(frame)

    # 4-2. 탐지 박스 그린 프레임 생성
    annotated_frame = results[0].plot()

    # 4-3. 탐지 객체 수
    count = len(results[0].boxes)

    # 4-4. 탐지 객체 수 기준 상태 및 색 결정
    if count >= WARNING_THRESHOLD:
        status = "Warning"
        color = (0, 0, 255)
    else:
        status = "Safe"
        color = (255, 0, 0)

    # 4-5. 탐지 객체 수 및 상태 화면에 표시
    cv2.putText(
        annotated_frame,                    # 글자를 그릴 영상
        f"Detected : {count}, {status}",    # 출력할 문자열
        (10, 30),                           # 표시할 좌표
        cv2.FONT_HERSHEY_SIMPLEX,           # 폰트 스타일
        1,                                  # 폰트 크기
        color,                              # 글자 색
        2,                                  # 글자 두께
        cv2.LINE_AA                         # 안티앨리어싱
    )

    # 4-6. 윈도우 창 출력
    cv2.imshow("YOLO_COUNT", annotated_frame)

    # 4-7. 'q' 키 누르면 종료
    if cv2.waitKey(1) & 0xFF == ord('q'):
        print("q키를 눌러서 종료")
        break

# 5. 자원 해제
cap.release()
cv2.destroyAllWindows()
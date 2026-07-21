from ultralytics import solutions
import cv2

# 1. 비디오 경로 설정 (공공 CCTV HLS 스트림)
cap = cv2.VideoCapture("http://210.99.70.120:1935/live/cctv013.stream/playlist.m3u8")

# 2. 속도 추정 객체 생성 및 모델 로드
yolo_speed = solutions.SpeedEstimator(
    model="yolo11n.pt",            # 사용할 YOLO 모델 파일
    show=False,                    # 결과 화면 실시간 표시
    max_speed=120,                 # 최대 속도 상한 (km/h) — 상한 초과값은 표시 안 됨
    meter_per_pixel=0.1,           # 픽셀 1개 = 실제 0.1m (추정값, 환경별 직접 보정 필수)
    classes=[2],                   # COCO class 2 = car (차량만 추적)
    line_width=2                   # 바운딩 박스 선 두께
)

# 3. 프레임 처리
while cap.isOpened():
    success, frame = cap.read()                # 한 프레임 읽기
    if not success:
        print("프레임 읽기 실패")
        break

    # 3-1. 속도 계산 및 추적 수행
    results = yolo_speed(frame)

    # 3-2. 처리된 프레임 표시
    cv2.imshow("Speed", results.plot_im)
    
    # 3-3. q 키 입력 시 종료
    if cv2.waitKey(5) & 0xFF == ord('q'):
        print("q 키를 눌러서 종료합니다.")
        break

# 4. 자원 해제
cap.release()
cv2.destroyAllWindows()
from ultralytics import solutions
import cv2

# 1. 비디오 경로 설정
stream_url = "http://210.99.70.120:1935/live/cctv001.stream/playlist.m3u8"
cap = cv2.VideoCapture(stream_url)

# 2. 모델 로드 및 거리 계산 객체 생성
distance = solutions.DistanceCalculation(
    model="yolo11n.pt",
    show=True
)

# 3. 비디오 프레임 처리
while cap.isOpened():
    success, frame = cap.read()
    if not success:
        print("프레임 읽기 실패")
        break

    # 3-1. 거리 계산 수행
    results = distance.process(frame)

    # 3-2. pixels_distance 추출
    pixel_distance = results.pixels_distance

    # q 키 확인은 continue보다 먼저 — 뒤에 두면 객체 미선택 상태에서 q로 종료 불가
    if cv2.waitKey(1) & 0xFF == ord('q'):
        print("Q 키를 눌러서 종료합니다.")
        break

    # 아직 거리 측정 안 됐을 때 (좌클릭 2회로 대상 2개를 고르기 전)
    if pixel_distance is None or pixel_distance == 0:
        print("[거리] ----px [상태] 입력 안됨")
        continue

    # 3-3. 거리 조건에 따른 상태 정의
    if pixel_distance >= 150:
        status = "SAFE"
    elif pixel_distance >= 100:
        status = "Warning"
    else:
        status = "DANGER"

    # 3-4. 상태 출력
    print(f"[거리] {pixel_distance}px [상태] {status}")

# 4. 자원 해제
cap.release()
cv2.destroyAllWindows()
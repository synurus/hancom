from ultralytics import YOLO
import cv2
from v15_03_cctv_its_def import its_cctv    # 앞서 만든 함수 가져오기

# 1. its_cctv 함수로 주소 가져오기
test_url = its_cctv(1111)

# 2. 비디오 경로 설정
cap = cv2.VideoCapture(test_url)

# 3. 모델 로드
model = YOLO("yolo11n.pt")

# 4. 프레임 처리
while cap.isOpened():
    success, frame = cap.read()
    if not success:
        print("프레임 읽기 실패...")
        break

    # 4-1. 모델 추론
    results = model(frame)

    # 4-2. 결과 이미지
    annotated_frame = results[0].plot()

    # 4-3. 윈도우 창 생성
    cv2.namedWindow("ITS_YOLO", cv2.WINDOW_AUTOSIZE)
    cv2.imshow("ITS_YOLO", annotated_frame)

    # 4-4. q키를 눌러서 종료
    if cv2.waitKey(1) & 0xFF == ord('q'):
        print("Q키를 눌러서 종료")
        break

# 5. 자원 해제
cap.release()
cv2.destroyAllWindows()
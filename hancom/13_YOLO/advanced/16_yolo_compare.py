import time
import cv2
from ultralytics import YOLO

# 1. 모델 선택 — 이 줄만 바꿔가며 비교
# model = YOLO("yolo11n.pt")
model = YOLO("yolo11n_openvino_model/")

# 2. 비디오 경로 설정
cap = cv2.VideoCapture(0)

# 3. 프레임 처리
while cap.isOpened():
    success, frame = cap.read()
    if not success:
        break

    # 3-1. 추론 시간 측정
    # perf_counter — 경과 시간 전용 시계. time.time()은 Windows에서 눈금이
    # 15.6ms라 50ms짜리 추론을 재면 오차가 ±30%까지 벌어짐
    start_time = time.perf_counter()      # 추론 시작 시각
    results = model(frame, verbose=False)
    end_time = time.perf_counter()        # 추론 종료 시각

    # 3-2. FPS 계산 (1초 ÷ 1장 걸린 시간)
    model_time = end_time - start_time
    fps = 1 / model_time

    # 3-3. 결과 그리고 FPS 표시
    annotated_frame = results[0].plot()
    cv2.putText(
        annotated_frame,
        f"{fps:.1f} FPS",
        (10, 30),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 255, 0),
        2
    )

    cv2.imshow("YOLO FPS", annotated_frame)

    # 3-4. q 키로 종료
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# 4. 자원 해제
cap.release()
cv2.destroyAllWindows()
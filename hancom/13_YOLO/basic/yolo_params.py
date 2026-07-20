from ultralytics import YOLO
import cv2

# 1. 모델 로드
model = YOLO("yolo11n.pt")

# 2. 클래스 이름 -> 인덱스 변환
target_names = ["dining table", "vase"]
name_to_id = {name: idx for idx, name in model.names.items()}
target_ids = [name_to_id[name] for name in target_names]

# 3. 모델 파라미터
model(
    "input_params.jpg",     # 추론할 이미지 경로
    save=True,
    classes=target_ids,     # dining table, vase 클래스만 탐지
    # conf=0.5              # 신뢰도(신뢰도 일정수치 이상만 보여줌)
    # max_det=3             # 탐지할 최대 개수
    # save_crop=True        # 탐지된 객체 폴더 및 이미지 저장
    # save_txt=True         # 좌표 텍스트 저장
    # save_conf=True
)
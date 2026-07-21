from ultralytics import YOLO

# 1. 원본 PyTorch 모델 로드
model = YOLO("yolo11n.pt")

# 2. OpenVINO 형식으로 변환 (Intel CPU 부스터)
model.export(format="openvino")
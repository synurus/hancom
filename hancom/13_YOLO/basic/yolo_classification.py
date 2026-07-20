from ultralytics import YOLO
import cv2

# 1. 모델 로드
model = YOLO("yolo11n-cls.pt")
# n => s => m => l => x 모델 크기 nano small medium large xlarge

# 2. 모델 추론
results = model("./input.jpg")

# 3. 결과 시각화
result_image = results[0].plot()

# 4. 결과 이미지 저장
output_image_path = "./result.jpg"
cv2.imwrite(output_image_path, result_image)
print(f"사진이 잘 저장 되었습니다. => {output_image_path}")
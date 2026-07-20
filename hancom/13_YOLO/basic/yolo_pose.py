from ultralytics import YOLO
import cv2

# 1. 모델 로그
model = YOLO("yolo11n-pose.pt")

# 2. 모델 추론
results = model("input_pose.jpg")

# 3. 결과 시각화
results_image = results[0].plot()

# 4. 결과 이미지 저장
output_image_path = "./resulf_pose.jpg"
cv2.imwrite(output_image_path, results_image)
print(f"저장 잘 되었습니다. => {output_image_path}")
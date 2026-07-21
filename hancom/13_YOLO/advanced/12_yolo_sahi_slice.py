from sahi.predict import get_sliced_prediction
from sahi import AutoDetectionModel

# 1. 모델 경로
model_path = "yolo11n.pt"

# 2. 모델 로드
detection_model = AutoDetectionModel.from_pretrained(
    model_type="ultralytics",
    model_path=model_path,
    confidence_threshold=0.4        # 40% 이상 확신할 때만 탐지
)

# 3. SAHI 적용 (사진을 작은 타일로 쪼개서 추론)
results = get_sliced_prediction(
    "13_YOLO\/advanced/demo_data/image_2.png",
    detection_model,
    slice_height=200,               # 타일 높이 (px)
    slice_width=200,                # 타일 너비 (px)
    overlap_height_ratio=0.1,       # 세로 겹침 10%
    overlap_width_ratio=0.1         # 가로 겹침 10%
)

# 4. 결과 시각화 및 저장
# export_dir은 '폴더' 경로 — 파일명(.jpg)을 주면 그 이름의 폴더가 만들어짐
# 저장 파일명은 SAHI가 정함: <export_dir>/prediction_visual.png
results.export_visuals(export_dir="sahi/")

# 5. 탐지 개수 출력 — STEP 11(기본 추론) 숫자와 비교하면 SAHI 효과가 보임
print(f"탐지 수: {len(results.object_prediction_list)}")
print("모든 코드가 성공적으로 수행됐습니다.")

# 다른 이미지 SAHI 추론
# 슬라이스 크기와 오버랩 비율 조절
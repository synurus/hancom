import streamlit as st
from ultralytics import YOLO
import cv2

# 1. Streamlit 페이지 기본 설정 - 웹 화면 모양 결정
st.set_page_config(layout="wide")
st.title("YOLO 실시간 CCTV 탐지")

# 2. 영상 출력용 공간 설정 - 영상이 들어갈 빈 액자 준비
frame_placeholder = st.empty()

# 3. CCTV 비디오 스트림 연결
stream_url = "http://210.99.70.120:1935/live/cctv013.stream/playlist.m3u8"
cap = cv2.VideoCapture(stream_url)

# 4. 모델 로드
model = YOLO("yolo11n.pt")

# 5. 프레임 처리
while cap.isOpened():
    success, frame = cap.read()
    if not success:
        print("프레임 읽기 실패")
        break

    # 5-1. 모델 객체 탐지 수행
    results = model(frame)

    # 5-2. 탐지 결과를 이미지에 시각화
    annotated_frame = results[0].plot()

    # 5-3. Streamlit placeholder에 프레임 갱신
    frame_placeholder.image(annotated_frame, channels="BGR")

# 6. 자원 해제
cap.release()
cv2.destroyAllWindows()
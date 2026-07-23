import streamlit as st             # 웹앱 도구
from ultralytics import YOLO       # 사물 찾는 AI
import cv2                          # 영상 처리 도구
import pandas as pd                 # 표(엑셀 같은) 만드는 도구
import plotly.express as px         # 그래프 그리는 도구 (pip install plotly)
import time                         # 시간 측정용

# 1. 화면 구성 - 화면을 좌|우 2칸으로 분할
col1, col2 = st.columns(2)

with col1:
    # YOLO 프레밍 표시용 빈 영역
    frame_placeholder = st.empty()

with col2:
    # 객체 수 그래프 표시용 빈 영역
    chart_placeholder = st.empty()
    
# 2. 비디오 경로 설정
stream_url = "http://210.99.70.120:1935/live/cctv013.stream/playlist.m3u8"
cap = cv2.VideoCapture(stream_url)

# 3. 모델 로드
@st.cache_resource      # 모델이나 DB 같은 무거운 자원 캐싱 (재실행해도 1번만 로드)
def load_model():
    return YOLO("yolo11n.pt")

model = load_model()

# 4. 프레임 처리
while cap.isOpened():
    success, frame = cap.read()
    if not success:
        print("프레임 읽기 실패")
        break

    # 4-1. 모델 객체 탐지 수행
    results = model(frame)

    # 4-2. 탐지 결과 이미지
    annotated_frame = results[0].plot()

    # 4-3. 탐지된 객체의 클래스 이름 추출 - "사람", "차", "버스", "트럭"
    # 컴프리헤션으로 클래스 이름 가져오기
    labels = [model.names[int(c)] for c in results[0].boxes.cls]

    # 4-4. 탐지 객체 수 시각화 - 종류별 갯수 막대 그래프 만들기
    if labels:      # 객체 탐지되면
        # labels 리스트를 DataFrame 으로 변환 후 갯수 집계
        df_count = pd.DataFrame({"Object" : labels})

        # 종류별 갯수 집계
        df_count = df_count.value_counts().reset_index(name="Count")

        # plotly 를 이용해 막대 그래프 생성
        fig = px.bar(
            df_count,
            x="Object",             # 클래스 이름
            y="Count",              # 갯수
            title="탐지 객체 수",
            color="Object",         # 클래스 마다 색상 다르게
            text="Count",           # 막대 위에 숫자 표시
        )
    else:
        df_count = pd.DataFrame({"Object" : [], "Count" : []})
        # 빈 표만 표시
        fig = px.bar(
            df_count,
            x="Object",             # 클래스 이름
            y="Count",              # 갯수
            title="탐지 객체 수",
        )

    # 4-5. Streamlit 결과 표시 - 왼쪽 영상 + 오른쪽 그래프
    frame_placeholder.image(annotated_frame, channels="BGR")

    chart_placeholder.plotly_chart(fig, use_container_width=True, key=f"chart_{time.time()}")
    # 매번 다름 키 값 설정해서 위젯 충돌 막기

# 5. 자원 해제
cap.release()
cv2.destroyAllWindows()
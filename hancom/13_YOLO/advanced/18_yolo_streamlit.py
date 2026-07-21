from ultralytics import solutions

import ssl, os
ssl._create_default_https_context = ssl._create_unverified_context
os.environ["CURL_CA_BUNDLE"] = ""
os.environ["REQUESTS_CA_BUNDLE"] = ""

# 1. Streamlit 추론 인스턴스 생성
inf = solutions.Inference(model="yolo11n.pt")

# 2. 웹 UI 시작 (브라우저 자동 오픈)
inf.inference()

# 사전 설치: pip install streamlit
# 실행 방법: streamlit run ./v15_19_yolo_streamlit.py
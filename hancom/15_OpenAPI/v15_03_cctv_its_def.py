# import urllib           # URL 요청
import json             # JSON 데이터 처리용
import pandas as pd     # 데이터 프레임 생성 및 데이터 처리용
import urllib.request   # URL 요청

# 1. 인증 키 설정
key = "db5c00dc1fce45c49049bff225a0fea6"

# 2. 도로 유형 지정
Type = "its"
# its = 일반도로
# ex = 고속도로

# 3. 관심 영역 설정
minX = float(126.78) # 최소 경도
maxX = float(129.06) # 최대 경도
minY = float(35.18) # 최소 위도
maxY = float(37.75) # 최대 위도

# 4. 응답 데이터 형식 설정
getType = "json"

# 5. API 요청 URL 생성
url_cctv = (
    f"https://openapi.its.go.kr:9443/cctvInfo"
    f"?apiKey={key}&type={Type}&cctvType=1"
    f"&minX={minX}&maxX={maxX}"
    f"&minY={minY}&maxY={maxY}"
    f"&getType={getType}"
)

def its_cctv(cctv_index=1111):
    test_url = pd.json_normalize(json.loads(urllib.request.urlopen(url_cctv).read().decode('utf-8'))["response"]["data"])["cctvurl"][cctv_index]
    return test_url
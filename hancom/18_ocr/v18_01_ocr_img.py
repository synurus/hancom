import pytesseract      # 이미지에서 문자 인식
from PIL import Image   # 이미지 처리
import os

# 1. Tesseract 실행 파일 경로 지정
pytesseract.pytesseract.tesseract_cmd = "C:/Program Files/Tesseract-OCR/tesseract.exe"

# 2. 이미지 불러오기
image = Image.open("tesseract.png")

# 3. OCR 수행
results = pytesseract.image_to_string(
    image,
    lang="eng",
)

# 4. 결과 출력
print("===========================")
print(results)
print("===========================")
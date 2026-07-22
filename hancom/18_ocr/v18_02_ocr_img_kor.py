import easyocr
import ssl

# 핵심: SSL 검증을 비활성화하여 인증서 에러 회피
ssl._create_default_https_context = ssl._create_unverified_context

# Reader 객체 생성 (한국어, 영어 설정)
reader = easyocr.Reader(['ko', 'en'])

# OCR 수행
result = reader.readtext('image.jpg')

print("===========================")
for bbox, text, prob in result:
    print(text)
print("===========================")
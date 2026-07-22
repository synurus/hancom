from sentence_transformers import SentenceTransformer, util

# 1. 사전 학습된 모델 로드
model = SentenceTransformer("all-MiniLM-L6-v2")
"""
all-MiniLM-L6-v2 모델 설명 :
    - 가벼운(경량) 문장 임베딩 모델
    - 영어 문장을 벡터 공간에 매핑
    - 특징
        1. 빠른 연산 속도
        2. 문장 의미를 벡터로 잘 반영
        3. 검색, 추천, 유사도 계산에 유용
    벡터 : 문장 => 숫자로 나열
    임베딩 : 의미를 가진 숫자 좌표로 변환
"""

# 2-1. 비교할 두 문장 정의 (유사한 문장)
# sen1 = "He is reading a book in the library"
# sen2 = "He is at the library reading a book"

# 2-2. 비교할 두 문장 정의 (다른 문장)
sen1 = "The cat is sleeping on the sofa"
sen2 = "Tomorrow, I have a math exam at school"

# 3. 두 문장을 모델이 이해할 수 있도록 벡터로 변환
emb1 = model.encode(sen1, convert_to_tensor=True)
emb2 = model.encode(sen2, convert_to_tensor=True)

# 4. 코사인 유사도 계산
cos_sim = util.pytorch_cos_sim(emb1, emb2)

# 5. 결과 출력

# -1    : 완전히 반대
# 0     : 무관
# +1    : 완전히 동일

print(f"결과 두 문장의 유사도 : {cos_sim.item():.4f}")


names = ["뽀삐", "초코", "쿠키"]
scores = [95, 88, 72,]

for name, score in zip(names, scores):
    print(f"{name} : {score}")

# 뽀삐: 95점
# 초코: 88점
# 쿠키: 72점

print("---------------------------------")

pairs = list(zip(names, scores))
print(pairs)

# [('뽀삐', 95), ('초코', 88), ('쿠키', 72)]

print("---------------------------------")

keys = ["이름", "나이", "직업"]
values = ["홍길동", 30, "개발자"]

person = dict(zip(keys, values))
print(person)

# {'이름': '홍길동', '나이': 30, '직업': '개발자'}
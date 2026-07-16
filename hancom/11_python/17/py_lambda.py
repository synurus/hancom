# 람다 공식
# 함수명 = lambda 매개변수(파라미터) : 반환값

# def add(a, b):
#     return a + b
# print(add(7, 3))  # 10

# add = lambda a, b : a + b
# print(add(7, 3))  # 10

import pyfiglet

# 일반 함수로 만들면 (참고)
# def decorate_text(text):
#     return pyfiglet.figlet_format(text)

figlet_text = lambda text : pyfiglet.figlet_format(text)

user_input = input("글자를 입력해주세요 : ")

print(figlet_text(user_input))
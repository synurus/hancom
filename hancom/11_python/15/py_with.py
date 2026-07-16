# with open("memo.txt", "w", encoding="utf-8") as f:
#     f.write("안녕, 파이썬!\n")
#     f.write("with문이 자동으로 닫아줌\n")
# # 블록을 빠져나오면 파일은 알아서 닫힘


# with open("memo.txt", "r", encoding="utf-8") as f:
#     text = f.read()
# print(text)
# # 출력:
# # 안녕, 파이썬!
# # with문이 자동으로 닫아줌


with open("memo.txt", "a", encoding="utf-8") as f:
    f.write("\n새로운 한 줄 추가\n")
# 기존 내용은 그대로, 끝에만 한 줄이 더 붙음


# w 새로 쓰기
# r 읽어 오기
# a 이어 쓰기
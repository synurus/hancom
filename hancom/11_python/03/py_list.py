# 순서있음, 수정가능, 중복허용
colors = ["red", "green", "blue"]

print(colors[0])
print(colors[-1])   # List 마지막값
print(colors[0:2])  # ['red', 'green']  (2번 짤림, 슬라이싱)

print("-------------------------")

print("colors : ", colors)

colors[-1] = "black"
print("colors[-1] = black : ", colors)

colors.append("pink")
print("colors.append(pink) : ", colors)

colors.insert(0, "white")
print("colors.insert(0, white) : ", colors)

colors.remove("green")
print("colors.remove(green) : ", colors)

print("-------------------------")

numbers = [8, 5, 3, 2, 7]
print("numbers : ", numbers)

numbers.sort()
print("numbers.sort() : ", numbers)

numbers.sort(reverse=True)
print("numbers.sort(reverse=True)(내림차순 정렬) : ", numbers)

numbers.reverse()
print("numbers.reverse() : ", numbers)

print("2 in numbers(numbers 에 2 가 포함되어있나요?) : ", 2 in numbers)
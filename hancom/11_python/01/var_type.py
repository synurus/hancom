x = 10                                  # int (주석 => Ctrl + /)
y = 3.14                                # float
name = 'Python'                         # str
is_fun = True                           # bool
colors = ["red", "green", "blue"]       # list(순서있음, 수정가능)
coords = (10, 10)                       # tuple(순서있음, 수정불가)
person = {"name": "Tom", "age": 30}     # dict(키-값 쌍으로)
nums = {1, 2, 3}                        # set(중복불가, 순서없음)
nothing = None                          # NoneType

# 네이밍 스타일 (Python)
# snake_case => 변수명, 함수명
# PascalCase => 클래스명
# camelCase => JavaScript용 (Python에서는 비권장)

print(type(person))             # dict
print(isinstance(x, int))       # True
print(isinstance(x, float))     # False
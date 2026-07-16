from termcolor import colored

# colored(출력할 문자열, 글자색, 배경색, attrs=[스타일])
result = colored(
    "Hello",
    "red",
    "on_white",
    ["bold"]
    )

print(result)
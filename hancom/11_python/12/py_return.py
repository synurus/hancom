from termcolor import colored

def highlight(text: str, color: str) -> str:
    """
    text, color를 입력받아서 text 색상을 변경하는 함수

        text: str
        color: str
    """
    color_text = colored(text, color)
    return color_text

# colored_text = highlight("GOOD", "yellow")
# print(colored_text)
print(highlight("GOOD", "yellow"))
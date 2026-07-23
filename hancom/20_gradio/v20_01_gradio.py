import gradio as gr

# 1. 간단한 함수 정의
def say_hello(name):
    """
    사용자가 입력한 이름을 받아 실행되는 함수
    """
    return "Hello, " + name

# 2. Gradio 인터페이스 생성
gr_web = gr.Interface(
    fn=say_hello,       # 실행할 함수
    inputs="text",      # 텍스트 입력창
    outputs="text",     # 텍스트 출력창
)

# 3. 웹앱 실행 ()
gr_web.launch(share=True)
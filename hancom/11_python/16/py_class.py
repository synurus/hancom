# ==========
# 1. 클래스 : 제품의 설계도
# 2. 생성자 : 객체를 만들 때 실행되는 함수
# 3. 속성   : 클래스 안의 변수
# 4. 메서드 : 클래스 안의 함수
# 5. 객체   : 설계도로 만든 제품
# ==========

# 클래스의 정의
class World:
    # 생성자
    def __init__(self, name, location):
        # 속성
        self.name = name
        self.location = location
    # 메서드
    def hello(self):
        print(f"Hello, {self.name}!!")

    def where(self):
        print(f"{self.name}은 {self.location}에 속해있어.")

# 객체 생성
country = World("Korea", "Asia")

country.hello()
country.where()
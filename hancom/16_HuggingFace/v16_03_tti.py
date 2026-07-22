import os
from huggingface_hub import InferenceClient

client = InferenceClient(
    provider="auto",
    api_key=os.environ["HF_TOKEN"],
)

text = input("프롬프트 입력 : ")

# output is a PIL.Image object
image = client.text_to_image(
    text,
    model="black-forest-labs/FLUX.1-dev",
)

image.save("tti_result.jpg")

print("이미지가 생성됐습니다.")
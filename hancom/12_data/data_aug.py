from PIL import Image, ImageEnhance, ImageOps   # 이미지 증강
import matplotlib.pyplot as plt

# 1. 이미지 로드
img = Image.open("captured_images/cat.jpg")
# img = Image.open("captured_images/result_20260720+093759.jpg")

# 2-1. 이미지 증강(회전)
img_rotated = img.rotate(90)

# 2-2. 이미지 증강(밝기 조절)
enhancer = ImageEnhance.Brightness(img)
img_brightness = enhancer.enhance(1.5)

# 2-3. 이미지 증강(좌우 반전)
img_flip = ImageOps.mirror(img)

# 3. 결과 시각화
fig, ax = plt.subplots(2, 3, figsize=(20, 10))

# 3-1. 원본 이미지
ax[0,0].imshow(img)
ax[0,0].axis('off')
ax[0,0].set_title("Original")

# 3-2. 회전 이미지
ax[0,1].imshow(img_rotated)
ax[0,1].axis('on')
ax[0,1].set_title("Rotated 90")

# 3-3. 밝기 이미지
ax[0,2].imshow(img_brightness)
ax[0,2].axis('off')
ax[0,2].set_title("Brightness")

# 3-4. 반전 이미지
ax[1,0].imshow(img_flip)
ax[1,0].axis('off')
ax[1,0].set_title("Fliped")

plt.show()

img_rotated.save("./img_rotated.jpg")
img_brightness.save("./img_brightness.jpg")
img_flip.save("./img_flip.jpg")
print("사진을 잘 저장했습니다.")
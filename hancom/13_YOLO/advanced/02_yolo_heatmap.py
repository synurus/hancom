from ultralytics import solutions
import cv2

# 1. 비디오 경로 설정
stream_url = "http://210.99.70.120:1935/live/cctv001.stream/playlist.m3u8"
cap = cv2.VideoCapture(stream_url)

# 2. 모델 로드 및 Heatmap 객체 생성
heatmap = solutions.Heatmap(
    model="yolo11n.pt",
    # show=True,
    colormap=cv2.COLORMAP_MAGMA
)

# 3. 비디오 프레임 처리
while cap.isOpened():
    success, frame = cap.read()
    if not success:
        print("프레임을 못 읽었습니다.")
        break

    # 3-1. 누적 히트맵 갱신
    results = heatmap(frame)

    # 3-2. 결과 이미지 저장
    # results[0].plot() # 기존방식
    annotated_frame = results.plot_im

    # 3-3. 윈도우 창
    cv2.imshow("HEATMAP", annotated_frame)

    # 3-4. q키를 눌러서 종료
    if cv2.waitKey(1) & 0xff == ord('q'):
        print("q키를 눌러서 종료")
        break

# 4. 자원 해제
cap.release()
cv2.destroyAllWindows()
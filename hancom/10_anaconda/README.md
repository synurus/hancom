알겠습니다. 블로그용이 아니라 그냥 내용 정리로 드릴게요.

## Anaconda 수업 정리

**1. Anaconda란?**
프로젝트마다 필요한 라이브러리와 버전이 다른데, Anaconda는 프로젝트별로 독립된 "방(가상환경)"을 만들어주는 관리자예요. 집 안의 방들(주방·화장실·거실)이 목적에 따라 나뉘어 있는 것처럼, 환경끼리 서로 간섭 없이 깔끔하게 분리해줍니다.

**2. 설치하기 (Windows)**
아카이브 페이지에서 `Anaconda3-…-Windows-x86_64.exe` 다운로드 → 실행 → Next → I Agree → **Just Me** 선택 → 설치 경로 기본값 유지 → **"Add Anaconda3 to my PATH" 체크** → Install → Finish.

설치 확인:
```bash
conda --version
conda info
python --version
```

**3. 가상환경 관리**
```bash
# 생성 (기본 형식)
conda create -n 환경이름 python=3.10

# 예시
conda create -n cv_env python=3.10

# 활성화 / 비활성화
conda activate cv_env
conda deactivate

# 목록 / 삭제
conda env list
conda env remove -n cv_env

# 유지보수
conda update conda
conda clean --all
```

**4. 패키지 관리 (pip)**
```bash
pip install package-name              # 기본 설치
pip install pkg1 pkg2 pkg3            # 다중 설치
pip install -r requirements.txt      # 파일에서 설치
pip install package==1.2.3           # 특정 버전
pip install --upgrade package        # 업그레이드
pip list                             # 설치 목록 조회
```

**5. 환경 내보내기 & 공유**
```bash
# conda 방식
conda env export > environment.yml       # 내보내기
conda env create -f environment.yml      # 복원

# pip 방식
pip freeze > requirements.txt            # 전체 의존성
pipreqs --force --savepath=requirements.txt .   # 실제 사용한 의존성만 자동 추출
```

---

핵심 흐름은 **설치 → 가상환경 생성/활성화 → 패키지 관리 → 환경 공유**로 이어진다. 특히 `conda`(환경 자체 관리)와 `pip`(패키지 설치)의 역할 구분, 그리고 `pip freeze`(설치된 것 전부)와 `pipreqs`(실제 코드에서 import한 것만)의 차이를 기억해두면 좋다.
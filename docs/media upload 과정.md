## media upload 전체 진행과정
1. 관리자 계정 로그인
2. 미디어 파일 업로드
3. 영화정보 입력 및 등록
4. 웹사이트에서 영상 변환 대기중
5. 변환 완료 후 웹사이트에서 영상 재생

## 1. 관리자 로그인
- 관리자 권한을 가진 유저만 관리자 탭에서 영상을 업로드할 수 있다.


## 2. 미디어 파일 업로드
- 관리자 탭 클릭 후 업로드할 영상 선택 -> s3 업로드 클릭

<img src="./assets/screenshot%202025-05-12%209.49.28.png" alt="screenshot 2025-05-12 9.49.28.png" width="400">

<div><img src="./assets/screenshot%202025-05-12%209.49.35.png" alt="screenshot 2025-05-12 9.49.35.png" width="400"></div>

## 3. 영화정보 입력 및 등록
- 파일이 성공적으로 업로드되면 영화정보를 입력할 수 있다.
- 영상 정보 등록을 클릭하면 영화정보가 저장되며, 영상 변환작업을 시작한다.

<div><img src="assets/screenshot%202025-05-12%209.50.12.png" alt="screenshot 2025-05-12 9.50.12.png" width="400"></div>

<div><img src="assets/screenshot%202025-05-12%209.50.39.png" alt="screenshot 2025-05-12 9.50.39.png" width="400"></div>

<div><img src="assets/screenshot%202025-05-12%209.50.56.png" alt="screenshot 2025-05-12 9.50.56.png" width="400"></div>

## 4. 웹사이트에서 영상 변환 대기중
- lambda function이 s3 이벤트를 트리거하여 mediaconvert에 영상 변환 요청을 보내면 영상 변환작업을 시작한다.

<div><img src="assets/screenshot%202025-05-12%209.56.03.png" alt="screenshot 2025-05-12 9.56.03.png" width="400"></div>

- 작업이 진행되는동안 웹사이트에선 영상의 정보만 확인 가능하다.
- 그동안 영상과 썸네일 미리보기는 확인할 수 없다.
<div><img src="assets/screenshot%202025-05-12%209.53.45.png" alt="screenshot 2025-05-12 9.53.45.png" width="400"></div>

<div><img src="assets/screenshot%202025-05-12%209.55.15.png" alt="screenshot 2025-05-12 9.55.15.png" width="400"></div>

## 5. 변환 완료 후 웹사이트에서 영상 재생
- 변환이 완료되면 다음과 같이 파일들이 저장된다.

<div><img src="assets/screenshot%202025-05-12%2010.07.03.png" alt="screenshot 2025-05-12 10.07.03.png" width="400"></div>


- 웹사이트에서도 영상과 썸네일 미리보기 등을 확인할 수 있다.

<div><img src="assets/screenshot%202025-05-12%2010.07.46.png" alt="screenshot 2025-05-12 10.07.46.png" width="400"></div>

<div><img src="assets/screenshot%202025-05-12%2010.08.02.png" alt="screenshot 2025-05-12 10.08.02.png" width="400"></div>

<div><img src="assets/screenshot%202025-05-12%2010.08.12.png" alt="screenshot 2025-05-12 10.08.12.png" width="400"></div>



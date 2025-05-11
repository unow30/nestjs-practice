<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>

## NestJs Test API Documentation

## swagger doc
<p>https://api.ceramic-tager.store/doc</p>

<p>open time: 11:00 ~ 20:00 (utc +9)</p>

## tech stack

<p>language, framework, server</p>
<img src="https://skillicons.dev/icons?i=js,ts,nodejs,nestjs,nginx&perline=5" alt="Tech Stack" />

<p>database</p>
<img src="https://skillicons.dev/icons?i=postgres,redis,&perline=4" alt="Tech Stack" />

<p>development tool & publish</p>
<img src="https://skillicons.dev/icons?i=webstorm,git,github,aws&perline=4" alt="Tech Stack" />

## schema
![schema.png](src/document/schema.png)

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev #(3000 port)

# watch mode worker
$ pnpm run start:dev:worker #(3001 port)

# production mode
$ pnpm run start:prod

# production mode worker
$ pnpm run start:prod:worker #(3001 port)

```
## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

# 영상 변환 로직(aws)
- [1. HLS(HTTP Live Streaming) 프로토콜.md](docs/HLS%20%EC%98%81%EC%83%81%20%EB%B3%80%ED%99%98/1.%20HLS%28HTTP%20Live%20Streaming%29%20%ED%94%84%EB%A1%9C%ED%86%A0%EC%BD%9C.md)
- [2. aws media convert를 이용한 영상파일 변환 로직.md](docs/HLS%20%EC%98%81%EC%83%81%20%EB%B3%80%ED%99%98/2.%20aws%20media%20convert%EB%A5%BC%20%EC%9D%B4%EC%9A%A9%ED%95%9C%20%EC%98%81%EC%83%81%ED%8C%8C%EC%9D%BC%20%EB%B3%80%ED%99%98%20%EB%A1%9C%EC%A7%81.md)
- [3. HLS player 구현.md](docs/HLS%20%EC%98%81%EC%83%81%20%EB%B3%80%ED%99%98/3.%20HLS%20player%20%EA%B5%AC%ED%98%84.md)
- [4. 썸네일 미리보기 기능 구현과정.md](docs/HLS%20%EC%98%81%EC%83%81%20%EB%B3%80%ED%99%98/4.%20%EC%8D%B8%EB%84%A4%EC%9D%BC%20%EB%AF%B8%EB%A6%AC%EB%B3%B4%EA%B8%B0%20%EA%B8%B0%EB%8A%A5%20%EA%B5%AC%ED%98%84%EA%B3%BC%EC%A0%95.md)
- [5. webVTT 생성.md](docs/HLS%20%EC%98%81%EC%83%81%20%EB%B3%80%ED%99%98/5.%20webVTT%20%EC%83%9D%EC%84%B1.md)
- [mediaconvert job 요청.md](docs/HLS%20%EC%98%81%EC%83%81%20%EB%B3%80%ED%99%98/mediaconvert%20job%20%EC%9A%94%EC%B2%AD.md)

# Elastic Beanstalk 배포 문서

프로젝트의 AWS Elastic Beanstalk 배포와 관련된 문서는 다음 링크에서 확인할 수 있습니다:

- [1. eb 권한부여 및 생성](/docs/elastic-beanstalk/1.%20eb%20권한부여%20및%20생성.md)
- [2. eb 서버배포](/docs/elastic-beanstalk/2.%20eb%20서버배포.md)
- [3. eb nginx 설정](/docs/elastic-beanstalk/3.%20eb%20nginx%20설정.md)

# server descripton

<details> <summary><strong>서버 정보</strong></summary>

- 서버 실행시간: 11:00 ~ 20:00

- Swagger 문서: [https://api.ceramic-tager.store/doc](https://api.ceramic-tager.store/doc)

- 미디어 생성 서버: 3000 port

- 영상 편집 서버: 3001 port

</details> <details> <summary><strong>영화 (Movie)</strong></summary>

- 영화 목록 불러오기

- 영화 생성하기

- 최신 영화 리스트 가져오기

- 영화 불러오기

- 영화 수정하기

- 영화 삭제하기

- 영화 좋아요

- 영화 싫어요


</details> <details> <summary><strong>공통 기능 (Common)</strong></summary>

- presigned-url 생성

- 서버 폴더에 비디오 파일 업로드

- 업로드파일 serve-static으로 접근하기

- serve-static으로 접근가능한 영상 목록 보기

- 비디오파일 s3 temp폴더 업로드


</details> <details> <summary><strong>영화 감독 (Director)</strong></summary>

- 영화 감독 생성하기

- 영화 감독 목록 불러오기

- 영화 감독 불러오기

- 영화 감독 변경하기

- 영화 감독 제거하기


</details> <details> <summary><strong>영화 장르 (Genre)</strong></summary>

- 영화 장르 생성하기

- 영화 장르 목록 불러오기

- 영화 장르 가져오기

- 영화 장르 변경하기

- 영화 장르 제거하기


</details> <details> <summary><strong>인증 (Auth)</strong></summary>

- 사용자 회원가입

- 사용자 로그인

- 사용자 로그인 passport 방식

- 사용자 토큰 갱신하기


</details> <details> <summary><strong>사용자 (User)</strong></summary>

- 사용자 목록 불러오기

- 사용자 불러오기

- 사용자 업데이트

- 사용자 제거하기


</details> <details> <summary><strong>헬스 체크 (Health)</strong></summary>

- load balancer 헬스체크


</details> 

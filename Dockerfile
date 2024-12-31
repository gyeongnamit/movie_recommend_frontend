# 1단계: 빌드 단계 (코드를 설치하고 빌드하는 과정)
# 'node:16' 이미지를 기반으로 새로운 컨테이너 생성 (Node.js 16버전 사용)
FROM node:16 AS builder

# 작업 디렉터리를 '/app'으로 설정 (모든 작업이 이 폴더에서 수행됨)
WORKDIR /app

# 의존성 설치를 위한 설정 파일 복사
# 'package.json'과 'yarn.lock' 파일 복사 (프로젝트의 의존성 정보를 담고 있음)
COPY package.json yarn.lock ./ 

# yarn 명령어로 의존성 설치 및 axios 추가
# - 'yarn install': 기본 의존성 설치
# - 'yarn add axios': 추가적으로 'axios' 라이브러리 설치 (서버와 데이터를 주고받을 때 사용)
RUN yarn install && yarn add axios

# 모든 소스 코드 복사 (현재 폴더의 모든 파일을 컨테이너 내부로 복사)
COPY . . 

# 애플리케이션 빌드 (코드를 최적화하고 실행 파일 생성)
RUN yarn build


# 2단계: 배포 단계 (빌드된 파일을 웹 서버에 배포하는 과정)
# 'nginx:1.23-alpine' 이미지를 기반으로 새로운 컨테이너 생성
# - Nginx는 빠르고 가벼운 웹 서버
# - Alpine은 가벼운 리눅스 배포판
FROM nginx:1.23-alpine

# Nginx 설정 템플릿 파일을 저장할 작업 디렉터리 설정
WORKDIR /etc/nginx/templates

# 패키지 설치 문제 해결 (필요한 프로그램 설치)
# - bash: 명령어 실행 도구
# - gettext: 환경 변수 처리 도구
# - dos2unix: Windows에서 만든 텍스트 파일을 Linux 형식으로 변환
RUN apk update && apk add --no-cache bash gettext dos2unix && rm -rf /var/cache/apk/*

# 빌드된 파일 복사
# - 1단계에서 빌드된 결과물을 Nginx의 기본 HTML 폴더로 복사
COPY --from=builder /app/build /usr/share/nginx/html

# Nginx 설정 템플릿 파일 복사
# - Nginx 설정을 환경 변수로 동적으로 구성할 수 있는 템플릿 파일
COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template

# 시작 스크립트 복사 및 형식 변환
# - 'entrypoint.sh': 컨테이너 시작 시 실행되는 스크립트 복사
# - dos2unix: Windows에서 생성된 줄바꿈 문자를 Linux 형식으로 변환
COPY entrypoint.sh /entrypoint.sh
RUN dos2unix /entrypoint.sh

# 'entrypoint.sh' 스크립트 실행 권한 부여 (실행 가능하게 설정)
RUN chmod +x /entrypoint.sh

# 컨테이너 시작 시 실행할 명령어 설정
# - bash 쉘을 사용하여 'entrypoint.sh' 실행
ENTRYPOINT ["/bin/bash", "/entrypoint.sh"]

# 웹 서버의 기본 포트(80번) 열기
# - 외부 사용자가 웹 페이지에 접근할 수 있도록 함
EXPOSE 80

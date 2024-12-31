# 1단계: 빌드
FROM node:16 AS builder
WORKDIR /app
COPY package.json yarn.lock ./ 
RUN yarn install && yarn add axios
COPY . . 
RUN yarn build

# 2단계: 배포
FROM nginx:1.23-alpine
WORKDIR /etc/nginx/templates

# 패키지 설치 문제 해결 (bash, gettext 및 dos2unix 설치)
RUN apk update && apk add --no-cache bash gettext dos2unix && rm -rf /var/cache/apk/*

# 빌드된 파일 및 템플릿 복사
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template

# entrypoint.sh 복사 및 형식 변환
COPY entrypoint.sh /entrypoint.sh
RUN dos2unix /entrypoint.sh
RUN chmod +x /entrypoint.sh

# 엔트리포인트 설정
ENTRYPOINT ["/bin/bash", "/entrypoint.sh"]

EXPOSE 80
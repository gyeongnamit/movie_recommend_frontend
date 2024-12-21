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

# 패키지 설치 문제 해결 (bash와 gettext를 개별 설치)
RUN apk update && apk add --no-cache bash gettext && rm -rf /var/cache/apk/*

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 80
CMD ["/entrypoint.sh"]
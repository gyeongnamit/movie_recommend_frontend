#!/bin/bash

# 환경변수를 대체하여 nginx 설정 생성
envsubst '$BACKEND_URL' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/conf.d/default.conf

# Nginx 실행
nginx -g "daemon off;"
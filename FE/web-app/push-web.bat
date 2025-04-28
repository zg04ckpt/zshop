@echo off
echo [starting push web to dockerhub...]

REM Bật chế độ kiểm tra lỗi
setlocal EnableDelayedExpansion

REM Xóa image cũ
docker stop zshop_web
docker rm zshop_web
docker rmi zg04ckpt/listen-e:zshop_web-1.0
docker rmi zshop_web:1.0

REM Build image
docker build -t zshop_web:1.0 .  || (
    echo [Error: Failed to build image!]
    exit /b 1
)

REM Tag image
docker tag zshop_web:1.0 zg04ckpt/listen-e:zshop_web-1.0 || (
    echo [Error: Failed to tag image!]
    exit /b 1
)

REM Push image
docker push zg04ckpt/listen-e:zshop_web-1.0 || (
    echo [Error: Failed to push image!]
    exit /b 1
)

echo [push web to dockerhub successfully!]
exit /b 0
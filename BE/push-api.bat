@echo off
echo [starting push zshop api to dockerhub...]

REM Bật chế độ kiểm tra lỗi
setlocal EnableDelayedExpansion

REM Xóa image cũ
docker stop zshop_api
docker rm zshop_api
docker rmi zg04ckpt/listen-e:zshop_api-1.0
docker rmi zshop_api:1.0

REM Build image
docker build -t zshop_api:1.0 . || (
    echo [Error: Failed to build image!]
    exit /b 1
)

REM Tag image
docker tag zshop_api:1.0 zg04ckpt/listen-e:zshop_api-1.0 || (
    echo [Error: Failed to tag image!]
    exit /b 1
)

REM Push image
docker push zg04ckpt/listen-e:zshop_api-1.0 || (
    echo [Error: Failed to push image!]
    exit /b 1
)

echo [push zshop api to dockerhub successfully!]
exit /b 0
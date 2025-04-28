docker stop zshop_api zshop_web
docker rm zshop_api zshop_web
docker rmi zg04ckpt/listen-e:zshop_api-1.0
docker rmi zg04ckpt/listen-e:zshop_web-1.0
docker pull zg04ckpt/listen-e:zshop_api-1.0
docker pull zg04ckpt/listen-e:zshop_web-1.0
docker-compose -f docker-compose.prod.yaml up -d
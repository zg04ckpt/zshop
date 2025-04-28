docker stop zshop_api 
docker rm zshop_api 
docker rmi zg04ckpt/listen-e:zshop_api-1.0
docker pull zg04ckpt/listen-e:zshop_api-1.0
docker-compose -f docker-compose.prod.yaml up -d
docker-compose down
docker rmi zshop_api
docker load -i new.tar 
docker-compose up -d
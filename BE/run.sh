docker-compose down
docker rmi api
docker load -i new.tar 
docker-compose up -d
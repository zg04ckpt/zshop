docker-compose down
docker rmi zshop_web
docker load -i new.tar 
docker-compose up -d
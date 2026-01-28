# build project
FROM mcr.microsoft.com/dotnet/sdk:6.0-alpine AS build
WORKDIR /src
COPY . . 
RUN dotnet restore 
RUN dotnet publish API/API.csproj -c Release -o /app/publish \
    --no-restore \
    /p:UseAppHost=false

# final image to run application
FROM mcr.microsoft.com/dotnet/aspnet:6.0-alpine AS final
RUN apk add --no-cache tzdata
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "API.dll"] 
# Image to build project
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /App
COPY . . 
RUN dotnet restore 
RUN dotnet publish -c Release -o out

# Image to run application
FROM mcr.microsoft.com/dotnet/aspnet:6.0
WORKDIR /App
EXPOSE 80

COPY --from=build /App/out .
ENTRYPOINT ["dotnet", "API.dll"]
# Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["Platform.Api/platform.Api.csproj", "Platform.Api/"]
COPY ["Platform.Application/Platform.Application.csproj", "Platform.Application/"]
COPY ["Platform.Domain/Platform.Domain.csproj", "Platform.Domain/"]
COPY ["Platform.Infrastructure/Platform.Infrastructure.csproj", "Platform.Infrastructure/"]
RUN dotnet restore "Platform.Api/platform.Api.csproj"

COPY . .
RUN dotnet publish "Platform.Api/platform.Api.csproj" -c Release -o /app/publish

# Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "platform.Api.dll"]

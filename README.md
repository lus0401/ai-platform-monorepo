# AI Platform (Monorepo)

AI 학습 플랫폼 초기 아키텍처 프로젝트입니다.

---

## 🏗 Architecture Overview

Browser  
↓  
Next.js (BFF)  
↓  
.NET 8 Platform API  
↓  
PostgreSQL  

---

## 📁 Project Structure

ai-platform-monorepo  
├── apps  
│   ├── web              # Next.js (BFF)  
│   └── platform-api     # ASP.NET Core 8  
├── infra  
│   └── compose  
│       └── docker-compose.yml  
├── libs  
│   └── contracts  
└── README.md  

---

## 🚀 Local Development

### 1. Start PostgreSQL

cd infra/compose  
docker compose up -d  

---

### 2. Run .NET API

cd apps/platform-api  
dotnet run  

Default:
http://localhost:5068

Health:
http://localhost:5068/health

Swagger:
http://localhost:5068/swagger

---

### 3. Run Next.js (BFF)

cd apps/web  
npm install  
npm run dev  

Web:
http://localhost:3000  

BFF Test:
http://localhost:3000/api/platform/health  

---

## ⚙ Environment Variables

apps/web/.env.local

PLATFORM_API_BASE=http://localhost:5068

---

## 🧠 Design Principles

- Frontend / Backend 분리
- BFF 패턴 적용
- 중앙 API 통제 구조
- AI 계산 영역과 플랫폼 영역 분리
- 확장 가능한 구조

---

## 📌 Next Steps

- EF Core + PostgreSQL 연결
- 도메인 스키마 설계
- Python AI Service 연동
- 인증/권한 구조 설계

---

## 🧩 Versions

Node: 20.x  
.NET SDK: 8.x  
PostgreSQL: 16  
Next.js: 16.x  
React: 18+  

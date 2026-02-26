# Layouts Next.js 마이그레이션 요약

React (react-router-dom) 기반 레이아웃을 Next.js App Router에서 사용할 수 있도록 수정한 내용입니다.

---

## 1. **라우팅: react-router-dom → Next.js**

### 변경
- **Sidebar.tsx**: `NavLink`, `to` → `Link`, `href` (next/link)  
- **Sidebar.tsx**: 활성 경로 판별을 `usePathname()` (next/navigation) 사용  
- **Header.tsx**: `useLocation()` → `usePathname()`  
- **Header.tsx**: `NavLink`/`to` → `Link`/`href`  
- **DropdownButton (Header 내부)**: `NavLink` → `Link`

### 이유
- Next.js는 자체 라우팅을 사용하므로 `react-router-dom`을 쓰지 않습니다.
- App Router에서는 `next/link`의 `Link`와 `next/navigation`의 `usePathname()`으로 클라이언트 네비게이션과 현재 경로를 처리합니다.

---

## 2. **라우트 설정: app-routes.ts 신규 추가**

### 변경
- `src/app-routes.ts` 생성: `sidebarRoutes`, `settingsRoute`, `RouteItem`, `RouteGroup` 정의  
- 기존 `../../app-routes`, `@assets` 등 절대 경로 제거 후 `@/app-routes`로 참조

### 이유
- 레이아웃이 사용하던 `app-routes`가 Next 앱에는 없어, App Router 경로 기준으로 한 곳에서 정의했습니다.
- 사이드바 그룹/메뉴와 설정 링크를 이 파일에서 관리하도록 했습니다.

---

## 3. **SVG: ReactComponent → img / public 경로**

### 변경
- **Sidebar.tsx**: `import { ReactComponent as IconSetting } from "@assets/..."` 제거  
  → `<img src="/images/icon-setting.svg" ... />` 사용 (public 기준)  
- **Header.tsx**: 모든 `ReactComponent as IconX` 제거  
  → 공통 `Icon` 컴포넌트로 `<img src="/images/xxx.svg" />` 사용  
- `Header.module.scss`에 `.iconImg` 스타일 추가 (아이콘 크기 등)

### 이유
- CRA 스타일 `import { ReactComponent as X } from "file.svg"`는 Next에서 기본 지원하지 않습니다.
- `public/images/`에 있는 SVG는 `/images/xxx.svg`로 접근하고, `<img>`로 사용하면 설정 없이 동작합니다.

---

## 4. **경로 별칭: @assets, @components 등 → @/**

### 변경
- **Sidebar**: `@assets/images/...`, `../../app-routes` → `@/app-routes`  
- **Header**:  
  - `@components/ui/Button/Button` → `@/components/ui/Button/Button`  
  - `../../app-routes` → `@/app-routes`  
  - `@contexts/apiMode` → `@/contexts/ApiModeContext`  
  - `@hooks/useTheme` → `@/hooks/useTheme`  
  - `@config` → `@/common/config`  
- **Shell index**: `@/layouts/Shell`에서 필요한 컴포넌트만 re-export

### 이유
- 이 Next 앱의 `tsconfig.json`에는 `@/*` → `./src/*` 만 있어, `@assets`/`@components` 등은 없습니다.
- 레이아웃 코드를 `@/` 기준으로 통일했습니다.

---

## 5. **config 확장**

### 변경
- `src/common/config/index.ts`의 `appConfig`에  
  - `name` (헤더/로고용, 기본값은 기존 `appName`과 동일)  
  - `companyLogoUrl` (환경 변수 `NEXT_PUBLIC_COMPANY_LOGO_URL`)  
  추가

### 이유
- Header에서 `appConfig.name`, `appConfig.companyLogoUrl`을 사용하므로, Next 앱 config에 맞춰 추가했습니다.

---

## 6. **클라이언트 전용 훅/컨텍스트**

### 변경
- **ApiModeContext**  
  - `src/contexts/ApiModeContext.tsx` 추가  
  - `ApiModeProvider`, `useApiMode()` (isMockMode, toggleApiMode)  
  - 파일 상단에 `"use client"`  
- **useTheme**  
  - `src/hooks/useTheme.ts` 추가  
  - `isDark`, `toggleTheme`, localStorage `theme-preference` 사용  
  - `"use client"`  
- **providers.tsx**  
  - 루트에서 `ApiModeProvider`로 감싸도록 수정  
- **contexts/index.ts**, **hooks/index.ts**  
  - 위 훅/컨텍스트 export 추가

### 이유
- Header가 `useApiMode`, `useTheme`를 사용하는데, 이들은 상태/브라우저 API를 쓰므로 클라이언트 컴포넌트여야 합니다.
- Next에서는 해당 파일에 `"use client"`를 두고, 루트 Provider에서 한 번만 감싸도록 했습니다.

---

## 7. **Button 컴포넌트**

### 변경
- `src/components/ui/Button/Button.tsx`  
  - `icon`, `variant`, `size`, `color`, `clickFn` 등 기존 사용처와 맞춤  
  - `Button.module.scss` 추가 (기본 스타일)  
- `src/components/ui/index.ts`에서 Button export

### 이유
- Header가 `@components/ui/Button/Button`를 사용하고 있어, Next 앱에 맞는 경로(`@/components/...`)와 구현을 추가했습니다.

---

## 8. **ReactNode import 및 default export**

### 변경
- **AppShellLayout.tsx**: `import { type ReactNode } from "react"` 추가  
- **AppContent.tsx**: 동일하게 `ReactNode` import 추가  
- **MainContent.tsx**: `"use client"` 추가, `ReactNode`를 `type` import로 통일  
- **Sidebar.tsx**, **Header.tsx**: `export default function` 형태로 통일 (Shell/index에서 default로 re-export)

### 이유
- `ReactNode`를 쓰는 레이아웃 컴포넌트는 명시적으로 import해야 타입 오류가 나지 않습니다.
- Next에서 레이아웃/클라이언트 컴포넌트는 `"use client"`가 필요할 수 있어, 필요한 파일에만 추가했습니다.
- `@/layouts/Shell`에서 named export로 쓰기 위해 각 파일은 default export로 두고 index에서 re-export했습니다.

---

## 9. **Shell index 및 Shell.tsx**

### 변경
- **Shell/index.ts**  
  - `AppShellLayout`, `AppHeader`, `AppContent`, `AppSidebar`, `AppMain` re-export  
- **Shell.tsx**  
  - 기존: `import { Header }, { Sidebar }` (named) → `import Header from "./Header"`, `import Sidebar from "./Sidebar"` (default)  
  - 사이드바 열림 상태를 내부 `useState`로 관리하고, `Sidebar`/`Header`에 `isOpen`, `onToggleSidebar` 전달  
  - 파일 상단에 `"use client"` 추가

### 이유
- `(app)/layout.tsx`가 `@/layouts/Shell`에서 위 컴포넌트들을 named import 하므로, index에서 한 번에 re-export 해줍니다.
- Header/Sidebar를 default export로 바꿨기 때문에 Shell.tsx의 import를 default로 맞췄고, 필요한 props를 넘기도록 했습니다.

---

## 10. **기타**

- **Header.tsx**:  
  - `variant == "user"` → `variant === "user"` 등 비교를 `===`로 통일  
  - `<button>`에 `type="button"` 명시 (폼 기본 제출 방지)  
- **embed layout**:  
  - `(embed)/layout.tsx`가 비어 있어 TypeScript/Next가 “모듈이 아님”으로 처리하므로, 최소한의 `default export` 레이아웃을 추가했습니다.

---

## 참고: 그대로 두거나 나중에 할 작업

- **`.next` 캐시**: 삭제된 `(app)/page.tsx`를 여전히 참조하면 `tsc`에서 오류가 날 수 있습니다.  
  `rm -rf .next` 후 다시 빌드하면 해소될 수 있습니다.  
- **테마 적용**: `useTheme`는 상태만 바꾸고 있어, 실제 CSS 변수/다크 모드 적용은 `token-theme.css` 등과 연동해 구현할 수 있습니다.

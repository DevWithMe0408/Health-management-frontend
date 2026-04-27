# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quy tắc làm việc
- Tôi là người code chính. Không tự động viết code mới hay sửa code mà chưa được tôi đồng ý.
- Khi tôi đưa code, hãy review, đánh giá, giải thích rõ ràng trước khi đề xuất thay đổi.
- Chỉ áp dụng thay đổi sau khi tôi xác nhận.

## Ngôn ngữ
- Giải thích, review, phân tích: tiếng Việt
- Code comment, commit message, tên biến: tiếng Anh

## Commands

```bash
npm run dev       # Start Vite dev server (http://localhost:5173)
npm run build     # Type-check + production build (output: dist/)
npm run lint      # Run ESLint
npm run preview   # Preview production build locally
```

No test runner is configured.

## Environment

The app expects a `.env` file with:
```
VITE_API_BASE_URL=http://localhost:8080/api/auth
VITE_API_GW_BASE_URL=http://localhost:8080
```

The backend API gateway is expected at `http://localhost:8080` with routes: `/api/auth`, `/api/health-data`, `/api/user`.

## Architecture

**Stack**: React 19 + TypeScript (strict), Vite, React Router v7, Tailwind CSS v4, Zod, React Hook Form, Axios, Recharts, Framer Motion.

### Routing (`src/App.tsx`)

Two route groups:
- **Public** (`AuthLayout`): `/` (LandingPage), `/login`, `/register`
- **Protected** (`ProtectedRoute` + `MainLayout`): `/dashboard`, `/submit-data`, `/stats`, `/profile`

`ProtectedRoute` reads from `AuthContext` and redirects to `/login` if unauthenticated.

### Auth Flow

`AuthContext` (`src/contexts/AuthContext.tsx`) is the single source of truth for auth state. It holds `accessToken`, `refreshToken`, `user` (UserProfile), and `isAuthenticated`. On app load, it restores session from `localStorage`. `login()` calls `auth.service.ts`, then fetches the user profile via `user.service.ts`.

All API calls pass the Bearer token manually from `AuthContext` — there is no Axios interceptor for auth headers; each service function accepts `token` as a parameter.

### Services (`src/services/`)

Three service modules, each using a plain Axios instance:
- `auth.service.ts` — register, login
- `healthData.service.ts` — submit health data, fetch latest metrics, dashboard metrics, historical data by indicator type
- `user.service.ts` — current user profile

### Data Model (`src/model/IndicatorType.ts`)

Defines the metadata for every health indicator (HEIGHT, WEIGHT, WAIST, HIP, BMI, BMR, TDEE, PBF, WHR, etc.) including category (`BASE` = user-entered, `CALCULATED` = system-computed, `USER_PROVIDED_CALCULATED`), unit, chart color, and tooltip text. This is the central reference for which metrics exist and how to display them.

### Forms

All forms use **React Hook Form** + **Zod** resolver. Schemas live in `src/types/` (e.g., `auth.schemas.ts`, `healthData.schemas.ts`). Reusable `InputField` component in `src/components/common/`.

### Styling

Tailwind CSS v4 utility classes inline in JSX. Custom brand colors defined in `tailwind.config.ts`:
- `brand-green` (#059669) — primary actions
- `brand-gray` (#6b7280) — secondary elements

Custom scrollbar and modal animation CSS in `src/index.css`.

### Layouts

- `MainLayout` — authenticated shell: `Header` (user dropdown) + `Sidebar` (nav links) + page content
- `AuthLayout` — minimal wrapper for login/register pages

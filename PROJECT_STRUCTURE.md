# 두과자 (DOGWAJA) 프로젝트 가이드

> 다른 에이전트가 이 문서를 기준으로 개발을 진행합니다. 모든 구현은 이 문서와 일치해야 합니다.

---

## 📋 목차

1. [프로젝트 컨셉](#프로젝트-컨셉)
2. [ERD 구조](#erd-구조)
3. [타입 정의](#타입-정의)
4. [API 명세](#api-명세)
5. [프로젝트 폴더 구조](#프로젝트-폴더-구조)
6. [메인 기능](#메인-기능)
7. [기능 요구사항](#기능-요구사항)
8. [라이브러리 사용 시 주의사항](#라이브러리-사용-시-주의사항)

---

## 프로젝트 컨셉

**두과자(DOGWAJA)**는 과자를 즐기는 사람들이 과자 추천과 구매 경험을 공유하는 커뮤니티 플랫폼입니다.

### 핵심 가치
- **과자 추천 시스템**: 사용자가 좋아하는 과자를 추천하고 의견 공유
- **구매 과자 관리**: 관리자가 현재 구매 가능한 과자를 관리하고, 사용자는 상태 업데이트
- **피드백 시스템**: 좋아요/싫어요를 통한 단순하고 직관적인 평가 체계
- **신뢰성**: 닉네임 기반 인증으로 가벼운 가입 절차

### 사용자 역할
- **일반 사용자**: 추천 작성/댓글, 과자 조회/댓글, 피드백 가능
- **관리자**: 일반 사용자 기능 + 구매 과자 CRUD

---

## ERD 구조

데이터베이스는 **7개 테이블**로 구성됩니다.

### 테이블 정의

| 테이블명 | 설명 | 주요 필드 |
|---------|------|---------|
| `user` | 사용자 정보 | user_id, nickname, password_h |
| `recommendation` | 과자 추천 게시물 | 주문_id, rc_id, 사용자Id, 과자이름, 주문이유 |
| `rc_comment` | 추천 댓글 | 댓글_id, 주문_id, 사용자Id, 내용 |
| `rcc_feedback` | 추천 게시글 피드백 | id, 댓글_id, 주문_id, 사용자Id, 반응(LIKE/DISLIKE) |
| `bought_snack` | 구매 과자 목록 | 구매_id, 과자이름, 상태(배송중/재고있음/재고없음) |
| `bs_comment` | 구매 과자 댓글 | Key, 구매_id, 사용자Id, 내용 |
| `bs_feedback` | 구매 과자 피드백 | id, 구매_id, 사용자Id, 반응(LIKE/DISLIKE) |

### 관계도

```
┌─────────────────────────────────────────┐
│              user (사용자)               │
│  user_id(PK), nickname, password_h      │
└────────────┬────────────────────────────┘
             │
    ┌────────┼──────────┬──────────┐
    │        │          │          │
    ▼        ▼          ▼          ▼
┌──────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐
│   rec.   │ │  rc_    │ │ buy_    │ │  bs_    │
│comment   │ │comment  │ │snack    │ │comment  │
│ (피드백) │ │feedback │ │ (피드백) │ │feedback │
└──┬───────┘ └────┬────┘ └──┬──────┘ └──┬──────┘
   │              │          │          │
   ▼              ▼          ▼          ▼
┌──────────────┐ ┌──────────────┐
│ rcc_feedback │ │ bs_feedback  │
│ (댓글 피드백) │ │ (게시글 피드백) │
└──────────────┘ └──────────────┘
```

### 제약 조건

- **추천 게시글 피드백**: `UNIQUE(사용자Id, 주문_id)` - 사용자당 하나만
- **구매 과자 피드백**: `UNIQUE(사용자Id, 구매_id)` - 사용자당 하나만
- **피드백 선택**: 사용자당 LIKE 또는 DISLIKE 중 하나만 가능 (상호 배타적)
- **상태 값**: `배송중` | `재고있음` | `재고없음` 만 허용

---

## 타입 정의

모든 타입은 `types/api.ts`에 정의됩니다. **필드명은 정확히 아래와 같아야 합니다.**

### 공통 타입

```typescript
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ErrorResponse {
  success: false;
  message: string;
  errorCode?: string;
}
```

### 사용자 (User)

```typescript
export interface User {
  user_id: number;           // PK
  nickname: string;          // 로그인용 닉네임 (이메일 아님)
  role?: 'admin' | 'user';   // 관리자 판별용 (JWT token.role 또는 admin 필드)
  createdAt: string;         // ISO 8601
  updatedAt: string;         // ISO 8601
}

export interface LoginRequest {
  nickname: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export interface SignupRequest {
  nickname: string;          // 중복 불가
  password: string;          // 최소 8자
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
```

### 추천 (Recommendation)

```typescript
export interface Recommendation {
  주문_id: number;           // PK (ERD 필드명)
  rc_id: number;             // 추천 항목 내부 ID
  사용자Id: number;          // FK
  과자이름: string;          // 추천 과자 이름
  주문이유: string;          // 추천 이유 (최소 10자)
  author: User;              // 작성자 객체
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecommendationRequest {
  과자이름: string;
  주문이유: string;
}

export interface UpdateRecommendationRequest {
  과자이름?: string;
  주문이유?: string;
}

export type RecommendationListResponse = PaginatedResponse<Recommendation>;
```

### 추천 댓글 (RecommendationComment)

```typescript
export interface RecommendationComment {
  댓글_id: number;           // PK (ERD 필드명)
  주문_id: number;           // FK to recommendation
  사용자Id: number;          // FK
  내용: string;              // 최소 2자, 최대 500자
  author: User;
  likeCount: number;
  dislikeCount: number;
  myFeedback?: 'LIKE' | 'DISLIKE' | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecommendationCommentRequest {
  내용: string;
}

export interface UpdateRecommendationCommentRequest {
  내용: string;
}

export type RecommendationCommentListResponse = PaginatedResponse<RecommendationComment>;
```

### 추천 피드백 (RecommendationFeedback)

```typescript
export interface RecommendationFeedback {
  id: number;                // PK
  댓글_id: number;           // FK (ERD 필드명)
  주문_id: number;           // FK (역정규화)
  사용자Id: number;          // FK
  반응: 'LIKE' | 'DISLIKE';  // 반응 타입 (정확히 이 2개만)
  createdAt: string;
}

export interface RecommendationFeedbackStats {
  주문_id: number;
  likeCount: number;
  dislikeCount: number;
  myFeedback?: 'LIKE' | 'DISLIKE' | null;
}
```

### 구매 과자 (BoughtSnack)

```typescript
export type BoughtSnackStatus = '배송중' | '재고있음' | '재고없음';  // 정확한 값

export interface BoughtSnack {
  구매_id: number;           // PK (ERD 필드명)
  과자이름: string;
  상태: BoughtSnackStatus;   // 반드시 위의 3개 값 중 하나
  commentCount: number;
  likeCount: number;
  dislikeCount: number;
  myFeedback?: 'LIKE' | 'DISLIKE' | null;
  myStatus?: BoughtSnackStatus;  // 로그인 시만
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoughtSnackRequest {
  과자이름: string;
  상태?: BoughtSnackStatus;   // 기본값: "재고있음"
}

export interface UpdateBoughtSnackRequest {
  과자이름?: string;
  상태?: BoughtSnackStatus;
}

export interface UpdateBoughtSnackStatusRequest {
  상태: BoughtSnackStatus;
}

export type BoughtSnackListResponse = PaginatedResponse<BoughtSnack>;
```

### 구매 과자 댓글 (BoughtSnackComment)

```typescript
export interface BoughtSnackComment {
  Key: number;               // PK (ERD 필드명)
  구매_id: number;           // FK
  사용자Id: number;          // FK
  내용: string;              // 최소 2자, 최대 500자
  author: User;
  likeCount: number;
  dislikeCount: number;
  myFeedback?: 'LIKE' | 'DISLIKE' | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoughtSnackCommentRequest {
  내용: string;
}

export interface UpdateBoughtSnackCommentRequest {
  내용: string;
}

export type BoughtSnackCommentListResponse = PaginatedResponse<BoughtSnackComment>;
```

### 구매 과자 피드백 (BoughtSnackFeedback)

```typescript
export interface BoughtSnackFeedback {
  id: number;
  구매_id: number;           // FK (ERD 필드명)
  사용자Id: number;          // FK
  반응: 'LIKE' | 'DISLIKE';
  createdAt: string;
}

export interface BoughtSnackFeedbackStats {
  구매_id: number;
  likeCount: number;
  dislikeCount: number;
  myFeedback?: 'LIKE' | 'DISLIKE' | null;
}
```

---

## API 명세

### 엔드포인트 참조

모든 엔드포인트는 `lib/axios/request.ts`의 `requests` 객체를 통해 참조합니다.

```typescript
const requests = {
  auth: {
    login: "/auth/login",                 // POST
    signup: "/auth/signup",               // POST
    logout: "/auth/logout",               // POST
    refresh: "/auth/refresh-token",       // POST
    changePassword: "/auth/password",     // PUT
  },
  user: {
    getProfile: "/users/me",              // GET
    updateProfile: "/users/me",           // PUT
    deleteAccount: "/users/me",           // DELETE
  },
  recommendations: {
    list: "/recommendations",             // GET
    getDetail: (주문_id) => `/recommendations/${주문_id}`,  // GET
    create: "/recommendations",           // POST
    update: (주문_id) => `/recommendations/${주문_id}`,     // PUT
    delete: (주문_id) => `/recommendations/${주문_id}`,     // DELETE
  },
  recommendationComments: {
    list: (주문_id) => `/recommendations/${주문_id}/comments`,  // GET
    getDetail: (주문_id, 댓글_id) => `/recommendations/${주문_id}/comments/${댓글_id}`,
    create: (주문_id) => `/recommendations/${주문_id}/comments`,
    update: (주문_id, 댓글_id) => `/recommendations/${주문_id}/comments/${댓글_id}`,
    delete: (주문_id, 댓글_id) => `/recommendations/${주문_id}/comments/${댓글_id}`,
  },
  recommendationFeedback: {
    like: (주문_id) => `/recommendations/${주문_id}/like`,       // POST
    unlike: (주문_id) => `/recommendations/${주문_id}/like`,     // DELETE
    dislike: (주문_id) => `/recommendations/${주문_id}/dislike`, // POST
    undislike: (주문_id) => `/recommendations/${주문_id}/dislike`, // DELETE
    getStats: (주문_id) => `/recommendations/${주문_id}/feedback-stats`,
  },
  boughtSnacks: {
    list: "/bought-snacks",               // GET
    getDetail: (구매_id) => `/bought-snacks/${구매_id}`,  // GET
    create: "/bought-snacks",             // POST (관리자)
    update: (구매_id) => `/bought-snacks/${구매_id}`,     // PUT (관리자)
    delete: (구매_id) => `/bought-snacks/${구매_id}`,     // DELETE (관리자)
  },
  boughtSnackComments: {
    list: (구매_id) => `/bought-snacks/${구매_id}/comments`,  // GET
    getDetail: (구매_id, Key) => `/bought-snacks/${구매_id}/comments/${Key}`,
    create: (구매_id) => `/bought-snacks/${구매_id}/comments`,
    update: (구매_id, Key) => `/bought-snacks/${구매_id}/comments/${Key}`,
    delete: (구매_id, Key) => `/bought-snacks/${구매_id}/comments/${Key}`,
  },
  boughtSnackFeedback: {
    like: (구매_id) => `/bought-snacks/${구매_id}/like`,
    unlike: (구매_id) => `/bought-snacks/${구매_id}/like`,
    dislike: (구매_id) => `/bought-snacks/${구매_id}/dislike`,
    undislike: (구매_id) => `/bought-snacks/${구매_id}/dislike`,
    getStats: (구매_id) => `/bought-snacks/${구매_id}/feedback-stats`,
  },
  boughtSnackStatus: {
    update: (구매_id) => `/bought-snacks/${구매_id}/status`,       // PUT
    getMyStatus: (구매_id) => `/bought-snacks/${구매_id}/my-status`, // GET
  },
};
```

### HTTP 메서드

| 작업 | 메서드 | 상태 |
|------|--------|------|
| 목록 조회 | GET | 200 |
| 상세 조회 | GET | 200 |
| 생성 | POST | 201 |
| 수정 | PUT | 200 |
| 삭제 | DELETE | 200 |
| 좋아요/싫어요 (추가) | POST | 200/201 |
| 좋아요/싫어요 (취소) | DELETE | 200 |

### 인증

- **토큰 방식**: Bearer Token (JWT)
- **헤더**: `Authorization: Bearer <accessToken>`
- **토큰 갱신**: 401 에러 시 `requests.auth.refresh` 호출
- **토큰 만료**: accessToken (15분), refreshToken (7일 권장)

### 에러 코드

| errorCode | HTTP | 설명 |
|-----------|------|------|
| `AUTH_REQUIRED` | 401 | 인증 필요 |
| `INVALID_CREDENTIALS` | 401 | 닉네임/비밀번호 오류 |
| `TOKEN_EXPIRED` | 401 | 토큰 만료 |
| `ACCESS_DENIED` | 403 | 권한 없음 |
| `NOT_FOUND` | 404 | 리소스 없음 |
| `DUPLICATE_NICKNAME` | 409 | 닉네임 중복 |
| `VALIDATION_ERROR` | 400 | 입력값 오류 |

### 페이지네이션

모든 목록 조회는 페이지네이션을 지원합니다.

**쿼리 파라미터**:
- `page`: 페이지 번호 (기본값: 1)
- `pageSize`: 페이지당 항목 수 (기본값: 10, 최대: 100)

**응답 포함**:
```typescript
{
  data: [...],
  pagination: {
    page: number,
    pageSize: number,
    total: number,
    totalPages: number
  }
}
```

---

## 프로젝트 폴더 구조

```
front/
├── docs/
│   └── api/                           # API 명세 문서
│       ├── README.md                  # 전체 개요
│       ├── auth.md
│       ├── user.md
│       ├── recommendations.md
│       ├── recommendation-comments.md
│       ├── recommendation-feedback.md
│       ├── bought-snacks.md
│       ├── bought-snack-comments.md
│       ├── bought-snack-feedback.md
│       └── bought-snack-status.md
│
├── app/                               # Next.js App Router
│   ├── layout.tsx                     # 전체 레이아웃
│   ├── page.tsx                       # 홈페이지
│   ├── (auth)/                        # 인증 관련 페이지
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── layout.tsx
│   ├── recommendations/               # 추천 관련 페이지
│   │   ├── page.tsx                   # 목록
│   │   ├── [id]/page.tsx              # 상세
│   │   ├── create/page.tsx            # 작성
│   │   └── layout.tsx
│   ├── bought-snacks/                 # 구매 과자 페이지
│   │   ├── page.tsx                   # 목록
│   │   ├── [id]/page.tsx              # 상세
│   │   └── layout.tsx
│   ├── admin/                         # 관리자 페이지
│   │   ├── bought-snacks/
│   │   │   ├── page.tsx               # 관리 페이지
│   │   │   └── [id]/page.tsx          # 편집
│   │   └── layout.tsx
│   └── globals.css                    # 전역 스타일
│
├── components/                        # React 컴포넌트
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   ├── recommendations/
│   │   ├── RecommendationCard.tsx
│   │   ├── RecommendationForm.tsx
│   │   └── CommentSection.tsx
│   ├── bought-snacks/
│   │   ├── BoughtSnackCard.tsx
│   │   ├── BoughtSnackForm.tsx         # 관리자용
│   │   └── CommentSection.tsx
│   └── common/
│       ├── Header.tsx
│       ├── Navigation.tsx
│       ├── Pagination.tsx
│       ├── FeedbackButtons.tsx         # 좋아요/싫어요
│       └── ErrorBoundary.tsx
│
├── lib/
│   ├── auth/
│   │   └── token.ts                   # 토큰 관리 (localStorage)
│   ├── axios/
│   │   ├── axios.ts                   # 클라이언트 axios 인스턴스
│   │   ├── axios.server.ts            # 서버 컴포넌트용 axios
│   │   ├── request.ts                 # 엔드포인트 상수
│   │   └── helpers.ts                 # API 헬퍼 (apiGet, apiPost 등)
│   └── store/
│       └── userStore.ts               # Zustand 전역 상태 (user)
│
├── types/
│   ├── api.ts                         # 모든 API 타입 정의
│   ├── axios/
│   │   ├── apiRes.ts                  # ApiResponse 타입
│   │   └── httpError.ts               # HttpError 클래스
│   └── index.ts                       # 타입 export
│
├── hooks/                             # 커스텀 React Hooks
│   ├── useRecommendations.ts          # 추천 관련 로직
│   ├── useBoughtSnacks.ts             # 구매 과자 관련 로직
│   ├── useAuth.ts                     # 인증 관련 로직
│   └── useFeedback.ts                 # 피드백 관련 로직
│
├── .env.local                         # 환경 변수 (개발용)
├── package.json                       # 의존성
├── tsconfig.json                      # TypeScript 설정
├── next.config.ts                     # Next.js 설정
├── tailwind.config.ts                 # Tailwind 설정
├── postcss.config.mjs                 # PostCSS 설정
├── eslint.config.mjs                  # ESLint 규칙
└── PROJECT_STRUCTURE.md               # 이 파일
```

---

## 메인 기능

### 1. 인증 시스템 (Authentication)

**기능**:
- [x] 닉네임 기반 회원가입
- [x] 닉네임/비밀번호 로그인
- [x] JWT 토큰 발급 (access + refresh)
- [x] 토큰 자동 갱신 (401 시)
- [x] 로그아웃
- [x] 비밀번호 변경

**구현 파일**:
- `lib/auth/token.ts` - 토큰 저장/조회
- `lib/axios/axios.ts` - 401 처리 및 토큰 갱신
- `app/(auth)/` - 인증 페이지

### 2. 추천 시스템 (Recommendation System)

**기능**:
- [x] 과자 추천 게시물 CRUD (모든 사용자)
- [x] 추천 댓글 CRUD (모든 사용자)
- [x] 추천 게시글 좋아요/싫어요 (모든 사용자, 1인 1표)
- [x] 추천 게시글 피드백 통계 조회

**ERD 테이블**:
- `recommendation` - 주문_id, rc_id, 사용자Id, 과자이름, 주문이유
- `rc_comment` - 댓글_id, 주문_id, 사용자Id, 내용
- `rcc_feedback` - id, 댓글_id, 주문_id, 사용자Id, 반응(LIKE/DISLIKE) (게시글 피드백)

**구현 파일**:
- `app/recommendations/` - 추천 관련 페이지
- `components/recommendations/` - 추천 컴포넌트
- `hooks/useRecommendations.ts` - 추천 로직

### 3. 구매 과자 관리 (Bought Snack Management)

**기능**:
- [x] 구매 과자 목록 조회 (모든 사용자)
- [x] 구매 과자 CRUD (관리자만)
- [x] 구매 과자 댓글 CRUD (모든 사용자)
- [x] 구매 과자 좋아요/싫어요 (모든 사용자, 1인 1표)
- [x] 구매 과자 상태 변경 (모든 사용자: 배송중/재고있음/재고없음)

**상태 값**:
- `배송중` - 배송 대기 중
- `재고있음` - 재고 보유 중
- `재고없음` - 재고 없음

**ERD 테이블**:
- `bought_snack` - 구매_id, 과자이름, 상태
- `bs_comment` - Key, 구매_id, 사용자Id, 내용
- `bs_feedback` - id, 구매_id, 사용자Id, 반응

**구현 파일**:
- `app/bought-snacks/` - 사용자 조회 페이지
- `app/admin/bought-snacks/` - 관리자 관리 페이지
- `components/bought-snacks/` - 컴포넌트
- `hooks/useBoughtSnacks.ts` - 로직

### 4. 프로필 관리 (User Profile)

**기능**:
- [x] 프로필 조회
- [x] 프로필 수정 (닉네임 변경)
- [x] 계정 삭제

**구현 파일**:
- `lib/store/userStore.ts` - 사용자 상태 관리
- `components/common/Header.tsx` - 사용자 메뉴

---

## 기능 요구사항

### 필수 구현 사항

#### 1. 타입 가드 및 유효성 검사

```typescript
// 입력값 검증
- nickname: 2자 이상, 50자 이하
- password: 8자 이상
- 과자이름: 1자 이상, 100자 이하
- 추천이유/댓글: 최소 2자
- 상태값: 정확히 '배송중' | '재고있음' | '재고없음'
- 피드백: 정확히 'LIKE' | 'DISLIKE'
```

#### 2. 권한 검증

```typescript
// 작성자 확인
- 추천/댓글 수정/삭제: 작성자만 가능
- 구매 과자 CRUD: 관리자만 가능

// 역할 확인 (JWT token.role 또는 admin 필드)
- 관리자 확인 로직 필요
```

#### 3. 피드백 시스템 규칙

```typescript
// LIKE/DISLIKE 상호 배타성
- 사용자가 LIKE 중일 때 DISLIKE 누르기 → DISLIKE로 변경
- 사용자가 LIKE 중일 때 LIKE 누르기 → 무시 (idempotent)
- 사용자가 반응 없을 때 취소 누르기 → 무시 (idempotent)

// 통계
- likeCount, dislikeCount는 DB에서 계산 또는 캐싱
- myFeedback은 로그인 시에만 응답에 포함
```

#### 4. 페이지네이션

```typescript
// 기본값
- page: 1
- pageSize: 20 (최대 100)

// 응답 포함
- data: T[]
- pagination: { page, pageSize, total, totalPages }
```

#### 5. 에러 처리

```typescript
// 표준 에러 응답
{
  success: false,
  message: "에러 메시지",
  errorCode: "ERROR_CODE"
}

// HttpError 클래스 사용
throw new HttpError({
  statusCode: 400,
  message: "유효하지 않은 입력",
  errorCode: "VALIDATION_ERROR"
});
```

---

## 라이브러리 사용 시 주의사항

### Axios 사용 규칙

❌ **절대 금지**:
```typescript
// 직접 URL 사용
axios.post("http://localhost:3000/auth/login", data);
axios.get("/auth/login");

// 엔드포인트 하드코딩
const url = "/recommendations/1";
```

✅ **반드시 사용**:
```typescript
// requests 객체 사용
import requests from "@/lib/axios/request";

requests.auth.login                              // 상수
requests.recommendations.getDetail("1")          // 함수
requests.boughtSnackComments.list("5")

// 헬퍼 함수 사용
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/axios/helpers";
import api from "@/lib/axios/axios";

const data = await apiGet<LoginResponse>(requests.auth.login);
const data = await apiPost<Recommendation>(requests.recommendations.create, payload);
```

### Zustand 사용 규칙

❌ **절대 금지**:
```typescript
// userStore에 복잡한 로직 추가
// 로컬스토리지 직접 사용
localStorage.setItem("user", JSON.stringify(user));
```

✅ **반드시 사용**:
```typescript
// userStore은 단순 상태 저장소만
import { useUserStore } from "@/lib/store/userStore";

const { setUser, clearUser } = useUserStore();

// 복잡한 로직은 hooks로
// 토큰은 lib/auth/token.ts로
```

### TypeScript 타입 규칙

❌ **절대 금지**:
```typescript
// any 사용
const response: any = await api.get(url);

// 타입 생략
export const getRecommendations = (params) => { ... }

// locale 필드명 사용 (예: recommand_id, snack_name)
```

✅ **반드시 사용**:
```typescript
// 정확한 타입 지정
import { Recommendation, RecommendationListResponse } from "@/types/api";

export const getRecommendations = async (
  page: number = 1
): Promise<RecommendationListResponse> => {
  return await apiGet<RecommendationListResponse>(
    `${requests.recommendations.list}?page=${page}`
  );
};

// ERD 필드명 정확히 사용
const rec: Recommendation = {
  주문_id: 1,           // 정확한 필드명
  rc_id: 101,
  사용자Id: 1,
  과자이름: "초콜릿",   // 한국어 필드명
  주문이유: "맛있어요",
  // ...
};
```

### API 호출 패턴

❌ **절대 금지**:
```typescript
// 직접 axios 호출
const res = await api.get("/recommendations/1");
const data = res.data;

// 에러 처리 생략
try {
  const data = await api.post(url, payload);
} catch (e) {
  // 처리 안 함
}

// 인터셉터 무시
const res = await axios.get(url);  // axios 직접 사용
```

✅ **반드시 사용**:
```typescript
// helpers 사용
import { apiGet } from "@/lib/axios/helpers";

try {
  const data = await apiGet<Recommendation>(requests.recommendations.getDetail("1"));
} catch (error) {
  if (isHttpError(error)) {
    console.error(error.errorCode, error.message);
  }
}

// 타입 안정성
const response = await apiPost<LoginResponse>(
  requests.auth.login,
  { nickname, password } as LoginRequest
);
```

### 페이지 라우팅 규칙

❌ **절대 금지**:
```typescript
// 동적 경로에 숫자만 사용
app/recommendations/1/page.tsx  // 잘못됨

// 중괄호 생략
app/recommendations/id/page.tsx
```

✅ **반드시 사용**:
```typescript
// 동적 경로에 [brackets] 사용
app/recommendations/[주문_id]/page.tsx
app/bought-snacks/[구매_id]/page.tsx
app/bought-snacks/[구매_id]/comments/[Key]/page.tsx

// 파라미터 명확히
export default function RecommendationDetail({ params }: { params: { 주문_id: string } }) {
  const 주문_id = Number(params.주문_id);
}
```

### 환경 변수 규칙

❌ **절대 금지**:
```typescript
// 하드코딩
const baseURL = "http://localhost:3000";
```

✅ **반드시 사용**:
```
// .env.local
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

```typescript
const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
```

---

## 참고사항

### 백엔드 API 개발 시

1. **ERD 필드명 정확히 따르기**: 주문_id, 과자이름, 좋아요/싫어요 등 정확히
2. **타입 응답 구조 일치**: RecommendationListResponse, BoughtSnackFeedbackStats 등
3. **에러 코드 사용**: VALIDATION_ERROR, AUTH_REQUIRED 등 정의된 코드만
4. **페이지네이션 포함**: 모든 목록은 pagination 객체 포함
5. **상태값 정규화**: "배송중", "재고있음", "재고없음" 정확히

### 프론트엔드 개발 시

1. **이 문서 최우선**: 의문이 생기면 먼저 이 문서 확인
2. **타입 먼저 확인**: types/api.ts에서 필드명 정확히 확인
3. **API 명세 참조**: docs/api/*.md에서 요청/응답 확인
4. **엔드포인트 상수 사용**: 절대 URL 하드코딩 금지
5. **에러 처리 필수**: try-catch 및 HttpError 처리

---

**마지막 업데이트**: 2026-03-31  
**상태**: 최종 확정  
**작성자**: AI Agent  
**검증**: ERD, types/api.ts, docs/api, lib/axios/request.ts 기준

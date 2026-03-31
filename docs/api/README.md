# 두과자 (DOGWAJA) API 명세

## 개요

두과자 API는 과자 추천 및 구매 관리를 위한 RESTful API입니다.

### ERD 기반 구조

- **user**: 사용자 정보 (user_id, nickname, password_h)
- **recommendation**: 과자 추천 게시물 (주문_id, rc_id, 사용자Id, 과자이름, 주문이유)
- **rc_comment**: 추천 댓글 (댓글_id, 주문_id, 사용자Id, 내용)
- **rcc_feedback**: 추천 피드백 (id, 댓글_id, 주문_id, 사용자Id, 반응 LIKE/DISLIKE)
- **bought_snack**: 구매 과자 (구매_id, 과자이름, 상태)
- **bs_comment**: 구매 과자 댓글 (Key, 구매_id, 사용자Id, 내용)
- **bs_feedback**: 구매 과자 피드백 (id, 구매_id, 사용자Id, 반응 LIKE/DISLIKE)

---

## 요청 구조

모든 엔드포인트는 `lib/axios/request.ts`의 `requests` 객체를 통해 참조합니다.

### 예시

**Python/Node.js 등에서:**
```javascript
import requests from "@/lib/axios/request";

// 상수 엔드포인트
requests.auth.login           // "/auth/login"
requests.user.getProfile      // "/users/me"

// 동적 엔드포인트
requests.recommendations.getDetail(1)  // "/recommendations/1"
requests.boughtSnackComments.list(5)   // "/bought-snacks/5/comments"
```

---

## API 엔드포인트 목록

### 인증 관련
- [auth.md](./auth.md) - 로그인, 회원가입, 로그아웃, 토큰 갱신, 비밀번호 변경

### 사용자 관련
- [user.md](./user.md) - 프로필 조회, 수정, 계정 삭제

### 과자 추천 관련
- [recommendations.md](./recommendations.md) - 추천 게시물 CRUD
- [recommendation-comments.md](./recommendation-comments.md) - 추천 댓글 CRUD
- [recommendation-feedback.md](./recommendation-feedback.md) - 추천 좋아요/싫어요

### 구매 과자 관련
- [bought-snacks.md](./bought-snacks.md) - 구매 과자 CRUD (관리자)
- [bought-snack-comments.md](./bought-snack-comments.md) - 구매 과자 댓글 CRUD
- [bought-snack-feedback.md](./bought-snack-feedback.md) - 구매 과자 좋아요/싫어요
- [bought-snack-status.md](./bought-snack-status.md) - 구매 과자 상태 관리

---

## 공통 응답 형식

### 성공 응답 (200, 201)
```json
{
  "success": true,
  "data": {}
}
```

### 실패 응답 (4xx, 5xx)
```json
{
  "success": false,
  "message": "에러 메시지",
  "errorCode": "ERROR_CODE"
}
```

---

## 인증 방식

- **방식**: Bearer Token (JWT)
- **헤더**: `Authorization: Bearer <accessToken>`
- **토큰 갱신**: 401 에러 시 `requests.auth.refresh`로 새 토큰 요청
- **만료**: accessToken은 짧은 주기(15분 권장), refreshToken은 긴 주기(7일 권장)

---

## 에러 코드

| 코드 | HTTP | 설명 |
|------|------|------|
| `AUTH_REQUIRED` | 401 | 인증이 필요합니다 |
| `INVALID_CREDENTIALS` | 401 | 닉네임 또는 비밀번호가 잘못되었습니다 |
| `TOKEN_EXPIRED` | 401 | 토큰이 만료되었습니다 |
| `ACCESS_DENIED` | 403 | 접근 권한이 없습니다 |
| `NOT_FOUND` | 404 | 리소스를 찾을 수 없습니다 |
| `DUPLICATE_NICKNAME` | 409 | 이미 존재하는 닉네임입니다 |
| `VALIDATION_ERROR` | 400 | 요청 데이터가 유효하지 않습니다 |
| `SERVER_ERROR` | 500 | 서버 오류가 발생했습니다 |

---

## 페이지네이션

리스트 조회 응답:
```typescript
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

**쿼리 파라미터**:
- `page`: 페이지 번호 (기본값: 1)
- `pageSize`: 페이지당 항목 수 (기본값: 20, 최대: 100)

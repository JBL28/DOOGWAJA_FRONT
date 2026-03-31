# 구매 과자 피드백 API

## 개요

구매 과자에 대한 좋아요/싫어요 피드백 엔드포인트입니다.

**ERD 테이블**: `bs_feedback` (id, 구매_id, 사용자Id, 반응 LIKE/DISLIKE)

**제약조건**: 사용자당 하나의 피드백만 가능 (LIKE 또는 DISLIKE 중 하나, 상호 배타적)

---

## 1. 구매 과자 좋아요

구매 과자에 좋아요를 표시합니다.

**엔드포인트**: `POST requests.boughtSnackFeedback.like(구매_id)`  
**경로**: `/bought-snacks/{구매_id}/like`

### 요청

#### 헤더
```
Authorization: Bearer <accessToken>   (필수)
```

### 응답 (200 / 201)

```json
{
  "message": "좋아요가 추가되었습니다"
}
```

### 비즈니스 로직

- 사용자가 이미 좋아요를 누른 경우: 요청 무시 (idempotent)
- 사용자가 싫어요를 누른 경우: 싫어요 취소하고 좋아요 추가
- 새로운 반응: 좋아요 추가

### 에러 응답

#### 401 - 인증 필요 (`AUTH_REQUIRED`)
```json
{
  "success": false,
  "message": "인증이 필요합니다",
  "errorCode": "AUTH_REQUIRED"
}
```

#### 404 - 과자 없음 (`NOT_FOUND`)
```json
{
  "success": false,
  "message": "구매 과자를 찾을 수 없습니다",
  "errorCode": "NOT_FOUND"
}
```

---

## 2. 구매 과자 좋아요 취소

구매 과자의 좋아요를 취소합니다.

**엔드포인트**: `DELETE requests.boughtSnackFeedback.unlike(구매_id)`  
**경로**: `/bought-snacks/{구매_id}/like`

### 요청

#### 헤더
```
Authorization: Bearer <accessToken>   (필수)
```

### 응답 (200)

```json
{
  "message": "좋아요가 취소되었습니다"
}
```

### 비즈니스 로직

- 사용자가 좋아요를 누르지 않은 경우: 요청 무시 (idempotent)
- 사용자가 싫어요를 누른 경우: 변화 없음
- 반응이 있는 경우: 반응 삭제

---

## 3. 구매 과자 싫어요

구매 과자에 싫어요를 표시합니다.

**엔드포인트**: `POST requests.boughtSnackFeedback.dislike(구매_id)`  
**경로**: `/bought-snacks/{구매_id}/dislike`

### 요청

#### 헤더
```
Authorization: Bearer <accessToken>   (필수)
```

### 응답 (200 / 201)

```json
{
  "message": "싫어요가 추가되었습니다"
}
```

### 비즈니스 로직

- 사용자가 이미 싫어요를 누른 경우: 요청 무시 (idempotent)
- 사용자가 좋아요를 누른 경우: 좋아요 취소하고 싫어요 추가
- 새로운 반응: 싫어요 추가

---

## 4. 구매 과자 싫어요 취소

구매 과자의 싫어요를 취소합니다.

**엔드포인트**: `DELETE requests.boughtSnackFeedback.undislike(구매_id)`  
**경로**: `/bought-snacks/{구매_id}/dislike`

### 요청

#### 헤더
```
Authorization: Bearer <accessToken>   (필수)
```

### 응답 (200)

```json
{
  "message": "싫어요가 취소되었습니다"
}
```

### 비즈니스 로직

- 사용자가 싫어요를 누르지 않은 경우: 요청 무시 (idempotent)
- 사용자가 좋아요를 누른 경우: 변화 없음
- 반응이 있는 경우: 반응 삭제

---

## 5. 구매 과자 피드백 통계 조회

구매 과자의 좋아요/싫어요 통계를 조회합니다.

**엔드포인트**: `GET requests.boughtSnackFeedback.getStats(구매_id)`  
**경로**: `/bought-snacks/{구매_id}/feedback-stats`

### 요청

#### 경로 파라미터
```
구매_id: number     // 구매 과자 ID
```

#### 헤더 (선택)
```
Authorization: Bearer <accessToken>   (로그인 시 내 반응 포함)
```

### 응답 (200)

#### `BoughtSnackFeedbackStats`
```typescript
{
  data: {
    구매_id: number,                   // 구매 과자 ID
    likeCount: number,                // 좋아요 개수
    dislikeCount: number,             // 싫어요 개수
    myFeedback: "LIKE" | "DISLIKE" | null  // 내 반응 (로그인 시)
  }
}
```

### 에러 응답

#### 404 - 과자 없음 (`NOT_FOUND`)
```json
{
  "success": false,
  "message": "구매 과자를 찾을 수 없습니다",
  "errorCode": "NOT_FOUND"
}
```

---

## 참고사항

- 모든 피드백 작업은 **멱등성(Idempotent)**을 보장합니다
- 같은 반응을 여러 번 표시해도 한 번만 카운트됩니다
- 서로 다른 반응은 자동으로 교체됩니다

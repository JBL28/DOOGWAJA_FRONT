# 추천 피드백 API

## 개요

추천 게시물에 대한 좋아요/싫어요 피드백 관련 엔드포인트입니다.

**ERD 테이블**: `rcc_feedback` (id, 댓글_id, 주문_id, 사용자Id, 반응 LIKE/DISLIKE)

---

## 1. 추천 좋아요

추천 게시물에 좋아요를 추가합니다.

**엔드포인트**: `POST requests.recommendationFeedback.like(주문_id)`  
**경로**: `/recommendations/{주문_id}/like`

### 요청

#### 헤더
```
Authorization: Bearer <accessToken>   (필수)
```

#### 경로 파라미터
```
주문_id: number     // 추천 게시물 ID
```

### 응답 (200)

#### `RecommendationFeedbackStats`
```typescript
{
  주문_id: number,
  likeCount: number,
  dislikeCount: number,
  myFeedback: "LIKE"
}
```

### 에러 응답

#### 401 - 인증 필요 (`AUTH_REQUIRED`)
```json
{
  "success": false,
  "message": "인증이 필요합니다",
  "errorCode": "AUTH_REQUIRED"
}
```

#### 404 - 리소스 없음 (`NOT_FOUND`)
```json
{
  "success": false,
  "message": "추천 게시물을 찾을 수 없습니다",
  "errorCode": "NOT_FOUND"
}
```

#### 409 - 이미 반응함 (`DUPLICATE_FEEDBACK`)
```json
{
  "success": false,
  "message": "이미 좋아요를 눌렀습니다",
  "errorCode": "DUPLICATE_FEEDBACK"
}
```

---

## 2. 추천 좋아요 취소

추천 게시물의 좋아요를 취소합니다.

**엔드포인트**: `DELETE requests.recommendationFeedback.unlike(주문_id)`  
**경로**: `/recommendations/{주문_id}/like`

### 요청

#### 헤더
```
Authorization: Bearer <accessToken>   (필수)
```

#### 경로 파라미터
```
주문_id: number     // 추천 게시물 ID
```

### 응답 (200)

#### `RecommendationFeedbackStats`
```typescript
{
  주문_id: number,
  likeCount: number,
  dislikeCount: number,
  myFeedback: null
}
```

### 에러 응답

#### 401 - 인증 필요 (`AUTH_REQUIRED`)
```json
{
  "success": false,
  "message": "인증이 필요합니다",
  "errorCode": "AUTH_REQUIRED"
}
```

#### 404 - 리소스 없음 (`NOT_FOUND`)
```json
{
  "success": false,
  "message": "추천 게시물을 찾을 수 없습니다",
  "errorCode": "NOT_FOUND"
}
```

---

## 3. 추천 싫어요

추천 게시물에 싫어요를 추가합니다.

**엔드포인트**: `POST requests.recommendationFeedback.dislike(주문_id)`  
**경로**: `/recommendations/{주문_id}/dislike`

### 요청

#### 헤더
```
Authorization: Bearer <accessToken>   (필수)
```

#### 경로 파라미터
```
주문_id: number     // 추천 게시물 ID
```

### 응답 (200)

#### `RecommendationFeedbackStats`
```typescript
{
  주문_id: number,
  likeCount: number,
  dislikeCount: number,
  myFeedback: "DISLIKE"
}
```

### 에러 응답

#### 401 - 인증 필요 (`AUTH_REQUIRED`)
```json
{
  "success": false,
  "message": "인증이 필요합니다",
  "errorCode": "AUTH_REQUIRED"
}
```

#### 404 - 리소스 없음 (`NOT_FOUND`)
```json
{
  "success": false,
  "message": "추천 게시물을 찾을 수 없습니다",
  "errorCode": "NOT_FOUND"
}
```

#### 409 - 이미 반응함 (`DUPLICATE_FEEDBACK`)
```json
{
  "success": false,
  "message": "이미 싫어요를 눌렀습니다",
  "errorCode": "DUPLICATE_FEEDBACK"
}
```

---

## 4. 추천 싫어요 취소

추천 게시물의 싫어요를 취소합니다.

**엔드포인트**: `DELETE requests.recommendationFeedback.undislike(주문_id)`  
**경로**: `/recommendations/{주문_id}/dislike`

### 요청

#### 헤더
```
Authorization: Bearer <accessToken>   (필수)
```

#### 경로 파라미터
```
주문_id: number     // 추천 게시물 ID
```

### 응답 (200)

#### `RecommendationFeedbackStats`
```typescript
{
  주문_id: number,
  likeCount: number,
  dislikeCount: number,
  myFeedback: null
}
```

### 에러 응답

#### 401 - 인증 필요 (`AUTH_REQUIRED`)
```json
{
  "success": false,
  "message": "인증이 필요합니다",
  "errorCode": "AUTH_REQUIRED"
}
```

#### 404 - 리소스 없음 (`NOT_FOUND`)
```json
{
  "success": false,
  "message": "추천 게시물을 찾을 수 없습니다",
  "errorCode": "NOT_FOUND"
}
```

---

## 5. 추천 피드백 통계 조회

추천 게시물의 피드백 통계를 조회합니다.

**엔드포인트**: `GET requests.recommendationFeedback.getStats(주문_id)`  
**경로**: `/recommendations/{주문_id}/feedback-stats`

### 요청

#### 경로 파라미터
```
주문_id: number     // 추천 게시물 ID
```

#### 헤더 (선택)
```
Authorization: Bearer <accessToken>   (myFeedback 포함)
```

### 응답 (200)

#### `RecommendationFeedbackStats`
```typescript
{
  주문_id: number,
  likeCount: number,
  dislikeCount: number,
  myFeedback: "LIKE" | "DISLIKE" | null  // 로그인 시만
}
```

### 에러 응답

#### 404 - 리소스 없음 (`NOT_FOUND`)
```json
{
  "success": false,
  "message": "추천 게시물을 찾을 수 없습니다",
  "errorCode": "NOT_FOUND"
}
```

---

## 구현 예시

```typescript
import { apiPost, apiDelete, apiGet } from "@/lib/axios/helpers";
import requests from "@/lib/axios/request";
import { RecommendationFeedbackStats } from "@/types/api";

// 좋아요 추가
const addLike = async (주문_id: number) => {
  const response = await apiPost<RecommendationFeedbackStats>(
    requests.recommendationFeedback.like(주문_id.toString())
  );
  return response;
};

// 싫어요 취소
const removeDislike = async (주문_id: number) => {
  const response = await apiDelete<RecommendationFeedbackStats>(
    requests.recommendationFeedback.undislike(주문_id.toString())
  );
  return response;
};

// 통계 조회
const getStats = async (주문_id: number) => {
  const response = await apiGet<RecommendationFeedbackStats>(
    requests.recommendationFeedback.getStats(주문_id.toString())
  );
  return response;
};
```
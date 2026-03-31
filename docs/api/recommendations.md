# 과자 추천 API

## 개요

사용자가 추천하는 과자에 대한 게시물 관련 CRUD 엔드포인트입니다.

**ERD 테이블**: `recommendation` (주문_id, rc_id, 사용자Id, 과자이름, 주문이유)

---

## 1. 추천 목록 조회

모든 과자 추천 게시물 목록을 조회합니다. (페이지네이션)

**엔드포인트**: `GET requests.recommendations.list`  
**경로**: `/recommendations?page=1&pageSize=20`

### 요청

#### 쿼리 파라미터
```
page=1                 // 페이지 번호 (기본값: 1)
pageSize=20            // 페이지당 항목 수 (기본값: 20, 최대: 100)
```

#### 헤더 (선택)
```
Authorization: Bearer <accessToken>   (로그인 시 myFeedback 포함)
```

### 응답 (200)

#### `RecommendationListResponse`
```typescript
{
  data: [
    {
      주문_id: number,               // 추천 게시물 ID
      rc_id: number,                 // 추천 내부 ID
      사용자Id: number,              // 작성자 ID
      과자이름: string,              // 추천하는 과자 이름
      주문이유: string,              // 추천 이유
      author: {
        user_id: number,
        nickname: string
      },
      commentCount: number,          // 댓글 개수
      likeCount: number,             // 좋아요 개수
      dislikeCount: number,          // 싫어요 개수
      myFeedback: "LIKE" | "DISLIKE" | null,  // 내 반응 (로그인 시)
      createdAt: string,
      updatedAt: string
    }
  ],
  pagination: {
    page: number,
    pageSize: number,
    total: number,
    totalPages: number
  }
}
```

### 구현 예시

```typescript
import { apiGet } from "@/lib/axios/helpers";
import requests from "@/lib/axios/request";
import { RecommendationListResponse } from "@/types/api";

const getRecommendations = async (page: number = 1, pageSize: number = 20) => {
  const response = await apiGet<RecommendationListResponse>(
    `${requests.recommendations.list}?page=${page}&pageSize=${pageSize}`
  );
  return response;
};
```

---

## 2. 추천 상세 조회

특정 추천 게시물의 상세 정보를 조회합니다.

**엔드포인트**: `GET requests.recommendations.getDetail(주문_id)`  
**경로**: `/recommendations/{주문_id}`

### 요청

#### 경로 파라미터
```
주문_id: number     // 추천 게시물 ID
```

### 응답 (200)

#### `Recommendation`
```typescript
{
  data: {
    주문_id: number,
    rc_id: number,
    사용자Id: number,
    과자이름: string,
    주문이유: string,
    author: { user_id: number, nickname: string },
    commentCount: number,
    likeCount: number,
    dislikeCount: number,
    myFeedback: "LIKE" | "DISLIKE" | null,
    createdAt: string,
    updatedAt: string
  }
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

## 3. 추천 작성

새로운 과자 추천 게시물을 작성합니다.

**엔드포인트**: `POST requests.recommendations.create`  
**경로**: `/recommendations`

### 요청

#### 헤더
```
Authorization: Bearer <accessToken>   (필수)
```

#### 본문: `CreateRecommendationRequest`
```typescript
{
  과자이름: string,      // 추천 과자 이름 (필수)
  주문이유: string       // 추천 이유 (필수, 최소 10자)
}
```

### 응답 (201)

#### `Recommendation`
```typescript
{
  data: {
    주문_id: number,
    rc_id: number,
    사용자Id: number,
    과자이름: string,
    주문이유: string,
    author: { user_id: number, nickname: string },
    commentCount: 0,
    likeCount: 0,
    dislikeCount: 0,
    myFeedback: null,
    createdAt: string,
    updatedAt: string
  }
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

#### 400 - 유효성 검사 실패 (`VALIDATION_ERROR`)
```json
{
  "success": false,
  "message": "주문이유는 최소 10자 이상이어야 합니다",
  "errorCode": "VALIDATION_ERROR"
}
```

---

## 4. 추천 수정

자신이 작성한 추천 게시물을 수정합니다.

**엔드포인트**: `PUT requests.recommendations.update(주문_id)`  
**경로**: `/recommendations/{주문_id}`

### 요청

#### 헤더
```
Authorization: Bearer <accessToken>   (필수)
```

#### 본문: `UpdateRecommendationRequest`
```typescript
{
  과자이름?: string,      // 추천 과자 이름 (선택)
  주문이유?: string       // 추천 이유 (선택, 최소 10자)
}
```

### 응답 (200)

#### `Recommendation`
```typescript
{
  data: {
    // 수정된 추천 게시물 데이터
  }
}
```

### 에러 응답

#### 403 - 권한 없음 (`ACCESS_DENIED`)
```json
{
  "success": false,
  "message": "이 게시물을 수정할 권한이 없습니다",
  "errorCode": "ACCESS_DENIED"
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

## 5. 추천 삭제

자신이 작성한 추천 게시물을 삭제합니다.

**엔드포인트**: `DELETE requests.recommendations.delete(주문_id)`  
**경로**: `/recommendations/{주문_id}`

### 요청

#### 헤더
```
Authorization: Bearer <accessToken>   (필수)
```

### 응답 (200)

```json
{
  "message": "추천 게시물이 삭제되었습니다"
}
```

### 에러 응답

#### 403 - 권한 없음 (`ACCESS_DENIED`)
```json
{
  "success": false,
  "message": "이 게시물을 삭제할 권한이 없습니다",
  "errorCode": "ACCESS_DENIED"
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

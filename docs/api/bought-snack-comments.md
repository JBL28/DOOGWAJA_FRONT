# 구매 과자 댓글 API

## 개요

구매 과자에 달린 댓글 관련 CRUD 엔드포인트입니다.

**ERD 테이블**: `bs_comment` (Key, 구매_id, 사용자Id, 내용)

---

## 1. 구매 과자 댓글 목록 조회

특정 구매 과자의 댓글 목록을 조회합니다.

**엔드포인트**: `GET requests.boughtSnackComments.list(구매_id)`  
**경로**: `/bought-snacks/{구매_id}/comments?page=1&pageSize=20`

### 요청

#### 경로 파라미터
```
구매_id: number     // 구매 과자 ID
```

#### 쿼리 파라미터
```
page=1                 // 페이지 번호 (기본값: 1)
pageSize=20            // 페이지당 항목 수 (기본값: 20)
sort=createdAt:asc     // 정렬 기준 (기본값: 오래된 순)
```

### 응답 (200)

#### `BoughtSnackCommentListResponse`
```typescript
{
  data: [
    {
      Key: number,                        // 댓글 ID (ERD)
      구매_id: number,                    // 구매 과자 ID
      사용자Id: number,                   // 작성자 ID
      내용: string,                       // 댓글 내용
      author: {
        user_id: number,
        nickname: string
      },
      likeCount: number,                  // 좋아요 개수
      dislikeCount: number,               // 싫어요 개수
      myFeedback: "LIKE" | "DISLIKE" | null,  // 내 반응
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

### 에러 응답

#### 404 - 구매 과자 없음 (`NOT_FOUND`)
```json
{
  "success": false,
  "message": "구매 과자를 찾을 수 없습니다",
  "errorCode": "NOT_FOUND"
}
```

---

## 2. 구매 과자 댓글 상세 조회

특정 댓글의 상세 정보를 조회합니다.

**엔드포인트**: `GET requests.boughtSnackComments.getDetail(구매_id, Key)`  
**경로**: `/bought-snacks/{구매_id}/comments/{Key}`

### 요청

#### 경로 파라미터
```
구매_id: number     // 구매 과자 ID
Key: number         // 댓글 ID
```

### 응답 (200)

#### `BoughtSnackComment`
```typescript
{
  data: {
    Key: number,
    구매_id: number,
    사용자Id: number,
    내용: string,
    author: { user_id: number, nickname: string },
    likeCount: number,
    dislikeCount: number,
    myFeedback: "LIKE" | "DISLIKE" | null,
    createdAt: string,
    updatedAt: string
  }
}
```

---

## 3. 구매 과자 댓글 작성

새로운 댓글을 작성합니다.

**엔드포인트**: `POST requests.boughtSnackComments.create(구매_id)`  
**경로**: `/bought-snacks/{구매_id}/comments`

### 요청

#### 헤더
```
Authorization: Bearer <accessToken>   (필수)
```

#### 본문: `CreateBoughtSnackCommentRequest`
```typescript
{
  내용: string      // 댓글 내용 (필수, 최소 2자, 최대 500자)
}
```

### 응답 (201)

#### `BoughtSnackComment`
```typescript
{
  data: {
    Key: number,
    구매_id: number,
    사용자Id: number,
    내용: string,
    author: { user_id: number, nickname: string },
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
  "message": "댓글 내용은 최소 2자 이상이어야 합니다",
  "errorCode": "VALIDATION_ERROR"
}
```

#### 404 - 구매 과자 없음 (`NOT_FOUND`)
```json
{
  "success": false,
  "message": "구매 과자를 찾을 수 없습니다",
  "errorCode": "NOT_FOUND"
}
```

---

## 4. 구매 과자 댓글 수정 (작성자만)

자신이 작성한 댓글을 수정합니다.

**엔드포인트**: `PUT requests.boughtSnackComments.update(구매_id, Key)`  
**경로**: `/bought-snacks/{구매_id}/comments/{Key}`

### 요청

#### 헤더
```
Authorization: Bearer <accessToken>   (필수)
```

#### 본문: `UpdateBoughtSnackCommentRequest`
```typescript
{
  내용: string      // 댓글 내용 (필수, 최소 2자, 최대 500자)
}
```

### 응답 (200)

#### `BoughtSnackComment`
```typescript
{
  data: {
    // 수정된 댓글 데이터
  }
}
```

### 에러 응답

#### 403 - 권한 없음 (`ACCESS_DENIED`)
```json
{
  "success": false,
  "message": "이 댓글을 수정할 권한이 없습니다",
  "errorCode": "ACCESS_DENIED"
}
```

#### 404 - 리소스 없음 (`NOT_FOUND`)
```json
{
  "success": false,
  "message": "댓글을 찾을 수 없습니다",
  "errorCode": "NOT_FOUND"
}
```

---

## 5. 구매 과자 댓글 삭제 (작성자만)

자신이 작성한 댓글을 삭제합니다.

**엔드포인트**: `DELETE requests.boughtSnackComments.delete(구매_id, Key)`  
**경로**: `/bought-snacks/{구매_id}/comments/{Key}`

### 요청

#### 헤더
```
Authorization: Bearer <accessToken>   (필수)
```

### 응답 (200)

```json
{
  "message": "댓글이 삭제되었습니다"
}
```

### 에러 응답

#### 403 - 권한 없음 (`ACCESS_DENIED`)
```json
{
  "success": false,
  "message": "이 댓글을 삭제할 권한이 없습니다",
  "errorCode": "ACCESS_DENIED"
}
```

#### 404 - 리소스 없음 (`NOT_FOUND`)
```json
{
  "success": false,
  "message": "댓글을 찾을 수 없습니다",
  "errorCode": "NOT_FOUND"
}
```

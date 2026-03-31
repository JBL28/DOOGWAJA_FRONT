# 구매 과자 API

## 개요

관리자가 관리하는 구매 과자 목록 관련 CRUD 엔드포인트입니다.

**ERD 테이블**: `bought_snack` (구매_id, 과자이름, 상태)

**권한 정책**:
- **모든 사용자**: 조회, 댓글 작성, 피드백, 상태 변경 가능
- **관리자만**: 생성, 수정, 삭제 가능

---

## 1. 구매 과자 목록 조회

모든 구매 과자 목록을 조회합니다. (페이지네이션)

**엔드포인트**: `GET requests.boughtSnacks.list`  
**경로**: `/bought-snacks?page=1&pageSize=20&status=재고있음`

### 요청

#### 쿼리 파라미터
```
page=1                 // 페이지 번호 (기본값: 1)
pageSize=20            // 페이지당 항목 수 (기본값: 20)
status=배송중          // 상태 필터링 (선택: 배송중, 재고있음, 재고없음)
```

#### 헤더 (선택)
```
Authorization: Bearer <accessToken>   (로그인 시 myFeedback/myStatus 포함)
```

### 응답 (200)

#### `BoughtSnackListResponse`
```typescript
{
  data: [
    {
      구매_id: number,                     // 구매 과자 ID
      과자이름: string,                   // 과자 이름
      상태: "배송중" | "재고있음" | "재고없음",  // 상태
      commentCount: number,              // 댓글 개수
      likeCount: number,                 // 좋아요 개수
      dislikeCount: number,              // 싫어요 개수
      myFeedback: "LIKE" | "DISLIKE" | null,  // 내 반응 (로그인 시)
      myStatus: "배송중" | "재고있음" | "재고없음" | null,  // 내 상태 (로그인 시)
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

---

## 2. 구매 과자 상세 조회

특정 구매 과자의 상세 정보를 조회합니다.

**엔드포인트**: `GET requests.boughtSnacks.getDetail(구매_id)`  
**경로**: `/bought-snacks/{구매_id}`

### 요청

#### 경로 파라미터
```
구매_id: number     // 구매 과자 ID
```

### 응답 (200)

#### `BoughtSnack`
```typescript
{
  data: {
    구매_id: number,
    과자이름: string,
    상태: "배송중" | "재고있음" | "재고없음",
    commentCount: number,
    likeCount: number,
    dislikeCount: number,
    myFeedback: "LIKE" | "DISLIKE" | null,
    myStatus: "배송중" | "재고있음" | "재고없음" | null,
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
  "message": "구매 과자를 찾을 수 없습니다",
  "errorCode": "NOT_FOUND"
}
```

---

## 3. 구매 과자 생성 (관리자만)

새로운 구매 과자를 추가합니다.

**엔드포인트**: `POST requests.boughtSnacks.create`  
**경로**: `/bought-snacks`

### 요청

#### 헤더
```
Authorization: Bearer <accessToken>   (필수)
```

#### 본문: `CreateBoughtSnackRequest`
```typescript
{
  과자이름: string,                  // 과자 이름 (필수)
  상태?: "배송중" | "재고있음" | "재고없음"  // 상태 (선택, 기본값: "재고있음")
}
```

### 응답 (201)

#### `BoughtSnack`
```typescript
{
  data: {
    구매_id: number,
    과자이름: string,
    상태: "배송중" | "재고있음" | "재고없음",
    commentCount: 0,
    likeCount: 0,
    dislikeCount: 0,
    myFeedback: null,
    myStatus: null,
    createdAt: string,
    updatedAt: string
  }
}
```

### 에러 응답

#### 403 - 권한 없음 (`ACCESS_DENIED`)
```json
{
  "success": false,
  "message": "관리자만 과자를 추가할 수 있습니다",
  "errorCode": "ACCESS_DENIED"
}
```

#### 400 - 유효성 검사 실패 (`VALIDATION_ERROR`)
```json
{
  "success": false,
  "message": "잘못된 상태값입니다. 배송중, 재고있음, 재고없음 중 하나여야 합니다",
  "errorCode": "VALIDATION_ERROR"
}
```

---

## 4. 구매 과자 수정 (관리자만)

구매 과자 정보를 수정합니다.

**엔드포인트**: `PUT requests.boughtSnacks.update(구매_id)`  
**경로**: `/bought-snacks/{구매_id}`

### 요청

#### 헤더
```
Authorization: Bearer <accessToken>   (필수)
```

#### 본문: `UpdateBoughtSnackRequest`
```typescript
{
  과자이름?: string,       // 과자 이름 (선택)
  상태?: "배송중" | "재고있음" | "재고없음"  // 상태 (선택)
}
```

### 응답 (200)

#### `BoughtSnack`
```typescript
{
  data: {
    // 수정된 구매 과자 데이터
  }
}
```

### 에러 응답

#### 403 - 권한 없음 (`ACCESS_DENIED`)
```json
{
  "success": false,
  "message": "관리자만 과자를 수정할 수 있습니다",
  "errorCode": "ACCESS_DENIED"
}
```

#### 404 - 리소스 없음 (`NOT_FOUND`)
```json
{
  "success": false,
  "message": "구매 과자를 찾을 수 없습니다",
  "errorCode": "NOT_FOUND"
}
```

---

## 5. 구매 과자 삭제 (관리자만)

구매 과자를 삭제합니다.

**엔드포인트**: `DELETE requests.boughtSnacks.delete(구매_id)`  
**경로**: `/bought-snacks/{구매_id}`

### 요청

#### 헤더
```
Authorization: Bearer <accessToken>   (필수)
```

### 응답 (200)

```json
{
  "message": "구매 과자가 삭제되었습니다"
}
```

### 에러 응답

#### 403 - 권한 없음 (`ACCESS_DENIED`)
```json
{
  "success": false,
  "message": "관리자만 과자를 삭제할 수 있습니다",
  "errorCode": "ACCESS_DENIED"
}
```

#### 404 - 리소스 없음 (`NOT_FOUND`)
```json
{
  "success": false,
  "message": "구매 과자를 찾을 수 없습니다",
  "errorCode": "NOT_FOUND"
}
```

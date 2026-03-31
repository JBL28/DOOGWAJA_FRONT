# 사용자 API

## 개요

사용자 프로필 조회, 수정, 계정 삭제 관련 엔드포인트입니다.

---

## 1. 프로필 조회

로그인한 사용자의 프로필 정보를 조회합니다.

**엔드포인트**: `GET requests.user.getProfile`  
**경로**: `/users/me`

### 요청

#### 헤더
```
Authorization: Bearer <accessToken>
```

### 응답 (200)

#### `User`
```typescript
{
  data: {
    user_id: number,                // 사용자 ID
    nickname: string,               // 사용자 닉네임
    createdAt: string,              // 생성 일시 (ISO 8601)
    updatedAt: string               // 수정 일시 (ISO 8601)
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

### 구현 예시

```typescript
import { apiGet } from "@/lib/axios/helpers";
import requests from "@/lib/axios/request";
import { User } from "@/types/api";

const getProfile = async () => {
  const user = await apiGet<User>(requests.user.getProfile);
  return user;
};
```

---

## 2. 프로필 수정

로그인한 사용자의 프로필 정보를 수정합니다.

**엔드포인트**: `PUT requests.user.updateProfile`  
**경로**: `/users/me`

### 요청

#### 헤더
```
Authorization: Bearer <accessToken>
```

#### 본문
```typescript
{
  nickname: string | undefined        // 사용자 닉네임 (선택, 중복 불가)
}
```

### 응답 (200)

#### `User`
```typescript
{
  data: {
    user_id: number,
    nickname: string,
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

#### 409 - 닉네임 중복 (`DUPLICATE_NICKNAME`)
```json
{
  "success": false,
  "message": "이미 존재하는 닉네임입니다",
  "errorCode": "DUPLICATE_NICKNAME"
}
```

---

## 3. 계정 삭제

로그인한 사용자의 계정을 삭제합니다. (되돌릴 수 없습니다)

**엔드포인트**: `DELETE requests.user.deleteAccount`  
**경로**: `/users/me`

### 요청

#### 헤더
```
Authorization: Bearer <accessToken>
```

### 응답 (200)

```json
{
  "message": "계정이 삭제되었습니다"
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

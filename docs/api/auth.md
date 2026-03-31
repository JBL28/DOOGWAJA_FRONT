# 인증 API

## 개요

사용자 인증, 회원가입, 로그아웃, 토큰 갱신 관련 엔드포인트입니다.

---

## 1. 로그인

회원이 닉네임과 비밀번호로 로그인합니다.

**엔드포인트**: `POST requests.auth.login`  
**경로**: `/auth/login`

### 요청

#### 본문: `LoginRequest`
```typescript
{
  nickname: string,     // 사용자 닉네임 (필수)
  password: string      // 사용자 비밀번호 (필수)
}
```

### 응답 (200)

#### `LoginResponse`
```typescript
{
  data: {
    accessToken: string,              // JWT 액세스 토큰
    refreshToken: string,             // 토큰 갱신용 리프레시 토큰
    user: {
      user_id: number,                // 사용자 ID
      nickname: string,               // 사용자 닉네임
      createdAt: string,              // 생성 일시 (ISO 8601)
      updatedAt: string               // 수정 일시 (ISO 8601)
    }
  }
}
```

### 에러 응답

#### 401 - 인증 실패 (`INVALID_CREDENTIALS`)
```json
{
  "success": false,
  "message": "닉네임 또는 비밀번호가 잘못되었습니다",
  "errorCode": "INVALID_CREDENTIALS"
}
```

#### 400 - 유효성 검사 실패 (`VALIDATION_ERROR`)
```json
{
  "success": false,
  "message": "nickname과 password는 필수입니다",
  "errorCode": "VALIDATION_ERROR"
}
```

### 구현 예시 (TypeScript + axios)

```typescript
import { apiPost } from "@/lib/axios/helpers";
import requests from "@/lib/axios/request";
import { LoginRequest, LoginResponse } from "@/types/api";

const login = async (nickname: string, password: string) => {
  const response = await apiPost<LoginResponse>(
    requests.auth.login,
    { nickname, password }
  );
  return response;
};
```

---

## 2. 회원가입

새로운 사용자를 등록합니다.

**엔드포인트**: `POST requests.auth.signup`  
**경로**: `/auth/signup`

### 요청

#### 본문: `SignupRequest`
```typescript
{
  nickname: string,     // 사용자 닉네임 (필수, 중복 불가)
  password: string      // 사용자 비밀번호 (필수, 최소 8자)
}
```

### 응답 (201)

#### `SignupResponse`
```typescript
{
  data: {
    accessToken: string,              // JWT 액세스 토큰
    refreshToken: string,             // 토큰 갱신용 리프레시 토큰
    user: {
      user_id: number,
      nickname: string,
      createdAt: string,
      updatedAt: string
    }
  }
}
```

### 에러 응답

#### 409 - 닉네임 중복 (`DUPLICATE_NICKNAME`)
```json
{
  "success": false,
  "message": "이미 존재하는 닉네임입니다",
  "errorCode": "DUPLICATE_NICKNAME"
}
```

#### 400 - 유효성 검사 실패 (`VALIDATION_ERROR`)
```json
{
  "success": false,
  "message": "비밀번호는 최소 8자 이상이어야 합니다",
  "errorCode": "VALIDATION_ERROR"
}
```

---

## 3. 로그아웃

사용자 로그아웃 (토큰 무효화)

**엔드포인트**: `POST requests.auth.logout`  
**경로**: `/auth/logout`

### 요청

#### 헤더
```
Authorization: Bearer <accessToken>
```

### 응답 (200)

```json
{
  "message": "로그아웃되었습니다"
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

---

## 4. 토큰 갱신

만료된 액세스 토큰을 새로 발급받습니다.

**엔드포인트**: `POST requests.auth.refresh`  
**경로**: `/auth/refresh-token`

### 요청

#### 본문
```typescript
{
  refreshToken: string     // 리프레시 토큰 (필수)
}
```

### 응답 (200)

#### `RefreshTokenResponse`
```typescript
{
  data: {
    accessToken: string    // 새로운 액세스 토큰
  }
}
```

### 에러 응답

#### 401 - 토큰 만료/무효 (`TOKEN_EXPIRED`)
```json
{
  "success": false,
  "message": "리프레시 토큰이 만료되었습니다",
  "errorCode": "TOKEN_EXPIRED"
}
```

---

## 5. 비밀번호 변경

사용자 비밀번호를 변경합니다.

**엔드포인트**: `PUT requests.auth.changePassword`  
**경로**: `/auth/password`

### 요청

#### 헤더
```
Authorization: Bearer <accessToken>
```

#### 본문: `ChangePasswordRequest`
```typescript
{
  currentPassword: string,   // 현재 비밀번호 (필수)
  newPassword: string        // 새 비밀번호 (필수, 최소 8자)
}
```

### 응답 (200)

```json
{
  "message": "비밀번호가 변경되었습니다"
}
```

### 에러 응답

#### 401 - 비밀번호 불일치 (`INVALID_CREDENTIALS`)
```json
{
  "success": false,
  "message": "현재 비밀번호가 일치하지 않습니다",
  "errorCode": "INVALID_CREDENTIALS"
}
```

#### 400 - 유효성 검사 실패 (`VALIDATION_ERROR`)
```json
{
  "success": false,
  "message": "새 비밀번호는 최소 8자 이상이어야 합니다",
  "errorCode": "VALIDATION_ERROR"
}
```

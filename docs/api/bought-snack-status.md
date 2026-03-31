# 구매 과자 상태 API

## 개요

구매 과자의 상태 관리 엔드포인트입니다. 일반 사용자가 자신의 상태(배송중/재고있음/재고없음)를 변경할 수 있습니다.

**ERD 테이블**: `bought_snack` 테이블의 상태 필드 참조

**상태값**: 
- `배송중`: 배송 중인 상태
- `재고있음`: 재고가 있는 상태
- `재고없음`: 재고가 없는 상태

---

## 1. 구매 과자 상태 업데이트

사용자가 구매 과자의 상태를 변경합니다.

**엔드포인트**: `PUT requests.boughtSnackStatus.update(구매_id)`  
**경로**: `/bought-snacks/{구매_id}/status`

### 요청

#### 경로 파라미터
```
구매_id: number     // 구매 과자 ID
```

#### 헤더
```
Authorization: Bearer <accessToken>   (필수)
```

#### 본문: `UpdateBoughtSnackStatusRequest`
```typescript
{
  상태: "배송중" | "재고있음" | "재고없음"  // 변경할 상태 (필수)
}
```

### 응답 (200)

```json
{
  "message": "상태가 업데이트되었습니다"
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
  "message": "잘못된 상태값입니다. 배송중, 재고있음, 재고없음 중 하나여야 합니다",
  "errorCode": "VALIDATION_ERROR"
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

### 구현 예시

```typescript
import { apiPut } from "@/lib/axios/helpers";
import requests from "@/lib/axios/request";
import { UpdateBoughtSnackStatusRequest } from "@/types/api";

const updateStatus = async (구매_id: number, 상태: BoughtSnackStatus) => {
  const payload: UpdateBoughtSnackStatusRequest = { 상태 };
  await apiPut(requests.boughtSnackStatus.update(String(구매_id)), payload);
};
```

---

## 2. 구매 과자 내 상태 조회

로그인한 사용자가 특정 구매 과자에 대해 설정한 상태를 조회합니다.

**엔드포인트**: `GET requests.boughtSnackStatus.getMyStatus(구매_id)`  
**경로**: `/bought-snacks/{구매_id}/my-status`

### 요청

#### 경로 파라미터
```
구매_id: number     // 구매 과자 ID
```

#### 헤더
```
Authorization: Bearer <accessToken>   (필수)
```

### 응답 (200)

```typescript
{
  data: {
    구매_id: number,                   // 구매 과자 ID
    상태: "배송중" | "재고있음" | "재고없음" | null  // 사용자가 설정한 상태 (없으면 null)
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

#### 404 - 과자 없음 (`NOT_FOUND`)
```json
{
  "success": false,
  "message": "구매 과자를 찾을 수 없습니다",
  "errorCode": "NOT_FOUND"
}
```

---

## 설계 의도

### 상태의 의미

이 API는 **구매 과자에 대한 사용자의 개인 상태(Personal Status)**를 관리합니다.

| 상태 | 의미 |
|------|------|
| `배송중` | 사용자가 이 과자의 배송을 기다리는 중 |
| `재고있음` | 사용자가 이 과자를 소유하고 있으며, 아직 다 먹지 않음 |
| `재고없음` | 사용자가 이 과자를 다 먹음 또는 소비함 |

### ERD 관계

- `bought_snack` 테이블: 관리자가 관리하는 과자 목록의 전체 상태
- `bs_comment` 테이블: 과자에 대한 사용자 피드백/댓글
- 사용자 개인 상태: 각 사용자가 특정 과자에 대해 설정한 개인 상태 (별도 저장소)

---

## 참고사항

- 상태 업데이트는 일반 사용자 모두에게 허용됩니다
- 같은 상태로 업데이트하는 경우: idempotent (재요청 안전)
- 상태는 사용자별로 독립적으로 관리됩니다

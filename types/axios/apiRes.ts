// types/apiRes.t.ts

/** 서버 공통 응답 형식 */
export type ApiResponse<T = unknown> = {
  data?: T;            // 응답 데이터
  errorCode?: string;  // 인증/인가 전용 에러 코드 (있을 수도 있음)
  message?: string;    // 에러 메시지 (있을 수도 있음)
};
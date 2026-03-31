/**
 * 클라이언트에서 토큰을 관리하는 유틸 함수들
 * localStorage를 사용하여 액세스 토큰과 토큰 타입을 저장
 */

const TOKEN_KEY = "accessToken";
const TOKEN_TYPE_KEY = "tokenType";

/**
 * 토큰 및 토큰 타입을 저장합니다.
 * @param tokenType - 토큰 타입 (e.g., "Bearer")
 * @param accessToken - 액세스 토큰
 */
export const saveAuthToken = (tokenType: string, accessToken: string) => {
  if (typeof window === "undefined") return; // SSR 환경에서는 실행 안 함
  localStorage.setItem(TOKEN_TYPE_KEY, tokenType);
  localStorage.setItem(TOKEN_KEY, accessToken);
};

/**
 * 저장된 토큰을 삭제합니다.
 */
export const clearAuthToken = () => {
  if (typeof window === "undefined") return; // SSR 환경에서는 실행 안 함
  localStorage.removeItem(TOKEN_TYPE_KEY);
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Authorization 헤더 값을 반환합니다.
 * @returns Authorization 헤더 값 (e.g., "Bearer <token>") 또는 null
 */
export const getAuthorizationHeader = (): string | null => {
  if (typeof window === "undefined") return null; // SSR 환경에서는 null 반환

  const tokenType = localStorage.getItem(TOKEN_TYPE_KEY);
  const token = localStorage.getItem(TOKEN_KEY);

  if (tokenType && token) {
    return `${tokenType} ${token}`;
  }
  return null;
};

/**
 * 토큰이 존재하는지 확인합니다.
 * @returns 토큰이 존재하면 true, 아니면 false
 */
export const hasAuthToken = (): boolean => {
  if (typeof window === "undefined") return false; // SSR 환경에서는 false 반환
  return !!localStorage.getItem(TOKEN_KEY);
};

/**
 * 저장된 액세스 토큰을 반환합니다.
 * @returns 액세스 토큰 또는 null
 */
export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * 저장된 토큰 타입을 반환합니다.
 * @returns 토큰 타입 또는 null
 */
export const getTokenType = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_TYPE_KEY);
};

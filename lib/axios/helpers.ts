/**
 * Axios 사용 예시 및 Helper 함수
 * @example
 * // GET 요청
 * const user = await api.get(requests.user.getProfile);
 *
 * // POST 요청
 * await api.post(requests.auth.login, { email: "test@example.com", password: "..." });
 *
 * // 파라미터가 있는 GET
 * await api.get(requests.posts.getDetail("123"));
 *
 * // PUT 요청
 * await api.put(requests.user.updateProfile, { name: "John" });
 *
 * // DELETE 요청
 * await api.delete(requests.posts.delete("456"));
 */

import api from "./axios";
import { ApiResponse } from "@/types/axios/apiRes";
import { HttpError } from "@/types/axios/httpError";

/**
 * 타입 안전한 API GET 요청
 * @template T - 응답 데이터 타입
 * @param url - API 엔드포인트 URL
 * @param config - 추가 axios 설정
 * @returns 응답 데이터
 */
export const apiGet = async <T = unknown>(
  url: string,
  config?: any
): Promise<T> => {
  try {
    const response = await api.get<ApiResponse<T>>(url, config);
    return response.data as T;
  } catch (error) {
    throw error;
  }
};

/**
 * 타입 안전한 API POST 요청
 * @template T - 응답 데이터 타입
 * @param url - API 엔드포인트 URL
 * @param data - 요청 바디 데이터
 * @param config - 추가 axios 설정
 * @returns 응답 데이터
 */
export const apiPost = async <T = unknown>(
  url: string,
  data?: any,
  config?: any
): Promise<T> => {
  try {
    const response = await api.post<ApiResponse<T>>(url, data, config);
    return response.data as T;
  } catch (error) {
    throw error;
  }
};

/**
 * 타입 안전한 API PUT 요청
 * @template T - 응답 데이터 타입
 * @param url - API 엔드포인트 URL
 * @param data - 요청 바디 데이터
 * @param config - 추가 axios 설정
 * @returns 응답 데이터
 */
export const apiPut = async <T = unknown>(
  url: string,
  data?: any,
  config?: any
): Promise<T> => {
  try {
    const response = await api.put<ApiResponse<T>>(url, data, config);
    return response.data as T;
  } catch (error) {
    throw error;
  }
};

/**
 * 타입 안전한 API DELETE 요청
 * @template T - 응답 데이터 타입
 * @param url - API 엔드포인트 URL
 * @param config - 추가 axios 설정
 * @returns 응답 데이터
 */
export const apiDelete = async <T = unknown>(
  url: string,
  config?: any
): Promise<T> => {
  try {
    const response = await api.delete<ApiResponse<T>>(url, config);
    return response.data as T;
  } catch (error) {
    throw error;
  }
};

/**
 * 타입 안전한 API PATCH 요청
 * @template T - 응답 데이터 타입
 * @param url - API 엔드포인트 URL
 * @param data - 요청 바디 데이터
 * @param config - 추가 axios 설정
 * @returns 응답 데이터
 */
export const apiPatch = async <T = unknown>(
  url: string,
  data?: any,
  config?: any
): Promise<T> => {
  try {
    const response = await api.patch<ApiResponse<T>>(url, data, config);
    return response.data as T;
  } catch (error) {
    throw error;
  }
};

/**
 * 에러 처리 Helper - HttpError인지 확인
 * @param error - 에러 객체
 * @returns HttpError 여부
 */
export const isHttpError = (error: unknown): error is HttpError => {
  return error instanceof HttpError;
};

/**
 * 에러 처리 Helper - 상태 코드로 에러 확인
 * @param error - 에러 객체
 * @param statusCode - 확인할 상태 코드
 * @returns 해당 상태 코드인지 여부
 */
export const isErrorWithStatus = (
  error: unknown,
  statusCode: number
): error is HttpError => {
  return isHttpError(error) && error.statusCode === statusCode;
};

export default api;

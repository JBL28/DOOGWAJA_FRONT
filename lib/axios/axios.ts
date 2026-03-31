// lib/axios/axios.ts
"use client";
import { ApiResponse } from "@/types/axios/apiRes";
import { HttpError } from "@/types/axios/httpError";
import {
  clearAuthToken,
  getAuthorizationHeader,
  hasAuthToken,
  saveAuthToken,
} from "@/lib/auth/token";
import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosInstance,
} from "axios";
import requests from "./request";

/**
 * 한 파일에서 응답 형식이나 에러처리 등을 관리
 * - 요청 인터셉터: Authorization 헤더 자동 주입
 * - 응답 인터셉터: 401 에러 시 토큰 refresh 시도 및 에러 처리
 */

/* axios 객체 설정 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL, // .env에 정의된 baseURL
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  timeout: 15000,
  withCredentials: true,
});

// refresh token 시도 중 플래그 (무한 루프 방지)
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

/**
 * 대기 중인 요청들을 처리합니다.
 * @param error - 에러가 발생한 경우 에러 객체
 * @param token - 새로 발급받은 토큰 (성공한 경우)
 */
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * 인증 관련 엔드포인트인지 확인합니다.
 * 인증 엔드포인트에서는 401 에러 발생 시 토큰을 삭제하지 않습니다.
 * @param url - 요청 URL
 * @returns 인증 엔드포인트인지 여부
 */
const isAuthEndpoint = (url: string): boolean => {
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/password") ||
    url.includes("/auth/signup") ||
    url.includes("/auth/email") ||
    url.includes("/auth/simple-password")
  );
};

/**
 * 토큰 refresh를 시도합니다.
 * @param apiInstance - axios 인스턴스
 * @param originalRequest - 원래 요청 설정
 * @returns 새 토큰으로 재시도한 요청 결과
 * @throws refresh 실패 시 에러
 */
const attemptTokenRefresh = async (
  apiInstance: AxiosInstance,
  originalRequest: InternalAxiosRequestConfig
): Promise<any> => {
  if (isRefreshing) {
    // 이미 refresh 중이면 대기열에 추가
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    })
      .then(() => {
        return apiInstance(originalRequest);
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  }

  isRefreshing = true;

  try {
    // refresh token 요청 (현재 토큰으로 인증 필요)
    // refresh 요청은 인터셉터를 거치지 않도록 별도 axios 인스턴스 사용
    // baseURL에 이미 /channel이 포함되어 있는지 확인
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "";
    const refreshResponse = await axios.get(requests.auth.refresh, {
      baseURL: process.env.NEXT_PUBLIC_BASE_URL,
      headers: {
        Authorization: getAuthorizationHeader() || "",
      },
      withCredentials: true,
    });

    const refreshData = refreshResponse.data as any;
    // 백엔드는 accessToken만 반환 (tokenType은 기본값 "Bearer" 사용)
    if (refreshData?.data?.accessToken) {
      // 새 토큰 저장 (tokenType은 기본값 "Bearer" 사용)
      saveAuthToken("Bearer", refreshData.data.accessToken);
      // 대기 중인 요청들 처리
      processQueue(null, refreshData.data.accessToken);
      // 원래 요청 재시도
      return apiInstance(originalRequest);
    } else {
      throw new Error("Invalid refresh token response");
    }
  } catch (refreshError) {
    // refresh 실패 시 토큰 삭제 및 대기 중인 요청들 실패 처리
    processQueue(refreshError, null);
    clearAuthToken();
    throw refreshError;
  } finally {
    isRefreshing = false;
  }
};

/**
 * 요청 인터셉터: 모든 요청에 Authorization 헤더를 자동으로 주입하고, /channel 프리픽스를 추가합니다.
 */
api.interceptors.request.use((config) => {
  const authHeader = getAuthorizationHeader();
  if (authHeader) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = authHeader;
  }

  // baseURL에 이미 /channel이 포함되어 있는지 확인
  const baseURL = config.baseURL || process.env.NEXT_PUBLIC_BASE_URL || "";
  const hasChannelInBaseURL = baseURL.includes("/channel");

  // baseURL에 /channel이 없고, URL도 /channel로 시작하지 않으면 프리픽스 추가
  if (
    config.url &&
    !hasChannelInBaseURL &&
    !config.url.startsWith("/channel")
  ) {
    config.url = `/channel${config.url}`;
  }

  return config;
});

/**
 * 응답 인터셉터: 응답 처리 및 에러 핸들링
 * - 성공 응답: 응답 데이터 반환
 * - 401 에러: 토큰 refresh 시도 (인증 엔드포인트 제외)
 * - 기타 에러: HttpError로 변환하여 throw
 */
api.interceptors.response.use(
  /**
   * 성공 응답 처리
   * @param res - 성공 응답 객체
   * @returns 응답 데이터
   */
  (res: AxiosResponse<ApiResponse | unknown>) => {
    const p = res.data as any;
    return p;
  },

  /**
   * 에러 응답 처리
   * @param err - 에러 객체
   * @throws HttpError
   */
  async (err: AxiosError<ApiResponse>) => {
    // AbortController로 취소된 요청은 그대로 throw (HttpError로 변환하지 않음)
    if (
      err.code === "ERR_CANCELED" ||
      err.message === "canceled" ||
      err.message?.toLowerCase().includes("canceled")
    ) {
      const canceledError = new Error("Request canceled");
      canceledError.name = "CanceledError";
      throw canceledError;
    }

    const statusCode = err.response?.status ?? 0; // HTTP status
    const payload = err.response?.data;
    const originalRequest = err.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const requestUrl = originalRequest?.url || "";

    // 인증 관련 엔드포인트는 토큰 삭제하지 않음 (로그인, 비밀번호 변경 등)
    const isAuth = isAuthEndpoint(requestUrl);

    // 401 에러이고 토큰이 있는 경우, 그리고 인증 엔드포인트가 아닌 경우에만 refresh 시도
    if (
      statusCode === 401 &&
      hasAuthToken() &&
      !originalRequest._retry &&
      !isAuth
    ) {
      originalRequest._retry = true;
      try {
        return await attemptTokenRefresh(api, originalRequest);
      } catch (refreshError) {
        // refresh 실패는 이미 attemptTokenRefresh에서 처리됨
        throw refreshError;
      }
    }

    // refresh가 아닌 경우 또는 refresh 실패 시
    // 인증 엔드포인트가 아닌 경우에만 토큰 삭제 (비밀번호 틀림 등은 토큰 유지)
    if (statusCode === 401 && !originalRequest._retry && !isAuth) {
      clearAuthToken();
    }

    throw new HttpError({
      statusCode: statusCode,
      message: payload?.message ?? err.message ?? "Request error",
      errorCode: payload?.errorCode,
      url: err.config?.url,
      method: err.config?.method,
      raw: payload ?? err,
    });
  }
);

export default api;
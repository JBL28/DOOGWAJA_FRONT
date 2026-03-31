"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost, apiGet, apiPut, apiDelete } from "@/lib/axios/helpers";
import { saveAuthToken, clearAuthToken } from "@/lib/auth/token";
import { useUserStore } from "@/lib/store/userStore";
import requests from "@/lib/axios/request";
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  User,
  ChangePasswordRequest,
} from "@/types/api";

export function useAuth() {
  const router = useRouter();
  const { setUser, clearUser } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 로그인
  const login = async (data: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiPost<LoginResponse>(requests.auth.login, data);
      saveAuthToken("Bearer", res.accessToken);
      setUser(
        res.user.user_id,
        res.user.nickname,
        res.user.role,
        undefined,
        undefined
      );
      router.push("/");
    } catch (err: any) {
      setError(err?.message ?? "로그인에 실패했습니다.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 회원가입
  const signup = async (data: SignupRequest) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiPost<SignupResponse>(requests.auth.signup, data);
      saveAuthToken("Bearer", res.accessToken);
      setUser(
        res.user.user_id,
        res.user.nickname,
        res.user.role,
        undefined,
        undefined
      );
      router.push("/");
    } catch (err: any) {
      setError(err?.message ?? "회원가입에 실패했습니다.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃
  const logout = async () => {
    try {
      await apiPost(requests.auth.logout);
    } catch { /* 서버 에러여도 클라이언트 정리는 진행 */ } finally {
      clearAuthToken();
      clearUser();
      router.push("/login");
    }
  };

  // 내 프로필 조회
  const getProfile = async (): Promise<User> => {
    return await apiGet<User>(requests.user.getProfile);
  };

  // 닉네임 변경
  const updateProfile = async (nickname: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiPut<User>(requests.user.updateProfile, { nickname });
      const { updateUser } = useUserStore.getState();
      updateUser(res.nickname, res.role);
      return res;
    } catch (err: any) {
      setError(err?.message ?? "프로필 수정에 실패했습니다.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 비밀번호 변경
  const changePassword = async (data: ChangePasswordRequest) => {
    setLoading(true);
    setError(null);
    try {
      await apiPut(requests.auth.changePassword, data);
    } catch (err: any) {
      setError(err?.message ?? "비밀번호 변경에 실패했습니다.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 회원탈퇴
  const deleteAccount = async () => {
    setLoading(true);
    setError(null);
    try {
      await apiDelete(requests.user.deleteAccount);
      clearAuthToken();
      clearUser();
      router.push("/login");
    } catch (err: any) {
      setError(err?.message ?? "회원탈퇴에 실패했습니다.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { login, signup, logout, getProfile, updateProfile, changePassword, deleteAccount, loading, error, setError };
}

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * 사용자 전역 상태 타입 정의
 *
 * ERD: user (user_id, nickname, password_h)
 * - password_h: 응답에 포함되지 않음
 */
interface UserState {
  user_id: number | null;
  nickname: string;
  role?: "admin" | "user";
  bio?: string;
  profileImage?: string;
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  setUser: (
    user_id: number,
    nickname: string,
    role?: "admin" | "user",
    bio?: string,
    profileImage?: string
  ) => void;
  updateUser: (
    nickname?: string,
    role?: "admin" | "user",
    bio?: string,
    profileImage?: string
  ) => void;
  clearUser: () => void;
}

/**
 * 👤 전역 사용자 Store (Zustand + persist)
 *
 * ERD: user 테이블 기반
 * - 로컬스토리지 key: `user`
 * - 새로고침 후에도 상태가 유지됩니다.
 */
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      /** 사용자 ID (ERD: user_id) */
      user_id: null,
      /** 사용자 닉네임 (ERD: nickname) */
      nickname: "",
      /** 사용자 역할 */
      role: undefined,
      /** 사용자 소개 */
      bio: undefined,
      /** 프로필 이미지 */
      profileImage: undefined,
      /** sessionStorage 하이드레이션 완료 여부 */
      _hasHydrated: false,

      setHasHydrated: (v) => set({ _hasHydrated: v }),

      clearUser: () => {
        set({
          user_id: null,
          nickname: "",
          role: undefined,
          bio: undefined,
          profileImage: undefined,
        });
      },

      setUser: (user_id, nickname, role, bio, profileImage) =>
        set({ user_id, nickname, role, bio, profileImage }),

      updateUser: (nickname, role, bio, profileImage) =>
        set((state) => ({
          nickname: nickname ?? state.nickname,
          role: role !== undefined ? role : state.role,
          bio: bio !== undefined ? bio : state.bio,
          profileImage:
            profileImage !== undefined ? profileImage : state.profileImage,
        })),
    }),
    {
      name: "user",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user_id: state.user_id,
        nickname: state.nickname,
        role: state.role,
        bio: state.bio,
        profileImage: state.profileImage,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
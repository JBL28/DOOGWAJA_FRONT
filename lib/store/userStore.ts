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
  role?: 'admin' | 'user';
  bio?: string;
  profileImage?: string;
  setUser: (user_id: number, nickname: string, role?: 'admin' | 'user', bio?: string, profileImage?: string) => void;
  updateUser: (nickname?: string, role?: 'admin' | 'user', bio?: string, profileImage?: string) => void;
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
      
      clearUser: () => {
        set({ user_id: null, nickname: "", role: undefined, bio: undefined, profileImage: undefined });
      },

      /**
       * 사용자 정보를 통합 설정합니다.
       * @param {number} user_id - 사용자 ID (ERD: user_id)
       * @param {string} nickname - 사용자 닉네임 (ERD: nickname)
       * @param {'admin' | 'user'} [role] - 사용자 역할
       * @param {string} [bio] - 사용자 소개
       * @param {string} [profileImage] - 프로필 이미지 URL
       */
      setUser: (user_id, nickname, role, bio, profileImage) =>
        set({
          user_id,
          nickname,
          role,
          bio,
          profileImage,
        }),

      /**
       * 사용자 정보를 개별적으로 변경합니다.
       * @param {string} [nickname] - 사용자 닉네임
       * @param {'admin' | 'user'} [role] - 사용자 역할
       * @param {string} [bio] - 사용자 소개
       * @param {string} [profileImage] - 프로필 이미지 URL
       */
      updateUser: (nickname, role, bio, profileImage) => 
        set((state) => ({
          nickname: nickname ?? state.nickname,
          role: role !== undefined ? role : state.role,
          bio: bio !== undefined ? bio : state.bio,
          profileImage: profileImage !== undefined ? profileImage : state.profileImage,
        })),
    }),
    {
      name: "user",
      version: 1,
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
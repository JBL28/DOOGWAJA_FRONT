import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { useUserStore } from "@/lib/store/userStore";
import { saveAuthToken } from "@/lib/auth/token";

// ── 로그인 상태 헬퍼 ─────────────────────────────────────
export function setLoggedInUser(
  user: Partial<{
    user_id: number;
    nickname: string;
    role: "admin" | "user";
  }> = {}
) {
  const defaults = { user_id: 1, nickname: "testuser", role: "user" as const };
  const merged = { ...defaults, ...user };
  useUserStore.setState({
    user_id: merged.user_id,
    nickname: merged.nickname,
    role: merged.role,
    bio: undefined,
    profileImage: undefined,
  });
  saveAuthToken("Bearer", "mock-access-token");
}

// ── 기본 렌더 래퍼 ───────────────────────────────────────
// 현재 Zustand는 Provider가 필요없으므로 단순 래퍼만 제공
// 향후 Context Provider 추가 시 이곳에서 확장합니다
export function renderWithProviders(
  ui: React.ReactElement,
  options?: RenderOptions
) {
  return render(ui, { ...options });
}

// ── 댓글 픽스처 팩토리 ───────────────────────────────────
export function makeComment(id: number, authorId = 1) {
  return {
    댓글_id: id,
    주문_id: 1,
    사용자Id: authorId,
    내용: `테스트 댓글 ${id}번째 내용`,
    author: {
      user_id: authorId,
      nickname: authorId === 1 ? "testuser" : `user${authorId}`,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    },
    likeCount: 0,
    dislikeCount: 0,
    myFeedback: null as null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  };
}

export function makeBSComment(id: number, authorId = 1) {
  return {
    Key: id,
    구매_id: 1,
    사용자Id: authorId,
    내용: `구매과자 댓글 ${id}번째`,
    author: {
      user_id: authorId,
      nickname: authorId === 1 ? "testuser" : `user${authorId}`,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    },
    likeCount: 0,
    dislikeCount: 0,
    myFeedback: null as null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  };
}

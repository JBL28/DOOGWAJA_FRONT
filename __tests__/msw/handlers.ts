import { http, HttpResponse } from "msw";

const BASE = "http://localhost:8080";

// ── 공통 픽스처 ─────────────────────────────────────────
export const fixtures = {
  user: {
    user_id: 1,
    nickname: "testuser",
    role: "user" as const,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  adminUser: {
    user_id: 2,
    nickname: "admin",
    role: "admin" as const,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  recommendation: {
    주문_id: 1,
    rc_id: 101,
    사용자Id: 1,
    과자이름: "포카칩",
    주문이유: "바삭하고 짭짤해서 너무 맛있어요!",
    author: {
      user_id: 1,
      nickname: "testuser",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    },
    commentCount: 0,
    likeCount: 5,
    dislikeCount: 1,
    myFeedback: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  comment: (id: number, authorId = 1) => ({
    댓글_id: id,
    주문_id: 1,
    사용자Id: authorId,
    내용: `테스트 댓글 ${id}`,
    author: {
      user_id: authorId,
      nickname: authorId === 1 ? "testuser" : "other",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    },
    likeCount: 0,
    dislikeCount: 0,
    myFeedback: null as null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  }),
  boughtSnack: {
    구매_id: 1,
    과자이름: "새우깡",
    상태: "재고있음" as const,
    commentCount: 0,
    likeCount: 3,
    dislikeCount: 0,
    myFeedback: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
};

// ── MSW 핸들러 ───────────────────────────────────────────
export const handlers = [
  // ── 인증 ──
  http.post(`${BASE}/auth/login`, () =>
    HttpResponse.json({
      data: {
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
        user: fixtures.user,
      },
    })
  ),

  http.post(`${BASE}/auth/signup`, () =>
    HttpResponse.json({
      data: {
        accessToken: "mock-access-token",
        user: fixtures.user,
      },
    })
  ),

  http.post(`${BASE}/auth/logout`, () => HttpResponse.json({ data: null })),

  http.put(`${BASE}/auth/password`, () => HttpResponse.json({ data: null })),

  // ── 사용자 ──
  http.get(`${BASE}/users/me`, () =>
    HttpResponse.json({ data: fixtures.user })
  ),

  http.put(`${BASE}/users/me`, () =>
    HttpResponse.json({ data: fixtures.user })
  ),

  http.delete(`${BASE}/users/me`, () => HttpResponse.json({ data: null })),

  // ── 추천 ──
  http.get(`${BASE}/recommendations`, () =>
    HttpResponse.json({
      data: {
        data: [fixtures.recommendation],
        pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
      },
    })
  ),

  http.get(`${BASE}/recommendations/:orderId`, () =>
    HttpResponse.json({ data: fixtures.recommendation })
  ),

  http.post(`${BASE}/recommendations`, () =>
    HttpResponse.json({ data: fixtures.recommendation })
  ),

  http.put(`${BASE}/recommendations/:orderId`, () =>
    HttpResponse.json({ data: { ...fixtures.recommendation, 과자이름: "수정된 과자" } })
  ),

  http.delete(`${BASE}/recommendations/:orderId`, () =>
    HttpResponse.json({ data: null })
  ),

  // ── 추천 댓글 ──
  http.get(`${BASE}/recommendations/:orderId/comments`, () =>
    HttpResponse.json({
      data: {
        data: [],
        pagination: { page: 1, pageSize: 100, total: 0, totalPages: 1 },
      },
    })
  ),

  http.post(`${BASE}/recommendations/:orderId/comments`, () =>
    HttpResponse.json({ data: fixtures.comment(99) })
  ),

  http.put(`${BASE}/recommendations/:orderId/comments/:commentId`, () =>
    HttpResponse.json({ data: { ...fixtures.comment(1), 내용: "수정된 댓글" } })
  ),

  http.delete(
    `${BASE}/recommendations/:orderId/comments/:commentId`,
    () => HttpResponse.json({ data: null })
  ),

  // ── 추천 피드백 ──
  http.post(`${BASE}/recommendations/:orderId/like`, () =>
    HttpResponse.json({ data: null })
  ),
  http.delete(`${BASE}/recommendations/:orderId/like`, () =>
    HttpResponse.json({ data: null })
  ),
  http.post(`${BASE}/recommendations/:orderId/dislike`, () =>
    HttpResponse.json({ data: null })
  ),
  http.delete(`${BASE}/recommendations/:orderId/dislike`, () =>
    HttpResponse.json({ data: null })
  ),

  // ── 구매 과자 ──
  http.get(`${BASE}/bought-snacks`, () =>
    HttpResponse.json({
      data: {
        data: [fixtures.boughtSnack],
        pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
      },
    })
  ),

  http.get(`${BASE}/bought-snacks/:purchaseId`, () =>
    HttpResponse.json({ data: fixtures.boughtSnack })
  ),

  http.put(`${BASE}/bought-snacks/:purchaseId/status`, () =>
    HttpResponse.json({ data: null })
  ),

  // ── 구매 과자 피드백 ──
  http.post(`${BASE}/bought-snacks/:purchaseId/like`, () =>
    HttpResponse.json({ data: null })
  ),
  http.delete(`${BASE}/bought-snacks/:purchaseId/like`, () =>
    HttpResponse.json({ data: null })
  ),
  http.post(`${BASE}/bought-snacks/:purchaseId/dislike`, () =>
    HttpResponse.json({ data: null })
  ),
  http.delete(`${BASE}/bought-snacks/:purchaseId/dislike`, () =>
    HttpResponse.json({ data: null })
  ),

  // ── 구매 과자 댓글 ──
  http.get(`${BASE}/bought-snacks/:purchaseId/comments`, () =>
    HttpResponse.json({
      data: {
        data: [],
        pagination: { page: 1, pageSize: 100, total: 0, totalPages: 1 },
      },
    })
  ),

  http.post(`${BASE}/bought-snacks/:purchaseId/comments`, () =>
    HttpResponse.json({ data: null })
  ),
];

/**
 * API 엔드포인트 경로 모음
 * 
 * ERD 기반 엔드포인트:
 * - /recommendations: 과자 추천 (주문_id, 과자이름, 주문이유)
 * - /recommendations/{주문_id}/comments: 추천 댓글 (댓글_id, 내용)
 * - /recommendations/{주문_id}/feedback: 추천 피드백 (LIKE/DISLIKE)
 * - /bought-snacks: 구매 과자 (구매_id, 과자이름, 상태)
 * - /bought-snacks/{구매_id}/comments: 과자 댓글 (Key, 내용)
 * - /bought-snacks/{구매_id}/feedback: 과자 피드백 (LIKE/DISLIKE)
 * 
 * ERD 테이블: user, recommendation, rc_comment, rcc_feedback, 
 *           bought_snack, bs_comment, bs_feedback
 */
const requests = {
  // ========== 인증 (Authentication) ==========
  auth: {
    login: "/auth/login",
    signup: "/auth/signup",
    logout: "/auth/logout",
    refresh: "/auth/refresh-token",
    changePassword: "/auth/password",
  },

  // ========== 사용자 (User) ==========
  user: {
    getProfile: "/users/me",
    updateProfile: "/users/me",
    deleteAccount: "/users/me",
  },

  // ========== 과자 추천 (Recommendations) ==========
  // ERD: recommendation (주문_id, rc_id, 사용자Id, 과자이름, 주문이유)
  recommendations: {
    list: "/recommendations",
    getDetail: (주문_id: string) => `/recommendations/${주문_id}`,
    create: "/recommendations",
    update: (주문_id: string) => `/recommendations/${주문_id}`,
    delete: (주문_id: string) => `/recommendations/${주문_id}`,
  },

  // ========== 추천 댓글 (Recommendation Comments) ==========
  // ERD: rc_comment (댓글_id, 주문_id, 사용자Id, 내용)
  recommendationComments: {
    list: (주문_id: string) => `/recommendations/${주문_id}/comments`,
    getDetail: (주문_id: string, 댓글_id: string) => 
      `/recommendations/${주문_id}/comments/${댓글_id}`,
    create: (주문_id: string) => `/recommendations/${주문_id}/comments`,
    update: (주문_id: string, 댓글_id: string) => 
      `/recommendations/${주문_id}/comments/${댓글_id}`,
    delete: (주문_id: string, 댓글_id: string) => 
      `/recommendations/${주문_id}/comments/${댓글_id}`,
  },

  // ========== 추천 피드백 (Recommendation Feedback) ==========
  // ERD: rcc_feedback (id, 댓글_id, 주문_id, 사용자Id, 반응 LIKE/DISLIKE)
  recommendationFeedback: {
    like: (주문_id: string) => `/recommendations/${주문_id}/like`,
    unlike: (주문_id: string) => `/recommendations/${주문_id}/like`,
    dislike: (주문_id: string) => `/recommendations/${주문_id}/dislike`,
    undislike: (주문_id: string) => `/recommendations/${주문_id}/dislike`,
    getStats: (주문_id: string) => `/recommendations/${주문_id}/feedback-stats`,
  },

  // ========== 구매한 과자 (Bought Snacks) ==========
  // ERD: bought_snack (구매_id, 과자이름, 상태)
  // 관리자: CRUD 모두 가능, 일반 사용자: 읽기, 댓글, 피드백, 상태변경만 가능
  boughtSnacks: {
    list: "/bought-snacks",
    getDetail: (구매_id: string) => `/bought-snacks/${구매_id}`,
    create: "/bought-snacks",
    update: (구매_id: string) => `/bought-snacks/${구매_id}`,
    delete: (구매_id: string) => `/bought-snacks/${구매_id}`,
  },

  // ========== 구매 과자 커멘트 (Bought Snack Comments) ==========
  // ERD: bs_comment (Key, 구매_id, 사용자Id, 내용)
  boughtSnackComments: {
    list: (구매_id: string) => `/bought-snacks/${구매_id}/comments`,
    getDetail: (구매_id: string, Key: string) => 
      `/bought-snacks/${구매_id}/comments/${Key}`,
    create: (구매_id: string) => `/bought-snacks/${구매_id}/comments`,
    update: (구매_id: string, Key: string) => 
      `/bought-snacks/${구매_id}/comments/${Key}`,
    delete: (구매_id: string, Key: string) => 
      `/bought-snacks/${구매_id}/comments/${Key}`,
  },

  // ========== 구매 과자 피드백 (Bought Snack Feedback) ==========
  // ERD: bs_feedback (id, 구매_id, 사용자Id, 반응 LIKE/DISLIKE)
  // UNIQUE(user_id, bs_id): 사용자당 하나만
  boughtSnackFeedback: {
    like: (구매_id: string) => `/bought-snacks/${구매_id}/like`,
    unlike: (구매_id: string) => `/bought-snacks/${구매_id}/like`,
    dislike: (구매_id: string) => `/bought-snacks/${구매_id}/dislike`,
    undislike: (구매_id: string) => `/bought-snacks/${구매_id}/dislike`,
    getStats: (구매_id: string) => `/bought-snacks/${구매_id}/feedback-stats`,
  },

  // ========== 구매 과자 상태 (Bought Snack Status) ==========
  // 사용자가 변경 가능: 배송중 | 재고있음 | 재고없음
  boughtSnackStatus: {
    update: (구매_id: string) => `/bought-snacks/${구매_id}/status`,
    getMyStatus: (구매_id: string) => `/bought-snacks/${구매_id}/my-status`,
  },
};

export default requests;
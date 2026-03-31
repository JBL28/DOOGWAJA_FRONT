/**
 * 두과자 (DOGWAJA) API 타입 정의
 * 
 * ERD 기반 타입 정의:
 * - user: 사용자 정보 (user_id, nickname, password_h)
 * - recommendation: 과자 추천 게시물 (주문_id, rc_id, 사용자Id, 과자이름, 주문이유)
 * - rc_comment: 추천 댓글 (댓글_id, 주문_id, 사용자Id, 내용)
 * - rcc_feedback: 추천 피드백 (id, 댓글_id, 주문_id, 사용자Id, 반응 LIKE/DISLIKE)
 * - bought_snack: 관리자 관리 과자 (구매_id, 과자이름, 상태)
 * - bs_comment: 과자 댓글 (Key, 구매_id, 사용자Id, 내용)
 * - bs_feedback: 과자 피드백 (id, 구매_id, 사용자Id, 반응 LIKE/DISLIKE)
 */

// ========== 공통 타입 ==========
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errorCode?: string;
}

// ========== 사용자 (User) ==========
export interface User {
  user_id: number;
  nickname: string;
  role?: 'admin' | 'user';  // 관리자 판별용 (JWT token.role 또는 admin 필드)
  createdAt: string;        // ISO 8601
  updatedAt: string;        // ISO 8601
}

// ========== 인증 (Authentication) ==========
export interface LoginRequest {
  nickname: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export interface SignupRequest {
  nickname: string;
  password: string;
}

export interface SignupResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ========== 과자 추천 (Recommendation) ==========
/**
 * 사용자가 추천하는 과자에 대한 게시물
 * 
 * ERD: recommendation (주문_id, rc_id, 사용자Id, 과자이름, 주문이유)
 */
export interface Recommendation {
  주문_id: number;
  rc_id: number;
  사용자Id: number;
  과자이름: string;
  주문이유: string;
  author: User;
  commentCount: number;
  likeCount: number;
  dislikeCount: number;
  myFeedback?: 'LIKE' | 'DISLIKE' | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecommendationRequest {
  과자이름: string;
  주문이유: string;
}

export interface UpdateRecommendationRequest {
  과자이름?: string;
  주문이유?: string;
}

// ========== 추천 댓글 (Recommendation Comment) ==========
/**
 * 과자 추천 게시물에 달린 댓글
 * 
 * ERD: rc_comment (댓글_id, 주문_id, 사용자Id, 내용)
 */
export interface RecommendationComment {
  댓글_id: number;
  주문_id: number;
  사용자Id: number;
  내용: string;
  author: User;
  likeCount: number;
  dislikeCount: number;
  myFeedback?: 'LIKE' | 'DISLIKE' | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecommendationCommentRequest {
  내용: string;
}

export interface UpdateRecommendationCommentRequest {
  내용: string;
}

// ========== 추천 피드백 (Recommendation Feedback) ==========
/**
 * 추천 댓글 또는 게시물에 대한 좋아요/싫어요
 * 
 * ERD: rcc_feedback (id, 댓글_id, 주문_id, 사용자Id, 반응)
 * - UNIQUE(사용자Id, 댓글_id): 사용자당 하나만
 * - 인당 하나만 선택 가능 (LIKE 또는 DISLIKE)
 */
export interface RecommendationFeedback {
  id: number;
  댓글_id: number;
  주문_id: number;
  사용자Id: number;
  반응: 'LIKE' | 'DISLIKE';
  createdAt: string;
}

export interface RecommendationFeedbackStats {
  주문_id: number;
  likeCount: number;
  dislikeCount: number;
  myFeedback?: 'LIKE' | 'DISLIKE' | null;
}

// ========== 구매한 과자 (Bought Snack) ==========
/**
 * 관리자가 관리하는 구매한 과자 목록
 * 
 * ERD: bought_snack (구매_id, 과자이름, 상태)
 * - 일반 사용자: 조회, 댓글, 피드백, 상태변경만 가능
 * - 관리자: CRUD 모두 가능
 */
export type BoughtSnackStatus = '배송중' | '재고있음' | '재고없음';

export interface BoughtSnack {
  구매_id: number;
  과자이름: string;
  상태: BoughtSnackStatus;
  commentCount: number;
  likeCount: number;
  dislikeCount: number;
  myFeedback?: 'LIKE' | 'DISLIKE' | null;
  myStatus?: BoughtSnackStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoughtSnackRequest {
  과자이름: string;
  상태?: BoughtSnackStatus;
}

export interface UpdateBoughtSnackRequest {
  과자이름?: string;
  상태?: BoughtSnackStatus;
}

export interface UpdateBoughtSnackStatusRequest {
  상태: BoughtSnackStatus;
}

// ========== 구매한 과자 댓글 (Bought Snack Comment) ==========
/**
 * 구매한 과자에 대한 댓글/피드백
 * 
 * ERD: bs_comment (Key, 구매_id, 사용자Id, 내용)
 */
export interface BoughtSnackComment {
  Key: number;
  구매_id: number;
  사용자Id: number;
  내용: string;
  author: User;
  likeCount: number;
  dislikeCount: number;
  myFeedback?: 'LIKE' | 'DISLIKE' | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoughtSnackCommentRequest {
  내용: string;
}

export interface UpdateBoughtSnackCommentRequest {
  내용: string;
}

// ========== 구매한 과자 피드백 (Bought Snack Feedback) ==========
/**
 * 구매한 과자 또는 댓글에 대한 좋아요/싫어요
 * 
 * ERD: bs_feedback (id, 구매_id, 사용자Id, 반응)
 * - UNIQUE(사용자Id, 구매_id): 사용자당 하나만
 * - 인당 하나만 선택 가능 (LIKE 또는 DISLIKE)
 */
export interface BoughtSnackFeedback {
  id: number;
  구매_id: number;
  사용자Id: number;
  반응: 'LIKE' | 'DISLIKE';
  createdAt: string;
}

export interface BoughtSnackFeedbackStats {
  구매_id: number;
  likeCount: number;
  dislikeCount: number;
  myFeedback?: 'LIKE' | 'DISLIKE' | null;
}

// ========== 타입 별칭 (Type Aliases) ==========
export type RecommendationListResponse = PaginatedResponse<Recommendation>;
export type RecommendationCommentListResponse = PaginatedResponse<RecommendationComment>;
export type BoughtSnackListResponse = PaginatedResponse<BoughtSnack>;
export type BoughtSnackCommentListResponse = PaginatedResponse<BoughtSnackComment>
"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { useUserStore } from "@/lib/store/userStore";
import { useRecommendations, useRecommendationComments } from "@/hooks/useRecommendations";
import FeedbackButtons from "@/components/common/FeedbackButtons";
import RecommendationCommentSection from "@/components/recommendations/CommentSection";
import type { Recommendation } from "@/types/api";
import { useRouter } from "next/navigation";

interface RecommendationCardProps {
  rec: Recommendation;
  onDeleted?: (id: number) => void;
}

export default function RecommendationCard({ rec, onDeleted }: RecommendationCardProps) {
  const { user_id, _hasHydrated } = useUserStore();
  const router = useRouter();
  const { remove } = useRecommendations();
  // NOTE: user_id(number|null) vs rec.사용자Id(number) → String() 변환으로 타입 불일치 방어
  const isAuthor =
    _hasHydrated && user_id != null && String(user_id) === String(rec.사용자Id);
  const [deleting, setDeleting] = useState(false);
  // onDeleted 콜백 없을 때 로컬에서 즉시 숨김 처리
  const [deleted, setDeleted] = useState(false);
  // 댓글 섹션 토글
  const [showComments, setShowComments] = useState(false);
  const loadedRef = useRef(false);

  const { comments, loading: commentsLoading, fetchComments, addComment, updateComment, removeComment } =
    useRecommendationComments(String(rec.주문_id));

  const handleToggleComments = async () => {
    const next = !showComments;
    setShowComments(next);
    if (next && !loadedRef.current) {
      loadedRef.current = true;
      await fetchComments();
    }
  };

  const handleDelete = async () => {
    // 중복 클릭 방지 guard
    if (deleting) return;
    if (!confirm("이 추천글을 삭제할까요?")) return;
    setDeleting(true);
    try {
      await remove(String(rec.주문_id));
      if (onDeleted) {
        onDeleted(rec.주문_id);
      } else {
        // 부모 콜백 없으면 로컬 상태로 즉시 카드 숨김
        setDeleted(true);
      }
    } catch {
      alert("삭제에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setDeleting(false);
    }
  };

  const timeAgo = formatTimeAgo(rec.createdAt);

  if (deleted) return null;

  return (
    <div
      className="card fade-in"
      style={{ borderLeft: "4px solid var(--color-candy-orange)", position: "relative" }}
    >
      {/* 과자 이름 */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 20 }}>🍬</span>
            <h3
              style={{
                fontWeight: 800,
                fontSize: "1.05rem",
                color: "var(--text-primary)",
              }}
            >
              {rec.과자이름}
            </h3>
          </div>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.9rem",
              lineHeight: 1.6,
              marginBottom: 12,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {rec.주문이유}
          </p>
        </div>
      </div>

      {/* 하단 메타 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <FeedbackButtons
            type="recommendation"
            id={String(rec.주문_id)}
            likeCount={rec.likeCount ?? 0}
            dislikeCount={rec.dislikeCount ?? 0}
            myFeedback={rec.myFeedback}
            size="sm"
          />
          <button
            onClick={handleToggleComments}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              color: showComments ? "var(--color-candy-orange)" : "var(--text-muted)",
              fontSize: "0.8rem",
              fontWeight: 600,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            💬 {rec.commentCount ?? 0}개 댓글 {showComments ? "▲" : "▼"}
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
            {rec.author?.nickname ?? "알 수 없음"} · {timeAgo}
          </span>
          {isAuthor && (
            <div style={{ display: "flex", gap: 4 }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  console.log("수정 버튼 클릭됨, 주문_id:", rec.주문_id);
                  if (typeof window !== "undefined") {
                    window.location.href = `/recommendations/${rec.주문_id}/edit`;
                  }
                }}
              >
                수정
              </button>
              <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleting}>
                삭제
              </button>
            </div>
          )}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              console.log("보기 버튼 클릭됨, 주문_id:", rec.주문_id);
              if (typeof window !== "undefined") {
                window.location.href = `/recommendations/${rec.주문_id}`;
              }
            }}
          >
            보기 →
          </button>
        </div>
      </div>

      {/* 댓글 섹션 */}
      {showComments && (
        <div style={{ marginTop: 16, borderTop: "1px solid var(--border-color)", paddingTop: 16 }}>
          {commentsLoading ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center" }}>🔄 로딩 중...</p>
          ) : (
            <RecommendationCommentSection
              주문_id={String(rec.주문_id)}
              comments={comments}
              onAdd={async (내용) => { await addComment({ 내용 }); }}
              onUpdate={async (댓글_id, 내용) => { await updateComment(댓글_id, { 내용 }); }}
              onDelete={removeComment}
            />
          )}
        </div>
      )}
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "방금 전";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}일 전`;
  return new Date(dateStr).toLocaleDateString("ko-KR");
}

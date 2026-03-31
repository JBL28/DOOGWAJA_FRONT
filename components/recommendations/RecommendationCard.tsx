"use client";

import Link from "next/link";
import { useState } from "react";
import { useUserStore } from "@/lib/store/userStore";
import { useRecommendations } from "@/hooks/useRecommendations";
import FeedbackButtons from "@/components/common/FeedbackButtons";
import type { Recommendation } from "@/types/api";

interface RecommendationCardProps {
  rec: Recommendation;
  onDeleted?: (id: number) => void;
}

export default function RecommendationCard({ rec, onDeleted }: RecommendationCardProps) {
  const { user_id } = useUserStore();
  const { remove } = useRecommendations();
  const isAuthor = user_id === rec.사용자Id;
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("이 추천글을 삭제할까요?")) return;
    setDeleting(true);
    try {
      await remove(String(rec.주문_id));
      onDeleted?.(rec.주문_id);
    } catch { /* pass */ } finally {
      setDeleting(false);
    }
  };

  const timeAgo = formatTimeAgo(rec.createdAt);

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
          <Link
            href={`/recommendations/${rec.주문_id}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              color: "var(--text-muted)",
              fontSize: "0.8rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            💬 {rec.commentCount ?? 0}개 댓글
          </Link>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
            {rec.author?.nickname ?? "알 수 없음"} · {timeAgo}
          </span>
          {isAuthor && (
            <div style={{ display: "flex", gap: 4 }}>
              <Link href={`/recommendations/${rec.주문_id}/edit`} className="btn btn-ghost btn-sm">
                수정
              </Link>
              <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleting}>
                삭제
              </button>
            </div>
          )}
          <Link href={`/recommendations/${rec.주문_id}`} className="btn btn-secondary btn-sm">
            보기 →
          </Link>
        </div>
      </div>
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

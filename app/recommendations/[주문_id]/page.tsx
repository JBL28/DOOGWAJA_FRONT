"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import FeedbackButtons from "@/components/common/FeedbackButtons";
import RecommendationCommentSection from "@/components/recommendations/CommentSection";
import { useRecommendations, useRecommendationComments } from "@/hooks/useRecommendations";
import { useUserStore } from "@/lib/store/userStore";
import type { Recommendation } from "@/types/api";
import Link from "next/link";

export default function RecommendationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const 주문_id = String(params["주문_id"] ?? params.id ?? "");
  const { getDetail, remove } = useRecommendations();
  const { comments, loading: cLoading, fetchComments, addComment, updateComment, removeComment } =
    useRecommendationComments(주문_id);
  const { user_id, _hasHydrated } = useUserStore();

  const [rec, setRec] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!주문_id) return;
    setLoading(true);
    getDetail(주문_id)
      .then(setRec)
      .catch(() => router.push("/"))
      .finally(() => setLoading(false));
    fetchComments();
  }, [주문_id]);

  const handleDelete = async () => {
    if (!confirm("이 추천글을 삭제할까요?")) return;
    setDeleting(true);
    try {
      await remove(주문_id);
      router.push("/");
    } catch { setDeleting(false); }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" />
      </div>
    </div>
  );
  if (!rec) return null;

  const isAuthor = _hasHydrated && user_id === rec.사용자Id;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <main className="page-wrapper" style={{ flex: 1, maxWidth: 760 }}>
        {/* 뒤로가기 */}
        <Link href="/" style={{ color: "var(--color-candy-orange)", fontWeight: 700, fontSize: "0.88rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 20 }}>
          ← 목록으로
        </Link>

        {/* 추천글 본문 */}
        <div className="card fade-in" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 28 }}>🍬</span>
            <h1 style={{ fontWeight: 900, fontSize: "1.5rem", color: "var(--text-primary)" }}>
              {rec.과자이름}
            </h1>
          </div>

          <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, fontSize: "0.95rem", marginBottom: 20 }}>
            {rec.주문이유}
          </p>

          <div className="divider" />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <FeedbackButtons
                type="recommendation"
                id={주문_id}
                likeCount={rec.likeCount ?? 0}
                dislikeCount={rec.dislikeCount ?? 0}
                myFeedback={rec.myFeedback}
              />
              <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                {rec.author?.nickname} · {new Date(rec.createdAt).toLocaleDateString("ko-KR")}
              </span>
            </div>
            {isAuthor && (
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => router.push(`/recommendations/${주문_id}/edit`)}
                >
                  수정
                </button>
                <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleting}>삭제</button>
              </div>
            )}
          </div>
        </div>

        {/* 댓글 */}
        <div className="card fade-in">
          <RecommendationCommentSection
            주문_id={주문_id}
            comments={comments}
            onAdd={async (content) => { await addComment({ 내용: content }); }}
            onUpdate={async (id, content) => { await updateComment(id, { 내용: content }); }}
            onDelete={async (id) => { await removeComment(id); }}
          />
        </div>
      </main>
    </div>
  );
}

function LoadingPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" />
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/common/Header";
import FeedbackButtons from "@/components/common/FeedbackButtons";
import BoughtSnackCommentSection from "@/components/bought-snacks/CommentSection";
import { useBoughtSnacks, useBoughtSnackComments } from "@/hooks/useBoughtSnacks";
import { useUserStore } from "@/lib/store/userStore";
import type { BoughtSnack, BoughtSnackStatus } from "@/types/api";
import Link from "next/link";

const STATUS_CONFIG: Record<BoughtSnackStatus, { emoji: string; cls: string }> = {
  "배송중":   { emoji: "🚚", cls: "status-배송중" },
  "재고있음": { emoji: "✅", cls: "status-재고있음" },
  "재고없음": { emoji: "❌", cls: "status-재고없음" },
};
const ALL_STATUSES: BoughtSnackStatus[] = ["배송중", "재고있음", "재고없음"];

export default function BoughtSnackDetailPage() {
  const params = useParams();
  const 구매_id = String(params["구매_id"] ?? "");
  const { getDetail, updateStatus } = useBoughtSnacks();
  const { comments, loading: cLoading, fetchComments, addComment, updateComment, removeComment } =
    useBoughtSnackComments(구매_id);
  const { user_id } = useUserStore();

  const [snack, setSnack] = useState<BoughtSnack | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<BoughtSnackStatus>("재고있음");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (!구매_id) return;
    setLoading(true);
    getDetail(구매_id)
      .then((s) => { setSnack(s); setCurrentStatus(s.상태); })
      .catch(console.error)
      .finally(() => setLoading(false));
    fetchComments();
  }, [구매_id]);

  const handleStatusChange = async (s: BoughtSnackStatus) => {
    if (!user_id || s === currentStatus || updatingStatus) return;
    setUpdatingStatus(true);
    try {
      await updateStatus(구매_id, s);
      setCurrentStatus(s);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" />
      </div>
    </div>
  );
  if (!snack) return null;

  const statusConf = STATUS_CONFIG[currentStatus];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <main className="page-wrapper" style={{ flex: 1, maxWidth: 760 }}>
        <Link href="/" style={{ color: "var(--color-candy-orange)", fontWeight: 700, fontSize: "0.88rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 20 }}>
          ← 목록으로
        </Link>

        {/* 과자 상세 */}
        <div className="card fade-in" style={{ marginBottom: 24, borderLeft: "4px solid var(--color-candy-yellow)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 32 }}>🛒</span>
              <h1 style={{ fontWeight: 900, fontSize: "1.5rem", color: "var(--text-primary)" }}>
                {snack.과자이름}
              </h1>
            </div>
            <span className={`badge ${statusConf.cls}`} style={{ fontSize: "0.9rem", padding: "5px 14px" }}>
              {statusConf.emoji} {currentStatus}
            </span>
          </div>

          {/* 상태 변경 */}
          {user_id && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: 8 }}>
                상태 변경:
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                {ALL_STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    disabled={updatingStatus}
                    style={{
                      padding: "6px 16px",
                      borderRadius: 999,
                      border: "1.5px solid",
                      borderColor: s === currentStatus ? "var(--color-candy-orange)" : "var(--border-color)",
                      background: s === currentStatus ? "rgba(255,107,53,0.1)" : "#fff",
                      color: s === currentStatus ? "var(--color-candy-orange)" : "var(--text-secondary)",
                      fontWeight: s === currentStatus ? 800 : 600,
                      fontSize: "0.85rem",
                      cursor: updatingStatus ? "not-allowed" : "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {STATUS_CONFIG[s].emoji} {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="divider" />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <FeedbackButtons
              type="boughtSnack"
              id={구매_id}
              likeCount={snack.likeCount ?? 0}
              dislikeCount={snack.dislikeCount ?? 0}
              myFeedback={snack.myFeedback}
            />
            <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
              등록일: {new Date(snack.createdAt).toLocaleDateString("ko-KR")}
            </span>
          </div>
        </div>

        {/* 댓글 */}
        <div className="card fade-in">
          <BoughtSnackCommentSection
            구매_id={구매_id}
            comments={comments}
            onAdd={async (content) => { await addComment({ 내용: content }); }}
            onUpdate={async (key, content) => { await updateComment(key, { 내용: content }); }}
            onDelete={async (key) => { await removeComment(key); }}
          />
        </div>
      </main>
    </div>
  );
}

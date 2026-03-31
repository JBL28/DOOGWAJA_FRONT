"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import FeedbackButtons from "@/components/common/FeedbackButtons";
import type { BoughtSnack, BoughtSnackStatus } from "@/types/api";
import { useUserStore } from "@/lib/store/userStore";
import { useBoughtSnacks, useBoughtSnackComments } from "@/hooks/useBoughtSnacks";
import BoughtSnackCommentSection from "@/components/bought-snacks/CommentSection";
import { useRouter } from "next/navigation";

const STATUS_LABELS: Record<BoughtSnackStatus, { emoji: string; label: string; cls: string }> = {
  "배송중":   { emoji: "🚚", label: "배송중",   cls: "status-배송중" },
  "재고있음": { emoji: "✅", label: "재고있음", cls: "status-재고있음" },
  "재고없음": { emoji: "❌", label: "재고없음", cls: "status-재고없음" },
};

interface BoughtSnackCardProps {
  snack: BoughtSnack;
  onStatusChanged?: (id: number, newStatus: BoughtSnackStatus) => void;
}

export default function BoughtSnackCard({ snack, onStatusChanged }: BoughtSnackCardProps) {
  const { user_id, role } = useUserStore();
  const isAdmin = role === 'admin';
  const router = useRouter();
  const { updateStatus, updateBoughtSnack, deleteBoughtSnack } = useBoughtSnacks();
  const [currentStatus, setCurrentStatus] = useState<BoughtSnackStatus>(snack.상태);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  // 댓글 섹션 토글
  const [showComments, setShowComments] = useState(false);
  const loadedRef = useRef(false);

  // ADMIN 기능
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(snack.과자이름);
  const [editStatus, setEditStatus] = useState<BoughtSnackStatus>(snack.상태);
  const [updating, setUpdating] = useState(false);

  const { comments, loading: commentsLoading, fetchComments, addComment, updateComment, removeComment } =
    useBoughtSnackComments(String(snack.구매_id));

  const handleToggleComments = async () => {
    const next = !showComments;
    setShowComments(next);
    if (next && !loadedRef.current) {
      loadedRef.current = true;
      await fetchComments();
    }
  };

  const statusInfo = STATUS_LABELS[currentStatus];

  const STATUSES: BoughtSnackStatus[] = ["배송중", "재고있음", "재고없음"];

  const handleStatusChange = async (newStatus: BoughtSnackStatus) => {
    if (!user_id || newStatus === currentStatus || updatingStatus) return;
    setUpdatingStatus(true);
    const prevStatus = currentStatus; // 실패 시 롤백을 위해 저장
    try {
      await updateStatus(String(snack.구매_id), newStatus);
      setCurrentStatus(newStatus);
      onStatusChanged?.(snack.구매_id, newStatus);
    } catch {
      setCurrentStatus(prevStatus); // 화면 롤백
      alert("상태 변경에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleEdit = async () => {
    if (!editName.trim()) return;
    setUpdating(true);
    try {
      await updateBoughtSnack(String(snack.구매_id), { 과자이름: editName, 상태: editStatus });
      setEditing(false);
      // 성공 시 상태 갱신
      setCurrentStatus(editStatus);
    } catch (err: any) {
      alert(err?.message ?? "수정에 실패했습니다.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("정말 이 과자를 삭제하시겠습니까?")) return;
    setUpdating(true);
    try {
      await deleteBoughtSnack(String(snack.구매_id));
      // 삭제 성공 시 부모에서 제거
      onStatusChanged?.(snack.구매_id, currentStatus); // 임시로 사용
    } catch (err: any) {
      alert(err?.message ?? "삭제에 실패했습니다.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div
      className="card fade-in"
      style={{ borderLeft: "4px solid var(--color-candy-yellow)" }}
    >
      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
          <span style={{ fontSize: 22 }}>🛒</span>
          {editing ? (
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              style={{
                fontWeight: 800,
                fontSize: "1.05rem",
                color: "var(--text-primary)",
                border: "1px solid var(--border-color)",
                borderRadius: 4,
                padding: "4px 8px",
                flex: 1,
              }}
            />
          ) : (
            <h3 style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--text-primary)" }}>
              {snack.과자이름}
            </h3>
          )}
        </div>
        {editing ? (
          <select
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value as BoughtSnackStatus)}
            style={{
              padding: "4px 8px",
              borderRadius: 6,
              border: "1px solid var(--border-color)",
              fontSize: "0.8rem",
            }}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s].emoji} {s}
              </option>
            ))}
          </select>
        ) : (
          <span className={`badge ${statusInfo.cls}`}>
            {statusInfo.emoji} {statusInfo.label}
          </span>
        )}
      </div>

      {/* 상태 변경 버튼 (로그인 시) */}
      {user_id && (
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600, alignSelf: "center" }}>
            상태:
          </span>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              disabled={updatingStatus}
              style={{
                padding: "3px 10px",
                borderRadius: 999,
                border: "1.5px solid",
                borderColor: s === currentStatus ? "var(--color-candy-orange)" : "var(--border-color)",
                background: s === currentStatus ? "rgba(255,107,53,0.1)" : "#fff",
                color: s === currentStatus ? "var(--color-candy-orange)" : "var(--text-secondary)",
                fontWeight: s === currentStatus ? 800 : 600,
                fontSize: "0.78rem",
                cursor: updatingStatus ? "not-allowed" : "pointer",
                transition: "all 0.15s",
              }}
            >
              {STATUS_LABELS[s].emoji} {s}
            </button>
          ))}
        </div>
      )}

      {/* ADMIN 버튼 */}
      {isAdmin && (
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {editing ? (
            <>
              <button
                onClick={() => setEditing(false)}
                disabled={updating}
                style={{
                  padding: "4px 12px",
                  borderRadius: 6,
                  border: "1px solid var(--border-color)",
                  background: "#fff",
                  color: "var(--text-secondary)",
                  fontSize: "0.8rem",
                  cursor: updating ? "not-allowed" : "pointer",
                }}
              >
                취소
              </button>
              <button
                onClick={handleEdit}
                disabled={updating || !editName.trim()}
                style={{
                  padding: "4px 12px",
                  borderRadius: 6,
                  border: "none",
                  background: "var(--color-candy-orange)",
                  color: "white",
                  fontSize: "0.8rem",
                  cursor: updating || !editName.trim() ? "not-allowed" : "pointer",
                }}
              >
                {updating ? "저장 중..." : "저장"}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                style={{
                  padding: "4px 12px",
                  borderRadius: 6,
                  border: "1px solid var(--border-color)",
                  background: "#fff",
                  color: "var(--text-secondary)",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                }}
              >
                ✏️ 수정
              </button>
              <button
                onClick={handleDelete}
                disabled={updating}
                style={{
                  padding: "4px 12px",
                  borderRadius: 6,
                  border: "none",
                  background: "#dc3545",
                  color: "white",
                  fontSize: "0.8rem",
                  cursor: updating ? "not-allowed" : "pointer",
                }}
              >
                🗑️ 삭제
              </button>
            </>
          )}
        </div>
      )}

      {/* 하단 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <FeedbackButtons
            type="boughtSnack"
            id={String(snack.구매_id)}
            likeCount={snack.likeCount ?? 0}
            dislikeCount={snack.dislikeCount ?? 0}
            myFeedback={snack.myFeedback}
            size="sm"
          />
          <button
            onClick={handleToggleComments}
            style={{
              color: showComments ? "var(--color-candy-orange)" : "var(--text-muted)",
              fontSize: "0.8rem",
              fontWeight: 600,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            💬 {snack.commentCount ?? 0}개 댓글 {showComments ? "▲" : "▼"}
          </button>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => {
            console.log("상세 버튼 클릭됨, 구매_id:", snack.구매_id);
            if (typeof window !== "undefined") {
              window.location.href = `/bought-snacks/${snack.구매_id}`;
            }
          }}
        >
          상세 →
        </button>
      </div>

      {/* 댓글 섹션 */}
      {showComments && (
        <div style={{ marginTop: 16, borderTop: "1px solid var(--border-color)", paddingTop: 16 }}>
          {commentsLoading ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center" }}>🔄 로딩 중...</p>
          ) : (
            <BoughtSnackCommentSection
              구매_id={String(snack.구매_id)}
              comments={comments}
              onAdd={async (내용) => { await addComment({ 내용 }); }}
              onUpdate={async (Key, 내용) => { await updateComment(Key, { 내용 }); }}
              onDelete={removeComment}
            />
          )}
        </div>
      )}
    </div>
  );
}

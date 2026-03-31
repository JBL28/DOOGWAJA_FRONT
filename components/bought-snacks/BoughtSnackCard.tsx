"use client";

import Link from "next/link";
import { useState } from "react";
import FeedbackButtons from "@/components/common/FeedbackButtons";
import type { BoughtSnack, BoughtSnackStatus } from "@/types/api";
import { useUserStore } from "@/lib/store/userStore";
import { useBoughtSnacks } from "@/hooks/useBoughtSnacks";

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
  const { user_id } = useUserStore();
  const { updateStatus } = useBoughtSnacks();
  const [currentStatus, setCurrentStatus] = useState<BoughtSnackStatus>(snack.상태);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const statusInfo = STATUS_LABELS[currentStatus];

  const STATUSES: BoughtSnackStatus[] = ["배송중", "재고있음", "재고없음"];

  const handleStatusChange = async (newStatus: BoughtSnackStatus) => {
    if (!user_id || newStatus === currentStatus || updatingStatus) return;
    setUpdatingStatus(true);
    try {
      await updateStatus(String(snack.구매_id), newStatus);
      setCurrentStatus(newStatus);
      onStatusChanged?.(snack.구매_id, newStatus);
    } catch { /* pass */ } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div
      className="card fade-in"
      style={{ borderLeft: "4px solid var(--color-candy-yellow)" }}
    >
      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 22 }}>🛒</span>
          <h3 style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--text-primary)" }}>
            {snack.과자이름}
          </h3>
        </div>
        <span className={`badge ${statusInfo.cls}`}>
          {statusInfo.emoji} {statusInfo.label}
        </span>
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
          <Link
            href={`/bought-snacks/${snack.구매_id}`}
            style={{
              color: "var(--text-muted)",
              fontSize: "0.8rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            💬 {snack.commentCount ?? 0}개 댓글
          </Link>
        </div>
        <Link href={`/bought-snacks/${snack.구매_id}`} className="btn btn-secondary btn-sm">
          상세 →
        </Link>
      </div>
    </div>
  );
}

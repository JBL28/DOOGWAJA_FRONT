"use client";

import { useState } from "react";
import { useUserStore } from "@/lib/store/userStore";
import { useBoughtSnackComments } from "@/hooks/useBoughtSnacks";
import FeedbackButtons from "@/components/common/FeedbackButtons";
import type { BoughtSnackComment } from "@/types/api";

interface BoughtSnackCommentSectionProps {
  구매_id: string;
  comments: BoughtSnackComment[];
  onAdd: (내용: string) => Promise<void>;
  onUpdate: (Key: string, 내용: string) => Promise<void>;
  onDelete: (Key: string) => Promise<void>;
}

export default function BoughtSnackCommentSection({
  구매_id,
  comments,
  onAdd,
  onUpdate,
  onDelete,
}: BoughtSnackCommentSectionProps) {
  const { user_id } = useUserStore();
  const [newContent, setNewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const FOLD_COUNT = 5;
  const shouldFold = comments.length > FOLD_COUNT;
  const visibleComments = shouldFold && !expanded ? comments.slice(0, FOLD_COUNT) : comments;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newContent.trim().length < 2) return;
    setSubmitting(true);
    try {
      await onAdd(newContent.trim());
      setNewContent("");
    } catch { /* pass */ } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h3 style={{ fontWeight: 800, fontSize: "0.98rem", marginBottom: 12 }}>
        💬 댓글 {comments.length}개
      </h3>

      <div style={{ marginBottom: 16 }}>
        {comments.length === 0 && (
          <div className="empty-state" style={{ padding: "24px 0" }}>
            <span>아직 댓글이 없어요!</span>
          </div>
        )}
        {visibleComments.map((c) => (
          <BSCommentItem
            key={c.Key}
            comment={c}
            구매_id={구매_id}
            isAuthor={user_id === c.사용자Id}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
        {shouldFold && (
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              width: "100%",
              padding: "8px",
              background: "rgba(255,209,102,0.12)",
              border: "1.5px dashed var(--color-candy-yellow)",
              borderRadius: 10,
              color: "#8B6000",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
              marginTop: 8,
            }}
          >
            {expanded ? "▲ 접기" : `▼ ${comments.length - FOLD_COUNT}개 댓글 더 보기`}
          </button>
        )}
      </div>

      {user_id ? (
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
          <input
            className="input"
            placeholder="댓글을 입력하세요 (최소 2자)"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            minLength={2}
            maxLength={500}
            style={{ flex: 1 }}
          />
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={submitting || newContent.trim().length < 2}
          >
            {submitting ? "..." : "등록"}
          </button>
        </form>
      ) : (
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center" }}>
          댓글을 작성하려면 로그인이 필요합니다.
        </p>
      )}
    </div>
  );
}

function BSCommentItem({
  comment,
  구매_id,
  isAuthor,
  onUpdate,
  onDelete,
}: {
  comment: BoughtSnackComment;
  구매_id: string;
  isAuthor: boolean;
  onUpdate: (key: string, content: string) => Promise<void>;
  onDelete: (key: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.내용);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (editContent.trim().length < 2) return;
    setSaving(true);
    try {
      await onUpdate(String(comment.Key), editContent.trim());
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="comment-item">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: "0.82rem", color: "#8B6000" }}>
              {comment.author?.nickname ?? "알 수 없음"}
            </span>
            <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
              {new Date(comment.createdAt).toLocaleDateString("ko-KR")}
            </span>
          </div>
          {editing ? (
            <div style={{ display: "flex", gap: 6 }}>
              <input
                className="input"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                style={{ flex: 1, fontSize: "0.85rem" }}
              />
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>저장</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>취소</button>
            </div>
          ) : (
            <p style={{ color: "var(--text-primary)", fontSize: "0.88rem", lineHeight: 1.5 }}>
              {comment.내용}
            </p>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <FeedbackButtons
            type="boughtSnack"
            id={구매_id}
            likeCount={comment.likeCount}
            dislikeCount={comment.dislikeCount}
            myFeedback={comment.myFeedback}
            size="sm"
          />
          {isAuthor && !editing && (
            <div style={{ display: "flex", gap: 4 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>수정</button>
              <button className="btn btn-danger btn-sm" onClick={() => onDelete(String(comment.Key))}>삭제</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

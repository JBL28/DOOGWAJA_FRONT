"use client";

import { useFeedback } from "@/hooks/useFeedback";

interface FeedbackButtonsProps {
  type: "recommendation" | "boughtSnack";
  id: string;
  likeCount: number;
  dislikeCount: number;
  myFeedback?: "LIKE" | "DISLIKE" | null;
  size?: "sm" | "md";
}

export default function FeedbackButtons({
  type,
  id,
  likeCount,
  dislikeCount,
  myFeedback: initFeedback,
  size = "md",
}: FeedbackButtonsProps) {
  const {
    likeCount: likes,
    dislikeCount: dislikes,
    myFeedback,
    loading,
    handleLike,
    handleDislike,
    handleUnlike,
    handleUndislike,
    isLoggedIn,
  } = useFeedback({
    type,
    id,
    initialLikeCount: likeCount,
    initialDislikeCount: dislikeCount,
    initialMyFeedback: initFeedback,
  });

  const pad = size === "sm" ? "4px 10px" : "6px 14px";
  const fs = size === "sm" ? "0.78rem" : "0.85rem";

  const handleLikeClick = () => {
    if (myFeedback === "LIKE") handleUnlike();
    else handleLike();
  };

  const handleDislikeClick = () => {
    if (myFeedback === "DISLIKE") handleUndislike();
    else handleDislike();
  };

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <button
        className={`feedback-btn${myFeedback === "LIKE" ? " active-like" : ""}`}
        style={{ padding: pad, fontSize: fs }}
        onClick={handleLikeClick}
        disabled={loading || !isLoggedIn}
        title={!isLoggedIn ? "로그인이 필요합니다" : undefined}
      >
        👍 {likes}
      </button>
      <button
        className={`feedback-btn${myFeedback === "DISLIKE" ? " active-dislike" : ""}`}
        style={{ padding: pad, fontSize: fs }}
        onClick={handleDislikeClick}
        disabled={loading || !isLoggedIn}
        title={!isLoggedIn ? "로그인이 필요합니다" : undefined}
      >
        👎 {dislikes}
      </button>
    </div>
  );
}

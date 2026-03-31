"use client";

import { useState, useCallback } from "react";
import { apiPost, apiDelete } from "@/lib/axios/helpers";
import requests from "@/lib/axios/request";
import { useUserStore } from "@/lib/store/userStore";

type FeedbackType = "LIKE" | "DISLIKE";

interface UseFeedbackOptions {
  type: "recommendation" | "boughtSnack";
  id: string;
  initialLikeCount?: number;
  initialDislikeCount?: number;
  initialMyFeedback?: FeedbackType | null;
}

export function useFeedback({
  type,
  id,
  initialLikeCount = 0,
  initialDislikeCount = 0,
  initialMyFeedback = null,
}: UseFeedbackOptions) {
  const { user_id } = useUserStore();
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [dislikeCount, setDislikeCount] = useState(initialDislikeCount);
  const [myFeedback, setMyFeedback] = useState<FeedbackType | null>(
    initialMyFeedback ?? null
  );
  const [loading, setLoading] = useState(false);

  const getLikeUrl = () =>
    type === "recommendation"
      ? requests.recommendationFeedback.like(id)
      : requests.boughtSnackFeedback.like(id);
  const getDislikeUrl = () =>
    type === "recommendation"
      ? requests.recommendationFeedback.dislike(id)
      : requests.boughtSnackFeedback.dislike(id);

  const handleLike = useCallback(async () => {
    if (!user_id || loading) return;
    setLoading(true);
    try {
      if (myFeedback === "LIKE") {
        // 이미 좋아요 → idempotent (무시)
        return;
      }
      if (myFeedback === "DISLIKE") {
        // 싫어요 취소 후 좋아요
        await apiDelete(getDislikeUrl());
        setDislikeCount((c) => Math.max(0, c - 1));
      }
      await apiPost(getLikeUrl());
      setLikeCount((c) => c + 1);
      setMyFeedback("LIKE");
    } catch (err) {
      console.error("USEFEEDBACK ERROR:", err);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myFeedback, loading, user_id, id, type]);

  const handleDislike = useCallback(async () => {
    if (!user_id || loading) return;
    setLoading(true);
    try {
      if (myFeedback === "DISLIKE") {
        // 이미 싫어요 → idempotent (무시)
        return;
      }
      if (myFeedback === "LIKE") {
        // 좋아요 취소 후 싫어요
        await apiDelete(getLikeUrl());
        setLikeCount((c) => Math.max(0, c - 1));
      }
      await apiPost(getDislikeUrl());
      setDislikeCount((c) => c + 1);
      setMyFeedback("DISLIKE");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myFeedback, loading, user_id, id, type]);

  const handleUnlike = useCallback(async () => {
    if (!user_id || loading || myFeedback !== "LIKE") return;
    setLoading(true);
    try {
      await apiDelete(getLikeUrl());
      setLikeCount((c) => Math.max(0, c - 1));
      setMyFeedback(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myFeedback, loading, user_id, id, type]);

  const handleUndislike = useCallback(async () => {
    if (!user_id || loading || myFeedback !== "DISLIKE") return;
    setLoading(true);
    try {
      await apiDelete(getDislikeUrl());
      setDislikeCount((c) => Math.max(0, c - 1));
      setMyFeedback(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myFeedback, loading, user_id, id, type]);

  return {
    likeCount,
    dislikeCount,
    myFeedback,
    loading,
    handleLike,
    handleDislike,
    handleUnlike,
    handleUndislike,
    isLoggedIn: !!user_id,
  };
}

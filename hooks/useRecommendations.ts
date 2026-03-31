"use client";

import { useState, useCallback } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/axios/helpers";
import requests from "@/lib/axios/request";
import type {
  Recommendation,
  RecommendationListResponse,
  RecommendationComment,
  RecommendationCommentListResponse,
  CreateRecommendationRequest,
  UpdateRecommendationRequest,
  CreateRecommendationCommentRequest,
} from "@/types/api";

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchList = useCallback(async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const res = await apiGet<RecommendationListResponse>(
        `${requests.recommendations.list}?page=${page}&pageSize=${pageSize}`
      );
      setRecommendations(res.data);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getDetail = async (주문_id: string): Promise<Recommendation> => {
    return await apiGet<Recommendation>(requests.recommendations.getDetail(주문_id));
  };

  const create = async (data: CreateRecommendationRequest): Promise<Recommendation> => {
    return await apiPost<Recommendation>(requests.recommendations.create, data);
  };

  const update = async (주문_id: string, data: UpdateRecommendationRequest): Promise<Recommendation> => {
    return await apiPut<Recommendation>(requests.recommendations.update(주문_id), data);
  };

  const remove = async (주문_id: string): Promise<void> => {
    await apiDelete(requests.recommendations.delete(주문_id));
  };

  return { recommendations, total, totalPages, loading, fetchList, getDetail, create, update, remove };
}

export function useRecommendationComments(주문_id: string) {
  const [comments, setComments] = useState<RecommendationComment[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async (page = 1, pageSize = 100) => {
    setLoading(true);
    try {
      const res = await apiGet<RecommendationCommentListResponse>(
        `${requests.recommendationComments.list(주문_id)}?page=${page}&pageSize=${pageSize}`
      );
      setComments(res.data);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [주문_id]);

  const addComment = async (data: CreateRecommendationCommentRequest): Promise<RecommendationComment> => {
    const newComment = await apiPost<RecommendationComment>(
      requests.recommendationComments.create(주문_id),
      data
    );
    setComments((prev) => [...prev, newComment]);
    return newComment;
  };

  const updateComment = async (댓글_id: string, data: { 내용: string }): Promise<RecommendationComment> => {
    const updated = await apiPut<RecommendationComment>(
      requests.recommendationComments.update(주문_id, 댓글_id),
      data
    );
    setComments((prev) => prev.map((c) => (String(c.댓글_id) === 댓글_id ? updated : c)));
    return updated;
  };

  const removeComment = async (댓글_id: string): Promise<void> => {
    await apiDelete(requests.recommendationComments.delete(주문_id, 댓글_id));
    setComments((prev) => prev.filter((c) => String(c.댓글_id) !== 댓글_id));
  };

  return { comments, totalPages, loading, fetchComments, addComment, updateComment, removeComment };
}

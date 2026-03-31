"use client";

import { useState, useCallback } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/axios/helpers";
import requests from "@/lib/axios/request";
import type {
  BoughtSnack,
  BoughtSnackListResponse,
  BoughtSnackComment,
  BoughtSnackCommentListResponse,
  BoughtSnackStatus,
  CreateBoughtSnackCommentRequest,
} from "@/types/api";

export function useBoughtSnacks() {
  const [snacks, setSnacks] = useState<BoughtSnack[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchList = useCallback(async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const res = await apiGet<BoughtSnackListResponse>(
        `${requests.boughtSnacks.list}?page=${page}&pageSize=${pageSize}`
      );
      setSnacks(res.data);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getDetail = async (구매_id: string): Promise<BoughtSnack> => {
    return await apiGet<BoughtSnack>(requests.boughtSnacks.getDetail(구매_id));
  };

  const updateStatus = async (구매_id: string, 상태: BoughtSnackStatus): Promise<void> => {
    await apiPut(requests.boughtSnackStatus.update(구매_id), { 상태 });
  };

  return { snacks, total, totalPages, loading, fetchList, getDetail, updateStatus };
}

export function useBoughtSnackComments(구매_id: string) {
  const [comments, setComments] = useState<BoughtSnackComment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async (page = 1, pageSize = 100) => {
    setLoading(true);
    try {
      const res = await apiGet<BoughtSnackCommentListResponse>(
        `${requests.boughtSnackComments.list(구매_id)}?page=${page}&pageSize=${pageSize}`
      );
      setComments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [구매_id]);

  const addComment = async (data: CreateBoughtSnackCommentRequest): Promise<BoughtSnackComment> => {
    const newComment = await apiPost<BoughtSnackComment>(
      requests.boughtSnackComments.create(구매_id),
      data
    );
    setComments((prev) => [...prev, newComment]);
    return newComment;
  };

  const updateComment = async (Key: string, data: { 내용: string }): Promise<BoughtSnackComment> => {
    const updated = await apiPut<BoughtSnackComment>(
      requests.boughtSnackComments.update(구매_id, Key),
      data
    );
    setComments((prev) => prev.map((c) => (String(c.Key) === Key ? updated : c)));
    return updated;
  };

  const removeComment = async (Key: string): Promise<void> => {
    await apiDelete(requests.boughtSnackComments.delete(구매_id, Key));
    setComments((prev) => prev.filter((c) => String(c.Key) !== Key));
  };

  return { comments, loading, fetchComments, addComment, updateComment, removeComment };
}

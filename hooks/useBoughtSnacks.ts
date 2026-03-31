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
  CreateBoughtSnackRequest,
  UpdateBoughtSnackRequest,
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

  const createBoughtSnack = async (data: CreateBoughtSnackRequest): Promise<BoughtSnack> => {
    const newSnack = await apiPost<BoughtSnack>(requests.boughtSnacks.create, data);
    // 목록 갱신 (선택적)
    await fetchList(1, snacks.length + 1);
    return newSnack;
  };

  const updateBoughtSnack = async (구매_id: string, data: UpdateBoughtSnackRequest): Promise<BoughtSnack> => {
    const updatedSnack = await apiPut<BoughtSnack>(requests.boughtSnacks.update(구매_id), data);
    // 목록 갱신
    setSnacks(prev => prev.map(snack => snack.구매_id === Number(구매_id) ? updatedSnack : snack));
    return updatedSnack;
  };

  const deleteBoughtSnack = async (구매_id: string): Promise<void> => {
    await apiDelete(requests.boughtSnacks.delete(구매_id));
    // 목록에서 제거
    setSnacks(prev => prev.filter(snack => snack.구매_id !== Number(구매_id)));
    setTotal(prev => prev - 1);
  };

  return { snacks, total, totalPages, loading, fetchList, getDetail, updateStatus, createBoughtSnack, updateBoughtSnack, deleteBoughtSnack };
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

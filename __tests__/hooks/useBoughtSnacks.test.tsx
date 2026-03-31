import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useBoughtSnacks } from "@/hooks/useBoughtSnacks";
import * as axiosHelpers from "@/lib/axios/helpers";

// Mock axios helpers
vi.mock("@/lib/axios/helpers", () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
}));

// Mock requests
vi.mock("@/lib/axios/request", () => ({
  default: {
    boughtSnacks: {
      list: "/bought-snacks",
      create: "/bought-snacks",
      update: (id: string) => `/bought-snacks/${id}`,
      delete: (id: string) => `/bought-snacks/${id}`,
    },
    boughtSnackStatus: {
      update: (id: string) => `/bought-snacks/${id}/status`,
    },
  },
}));

describe("useBoughtSnacks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch snacks list", async () => {
    const mockData = {
      data: [
        {
          구매_id: 1,
          과자이름: "테스트 과자",
          상태: "재고있음" as const,
          commentCount: 0,
          likeCount: 0,
          dislikeCount: 0,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      ],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 1,
        totalPages: 1,
      },
    };

    (axiosHelpers.apiGet as any).mockResolvedValue(mockData);

    const { result } = renderHook(() => useBoughtSnacks());

    await act(async () => {
      await result.current.fetchList(1, 10);
    });

    expect(result.current.snacks).toEqual(mockData.data);
    expect(result.current.total).toBe(1);
  });

  it("should create bought snack", async () => {
    const mockSnack = {
      구매_id: 1,
      과자이름: "새 과자",
      상태: "재고있음" as const,
      commentCount: 0,
      likeCount: 0,
      dislikeCount: 0,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    };

    (axiosHelpers.apiPost as any).mockResolvedValue(mockSnack);
    (axiosHelpers.apiGet as any).mockResolvedValue({
      data: [mockSnack],
      pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
    });

    const { result } = renderHook(() => useBoughtSnacks());

    let createdSnack;
    await act(async () => {
      createdSnack = await result.current.createBoughtSnack({
        과자이름: "새 과자",
        상태: "재고있음",
      });
    });

    expect(createdSnack).toEqual(mockSnack);
    expect(axiosHelpers.apiPost).toHaveBeenCalledWith("/bought-snacks", {
      과자이름: "새 과자",
      상태: "재고있음",
    });
  });

  it("should update bought snack", async () => {
    const mockUpdatedSnack = {
      구매_id: 1,
      과자이름: "수정된 과자",
      상태: "배송중" as const,
      commentCount: 0,
      likeCount: 0,
      dislikeCount: 0,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    };

    (axiosHelpers.apiPut as any).mockResolvedValue(mockUpdatedSnack);

    const { result } = renderHook(() => useBoughtSnacks());

    // 초기 데이터 설정
    act(() => {
      result.current.snacks = [
        {
          구매_id: 1,
          과자이름: "원래 과자",
          상태: "재고있음" as const,
          commentCount: 0,
          likeCount: 0,
          dislikeCount: 0,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      ];
    });

    await act(async () => {
      await result.current.updateBoughtSnack("1", {
        과자이름: "수정된 과자",
        상태: "배송중",
      });
    });

    expect(result.current.snacks[0]).toEqual(mockUpdatedSnack);
    expect(axiosHelpers.apiPut).toHaveBeenCalledWith("/bought-snacks/1", {
      과자이름: "수정된 과자",
      상태: "배송중",
    });
  });

  it("should delete bought snack", async () => {
    (axiosHelpers.apiDelete as any).mockResolvedValue(undefined);

    const { result } = renderHook(() => useBoughtSnacks());

    // 초기 데이터 설정
    act(() => {
      result.current.snacks = [
        {
          구매_id: 1,
          과자이름: "삭제할 과자",
          상태: "재고있음" as const,
          commentCount: 0,
          likeCount: 0,
          dislikeCount: 0,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      ];
      result.current.total = 1;
    });

    await act(async () => {
      await result.current.deleteBoughtSnack("1");
    });

    expect(result.current.snacks).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(axiosHelpers.apiDelete).toHaveBeenCalledWith("/bought-snacks/1");
  });
});
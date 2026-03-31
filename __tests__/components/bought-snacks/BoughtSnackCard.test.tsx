import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import BoughtSnackCard from "@/components/bought-snacks/BoughtSnackCard";
import * as useBoughtSnacks from "@/hooks/useBoughtSnacks";
import * as useUserStore from "@/lib/store/userStore";

// Mock hooks
vi.mock("@/hooks/useBoughtSnacks");
vi.mock("@/lib/store/userStore");
vi.mock("@/components/common/FeedbackButtons", () => ({
  default: () => <div>FeedbackButtons</div>,
}));
vi.mock("@/components/bought-snacks/CommentSection", () => ({
  default: () => <div>CommentSection</div>,
}));
vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

const mockSnack = {
  구매_id: 1,
  과자이름: "테스트 과자",
  상태: "재고있음" as const,
  commentCount: 5,
  likeCount: 10,
  dislikeCount: 2,
  myFeedback: "LIKE" as const,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

describe("BoughtSnackCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render snack information", () => {
    (useUserStore.useUserStore as any).mockReturnValue({ user_id: null, role: "user" });
    (useBoughtSnacks.useBoughtSnacks as any).mockReturnValue({
      updateStatus: vi.fn(),
    });
    (useBoughtSnacks.useBoughtSnackComments as any).mockReturnValue({
      comments: [],
      loading: false,
      fetchComments: vi.fn(),
      addComment: vi.fn(),
      updateComment: vi.fn(),
      removeComment: vi.fn(),
    });

    render(<BoughtSnackCard snack={mockSnack} />);

    expect(screen.getByText("테스트 과자")).toBeInTheDocument();
    expect(screen.getByText("✅ 재고있음")).toBeInTheDocument();
    expect(screen.getByText("💬 5개 댓글 ▼")).toBeInTheDocument();
  });

  it("should show admin buttons for admin user", () => {
    (useUserStore.useUserStore as any).mockReturnValue({ user_id: 1, role: "admin" });
    (useBoughtSnacks.useBoughtSnacks as any).mockReturnValue({
      updateStatus: vi.fn(),
      updateBoughtSnack: vi.fn(),
      deleteBoughtSnack: vi.fn(),
    });
    (useBoughtSnacks.useBoughtSnackComments as any).mockReturnValue({
      comments: [],
      loading: false,
      fetchComments: vi.fn(),
      addComment: vi.fn(),
      updateComment: vi.fn(),
      removeComment: vi.fn(),
    });

    render(<BoughtSnackCard snack={mockSnack} />);

    expect(screen.getByText("✏️ 수정")).toBeInTheDocument();
    expect(screen.getByText("🗑️ 삭제")).toBeInTheDocument();
  });

  it("should not show admin buttons for non-admin user", () => {
    (useUserStore.useUserStore as any).mockReturnValue({ user_id: 1, role: "user" });
    (useBoughtSnacks.useBoughtSnacks as any).mockReturnValue({
      updateStatus: vi.fn(),
    });
    (useBoughtSnacks.useBoughtSnackComments as any).mockReturnValue({
      comments: [],
      loading: false,
      fetchComments: vi.fn(),
      addComment: vi.fn(),
      updateComment: vi.fn(),
      removeComment: vi.fn(),
    });

    render(<BoughtSnackCard snack={mockSnack} />);

    expect(screen.queryByText("✏️ 수정")).not.toBeInTheDocument();
    expect(screen.queryByText("🗑️ 삭제")).not.toBeInTheDocument();
  });

  it("should enter edit mode when edit button is clicked", () => {
    (useUserStore.useUserStore as any).mockReturnValue({ user_id: 1, role: "admin" });
    (useBoughtSnacks.useBoughtSnacks as any).mockReturnValue({
      updateStatus: vi.fn(),
      updateBoughtSnack: vi.fn(),
      deleteBoughtSnack: vi.fn(),
    });
    (useBoughtSnacks.useBoughtSnackComments as any).mockReturnValue({
      comments: [],
      loading: false,
      fetchComments: vi.fn(),
      addComment: vi.fn(),
      updateComment: vi.fn(),
      removeComment: vi.fn(),
    });

    render(<BoughtSnackCard snack={mockSnack} />);

    fireEvent.click(screen.getByText("✏️ 수정"));

    expect(screen.getByDisplayValue("테스트 과자")).toBeInTheDocument();
    expect(screen.getByText("저장")).toBeInTheDocument();
    expect(screen.getByText("취소")).toBeInTheDocument();
  });

  it("should call updateBoughtSnack when save is clicked", async () => {
    const mockUpdate = vi.fn().mockResolvedValue(mockSnack);
    (useUserStore.useUserStore as any).mockReturnValue({ user_id: 1, role: "admin" });
    (useBoughtSnacks.useBoughtSnacks as any).mockReturnValue({
      updateStatus: vi.fn(),
      updateBoughtSnack: mockUpdate,
      deleteBoughtSnack: vi.fn(),
    });
    (useBoughtSnacks.useBoughtSnackComments as any).mockReturnValue({
      comments: [],
      loading: false,
      fetchComments: vi.fn(),
      addComment: vi.fn(),
      updateComment: vi.fn(),
      removeComment: vi.fn(),
    });

    render(<BoughtSnackCard snack={mockSnack} />);

    fireEvent.click(screen.getByText("✏️ 수정"));
    fireEvent.change(screen.getByDisplayValue("테스트 과자"), {
      target: { value: "수정된 과자" },
    });
    fireEvent.click(screen.getByText("저장"));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith("1", {
        과자이름: "수정된 과자",
        상태: "재고있음",
      });
    });
  });

  it("should call deleteBoughtSnack when delete is confirmed", async () => {
    const mockDelete = vi.fn().mockResolvedValue(undefined);
    (useUserStore.useUserStore as any).mockReturnValue({ user_id: 1, role: "admin" });
    (useBoughtSnacks.useBoughtSnacks as any).mockReturnValue({
      updateStatus: vi.fn(),
      updateBoughtSnack: vi.fn(),
      deleteBoughtSnack: mockDelete,
    });
    (useBoughtSnacks.useBoughtSnackComments as any).mockReturnValue({
      comments: [],
      loading: false,
      fetchComments: vi.fn(),
      addComment: vi.fn(),
      updateComment: vi.fn(),
      removeComment: vi.fn(),
    });

    // Mock window.confirm
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<BoughtSnackCard snack={mockSnack} />);

    fireEvent.click(screen.getByText("🗑️ 삭제"));

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith("1");
    });
  });
});
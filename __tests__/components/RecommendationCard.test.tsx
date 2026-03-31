/**
 * RecommendationCard 컴포넌트 테스트
 *
 * 검증:
 * - 과자이름·추천이유·작성자·좋아요 수 렌더링
 * - 작성자 본인: 수정·삭제 버튼 표시
 * - 타인 게시글: 수정·삭제 버튼 없음
 * - 삭제 확인 후 onDeleted 콜백 호출
 * - 삭제 취소 시 onDeleted 미호출
 * - API 에러 시 버튼 복원
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { http, HttpResponse } from "msw";
import RecommendationCard from "@/components/recommendations/RecommendationCard";
import { setLoggedInUser } from "../helpers";
import { fixtures } from "../msw/handlers";
import { server } from "../msw/server";

const BASE = "http://localhost:8080";

// FeedbackButtons 스텁
vi.mock("@/components/common/FeedbackButtons", () => ({
  default: ({ likeCount, dislikeCount }: { likeCount: number; dislikeCount: number }) => (
    <div>
      <span>좋아요 {likeCount}</span>
      <span>싫어요 {dislikeCount}</span>
    </div>
  ),
}));

const REC = fixtures.recommendation;

describe("RecommendationCard 컴포넌트", () => {
  // ── 렌더링 ──
  describe("렌더링", () => {
    it("과자이름·좋아요 수·댓글 수·작성자가 표시된다", () => {
      render(<RecommendationCard rec={{ ...REC, commentCount: 3, likeCount: 5 }} />);

      expect(screen.getByText("포카칩")).toBeInTheDocument();
      expect(screen.getByText(/좋아요 5/)).toBeInTheDocument();
      expect(screen.getByText(/3개 댓글/)).toBeInTheDocument();
      expect(screen.getByText(/testuser/)).toBeInTheDocument();
    });

    it("추천이유가 표시된다", () => {
      render(<RecommendationCard rec={REC} />);
      expect(screen.getByText(/바삭하고 짭짤해서/)).toBeInTheDocument();
    });

    it("'보기 →' 버튼이 올바른 경로로 이동한다", () => {
      const mockLocation = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { href: '' },
        writable: true,
      });
      const originalLocation = window.location;
      window.location.href = '';

      render(<RecommendationCard rec={REC} />);
      const viewButton = screen.getByRole("button", { name: /보기/ });
      userEvent.click(viewButton);
      expect(window.location.href).toBe(`/recommendations/${REC.주문_id}`);
    });
  });

  // ── 권한 분기 ──
  describe("작성자 권한", () => {
    it("본인 글에는 수정·삭제 버튼이 표시된다", () => {
      setLoggedInUser({ user_id: 1 }); // 작성자와 동일
      render(<RecommendationCard rec={REC} />);

      expect(screen.getByRole("button", { name: "수정" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "삭제" })).toBeInTheDocument();
    });

    it("타인 글에는 수정·삭제 버튼이 없다", () => {
      setLoggedInUser({ user_id: 99 }); // 작성자(1)와 다른 사용자
      render(<RecommendationCard rec={REC} />);

      expect(screen.queryByRole("button", { name: "수정" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "삭제" })).not.toBeInTheDocument();
    });

    it("비로그인 상태에서는 수정·삭제 버튼이 없다", () => {
      // user_id=null (setup.ts 초기화)
      render(<RecommendationCard rec={REC} />);

      expect(screen.queryByRole("button", { name: "수정" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "삭제" })).not.toBeInTheDocument();
    });
    });
  });

  // ── 삭제 흐름 ──
  describe("삭제", () => {
    it("삭제 확인 후 onDeleted가 주문_id와 함께 호출된다", async () => {
      setLoggedInUser({ user_id: 1 });
      const onDeleted = vi.fn();
      const user = userEvent.setup();

      // window.confirm을 true로 모킹
      vi.spyOn(window, "confirm").mockReturnValue(true);

      render(<RecommendationCard rec={REC} onDeleted={onDeleted} />);
      await user.click(screen.getByRole("button", { name: "삭제" }));

      await waitFor(() =>
        expect(onDeleted).toHaveBeenCalledWith(REC.주문_id)
      );
    });

    it("삭제 취소(confirm=false) 시 onDeleted가 호출되지 않는다", async () => {
      setLoggedInUser({ user_id: 1 });
      const onDeleted = vi.fn();
      const user = userEvent.setup();

      vi.spyOn(window, "confirm").mockReturnValue(false);

      render(<RecommendationCard rec={REC} onDeleted={onDeleted} />);
      await user.click(screen.getByRole("button", { name: "삭제" }));

      await new Promise((r) => setTimeout(r, 50));
      expect(onDeleted).not.toHaveBeenCalled();
    });

    it("삭제 API 실패 시 삭제 버튼이 다시 활성화된다", async () => {
      server.use(
        http.delete(`${BASE}/recommendations/:id`, () =>
          HttpResponse.json({ message: "오류" }, { status: 500 })
        )
      );
      setLoggedInUser({ user_id: 1 });
      vi.spyOn(window, "confirm").mockReturnValue(true);
      const user = userEvent.setup();

      render(<RecommendationCard rec={REC} />);
      await user.click(screen.getByRole("button", { name: "삭제" }));

      // API 실패 후 버튼이 다시 enabled
      await waitFor(() =>
        expect(screen.getByRole("button", { name: "삭제" })).not.toBeDisabled()
      );
    });
  });

  // ── 수정 버튼 ──
  it("수정 버튼이 올바른 편집 경로로 이동한다", () => {
    setLoggedInUser({ user_id: 1 });
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });
    window.location.href = '';

    render(<RecommendationCard rec={REC} />);
    const editButton = screen.getByRole("button", { name: "수정" });
    userEvent.click(editButton);
    expect(window.location.href).toBe(`/recommendations/${REC.주문_id}/edit`);
  });
});

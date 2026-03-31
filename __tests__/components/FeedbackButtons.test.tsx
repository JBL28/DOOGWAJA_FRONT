/**
 * FeedbackButtons 컴포넌트 테스트
 *
 * 검증 항목:
 * - 초기 카운트 표시
 * - 비로그인 시 버튼 disabled
 * - 로그인 후 좋아요/싫어요 클릭 → 카운트 반영 및 시각적 활성 상태
 * - 이미 활성 상태에서 다시 클릭 → 취소(toggle)
 * - LIKE에서 DISLIKE 전환
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import FeedbackButtons from "@/components/common/FeedbackButtons";
import { setLoggedInUser } from "../helpers";

describe("FeedbackButtons 컴포넌트", () => {
  // ── 렌더링 ──
  it("좋아요·싫어요 카운트가 올바르게 표시된다", () => {
    render(
      <FeedbackButtons
        type="recommendation"
        id="1"
        likeCount={7}
        dislikeCount={3}
      />
    );
    expect(screen.getByText(/👍 7/)).toBeInTheDocument();
    expect(screen.getByText(/👎 3/)).toBeInTheDocument();
  });

  // ── 비로그인 ──
  it("비로그인 상태에서는 버튼이 disabled다", () => {
    render(
      <FeedbackButtons
        type="recommendation"
        id="1"
        likeCount={0}
        dislikeCount={0}
      />
    );
    const [likeBtn, dislikeBtn] = screen.getAllByRole("button");
    expect(likeBtn).toBeDisabled();
    expect(dislikeBtn).toBeDisabled();
  });

  // ── 로그인 후 좋아요 ──
  it("로그인 후 좋아요를 누르면 카운트가 1 증가한다", async () => {
    setLoggedInUser();
    const user = userEvent.setup();

    render(
      <FeedbackButtons
        type="recommendation"
        id="1"
        likeCount={5}
        dislikeCount={0}
      />
    );

    await user.click(screen.getByText(/👍/));

    await waitFor(() =>
      expect(screen.getByText(/👍 6/)).toBeInTheDocument()
    );
  });

  // ── 활성 상태에서 다시 클릭 → 취소 ──
  it("이미 좋아요 상태에서 다시 누르면 취소된다 (toggle)", async () => {
    setLoggedInUser();
    const user = userEvent.setup();

    render(
      <FeedbackButtons
        type="recommendation"
        id="1"
        likeCount={5}
        dislikeCount={0}
        myFeedback="LIKE"
      />
    );

    // 현재 LIKE 상태 → 다시 클릭하면 unlike
    await user.click(screen.getByText(/👍/));

    await waitFor(() =>
      expect(screen.getByText(/👍 4/)).toBeInTheDocument()
    );
  });

  // ── LIKE → DISLIKE 전환 ──
  it("좋아요 상태에서 싫어요를 누르면 좋아요는 감소하고 싫어요는 증가한다", async () => {
    setLoggedInUser();
    const user = userEvent.setup();

    render(
      <FeedbackButtons
        type="recommendation"
        id="1"
        likeCount={4}
        dislikeCount={1}
        myFeedback="LIKE"
      />
    );

    await user.click(screen.getByText(/👎/));

    await waitFor(() => {
      expect(screen.getByText(/👍 3/)).toBeInTheDocument();
      expect(screen.getByText(/👎 2/)).toBeInTheDocument();
    });
  });

  // ── sm 사이즈 ──
  it("size='sm' Props를 받아도 렌더링된다", () => {
    render(
      <FeedbackButtons
        type="boughtSnack"
        id="2"
        likeCount={10}
        dislikeCount={2}
        size="sm"
      />
    );
    expect(screen.getByText(/👍 10/)).toBeInTheDocument();
  });
});

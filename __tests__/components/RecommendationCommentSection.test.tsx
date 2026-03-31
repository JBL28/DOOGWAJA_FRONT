/**
 * RecommendationCommentSection 컴포넌트 테스트
 *
 * 핵심 검증:
 * 1. 5개 이하 댓글 → 펼치기 버튼 없음
 * 2. 6개 이상 댓글 → 처음 5개만 보임 + "더 보기" 버튼
 * 3. "더 보기" 클릭 → 전체 댓글 노출
 * 4. "접기" 클릭 → 다시 5개만
 * 5. 댓글 추가: 1자 → 제출 불가 / 2자 → 가능 / 빈 문자열 → 불가
 * 6. 작성자 본인: 수정/삭제 버튼 노출, 인라인 수정
 * 7. 타인 댓글: 수정/삭제 버튼 없음
 * 8. 비로그인: 작성 폼 없음
 */
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import RecommendationCommentSection from "@/components/recommendations/CommentSection";
import { setLoggedInUser, makeComment } from "../helpers";

// FeedbackButtons를 스텁해 테스트 단순화 (피드백 자체는 별도 테스트에서 다룸)
vi.mock("@/components/common/FeedbackButtons", () => ({
  default: () => <div data-testid="feedback-btns" />,
}));

function renderSection(options: {
  count?: number;
  authorId?: number;
  isLoggedIn?: boolean;
  otherAuthorIds?: number[];
}) {
  const {
    count = 0,
    authorId = 1,
    isLoggedIn = false,
    otherAuthorIds = [],
  } = options;

  if (isLoggedIn) setLoggedInUser({ user_id: authorId });

  const comments = [
    ...Array.from({ length: count }, (_, i) =>
      makeComment(i + 1, otherAuthorIds[i] ?? authorId)
    ),
  ];

  const onAdd = vi.fn().mockResolvedValue(undefined);
  const onUpdate = vi.fn().mockResolvedValue(undefined);
  const onDelete = vi.fn().mockResolvedValue(undefined);

  render(
    <RecommendationCommentSection
      주문_id="1"
      comments={comments}
      onAdd={onAdd}
      onUpdate={onUpdate}
      onDelete={onDelete}
    />
  );

  return { onAdd, onUpdate, onDelete };
}

describe("RecommendationCommentSection", () => {
  // ── 접기/펼치기 ──
  describe("댓글 접기/펼치기", () => {
    it("5개 이하 댓글에는 펼치기 버튼이 없다", () => {
      renderSection({ count: 5 });
      expect(screen.queryByText(/더 보기/)).not.toBeInTheDocument();
    });

    it("정확히 5개 댓글이면 모두 표시되고 더보기 버튼이 없다", () => {
      renderSection({ count: 5 });
      expect(screen.getAllByText(/테스트 댓글/)).toHaveLength(5);
    });

    it("6개 댓글 중 기본적으로 5개만 보인다", () => {
      renderSection({ count: 6 });
      // 5번째 댓글은 보이고 6번째는 숨겨짐
      expect(screen.getAllByText(/테스트 댓글/)).toHaveLength(5);
    });

    it("6개 댓글이면 '1개 댓글 더 보기' 버튼이 표시된다", () => {
      renderSection({ count: 6 });
      expect(screen.getByText(/1개 댓글 더 보기/)).toBeInTheDocument();
    });

    it("'더 보기' 클릭 시 전체 댓글이 노출된다", async () => {
      const user = userEvent.setup();
      renderSection({ count: 7 });

      // Act: 펼치기
      await user.click(screen.getByText(/2개 댓글 더 보기/));

      // Assert: 7개 전부 노출
      await waitFor(() =>
        expect(screen.getAllByText(/테스트 댓글/)).toHaveLength(7)
      );
    });

    it("펼친 후 '접기' 클릭 시 5개로 돌아온다", async () => {
      const user = userEvent.setup();
      renderSection({ count: 8 });

      await user.click(screen.getByText(/3개 댓글 더 보기/));
      await waitFor(() =>
        expect(screen.getAllByText(/테스트 댓글/)).toHaveLength(8)
      );

      // Act: 접기
      await user.click(screen.getByText("▲ 접기"));

      await waitFor(() =>
        expect(screen.getAllByText(/테스트 댓글/)).toHaveLength(5)
      );
    });
  });

  // ── 댓글 추가 ──
  describe("댓글 추가", () => {
    it("비로그인 상태에서는 입력 폼이 없다", () => {
      renderSection({ count: 0, isLoggedIn: false });
      expect(screen.queryByPlaceholderText(/댓글을 입력/)).not.toBeInTheDocument();
      expect(screen.getByText(/로그인이 필요합니다/)).toBeInTheDocument();
    });

    it("빈 문자열로는 제출할 수 없다 (버튼 disabled)", () => {
      renderSection({ count: 0, isLoggedIn: true });
      const submitBtn = screen.getByRole("button", { name: "등록" });
      expect(submitBtn).toBeDisabled();
    });

    it("댓글 1자로는 제출할 수 없다 (최소 2자)", async () => {
      const user = userEvent.setup();
      renderSection({ count: 0, isLoggedIn: true });

      await user.type(screen.getByPlaceholderText(/댓글을 입력/), "a");

      // 1자이므로 버튼이 여전히 disabled
      expect(screen.getByRole("button", { name: "등록" })).toBeDisabled();
    });

    it("댓글 2자 입력 후 제출하면 onAdd가 호출된다", async () => {
      const user = userEvent.setup();
      const { onAdd } = renderSection({ count: 0, isLoggedIn: true });

      await user.type(screen.getByPlaceholderText(/댓글을 입력/), "ok");
      await user.click(screen.getByRole("button", { name: "등록" }));

      await waitFor(() =>
        expect(onAdd).toHaveBeenCalledWith("ok")
      );
    });

    it("제출 후 입력란이 비워진다", async () => {
      const user = userEvent.setup();
      renderSection({ count: 0, isLoggedIn: true });

      const input = screen.getByPlaceholderText(/댓글을 입력/) as HTMLInputElement;
      await user.type(input, "좋아요!");
      await user.click(screen.getByRole("button", { name: "등록" }));

      await waitFor(() => expect(input.value).toBe(""));
    });
  });

  // ── 작성자 수정/삭제 ──
  describe("댓글 수정·삭제 권한", () => {
    it("본인 댓글에는 수정·삭제 버튼이 표시된다", () => {
      // user_id=1이 작성한 댓글 1개
      renderSection({ count: 1, authorId: 1, isLoggedIn: true });

      expect(screen.getByRole("button", { name: "수정" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "삭제" })).toBeInTheDocument();
    });

    it("타인 댓글에는 수정·삭제 버튼이 없다", () => {
      // user_id=1이 로그인, 댓글 작성자는 user_id=2
      renderSection({ count: 1, authorId: 1, isLoggedIn: true, otherAuthorIds: [2] });

      expect(screen.queryByRole("button", { name: "수정" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "삭제" })).not.toBeInTheDocument();
    });

    it("수정 버튼 클릭 시 인라인 편집 모드가 된다", async () => {
      const user = userEvent.setup();
      renderSection({ count: 1, authorId: 1, isLoggedIn: true });

      await user.click(screen.getByRole("button", { name: "수정" }));

      // 인라인 수정 input과 저장/취소 버튼이 나타남
      expect(screen.getByRole("button", { name: "저장" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "취소" })).toBeInTheDocument();
    });

    it("수정 후 저장하면 onUpdate가 수정 내용과 함께 호출된다", async () => {
      const user = userEvent.setup();
      const { onUpdate } = renderSection({ count: 1, authorId: 1, isLoggedIn: true });

      await user.click(screen.getByRole("button", { name: "수정" }));

      // 기존 내용을 지우고 새 내용 입력
      const editInput = screen.getByDisplayValue("테스트 댓글 1번째 내용");
      await user.clear(editInput);
      await user.type(editInput, "수정된 내용");
      await user.click(screen.getByRole("button", { name: "저장" }));

      await waitFor(() =>
        expect(onUpdate).toHaveBeenCalledWith("1", "수정된 내용")
      );
    });

    it("취소 버튼 клик 시 원래 내용으로 돌아간다", async () => {
      const user = userEvent.setup();
      renderSection({ count: 1, authorId: 1, isLoggedIn: true });

      await user.click(screen.getByRole("button", { name: "수정" }));
      await user.click(screen.getByRole("button", { name: "취소" }));

      // 원래 본문과 수정/삭제 버튼이 다시 노출
      expect(screen.getByText("테스트 댓글 1번째 내용")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "수정" })).toBeInTheDocument();
    });

    it("삭제 버튼 클릭 시 onDelete가 호출된다", async () => {
      const user = userEvent.setup();
      const { onDelete } = renderSection({ count: 1, authorId: 1, isLoggedIn: true });

      await user.click(screen.getByRole("button", { name: "삭제" }));

      await waitFor(() => expect(onDelete).toHaveBeenCalledWith("1"));
    });
  });

  // ── 빈 상태 ──
  it("댓글이 없을 때 빈 상태 안내 문구가 보인다", () => {
    renderSection({ count: 0 });
    expect(screen.getByText(/아직 댓글이 없어요/)).toBeInTheDocument();
  });
});

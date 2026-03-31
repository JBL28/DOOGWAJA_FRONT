/**
 * SignupPage 테스트
 *
 * 클라이언트 유효성 검사 엣지케이스:
 * - 닉네임: 2자 미만 / 50자 초과
 * - 비밀번호: 8자 미만
 * - 비밀번호 불일치
 * - 서버: 닉네임 중복
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useRouter } from "next/navigation";
import { http, HttpResponse } from "msw";
import SignupPage from "@/app/(auth)/signup/page";
import { server } from "../msw/server";

const BASE = "http://localhost:8080";

describe("회원가입 페이지", () => {
  let mockPush: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    } as any);
  });

  // ── 렌더링 ──
  it("닉네임·비밀번호·비밀번호확인 입력란과 회원가입 버튼이 보인다", () => {
    render(<SignupPage />);
    expect(screen.getByPlaceholderText("2자 이상 50자 이하")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("8자 이상")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("비밀번호를 한번 더 입력하세요")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "회원가입" })).toBeInTheDocument();
  });

  // ── 성공 흐름 ──
  it("올바른 정보로 가입하면 홈으로 이동한다", async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    await user.type(screen.getByPlaceholderText("2자 이상 50자 이하"), "newuser");
    await user.type(screen.getByPlaceholderText("8자 이상"), "password123");
    await user.type(screen.getByPlaceholderText("비밀번호를 한번 더 입력하세요"), "password123");
    await user.click(screen.getByRole("button", { name: "회원가입" }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/"));
  });

  // ── 클라이언트 유효성 검사 ──
  it("닉네임이 1자이면 에러 메시지가 표시되고 제출되지 않는다", async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    // Arrange: 1자 닉네임 (최소 2자 필요)
    await user.type(screen.getByPlaceholderText("2자 이상 50자 이하"), "a");
    await user.type(screen.getByPlaceholderText("8자 이상"), "password123");
    await user.type(screen.getByPlaceholderText("비밀번호를 한번 더 입력하세요"), "password123");

    // Act
    await user.click(screen.getByRole("button", { name: "회원가입" }));

    // Assert
    await waitFor(() =>
      expect(screen.getByText(/2자 이상 50자 이하/)).toBeInTheDocument()
    );
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("닉네임이 2자이면 유효성 검사를 통과한다", async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    await user.type(screen.getByPlaceholderText("2자 이상 50자 이하"), "ab");
    await user.type(screen.getByPlaceholderText("8자 이상"), "password123");
    await user.type(screen.getByPlaceholderText("비밀번호를 한번 더 입력하세요"), "password123");
    await user.click(screen.getByRole("button", { name: "회원가입" }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/"));
  });

  it("비밀번호가 7자이면 에러 메시지가 표시되고 제출되지 않는다", async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    await user.type(screen.getByPlaceholderText("2자 이상 50자 이하"), "validnick");
    await user.type(screen.getByPlaceholderText("8자 이상"), "1234567"); // 7자
    await user.type(screen.getByPlaceholderText("비밀번호를 한번 더 입력하세요"), "1234567");
    await user.click(screen.getByRole("button", { name: "회원가입" }));

    await waitFor(() =>
      expect(screen.getByText(/8자 이상/)).toBeInTheDocument()
    );
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("비밀번호가 8자이면 유효성 검사를 통과한다", async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    await user.type(screen.getByPlaceholderText("2자 이상 50자 이하"), "validnick");
    await user.type(screen.getByPlaceholderText("8자 이상"), "12345678"); // 8자
    await user.type(screen.getByPlaceholderText("비밀번호를 한번 더 입력하세요"), "12345678");
    await user.click(screen.getByRole("button", { name: "회원가입" }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/"));
  });

  it("비밀번호와 확인이 다르면 에러 메시지가 표시된다", async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    await user.type(screen.getByPlaceholderText("2자 이상 50자 이하"), "validnick");
    await user.type(screen.getByPlaceholderText("8자 이상"), "password123");
    await user.type(screen.getByPlaceholderText("비밀번호를 한번 더 입력하세요"), "different123");
    await user.click(screen.getByRole("button", { name: "회원가입" }));

    await waitFor(() =>
      expect(screen.getByText(/비밀번호가 일치하지 않습니다/)).toBeInTheDocument()
    );
    expect(mockPush).not.toHaveBeenCalled();
  });

  // ── 서버 에러 ──
  it("닉네임이 중복되면 서버 에러 메시지가 표시된다", async () => {
    server.use(
      http.post(`${BASE}/auth/signup`, () =>
        HttpResponse.json(
          { message: "이미 사용 중인 닉네임입니다.", errorCode: "DUPLICATE_NICKNAME" },
          { status: 409 }
        )
      )
    );
    const user = userEvent.setup();
    render(<SignupPage />);

    await user.type(screen.getByPlaceholderText("2자 이상 50자 이하"), "existinguser");
    await user.type(screen.getByPlaceholderText("8자 이상"), "password123");
    await user.type(screen.getByPlaceholderText("비밀번호를 한번 더 입력하세요"), "password123");
    await user.click(screen.getByRole("button", { name: "회원가입" }));

    await waitFor(() =>
      expect(screen.getByText(/이미 사용 중인 닉네임/)).toBeInTheDocument()
    );
    expect(mockPush).not.toHaveBeenCalled();
  });

  // ── 엣지케이스: 정확히 50자 닉네임 ──
  it("닉네임 50자는 허용된다", async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    const fiftyChars = "가".repeat(50);
    await user.type(screen.getByPlaceholderText("2자 이상 50자 이하"), fiftyChars);
    await user.type(screen.getByPlaceholderText("8자 이상"), "password123");
    await user.type(screen.getByPlaceholderText("비밀번호를 한번 더 입력하세요"), "password123");
    await user.click(screen.getByRole("button", { name: "회원가입" }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/"));
  });
});

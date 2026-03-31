/**
 * LoginPage 테스트
 *
 * 원칙:
 * - 보이는 결과(UI 상태)를 테스트
 * - role/text 기반 셀렉터 우선
 * - MSW로 실제 네트워크 흐름과 유사하게 처리
 * - Arrange → Act → Assert 구조
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useRouter } from "next/navigation";
import { http, HttpResponse } from "msw";
import LoginPage from "@/app/(auth)/login/page";
import { server } from "../msw/server";

const BASE = "http://localhost:8080";

describe("로그인 페이지", () => {
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
  it("닉네임·비밀번호 입력란과 로그인 버튼이 보인다", () => {
    // Arrange & Act
    render(<LoginPage />);

    // Assert
    expect(screen.getByPlaceholderText("닉네임을 입력하세요")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("비밀번호를 입력하세요")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "로그인" })).toBeInTheDocument();
  });

  it("회원가입 링크가 보인다", () => {
    render(<LoginPage />);
    expect(screen.getByRole("link", { name: "회원가입" })).toHaveAttribute(
      "href",
      "/signup"
    );
  });

  // ── 성공 흐름 ──
  it("올바른 닉네임·비밀번호로 로그인하면 홈으로 이동한다", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<LoginPage />);

    // Act
    await user.type(screen.getByPlaceholderText("닉네임을 입력하세요"), "testuser");
    await user.type(screen.getByPlaceholderText("비밀번호를 입력하세요"), "password123");
    await user.click(screen.getByRole("button", { name: "로그인" }));

    // Assert
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/"));
  });

  it("로그인 중에는 버튼이 '로그인 중...' 상태가 된다", async () => {
    // Arrange: 응답을 늦춤
    server.use(
      http.post(`${BASE}/auth/login`, async () => {
        await new Promise((r) => setTimeout(r, 100));
        return HttpResponse.json({
          data: {
            accessToken: "token",
            user: { user_id: 1, nickname: "t", role: "user", createdAt: "", updatedAt: "" },
          },
        });
      })
    );
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText("닉네임을 입력하세요"), "testuser");
    await user.type(screen.getByPlaceholderText("비밀번호를 입력하세요"), "password123");

    // Act
    await user.click(screen.getByRole("button", { name: "로그인" }));

    // Assert: 로딩 중 텍스트
    expect(screen.getByRole("button", { name: "로그인 중..." })).toBeDisabled();
  });

  // ── 에러 처리 ──
  it("잘못된 비밀번호로 로그인하면 에러 메시지가 표시된다", async () => {
    // Arrange: 401 응답 오버라이드
    server.use(
      http.post(`${BASE}/auth/login`, () =>
        HttpResponse.json(
          { message: "닉네임 또는 비밀번호가 올바르지 않습니다.", errorCode: "INVALID_CREDENTIALS" },
          { status: 401 }
        )
      )
    );
    const user = userEvent.setup();
    render(<LoginPage />);

    // Act
    await user.type(screen.getByPlaceholderText("닉네임을 입력하세요"), "testuser");
    await user.type(screen.getByPlaceholderText("비밀번호를 입력하세요"), "wrongpassword");
    await user.click(screen.getByRole("button", { name: "로그인" }));

    // Assert: 에러 메시지 표시
    await waitFor(() =>
      expect(
        screen.getByText(/닉네임 또는 비밀번호가 올바르지/)
      ).toBeInTheDocument()
    );
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("네트워크 오류 시 에러 메시지가 표시된다", async () => {
    // Arrange: 네트워크 에러 시뮬레이션
    server.use(
      http.post(`${BASE}/auth/login`, () => HttpResponse.error())
    );
    const user = userEvent.setup();
    render(<LoginPage />);

    // Act
    await user.type(screen.getByPlaceholderText("닉네임을 입력하세요"), "testuser");
    await user.type(screen.getByPlaceholderText("비밀번호를 입력하세요"), "password123");
    await user.click(screen.getByRole("button", { name: "로그인" }));

    // Assert: 에러 메시지가 화면에 표시 (Axios Network Error 또는 일반 에러)
    await waitFor(() =>
      expect(screen.getByText(/⚠️/)).toBeInTheDocument()
    );
  });

  // ── 엣지케이스: HTML 기본 유효성 검사 ──
  it("닉네임이 비어 있으면 폼이 제출되지 않는다 (브라우저 required 검사)", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<LoginPage />);

    // Act: 닉네임 없이 비밀번호만 입력 후 제출
    await user.type(screen.getByPlaceholderText("비밀번호를 입력하세요"), "password123");
    await user.click(screen.getByRole("button", { name: "로그인" }));

    // Assert: 서버로 요청이 가지 않음 → push 호출 없음
    await new Promise((r) => setTimeout(r, 100));
    expect(mockPush).not.toHaveBeenCalled();
  });
});

import "@testing-library/jest-dom";
import { server } from "./msw/server";
import { beforeAll, afterEach, afterAll, beforeEach, vi } from "vitest";
import { useUserStore } from "@/lib/store/userStore";

// ── MSW 서버 라이프사이클 ──────────────────────────────────
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ── NEXT_PUBLIC_BASE_URL ───────────────────────────────────
process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:8080";

// ── Next.js 모듈 모킹 ─────────────────────────────────────
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  })),
  useParams: vi.fn(() => ({})),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

vi.mock("next/link", () => {
  const React = require("react");
  return {
    default: function NextLink({
      href,
      children,
      ...props
    }: {
      href: string;
      children: React.ReactNode;
      [key: string]: unknown;
    }) {
      return React.createElement("a", { href, ...props }, children);
    },
  };
});

vi.mock("next/image", () => {
  const React = require("react");
  return {
    default: function NextImage({
      src,
      alt,
      ...props
    }: {
      src: string;
      alt: string;
      [key: string]: unknown;
    }) {
      return React.createElement("img", { src, alt, ...props });
    },
  };
});

// ── 스토어·스토리지 초기화 ────────────────────────────────
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  // Zustand 스토어 리셋
  useUserStore.setState({
    user_id: null,
    nickname: "",
    role: undefined,
    bio: undefined,
    profileImage: undefined,
  });
});

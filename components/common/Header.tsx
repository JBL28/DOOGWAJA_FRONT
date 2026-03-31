"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/store/userStore";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const router = useRouter();
  const { user_id, nickname } = useUserStore();
  const { logout } = useAuth();

  return (
    <header
      style={{
        background: "linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)",
        boxShadow: "0 4px 16px rgba(255,107,53,0.3)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* 로고 */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
        >
          <span style={{ fontSize: 28 }}>🍪</span>
          <span
            style={{
              fontWeight: 900,
              fontSize: "1.4rem",
              color: "#fff",
              letterSpacing: "-0.5px",
            }}
          >
            두과자
          </span>
        </Link>

        {/* 네비게이션 */}
        <nav style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <NavLink href="/">홈</NavLink>
          <NavLink href="/recommendations/create">추천글 작성</NavLink>

          {user_id ? (
            <>
              <NavLink href="/profile">내 프로필</NavLink>
              <button
                onClick={() => logout()}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "1.5px solid rgba(255,255,255,0.5)",
                  color: "#fff",
                  padding: "7px 16px",
                  borderRadius: 999,
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.35)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.2)")
                }
              >
                {nickname} · 로그아웃
              </button>
            </>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <NavLink href="/login">로그인</NavLink>
              <Link
                href="/signup"
                style={{
                  background: "#fff",
                  color: "#FF6B35",
                  padding: "7px 18px",
                  borderRadius: 999,
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  textDecoration: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                }}
              >
                회원가입
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        color: "rgba(255,255,255,0.9)",
        fontWeight: 700,
        fontSize: "0.88rem",
        textDecoration: "none",
        padding: "7px 14px",
        borderRadius: 999,
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "rgba(255,255,255,0.18)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = "transparent")
      }
    >
      {children}
    </Link>
  );
}

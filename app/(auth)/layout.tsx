import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "두과자 🍪 | 로그인",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #FFF0E0 0%, #FFE5CC 50%, #FFF8F0 100%)",
        padding: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* 로고 */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>🍪</div>
          <h1
            style={{
              fontWeight: 900,
              fontSize: "2rem",
              color: "var(--color-candy-orange)",
              letterSpacing: "-1px",
            }}
          >
            두과자
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: 4 }}>
            과자 취향을 공유하는 커뮤니티
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}

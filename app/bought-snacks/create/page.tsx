"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/common/Header";
import { useBoughtSnacks } from "@/hooks/useBoughtSnacks";
import { useUserStore } from "@/lib/store/userStore";
import type { BoughtSnackStatus, CreateBoughtSnackRequest } from "@/types/api";

const STATUSES: BoughtSnackStatus[] = ["배송중", "재고있음", "재고없음"];

export default function CreateBoughtSnackPage() {
  const { role } = useUserStore();
  const isAdmin = role === 'admin';
  const router = useRouter();
  const { createBoughtSnack } = useBoughtSnacks();

  const [과자이름, set과자이름] = useState("");
  const [상태, set상태] = useState<BoughtSnackStatus>("재고있음");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ADMIN이 아니면 리다이렉트
  if (!isAdmin) {
    router.push("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!과자이름.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data: CreateBoughtSnackRequest = { 과자이름: 과자이름.trim(), 상태 };
      await createBoughtSnack(data);
      router.push("/");
    } catch (err: any) {
      setError(err?.message ?? "과자 추가에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <main className="page-wrapper" style={{ flex: 1, paddingTop: 32 }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          {/* 헤더 */}
          <div style={{ marginBottom: 32 }}>
            <Link href="/" style={{ color: "var(--color-candy-orange)", textDecoration: "none", fontWeight: 600 }}>
              ← 홈으로 돌아가기
            </Link>
            <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "var(--text-primary)", marginTop: 16 }}>
              🛒 새 과자 추가
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "1rem", marginTop: 8 }}>
              구매한 새 과자를 목록에 추가합니다.
            </p>
          </div>

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="card" style={{ padding: 32 }}>
            <div style={{ marginBottom: 24 }}>
              <label
                htmlFor="과자이름"
                style={{
                  display: "block",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: 8,
                  fontSize: "1rem",
                }}
              >
                과자 이름 *
              </label>
              <input
                id="과자이름"
                type="text"
                value={과자이름}
                onChange={(e) => set과자이름(e.target.value)}
                placeholder="예: 오레오 초코 쿠키"
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid var(--border-color)",
                  borderRadius: 8,
                  fontSize: "1rem",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--color-candy-orange)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-color)")}
              />
            </div>

            <div style={{ marginBottom: 32 }}>
              <label
                htmlFor="상태"
                style={{
                  display: "block",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: 8,
                  fontSize: "1rem",
                }}
              >
                상태
              </label>
              <select
                id="상태"
                value={상태}
                onChange={(e) => set상태(e.target.value as BoughtSnackStatus)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid var(--border-color)",
                  borderRadius: 8,
                  fontSize: "1rem",
                  background: "white",
                }}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div
                style={{
                  background: "#fee",
                  color: "#c33",
                  padding: "12px 16px",
                  borderRadius: 8,
                  marginBottom: 24,
                  border: "1px solid #fcc",
                }}
              >
                ⚠️ {error}
              </div>
            )}

            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="submit"
                disabled={loading || !과자이름.trim()}
                style={{
                  flex: 1,
                  background: "var(--color-candy-orange)",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  padding: "14px 24px",
                  fontSize: "1rem",
                  fontWeight: 700,
                  cursor: loading || !과자이름.trim() ? "not-allowed" : "pointer",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) => !loading && 과자이름.trim() && (e.currentTarget.style.background = "#E55A2B")}
                onMouseOut={(e) => !loading && 과자이름.trim() && (e.currentTarget.style.background = "var(--color-candy-orange)")}
              >
                {loading ? "추가 중..." : "과자 추가하기"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/")}
                style={{
                  padding: "14px 24px",
                  background: "white",
                  color: "var(--text-secondary)",
                  border: "2px solid var(--border-color)",
                  borderRadius: 8,
                  fontSize: "1rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                취소
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import { useRecommendations } from "@/hooks/useRecommendations";
import { useUserStore } from "@/lib/store/userStore";
import Link from "next/link";

export default function CreateRecommendationPage() {
  const router = useRouter();
  const { create } = useRecommendations();
  const { user_id } = useUserStore();
  const [form, setForm] = useState({ 과자이름: "", 주문이유: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user_id) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Header />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
          <span style={{ fontSize: 48 }}>🔐</span>
          <p style={{ fontWeight: 700, color: "var(--text-secondary)" }}>로그인이 필요합니다.</p>
          <Link href="/login" className="btn btn-primary">로그인하기</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.과자이름.trim()) { setError("과자 이름을 입력해주세요."); return; }
    if (form.주문이유.trim().length < 10) { setError("추천 이유는 최소 10자 이상 입력해주세요."); return; }

    setSubmitting(true);
    try {
      const rec = await create({ 과자이름: form.과자이름.trim(), 주문이유: form.주문이유.trim() });
      router.push(`/`);
    } catch (err: any) {
      setError(err?.message ?? "추천글 작성에 실패했습니다.");
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <main className="page-wrapper" style={{ flex: 1, maxWidth: 640 }}>
        <Link href="/" style={{ color: "var(--color-candy-orange)", fontWeight: 700, fontSize: "0.88rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 24 }}>
          ← 뒤로가기
        </Link>

        <div className="card fade-in" style={{ borderTop: "4px solid var(--color-candy-orange)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <span style={{ fontSize: 28 }}>🍬</span>
            <h1 style={{ fontWeight: 900, fontSize: "1.4rem" }}>과자 추천하기</h1>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={labelStyle}>과자 이름 *</label>
              <input
                className="input"
                placeholder="추천하고 싶은 과자 이름"
                value={form.과자이름}
                onChange={(e) => setForm({ ...form, 과자이름: e.target.value })}
                required maxLength={100}
              />
            </div>
            <div>
              <label style={labelStyle}>추천 이유 * <small style={{ color: "var(--text-muted)", fontWeight: 500 }}>(최소 10자)</small></label>
              <textarea
                className="input"
                placeholder="왜 이 과자를 추천하나요? 맛, 식감, 특별한 이유 등을 자유롭게 적어주세요."
                value={form.주문이유}
                onChange={(e) => setForm({ ...form, 주문이유: e.target.value })}
                required minLength={10}
                rows={5}
              />
              <span style={{ fontSize: "0.78rem", color: form.주문이유.length < 10 ? "#CC2233" : "var(--text-muted)", fontWeight: 600 }}>
                {form.주문이유.length}자
              </span>
            </div>

            {error && (
              <div style={{ padding: "10px 14px", background: "rgba(255,68,85,0.08)", borderRadius: 10, color: "#CC2233", fontSize: "0.85rem", fontWeight: 600 }}>
                ⚠️ {error}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Link href="/" className="btn btn-ghost">취소</Link>
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? "등록 중..." : "추천글 등록 🍪"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontWeight: 700, fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 6,
};

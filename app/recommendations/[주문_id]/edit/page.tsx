"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/common/Header";
import { useRecommendations } from "@/hooks/useRecommendations";
import { useUserStore } from "@/lib/store/userStore";

export default function EditRecommendationPage() {
  const params = useParams();
  const router = useRouter();
  const 주문_id = String(params["주문_id"] ?? "");
  const { getDetail, update } = useRecommendations();
  const { user_id } = useUserStore();
  const [form, setForm] = useState({ 과자이름: "", 주문이유: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user_id === null) return; // 아직 Zustand 하이드레이션 전 - 대기
    getDetail(주문_id)
      .then((rec) => {
        if (user_id !== rec.사용자Id) { router.push(`/recommendations/${주문_id}`); return; }
        setForm({ 과자이름: rec.과자이름, 주문이유: rec.주문이유 });
      })
      .catch(() => router.push("/"))
      .finally(() => setLoading(false));
  }, [주문_id, user_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.주문이유.trim().length < 10) { setError("추천 이유는 최소 10자 이상 입력해주세요."); return; }
    setSubmitting(true);
    try {
      await update(주문_id, { 과자이름: form.과자이름.trim(), 주문이유: form.주문이유.trim() });
      router.push(`/recommendations/${주문_id}`);
    } catch (err: any) {
      setError(err?.message ?? "수정에 실패했습니다.");
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" />
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <main className="page-wrapper" style={{ flex: 1, maxWidth: 640 }}>
        <Link href={`/recommendations/${주문_id}`} style={{ color: "var(--color-candy-orange)", fontWeight: 700, fontSize: "0.88rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 24 }}>
          ← 뒤로가기
        </Link>

        <div className="card fade-in" style={{ borderTop: "4px solid var(--color-candy-orange)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <span style={{ fontSize: 28 }}>✏️</span>
            <h1 style={{ fontWeight: 900, fontSize: "1.4rem" }}>추천글 수정</h1>
          </div>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={labelStyle}>과자 이름</label>
              <input className="input" value={form.과자이름} onChange={(e) => setForm({ ...form, 과자이름: e.target.value })} required maxLength={100} />
            </div>
            <div>
              <label style={labelStyle}>추천 이유 <small style={{ color: "var(--text-muted)", fontWeight: 500 }}>(최소 10자)</small></label>
              <textarea className="input" value={form.주문이유} onChange={(e) => setForm({ ...form, 주문이유: e.target.value })} required minLength={10} rows={5} />
              <span style={{ fontSize: "0.78rem", color: form.주문이유.length < 10 ? "#CC2233" : "var(--text-muted)", fontWeight: 600 }}>
                {form.주문이유.length}자
              </span>
            </div>
            {error && <div style={{ padding: "10px 14px", background: "rgba(255,68,85,0.08)", borderRadius: 10, color: "#CC2233", fontSize: "0.85rem", fontWeight: 600 }}>⚠️ {error}</div>}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Link href={`/recommendations/${주문_id}`} className="btn btn-ghost">취소</Link>
              <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? "저장 중..." : "수정 저장"}</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontWeight: 700, fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 6
};

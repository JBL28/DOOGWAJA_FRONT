"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function SignupPage() {
  const { signup, loading, error } = useAuth();
  const [form, setForm] = useState({ nickname: "", password: "", passwordConfirm: "" });
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (form.nickname.length < 2 || form.nickname.length > 50) {
      setLocalError("닉네임은 2자 이상 50자 이하여야 합니다.");
      return;
    }
    if (form.password.length < 8) {
      setLocalError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (form.password !== form.passwordConfirm) {
      setLocalError("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      await signup({ nickname: form.nickname, password: form.password });
    } catch { /* error handled in hook */ }
  };

  const displayError = localError || error;

  return (
    <div className="card fade-in">
      <h2 style={{ fontWeight: 800, fontSize: "1.3rem", marginBottom: 24, color: "var(--text-primary)" }}>
        회원가입 🎉
      </h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={labelStyle}>닉네임</label>
          <input
            className="input"
            placeholder="2자 이상 50자 이하"
            value={form.nickname}
            onChange={(e) => setForm({ ...form, nickname: e.target.value })}
            required minLength={2} maxLength={50}
          />
        </div>
        <div>
          <label style={labelStyle}>비밀번호</label>
          <input
            className="input"
            type="password"
            placeholder="8자 이상"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required minLength={8}
          />
        </div>
        <div>
          <label style={labelStyle}>비밀번호 확인</label>
          <input
            className="input"
            type="password"
            placeholder="비밀번호를 한번 더 입력하세요"
            value={form.passwordConfirm}
            onChange={(e) => setForm({ ...form, passwordConfirm: e.target.value })}
            required
          />
        </div>

        {displayError && (
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(255,68,85,0.08)",
              borderRadius: 10,
              color: "#CC2233",
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            ⚠️ {displayError}
          </div>
        )}

        <button className="btn btn-primary" type="submit" disabled={loading}
          style={{ width: "100%", paddingTop: 12, paddingBottom: 12, marginTop: 4 }}>
          {loading ? "가입 중..." : "회원가입"}
        </button>
      </form>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginTop: 20,
          justifyContent: "center",
        }}
      >
        <span style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>이미 계정이 있으신가요?</span>
        <Link href="/login" style={{ color: "var(--color-candy-orange)", fontWeight: 700, fontSize: "0.88rem" }}>
          로그인
        </Link>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontWeight: 700,
  fontSize: "0.85rem",
  color: "var(--text-secondary)",
  marginBottom: 6,
};

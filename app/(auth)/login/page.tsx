"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const [form, setForm] = useState({ nickname: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await login(form); } catch { /* error is handled in hook */ }
  };

  return (
    <div className="card fade-in">
      <h2 style={{ fontWeight: 800, fontSize: "1.3rem", marginBottom: 24, color: "var(--text-primary)" }}>
        로그인 🔐
      </h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={labelStyle}>닉네임</label>
          <input
            className="input"
            placeholder="닉네임을 입력하세요"
            value={form.nickname}
            onChange={(e) => setForm({ ...form, nickname: e.target.value })}
            required
            minLength={2}
          />
        </div>
        <div>
          <label style={labelStyle}>비밀번호</label>
          <input
            className="input"
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={8}
          />
        </div>

        {error && (
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
            ⚠️ {error}
          </div>
        )}

        <button className="btn btn-primary" type="submit" disabled={loading}
          style={{ width: "100%", paddingTop: 12, paddingBottom: 12, marginTop: 4 }}>
          {loading ? "로그인 중..." : "로그인"}
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
        <span style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
          계정이 없으신가요?
        </span>
        <Link
          href="/signup"
          style={{ color: "var(--color-candy-orange)", fontWeight: 700, fontSize: "0.88rem" }}
        >
          회원가입
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

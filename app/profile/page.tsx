"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import { useAuth } from "@/hooks/useAuth";
import { useUserStore } from "@/lib/store/userStore";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const { getProfile, updateProfile, changePassword, deleteAccount, loading } = useAuth();
  const { user_id, nickname } = useUserStore();

  const [activeTab, setActiveTab] = useState<"profile" | "password" | "delete">("profile");
  const [nicknameVal, setNicknameVal] = useState(nickname);
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!user_id) { router.push("/login"); return; }
    getProfile().then((u) => setNicknameVal(u.nickname)).catch(() => {});
  }, []);

  const showMsg = (type: "success" | "error", text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(nicknameVal);
      showMsg("success", "닉네임이 변경되었습니다.");
    } catch (err: any) {
      showMsg("error", err?.message ?? "수정에 실패했습니다.");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { showMsg("error", "새 비밀번호가 일치하지 않습니다."); return; }
    if (pwForm.newPassword.length < 8) { showMsg("error", "새 비밀번호는 8자 이상이어야 합니다."); return; }
    try {
      await changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      showMsg("success", "비밀번호가 변경되었습니다.");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      showMsg("error", err?.message ?? "비밀번호 변경에 실패했습니다.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
    if (!confirm("모든 데이터가 삭제됩니다. 계속 진행하시겠습니까?")) return;
    try {
      await deleteAccount();
    } catch (err: any) {
      showMsg("error", err?.message ?? "탈퇴에 실패했습니다.");
    }
  };

  const tabs = [
    { id: "profile" as const, label: "프로필 수정", emoji: "👤" },
    { id: "password" as const, label: "비밀번호 변경", emoji: "🔑" },
    { id: "delete" as const, label: "회원 탈퇴", emoji: "⚠️" },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <main className="page-wrapper" style={{ flex: 1, maxWidth: 640 }}>
        <Link href="/" style={{ color: "var(--color-candy-orange)", fontWeight: 700, fontSize: "0.88rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 24 }}>
          ← 홈으로
        </Link>

        <h1 style={{ fontWeight: 900, fontSize: "1.5rem", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
          <span>👤</span> 내 프로필
        </h1>

        {/* 탭 */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "rgba(255,107,53,0.05)", padding: 6, borderRadius: 14 }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); setMsg(null); }}
              style={{
                flex: 1,
                padding: "9px 12px",
                borderRadius: 10,
                border: "none",
                background: activeTab === t.id ? "#fff" : "transparent",
                color: activeTab === t.id ? "var(--color-candy-orange)" : "var(--text-secondary)",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer",
                boxShadow: activeTab === t.id ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s",
              }}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        {/* 알림 메시지 */}
        {msg && (
          <div
            className="toast"
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              background: msg.type === "success" ? "rgba(6,214,160,0.1)" : "rgba(255,68,85,0.08)",
              color: msg.type === "success" ? "#057A59" : "#CC2233",
              fontWeight: 700,
              fontSize: "0.88rem",
              marginBottom: 16,
              border: `1.5px solid ${msg.type === "success" ? "rgba(6,214,160,0.3)" : "rgba(255,68,85,0.2)"}`,
            }}
          >
            {msg.type === "success" ? "✅" : "⚠️"} {msg.text}
          </div>
        )}

        {/* 프로필 수정 */}
        {activeTab === "profile" && (
          <div className="card fade-in">
            <h2 style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: 20 }}>👤 프로필 수정</h2>
            <form onSubmit={handleProfileUpdate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>닉네임</label>
                <input
                  className="input"
                  value={nicknameVal}
                  onChange={(e) => setNicknameVal(e.target.value)}
                  required minLength={2} maxLength={50}
                  placeholder="2자 이상 50자 이하"
                />
              </div>
              <button className="btn btn-primary" type="submit" disabled={loading} style={{ alignSelf: "flex-end" }}>
                {loading ? "저장 중..." : "변경 저장"}
              </button>
            </form>
          </div>
        )}

        {/* 비밀번호 변경 */}
        {activeTab === "password" && (
          <div className="card fade-in">
            <h2 style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: 20 }}>🔑 비밀번호 변경</h2>
            <form onSubmit={handlePasswordChange} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>현재 비밀번호</label>
                <input className="input" type="password" value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} required />
              </div>
              <div>
                <label style={labelStyle}>새 비밀번호 (8자 이상)</label>
                <input className="input" type="password" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} required minLength={8} />
              </div>
              <div>
                <label style={labelStyle}>새 비밀번호 확인</label>
                <input className="input" type="password" value={pwForm.confirmPassword} onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })} required />
              </div>
              <button className="btn btn-primary" type="submit" disabled={loading} style={{ alignSelf: "flex-end" }}>
                {loading ? "변경 중..." : "비밀번호 변경"}
              </button>
            </form>
          </div>
        )}

        {/* 회원탈퇴 */}
        {activeTab === "delete" && (
          <div className="card fade-in" style={{ border: "1.5px solid rgba(255,68,85,0.2)" }}>
            <h2 style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: 12, color: "#CC2233" }}>⚠️ 회원 탈퇴</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: 20 }}>
              탈퇴하면 작성한 추천글, 댓글이 모두 삭제됩니다.<br />
              이 작업은 <strong>되돌릴 수 없습니다.</strong>
            </p>
            <button className="btn btn-danger" onClick={handleDeleteAccount} disabled={loading}>
              {loading ? "처리 중..." : "정말로 탈퇴하기"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontWeight: 700, fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 6,
};

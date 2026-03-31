"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import Pagination from "@/components/common/Pagination";
import RecommendationCard from "@/components/recommendations/RecommendationCard";
import BoughtSnackCard from "@/components/bought-snacks/BoughtSnackCard";
import { useRecommendations } from "@/hooks/useRecommendations";
import { useBoughtSnacks } from "@/hooks/useBoughtSnacks";
import { useUserStore } from "@/lib/store/userStore";
import type { Recommendation } from "@/types/api";

export default function HomePage() {
  const { role } = useUserStore();
  const isAdmin = role === 'admin';
  const router = useRouter();

  const {
    recommendations,
    totalPages: recTotalPages,
    loading: recLoading,
    fetchList: fetchRecs,
  } = useRecommendations();

  const {
    snacks,
    totalPages: snackTotalPages,
    loading: snackLoading,
    fetchList: fetchSnacks,
  } = useBoughtSnacks();

  const [recPage, setRecPage] = useState(1);
  const [snackPage, setSnackPage] = useState(1);
  const [recList, setRecList] = useState<Recommendation[]>([]);

  useEffect(() => {
    fetchRecs(recPage, 10);
  }, [recPage]);

  useEffect(() => {
    fetchSnacks(snackPage, 10);
  }, [snackPage]);

  useEffect(() => {
    setRecList(recommendations);
  }, [recommendations]);

  const handleRecDeleted = (id: number) => {
    setRecList((prev) => prev.filter((r) => r.주문_id !== id));
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <main className="page-wrapper" style={{ flex: 1, paddingTop: 32 }}>
        {/* 히어로 배너 */}
        <div
          style={{
            background: "linear-gradient(135deg, #FF6B35 0%, #FFD166 100%)",
            borderRadius: 24,
            padding: "32px 36px",
            marginBottom: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 8px 32px rgba(255,107,53,0.25)",
          }}
        >
          <div>
            <h1
              style={{
                fontWeight: 900,
                fontSize: "2rem",
                color: "#fff",
                letterSpacing: "-1px",
                marginBottom: 8,
              }}
            >
              🍪 두과자
            </h1>
            <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "1rem", fontWeight: 600 }}>
              반 구성원들과 과자 취향을 공유해요!
            </p>
          </div>
          <div style={{ fontSize: 64, opacity: 0.8 }}>🛒</div>
        </div>

        {/* 2컬럼 레이아웃 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
          {/* 구매한 과자 */}
          <section>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <h2 className="section-title">🛒 구매한 과자</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {isAdmin && (
                  <button
                    onClick={() => {
                      console.log("새 과자 추가 버튼 클릭됨");
                      if (typeof window !== "undefined") {
                        window.location.href = "/bought-snacks/create";
                      }
                    }}
                    style={{
                      background: "#FF6B35",
                      color: "white",
                      border: "none",
                      borderRadius: 8,
                      padding: "8px 16px",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = "#E55A2B")}
                    onMouseOut={(e) => (e.currentTarget.style.background = "#FF6B35")}
                  >
                    + 새 과자 추가
                  </button>
                )}
                {snackLoading && <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />}
              </div>
            </div>

            {snacks.length === 0 && !snackLoading ? (
              <div className="empty-state">
                <span className="empty-icon">🍬</span>
                <span>아직 구매한 과자가 없어요</span>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {snacks.map((snack) => (
                  <BoughtSnackCard key={snack.구매_id} snack={snack} />
                ))}
              </div>
            )}
            <Pagination page={snackPage} totalPages={snackTotalPages} onChange={setSnackPage} />
          </section>

          {/* 과자 추천 */}
          <section>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <h2 className="section-title">🍬 과자 추천</h2>
              {recLoading && <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />}
            </div>

            {recList.length === 0 && !recLoading ? (
              <div className="empty-state">
                <span className="empty-icon">🍫</span>
                <span>아직 추천글이 없어요</span>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {recList.map((rec) => (
                  <RecommendationCard
                    key={rec.주문_id}
                    rec={rec}
                    onDeleted={handleRecDeleted}
                  />
                ))}
              </div>
            )}
            <Pagination page={recPage} totalPages={recTotalPages} onChange={setRecPage} />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer
      style={{
        marginTop: 48,
        padding: "20px 24px",
        borderTop: "1.5px solid var(--border-color)",
        textAlign: "center",
        color: "var(--text-muted)",
        fontSize: "0.82rem",
        fontWeight: 600,
      }}
    >
      🍪 두과자 — 과자 취향을 나눠요
    </footer>
  );
}

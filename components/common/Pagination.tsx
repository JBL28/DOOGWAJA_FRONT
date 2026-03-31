"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  const showPages = 5;
  let start = Math.max(1, page - Math.floor(showPages / 2));
  let end = Math.min(totalPages, start + showPages - 1);
  if (end - start < showPages - 1) start = Math.max(1, end - showPages + 1);

  if (start > 1) { pages.push(1); if (start > 2) pages.push("..."); }
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages) { if (end < totalPages - 1) pages.push("..."); pages.push(totalPages); }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "16px 0" }}>
      <PageBtn onClick={() => onChange(page - 1)} disabled={page === 1}>‹</PageBtn>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} style={{ color: "var(--text-muted)", padding: "0 4px" }}>…</span>
        ) : (
          <PageBtn key={p} onClick={() => onChange(p as number)} active={p === page}>
            {p}
          </PageBtn>
        )
      )}
      <PageBtn onClick={() => onChange(page + 1)} disabled={page === totalPages}>›</PageBtn>
    </div>
  );
}

function PageBtn({
  onClick,
  disabled,
  active,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        border: active ? "none" : "1.5px solid var(--border-color)",
        background: active ? "var(--color-candy-orange)" : "#fff",
        color: active ? "#fff" : disabled ? "var(--text-muted)" : "var(--text-primary)",
        fontWeight: active ? 800 : 600,
        fontSize: "0.88rem",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.15s",
        boxShadow: active ? "0 2px 8px rgba(255,107,53,0.35)" : "none",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {children}
    </button>
  );
}

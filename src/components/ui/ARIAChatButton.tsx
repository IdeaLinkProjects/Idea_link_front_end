
import { useState } from "react";
import Image from "next/image";
import ARIAChatWidget from "./ARIAChatWidget";

interface User {
  id: number;
  role: string;
  firstName?: string;
}

interface Props {
  user: User | null;
}

export default function ARIAChatButton({ user }: Props) {
  const [open, setOpen] = useState(false);

  // Only show for investors
  if (!user || user.role !== "INVESTOR") return null;

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 90,
            right: 20,
            width: 370,
            height: 580,
            zIndex: 1000,
            borderRadius: 20,
            overflow: "hidden",
            boxShadow:
              "0 20px 60px rgba(0,196,140,0.15), 0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          <ARIAChatWidget
            userId={user.id}
            firstName={user.firstName || ""}
            onClose={() => setOpen(false)}
          />
        </div>
      )}

      {/* Tooltip */}
      {!open && (
        <div
          style={{
            position: "fixed",
            bottom: 86,
            right: 20,
            zIndex: 1000,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              background: "#00C48C",
              color: "#0D1F1A",
              fontSize: 10,
              fontWeight: 700,
              padding: "5px 12px",
              borderRadius: 8,
              whiteSpace: "nowrap",
              boxShadow: "0 4px 12px rgba(0,196,140,0.3)",
            }}
          >
            Ask ARIA ✦
          </div>
        </div>
      )}

      {/* Floating button with IdeaLink logo */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 1000,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: open ? "#0D1F1A" : "#00C48C",
          border: "2.5px solid #00C48C",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(0,196,140,0.45)",
          transition: "all 0.2s ease",
          padding: 0,
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow =
            "0 6px 28px rgba(0,196,140,0.6)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow =
            "0 4px 20px rgba(0,196,140,0.45)";
        }}
        aria-label="Open ARIA investment advisor"
      >
        {open ? (
          <span
            style={{ color: "#00C48C", fontSize: 22, fontWeight: 700, lineHeight: 1 }}
          >
            ✕
          </span>
        ) : (
          <Image
            src="/favicon.ico"
            alt="IdeaLink ARIA"
            width={34}
            height={34}
            style={{ objectFit: "contain" }}
          />
        )}
      </button>
    </>
  );
}

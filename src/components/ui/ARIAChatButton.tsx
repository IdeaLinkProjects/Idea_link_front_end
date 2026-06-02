
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

  // Show for both investors and innovators
  if (!user || (user.role !== "INVESTOR" && user.role !== "INNOVATOR")) return null;

  const isInvestor = user.role === "INVESTOR";
  const primaryColor = "#00C48C";
  const darkColor = "#0D1F1A";
  const shadowColor = "rgba(0,196,140,0.15)";
  const buttonShadow = "rgba(0,196,140,0.45)";
  const buttonShadowHover = "rgba(0,196,140,0.6)";
  const tooltipText = isInvestor ? "Ask ARIA ✦" : "Ask NOVA ✦";
  const ariaLabel = isInvestor ? "Open ARIA investment advisor" : "Open NOVA innovator assistant";

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
            boxShadow: `0 20px 60px ${shadowColor}, 0 8px 32px rgba(0,0,0,0.4)`,
          }}
        >
          <ARIAChatWidget
            userId={user.id}
            firstName={user.firstName || ""}
            onClose={() => setOpen(false)}
            role={user.role as any}
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
              background: primaryColor,
              color: darkColor,
              fontSize: 10,
              fontWeight: 700,
              padding: "5px 12px",
              borderRadius: 8,
              whiteSpace: "nowrap",
              boxShadow: `0 4px 12px ${buttonShadow}`,
            }}
          >
            {tooltipText}
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
          background: open ? darkColor : primaryColor,
          border: `2.5px solid ${primaryColor}`,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 4px 20px ${buttonShadow}`,
          transition: "all 0.2s ease",
          padding: 0,
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow = `0 6px 28px ${buttonShadowHover}`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = `0 4px 20px ${buttonShadow}`;
        }}
        aria-label={ariaLabel}
      >
        {open ? (
          <span
            style={{ color: primaryColor, fontSize: 22, fontWeight: 700, lineHeight: 1 }}
          >
            ✕
          </span>
        ) : (
          <Image
            src="/favicon.ico"
            alt="IdeaLink Chatbot"
            width={34}
            height={34}
            style={{ objectFit: "contain" }}
          />
        )}
      </button>
    </>
  );
}

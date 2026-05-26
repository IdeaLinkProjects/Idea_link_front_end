import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

// ── types ──────────────────────────────────────────────────────────────────
interface CampaignCard {
  id?: number;
  title: string;
  cat?: string;
  category?: string;
  score: number;
  equity?: string;
  val?: string;
  valuation?: number;
  min?: string;
  min_investment?: number;
  funded: number;
  funding_progress?: number;
  closing?: string;
  description?: string;
  short_description?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  userId?: number;
  onClose?: () => void;
}

// IdeaLink green palette
const IL = {
  green: "#00C48C",
  greenDark: "#00A87A",
  greenLight: "#E6FAF5",
  greenBorder: "#B3EEE0",
  dark: "#0D1F1A",
  darkCard: "#112920",
  text: "#E8F5F1",
  textMuted: "#7DB8A8",
};

const DEFAULT_MESSAGE: Message = {
  role: "assistant",
  content: "👋 Hey! I'm ARIA, IdeaLink's investment advisor.\n\nTry asking:\n• \"I have $5,000, where should I invest?\"\n• \"Show me active campaigns\"\n• \"What's trending this week?\"",
};

const STORAGE_KEY = "aria-chat-history";

function parseMessage(raw: string) {
  const cardMatch = raw.match(/\[CARDS\]([\s\S]*?)\[\/CARDS\]/);
  let cards: CampaignCard[] = [];
  let text = raw;
  if (cardMatch) {
    try { cards = JSON.parse(cardMatch[1].trim()); } catch {}
    text = raw.replace(/\[CARDS\][\s\S]*?\[\/CARDS\]/, "").trim();
  }
  return { text, cards };
}

function fmtCurrency(n?: number): string {
  if (!n) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function extractText(data: unknown): string {
  if (!data) return "";
  if (typeof data === "string") return data;
  const d = data as Record<string, unknown>;
  if (d.output) return String(d.output);
  if (d.message) return String(d.message);
  if (d.text) return String(d.text);
  if (Array.isArray(data) && data[0]) return extractText(data[0]);
  return JSON.stringify(data);
}

// ── campaign card ──────────────────────────────────────────────────────────
function CampaignCard({ card }: { card: CampaignCard }) {
  const router = useRouter();
  const funded = card.funded ?? card.funding_progress ?? 0;
  const equity = card.equity || "—";
  const valuation = card.val || fmtCurrency(card.valuation);
  const minInvest = card.min || fmtCurrency(card.min_investment);
  const scoreColor = card.score >= 80 ? IL.green : card.score >= 65 ? "#F59E0B" : "#9CA3AF";
  const progressWidth = Math.min(funded, 100);

  return (
    <div style={{
      width: 200,
      flexShrink: 0,
      background: IL.darkCard,
      border: `1px solid ${IL.greenBorder}22`,
      borderRadius: 14,
      padding: "12px",
      display: "flex",
      flexDirection: "column",
      gap: 8,
    }}>
      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{
          fontSize: 9,
          fontWeight: 600,
          padding: "2px 8px",
          borderRadius: 20,
          background: `${IL.green}22`,
          color: IL.green,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}>
          {card.cat || card.category || "Campaign"}
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, color: scoreColor }}>
          {card.score}/100
        </span>
      </div>

      {/* title */}
      <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: IL.text, lineHeight: 1.3 }}>
        {card.title}
      </p>

      {/* description */}
      {(card.description || card.short_description) && (
        <p style={{ margin: 0, fontSize: 10, color: IL.textMuted, lineHeight: 1.4, 
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {card.description || card.short_description}
        </p>
      )}

      {/* stats */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {[["Equity", equity], ["Valuation", valuation], ["Min invest", minInvest]].map(([label, val]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 10, color: IL.textMuted }}>{label}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: IL.text }}>{val}</span>
          </div>
        ))}
      </div>

      {/* progress */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 9, color: IL.textMuted }}>Funded</span>
          <span style={{ fontSize: 9, fontWeight: 600, color: IL.text }}>{funded}%</span>
        </div>
        <div style={{ background: "#1a3a30", borderRadius: 4, height: 4 }}>
          <div style={{
            width: `${progressWidth}%`,
            background: funded >= 70 ? IL.green : funded >= 40 ? "#F59E0B" : "#EF4444",
            borderRadius: 4,
            height: 4,
            transition: "width 0.6s ease",
          }} />
        </div>
      </div>

      {card.closing && (
        <p style={{ margin: 0, fontSize: 9, color: IL.textMuted }}>Closes {card.closing}</p>
      )}

      {/* button */}
      <button
        onClick={() => card.id && router.push(`/projects/${card.id}`)}
        style={{
          marginTop: "auto",
          width: "100%",
          padding: "7px 0",
          fontSize: 10,
          fontWeight: 600,
          color: IL.dark,
          background: IL.green,
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          transition: "background 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = IL.greenDark)}
        onMouseLeave={e => (e.currentTarget.style.background = IL.green)}
      >
        View details →
      </button>
    </div>
  );
}

// ── message bubble ─────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: Message }) {
  const { text, cards } = parseMessage(msg.content);
  const isUser = msg.role === "user";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start", gap: 8 }}>
      {text && (
        <div style={{
          maxWidth: "82%",
          padding: "9px 13px",
          borderRadius: isUser ? "16px 16px 3px 16px" : "3px 16px 16px 16px",
          background: isUser ? IL.green : "#1a3a30",
          color: isUser ? IL.dark : IL.text,
          fontSize: 12,
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
          fontWeight: isUser ? 500 : 400,
        }}>
          {text}
        </div>
      )}
      {cards.length > 0 && (
        <div style={{ width: "100%", overflowX: "auto", paddingBottom: 6, scrollbarWidth: "thin" }}>
          <div style={{ display: "flex", gap: 10, width: "max-content", padding: "2px 2px" }}>
            {cards.map((card, i) => <CampaignCard key={i} card={card} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ── typing indicator ───────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "9px 13px",
      background: "#1a3a30", borderRadius: "3px 16px 16px 16px", width: "fit-content" }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{
          width: 6, height: 6, borderRadius: "50%", background: IL.green,
          display: "inline-block", animation: "aria-bounce 1.2s infinite",
          animationDelay: `${i * 0.2}s`, opacity: 0.7,
        }} />
      ))}
      <style>{`@keyframes aria-bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}`}</style>
    </div>
  );
}

// ── main widget ────────────────────────────────────────────────────────────
export default function ARIAChatWidget({ userId, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === "undefined") return [DEFAULT_MESSAGE];
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [DEFAULT_MESSAGE];
    } catch { return [DEFAULT_MESSAGE]; }
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch {}
    }
  }, [messages]);

  const handleNewChat = () => {
    setMessages([DEFAULT_MESSAGE]);
    if (typeof window !== "undefined") sessionStorage.removeItem(STORAGE_KEY);
  };

  const sendMessage = async (text?: string) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await fetch("/api/aria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, userId: userId || 1, chatHistory: newMessages.slice(-10) }),
      });
      const data = await res.json();
      const reply = extractText(data) || "I couldn't process that. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const suggestions = ["Show active campaigns", "I have $5,000 to invest", "What's trending?", "My portfolio"];

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      background: IL.dark,
      borderRadius: 20,
      overflow: "hidden",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      border: `1px solid ${IL.green}33`,
    }}>
      {/* ── header ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 16px",
        background: `linear-gradient(135deg, ${IL.dark} 0%, ${IL.darkCard} 100%)`,
        borderBottom: `1px solid ${IL.green}33`,
        flexShrink: 0,
      }}>
        {/* IdeaLink logo */}
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: `${IL.green}22`,
          border: `1.5px solid ${IL.green}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden", flexShrink: 0,
        }}>
          <Image
            src="/logo_idealink.png"
            alt="IdeaLink"
            width={28}
            height={28}
            style={{ objectFit: "contain" }}
          />
        </div>

        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: IL.text }}>ARIA</p>
          <p style={{ margin: 0, fontSize: 10, color: IL.textMuted }}>IdeaLink Investment Advisor</p>
        </div>

        {/* online dot */}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: IL.green }} />
          <span style={{ fontSize: 10, color: IL.textMuted }}>Online</span>
        </div>

        {/* new chat */}
        <button
          onClick={handleNewChat}
          style={{
            fontSize: 10, fontWeight: 500, padding: "4px 10px",
            border: `1px solid ${IL.green}44`, borderRadius: 8,
            background: "transparent", color: IL.textMuted,
            cursor: "pointer", transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = IL.green; e.currentTarget.style.color = IL.green; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = `${IL.green}44`; e.currentTarget.style.color = IL.textMuted; }}
        >
          New chat
        </button>

        {onClose && (
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: IL.textMuted, cursor: "pointer", fontSize: 16, padding: 2 }}
            aria-label="Close"
          >
            ✕
          </button>
        )}
      </div>

      {/* ── messages ── */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "14px 14px 8px",
        display: "flex", flexDirection: "column", gap: 12,
        scrollbarWidth: "thin", scrollbarColor: `${IL.green}33 transparent`,
      }}>
        {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* ── suggestion chips ── */}
      {messages.length === 1 && (
        <div style={{
          padding: "0 14px 10px",
          display: "flex", gap: 7, overflowX: "auto", scrollbarWidth: "none", flexShrink: 0,
        }}>
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => sendMessage(s)}
              style={{
                flexShrink: 0, fontSize: 10, fontWeight: 500,
                padding: "5px 12px", borderRadius: 20,
                border: `1px solid ${IL.green}44`,
                background: `${IL.green}11`, color: IL.green,
                cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${IL.green}22`; }}
              onMouseLeave={e => { e.currentTarget.style.background = `${IL.green}11`; }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* ── input ── */}
      <div style={{
        display: "flex", gap: 10, padding: "10px 14px",
        borderTop: `1px solid ${IL.green}22`, alignItems: "flex-end", flexShrink: 0,
      }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask ARIA anything..."
          rows={1}
          style={{
            flex: 1, resize: "none",
            border: `1px solid ${IL.green}33`,
            borderRadius: 12, padding: "9px 13px",
            fontSize: 12, fontFamily: "inherit",
            outline: "none", lineHeight: 1.5,
            maxHeight: 90, overflowY: "auto",
            background: "#1a3a30",
            color: IL.text,
          }}
          onFocus={e => (e.target.style.borderColor = IL.green)}
          onBlur={e => (e.target.style.borderColor = `${IL.green}33`)}
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = `${Math.min(el.scrollHeight, 90)}px`;
          }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{
            width: 38, height: 38, borderRadius: "50%",
            background: loading || !input.trim() ? "#1a3a30" : IL.green,
            border: `1px solid ${loading || !input.trim() ? IL.green + "22" : IL.green}`,
            color: loading || !input.trim() ? IL.textMuted : IL.dark,
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, flexShrink: 0, transition: "all 0.15s",
          }}
          aria-label="Send"
        >
          ➤
        </button>
      </div>
    </div>
  );
}

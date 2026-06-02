
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
  cards?: CampaignCard[];
}

interface Props {
  userId?: number;
  firstName?: string;
  onClose?: () => void;
  role?: "INVESTOR" | "INNOVATOR";
}

// IdeaLink green palette (Default for Investors)
const DEFAULT_IL = {
  green: "#00C48C",
  greenDark: "#00A87A",
  greenLight: "#E6FAF5",
  dark: "#0D1F1A",
  darkCard: "#112920",
  darkInput: "#1a3a30",
  text: "#E8F5F1",
  textMuted: "#7DB8A8",
  border: "#00C48C22",
};

type ILTheme = typeof DEFAULT_IL;

function getStorageKey(userId?: number, role?: "INVESTOR" | "INNOVATOR") {
  return `aria-chat-history-${userId ?? "anon"}-${role ?? "INVESTOR"}`;
}

// ── helpers ──────────────────────────────────────────────────────────────
function parseMessage(raw: string) {
  // Matches [CARDS]...[/CARDS], [PROJECTS]...[/PROJECTS], etc. case-insensitively
  const cardMatch = raw.match(/\[(CARDS|CARD|PROJECTS|PROJECT|CAMPAIGNS|CAMPAIGN)\]([\s\S]*?)\[\/\1\]/i);
  let cards: CampaignCard[] = [];
  let text = raw;
  if (cardMatch) {
    let jsonStr = cardMatch[2].trim();
    // Strip markdown code blocks if the LLM outputted them inside the custom tags
    jsonStr = jsonStr.replace(/^```(?:json)?\s*|```$/g, "").trim();
    try {
      // First try standard parse
      cards = JSON.parse(jsonStr);
    } catch (e) {
      // Try parsing after removing trailing commas
      try {
        const cleanedStr = jsonStr
          .replace(/,\s*\]/g, "]")
          .replace(/,\s*\}/g, "}");
        cards = JSON.parse(cleanedStr);
      } catch (err2) {
        console.error(
          `ARIA: Failed to parse [${cardMatch[1]}] JSON:`,
          e,
          "Raw matched string:",
          cardMatch[2]
        );
      }
    }
    // Remove the match from the text so it doesn't display raw tags/JSON to the user
    text = raw.replace(/\[(CARDS|CARD|PROJECTS|PROJECT|CAMPAIGNS|CAMPAIGN)\]([\s\S]*?)\[\/\1\]/i, "").trim();
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

// ── campaign card ─────────────────────────────────────────────────────────
function CampaignCard({ card, theme = DEFAULT_IL }: { card: CampaignCard; theme?: ILTheme }) {
  const router = useRouter();
  const funded = card.funded ?? card.funding_progress ?? 0;
  const equity = card.equity || "—";
  const valuation = card.val || fmtCurrency(card.valuation);
  const minInvest = card.min || fmtCurrency(card.min_investment);
  const scoreColor =
    card.score >= 80 ? theme.green : card.score >= 65 ? "#F59E0B" : "#9CA3AF";
  const progressColor =
    funded >= 70 ? theme.green : funded >= 40 ? "#F59E0B" : "#EF4444";

  return (
    <div
      style={{
        width: 200,
        flexShrink: 0,
        background: theme.darkCard,
        border: `1px solid ${theme.border}`,
        borderRadius: 14,
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span
          style={{
            fontSize: 9,
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: 20,
            background: `${theme.green}22`,
            color: theme.green,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {card.cat || card.category || "Campaign"}
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, color: scoreColor }}>
          {card.score}/100
        </span>
      </div>

      <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: theme.text, lineHeight: 1.3 }}>
        {card.title}
      </p>

      {(card.description || card.short_description) && (
        <p
          style={{
            margin: 0, fontSize: 10, color: theme.textMuted, lineHeight: 1.4,
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}
        >
          {card.description || card.short_description}
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {[["Equity", equity], ["Valuation", valuation], ["Min invest", minInvest]].map(
          ([label, val]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 10, color: theme.textMuted }}>{label}</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: theme.text }}>{val}</span>
            </div>
          )
        )}
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 9, color: theme.textMuted }}>Funded</span>
          <span style={{ fontSize: 9, fontWeight: 600, color: theme.text }}>{funded}%</span>
        </div>
        <div style={{ background: "#1a3a30", borderRadius: 4, height: 4 }}>
          <div
            style={{
              width: `${Math.min(funded, 100)}%`,
              background: progressColor,
              borderRadius: 4,
              height: 4,
              transition: "width 0.6s ease",
            }}
          />
        </div>
      </div>

      {card.closing && (
        <p style={{ margin: 0, fontSize: 9, color: theme.textMuted }}>
          Closes {card.closing}
        </p>
      )}

      <button
        onClick={() => {
          const id = card.id ?? (card as any).campaignId ?? (card as any).campaign_id ?? (card as any).projectId ?? (card as any).project_id;
          if (id) {
            router.push(`/projects/${id}`);
          } else {
            console.warn("ARIA: No project/campaign ID found on card object:", card);
          }
        }}
        style={{
          marginTop: "auto",
          width: "100%",
          padding: "7px 0",
          fontSize: 10,
          fontWeight: 600,
          color: theme.dark,
          background: theme.green,
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = theme.greenDark)}
        onMouseLeave={(e) => (e.currentTarget.style.background = theme.green)}
      >
        View details →
      </button>
    </div>
  );
}

// ── message bubble ────────────────────────────────────────────────────────
function MessageBubble({ msg, theme = DEFAULT_IL }: { msg: Message; theme?: ILTheme }) {
  const parsed = parseMessage(msg.content);
  const isUser = msg.role === "user";
  const cards = msg.cards && msg.cards.length > 0 ? msg.cards : parsed.cards;
  const text = parsed.text;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        gap: 8,
      }}
    >
      {text && (
        <div
          style={{
            maxWidth: "82%",
            padding: "9px 13px",
            borderRadius: isUser ? "16px 16px 3px 16px" : "3px 16px 16px 16px",
            background: isUser ? theme.green : "#1a3a30",
            color: isUser ? theme.dark : theme.text,
            fontSize: 12,
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            fontWeight: isUser ? 500 : 400,
          }}
        >
          {text}
        </div>
      )}
      {cards.length > 0 && (
        <div style={{ width: "100%", overflowX: "auto", paddingBottom: 6, scrollbarWidth: "thin" }}>
          <div style={{ display: "flex", gap: 10, width: "max-content", padding: "2px 2px" }}>
            {cards.map((card, i) => {
              if (!card || typeof card !== "object") return null;
              return <CampaignCard key={i} card={card} theme={theme} />;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── typing indicator ──────────────────────────────────────────────────────
function TypingIndicator({ theme = DEFAULT_IL }: { theme?: ILTheme }) {
  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 5,
        padding: "9px 13px", background: "#1a3a30",
        borderRadius: "3px 16px 16px 16px", width: "fit-content",
      }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 6, height: 6, borderRadius: "50%",
            background: theme.green, display: "inline-block",
            animation: "aria-bounce 1.2s infinite",
            animationDelay: `${i * 0.2}s`, opacity: 0.7,
          }}
        />
      ))}
      <style>{`@keyframes aria-bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}`}</style>
    </div>
  );
}

// ── main widget ───────────────────────────────────────────────────────────
export default function ARIAChatWidget({ userId, firstName, onClose, role = "INVESTOR" }: Props) {
  const isInvestor = role === "INVESTOR";
  
  // Keep original green palette colors for both ARIA and NOVA
  const IL = {
    green: "#00C48C",
    greenDark: "#00A87A",
    greenLight: "#E6FAF5",
    dark: "#0D1F1A",
    darkCard: "#112920",
    darkInput: "#1a3a30",
    text: "#E8F5F1",
    textMuted: "#7DB8A8",
    border: "#00C48C22",
  };

  const aiName = isInvestor ? "ARIA" : "NOVA";
  const aiTitle = isInvestor ? "IdeaLink Investment Advisor" : "IdeaLink Innovator Support AI";
  const apiEndpoint = isInvestor ? "/api/aria" : "/api/nova";

  // Build personalized welcome message using the user's real first name
  const welcomeMessage: Message = {
    role: "assistant",
    content: isInvestor
      ? (firstName
          ? `👋 Welcome back, ${firstName}! I'm ARIA, your IdeaLink investment advisor.\n\nI can see your profile and portfolio. Try asking:\n• "What is my portfolio?"\n• "How much have I invested?"\n• "Show me active campaigns"\n• "I have $5,000, where should I invest?"`
          : `👋 Hey! I'm ARIA, your IdeaLink investment advisor.\n\nTry asking:\n• "Show me active campaigns"\n• "I have $5,000, where should I invest?"\n• "What's trending this week?"`)
      : (firstName
          ? `👋 Welcome back, ${firstName}! I'm NOVA, your IdeaLink innovator support AI.\n\nI can help you draft campaign details, track progress, or optimize your pitches. Try asking:\n• "How do I optimize my campaign?"\n• "Draft a campaign story"\n• "Show my active campaigns"\n• "Help me structure my risks"`
          : `👋 Hey! I'm NOVA, your IdeaLink innovator support AI.\n\nTry asking:\n• "Draft a campaign story"\n• "Show my active campaigns"\n• "How to attract investors?"`),
  };

  const storageKey = getStorageKey(userId, role);
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === "undefined") return [welcomeMessage];
    try {
      const saved = sessionStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [welcomeMessage];
    } catch {
      return [welcomeMessage];
    }
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Save chat to sessionStorage — persists until tab is closed
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(messages));
      } catch {}
    }
  }, [messages, storageKey]);

  const handleNewChat = () => {
    setMessages([welcomeMessage]);
    if (typeof window !== "undefined") sessionStorage.removeItem(storageKey);
  };

  const sendMessage = async (text?: string) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userText },
    ];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Get investor's token to pass to API
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("ideal-link-access-token")
          : null;

      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: userText,
          userId: userId || 1,
          sessionId: `user-${userId || 1}`,
          chatHistory: newMessages.slice(-10),
        }),
      });

      const data = await res.json();
      const reply =
        extractText(data) || "I couldn't process that. Please try again.";
      
      // Extract structured cards if they are returned directly in the response
      const cards = data?.cards || data?.projects || null;

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
          ...(cards ? { cards } : {}),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Connection error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestions = isInvestor
    ? [
        "What is my portfolio?",
        "Show active campaigns",
        "I have $5,000 to invest",
        "What's trending?",
      ]
    : [
        "Draft a campaign story",
        "Show my active campaigns",
        "How to attract investors?",
        "Review my KPIs",
      ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: IL.dark,
        borderRadius: 20,
        overflow: "hidden",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        border: `1px solid ${IL.green}33`,
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 16px",
          background: `linear-gradient(135deg, ${IL.dark} 0%, ${IL.darkCard} 100%)`,
          borderBottom: `1px solid ${IL.green}33`,
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: 36, height: 36, borderRadius: "50%",
            background: `${IL.green}22`,
            border: `1.5px solid ${IL.green}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden", flexShrink: 0,
          }}
        >
          <Image
            src="/logo_idealink.png"
            alt="IdeaLink"
            width={28}
            height={28}
            style={{ objectFit: "contain" }}
          />
        </div>

        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: IL.text }}>
            {aiName}
          </p>
          <p style={{ margin: 0, fontSize: 10, color: IL.textMuted }}>
            {aiTitle}
          </p>
        </div>

        {/* Online dot */}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: IL.green }} />
          <span style={{ fontSize: 10, color: IL.textMuted }}>Online</span>
        </div>

        {/* New chat button */}
        <button
          onClick={handleNewChat}
          style={{
            fontSize: 10, fontWeight: 500, padding: "4px 10px",
            border: `1px solid ${IL.green}44`, borderRadius: 8,
            background: "transparent", color: IL.textMuted,
            cursor: "pointer", transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = IL.green;
            e.currentTarget.style.color = IL.green;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = `${IL.green}44`;
            e.currentTarget.style.color = IL.textMuted;
          }}
        >
          New chat
        </button>

        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none",
              color: IL.textMuted, cursor: "pointer",
              fontSize: 16, padding: 2,
            }}
            aria-label="Close"
          >
            ✕
          </button>
        )}
      </div>

      {/* ── Messages ── */}
      <div
        style={{
          flex: 1, overflowY: "auto", padding: "14px 14px 8px",
          display: "flex", flexDirection: "column", gap: 12,
          scrollbarWidth: "thin",
          scrollbarColor: `${IL.green}33 transparent`,
        }}
      >
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} theme={IL} />
        ))}
        {loading && <TypingIndicator theme={IL} />}
        <div ref={bottomRef} />
      </div>

      {/* ── Suggestion chips — only on first message ── */}
      {messages.length === 1 && (
        <div
          style={{
            padding: "0 14px 10px",
            display: "flex", gap: 7,
            overflowX: "auto", scrollbarWidth: "none",
            flexShrink: 0,
          }}
        >
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => sendMessage(s)}
              style={{
                flexShrink: 0, fontSize: 10, fontWeight: 500,
                padding: "5px 12px", borderRadius: 20,
                border: `1px solid ${IL.green}44`,
                background: `${IL.green}11`, color: IL.green,
                cursor: "pointer", whiteSpace: "nowrap",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${IL.green}22`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `${IL.green}11`;
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* ── Input ── */}
      <div
        style={{
          display: "flex", gap: 10, padding: "10px 14px",
          borderTop: `1px solid ${IL.green}22`,
          alignItems: "flex-end", flexShrink: 0,
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Ask ${aiName} anything...`}
          rows={1}
          style={{
            flex: 1, resize: "none",
            border: `1px solid ${IL.green}33`,
            borderRadius: 12, padding: "9px 13px",
            fontSize: 12, fontFamily: "inherit",
            outline: "none", lineHeight: 1.5,
            maxHeight: 90, overflowY: "auto",
            background: IL.darkInput,
            color: IL.text,
            transition: "border-color 0.15s",
          }}
          onFocus={(e) => (e.target.style.borderColor = IL.green)}
          onBlur={(e) => (e.target.style.borderColor = `${IL.green}33`)}
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
            background:
              loading || !input.trim() ? "#1a3a30" : IL.green,
            border: `1px solid ${
              loading || !input.trim() ? `${IL.green}22` : IL.green
            }`,
            color:
              loading || !input.trim() ? IL.textMuted : IL.dark,
            cursor:
              loading || !input.trim() ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center",
            justifyContent: "center",
            fontSize: 16, flexShrink: 0,
            transition: "all 0.15s",
          }}
          aria-label="Send"
        >
          ➤
        </button>
      </div>
    </div>
  );
}

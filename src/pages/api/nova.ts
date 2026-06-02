import type { NextApiRequest, NextApiResponse } from "next";

const N8N_WEBHOOK = "https://kvillai.app.n8n.cloud/webhook/nova-chat-trigger-001/chat";

const BACKEND_URL = "https://idealink-7i33.onrender.com/api";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, chatHistory, sessionId, language } = req.body;
    const authHeader = req.headers.authorization;

    let realUserId = 1;
    let firstName = "";

    // Fetch real user info using their token
    if (authHeader) {
      try {
        const profileRes = await fetch(`${BACKEND_URL}/users/roles/status`, {
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          realUserId = profileData.userId;
          // Get first name only e.g. "Elshaday" from "Elshaday Negus"
          firstName = profileData.fullName?.split(" ")[0] || "";
        }
      } catch (e) {
        console.error("Could not fetch user profile:", e);
      }
    }

    const response = await fetch(N8N_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatInput: message,
        message: message,
        sessionId: sessionId || `user-${realUserId}`,
        userId: realUserId,
        firstName: firstName,
        chatHistory: chatHistory || [],
        language: language || "en",
      }),
    });

    const text = await response.text();
    console.log("=== NOVA Webhook Response ===");
    console.log("Status:", response.status);
    console.log("Raw Response Text:", text);

    try {
      const data = JSON.parse(text);
      const output =
        data?.output ||
        data?.message ||
        data?.text ||
        data?.response ||
        (Array.isArray(data) ? data[0]?.output || data[0]?.text : null) ||
        text;
      
      // Forward the entire response data object along with the resolved output
      return res.status(200).json({
        ...(typeof data === "object" && data !== null ? data : {}),
        output,
      });
    } catch {
      return res.status(200).json({ output: text });
    }
  } catch (error) {
    console.error("NOVA error:", error);
    return res.status(500).json({ error: "Failed to reach NOVA" });
  }
}

import type { NextApiRequest, NextApiResponse } from "next";

const N8N_WEBHOOK = "https://kvillain6327.app.n8n.cloud/webhook/b3da1344-e359-4770-8b50-38c385e06ca3/chat";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { message, userId, chatHistory, sessionId } = req.body;

    const response = await fetch(N8N_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatInput: message,
        message: message,
        sessionId: sessionId || `user-${userId || 1}`,
        userId: userId || 1,
        chatHistory: chatHistory || [],
      }),
    });

    const text = await response.text();
    
    // Try to parse as JSONGet-Content src\store\hooks.ts
    try {
      const data = JSON.parse(text);
      // n8n can return different formats
      const output = 
        data?.output || 
        data?.message || 
        data?.text || 
        data?.response ||
        (Array.isArray(data) ? data[0]?.output || data[0]?.text : null) ||
        text;
      return res.status(200).json({ output });
    } catch {
      // If not JSON just return the text
      return res.status(200).json({ output: text });
    }
  } catch (error) {
    console.error("ARIA error:", error);
    return res.status(500).json({ error: "Failed to reach ARIA" });
  }
}
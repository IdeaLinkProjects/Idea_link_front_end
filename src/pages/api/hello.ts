import type { NextApiRequest, NextApiResponse } from "next";
import { siteConfig } from "@/config/site";

type HealthResponse = {
  status: "ok";
  service: string;
  timestamp: string;
};

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<HealthResponse>,
) {
  res.status(200).json({
    status: "ok",
    service: siteConfig.name,
    timestamp: new Date().toISOString(),
  });
}

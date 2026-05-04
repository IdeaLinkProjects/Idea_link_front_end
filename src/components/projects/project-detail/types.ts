import type { messages } from "@/locales";

export type ProjectDetailTabKey = "overview" | "risks" | "updates" | "documents";

export type DiscoveryCategoryKey = keyof typeof messages.en.discovery.categories;

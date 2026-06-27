import type { messages } from "@/locales";

export type ProjectDetailTabKey = "overview" | "risks" | "updates" | "comments" | "documents";

export type DiscoveryCategoryKey = keyof typeof messages.en.discovery.categories;

import { Bot, Cloud, Globe, TrendingUp, type LucideIcon } from "lucide-react";

/** One icon per case study filter tab, used on cards and the detail page. */
const ICONS: Record<string, LucideIcon> = {
  "AI & Automation": Bot,
  "Platforms & Cloud": Cloud,
  Fintech: TrendingUp,
  "Web & Brand": Globe,
};

export const caseStudyIcon = (category: string): LucideIcon => ICONS[category] ?? Globe;

import { BookOpen, Briefcase, FileText, FolderKanban, HelpCircle, History, Image, LayoutDashboard, LayoutTemplate, ListTree, Settings, Sparkles, UserCircle, Users, UsersRound, type LucideIcon } from "lucide-react";
import type { Permission } from "@/lib/types";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  permission?: Permission;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  { items: [{ href: "/", label: "Dashboard", icon: LayoutDashboard }] },
  {
    label: "Website",
    items: [
      { href: "/pages", label: "Pages", icon: LayoutTemplate },
      { href: "/content/services", label: "Services", icon: Sparkles },
      { href: "/content/serviceCategories", label: "Service categories", icon: ListTree, permission: "structure.edit" },
      { href: "/content/projects", label: "Projects", icon: FolderKanban },
      { href: "/content/caseStudies", label: "Case studies", icon: FileText },
    ],
  },
  {
    label: "Publishing",
    items: [
      { href: "/content/blogPosts", label: "Blog", icon: BookOpen },
      { href: "/content/authors", label: "Authors", icon: UserCircle },
      { href: "/content/faqs", label: "FAQs", icon: HelpCircle },
      { href: "/media", label: "Media library", icon: Image },
    ],
  },
  {
    label: "Company",
    items: [
      { href: "/content/jobs", label: "Careers", icon: Briefcase },
      { href: "/content/teamMembers", label: "Team", icon: UsersRound },
    ],
  },
  {
    label: "Administration",
    items: [
      { href: "/settings", label: "Settings", icon: Settings },
      { href: "/users", label: "Users", icon: Users, permission: "users.manage" },
      { href: "/activity", label: "Activity log", icon: History, permission: "audit.view" },
    ],
  },
];

export const isActive = (href: string, location: string) => (href === "/" ? location === "/" : location === href || location.startsWith(`${href}/`));

/** The nav entry (and its group) that owns a location, preferring the longest match. */
export function findNav(location: string): { group?: string; item: NavItem } | null {
  let best: { group?: string; item: NavItem } | null = null;
  for (const g of navGroups)
    for (const item of g.items)
      if (isActive(item.href, location) && (!best || item.href.length > best.item.href.length)) best = { group: g.label, item };
  return best;
}

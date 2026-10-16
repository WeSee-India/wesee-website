import { BookOpen, Briefcase, ExternalLink, FileText, FolderKanban, HelpCircle, History, Image, LayoutDashboard, LayoutTemplate, ListTree, LogOut, Menu, Settings, Sparkles, UserCircle, Users, UsersRound, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useSchema } from "@/lib/schema";
import type { Permission } from "@/lib/types";
import { confirmLeave } from "@/lib/unsaved";
import { cx } from "./ui";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  permission?: Permission;
}

const ic = "size-4 shrink-0";

const groups: { label?: string; items: NavItem[] }[] = [
  { items: [{ href: "/", label: "Dashboard", icon: <LayoutDashboard className={ic} /> }] },
  {
    label: "Website",
    items: [
      { href: "/pages", label: "Pages", icon: <LayoutTemplate className={ic} /> },
      { href: "/content/services", label: "Services", icon: <Sparkles className={ic} /> },
      { href: "/content/serviceCategories", label: "Service categories", icon: <ListTree className={ic} />, permission: "structure.edit" },
      { href: "/content/projects", label: "Projects", icon: <FolderKanban className={ic} /> },
      { href: "/content/caseStudies", label: "Case studies", icon: <FileText className={ic} /> },
      { href: "/content/blogPosts", label: "Blog", icon: <BookOpen className={ic} /> },
      { href: "/content/authors", label: "Authors", icon: <UserCircle className={ic} /> },
      { href: "/content/faqs", label: "FAQs", icon: <HelpCircle className={ic} /> },
      { href: "/content/jobs", label: "Careers", icon: <Briefcase className={ic} /> },
      { href: "/content/teamMembers", label: "Team", icon: <UsersRound className={ic} /> },
      { href: "/media", label: "Media library", icon: <Image className={ic} /> },
    ],
  },
  {
    label: "Administration",
    items: [
      { href: "/settings", label: "Settings", icon: <Settings className={ic} /> },
      { href: "/users", label: "Users", icon: <Users className={ic} />, permission: "users.manage" },
      { href: "/activity", label: "Activity log", icon: <History className={ic} />, permission: "audit.view" },
    ],
  },
];

function NavLink({ item, onNavigate }: { item: NavItem; onNavigate(): void }) {
  const [location] = useLocation();
  const active = item.href === "/" ? location === "/" : location === item.href || location.startsWith(`${item.href}/`);
  return (
    <Link
      href={item.href}
      onClick={(e) => {
        if (!confirmLeave()) e.preventDefault();
        else onNavigate();
      }}
      aria-current={active ? "page" : undefined}
      className={cx("flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13.5px] transition-colors", active ? "bg-white/10 text-white" : "text-neutral-400 hover:bg-white/5 hover:text-white")}
    >
      {item.icon}
      {item.label}
    </Link>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout, can } = useAuth();
  const schema = useSchema();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav aria-label="Admin" className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-5">
        <Link href="/" className="text-lg font-semibold tracking-tight text-white" onClick={(e) => !confirmLeave() && e.preventDefault()}>
          WeSee<span className="text-accent">.</span> <span className="text-sm font-normal text-neutral-400">Admin</span>
        </Link>
        <button type="button" className="rounded p-1 text-neutral-400 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
          <X className="size-5" />
        </button>
      </div>
      <div className="flex-1 space-y-5 overflow-y-auto px-2.5 pb-4">
        {groups.map((g, i) => {
          const items = g.items.filter((it) => !it.permission || can(it.permission));
          if (!items.length) return null;
          return (
            <div key={i}>
              {g.label && <p className="mb-1 px-2.5 text-[11px] font-medium uppercase tracking-wider text-neutral-500">{g.label}</p>}
              <div className="space-y-0.5">
                {items.map((it) => (
                  <NavLink key={it.href} item={it} onNavigate={() => setOpen(false)} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="border-t border-white/10 p-2.5">
        {schema.data && (
          <a href={schema.data.siteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13.5px] text-neutral-400 hover:bg-white/5 hover:text-white">
            <ExternalLink className={ic} /> View website
          </a>
        )}
        <Link href="/profile" onClick={(e) => (!confirmLeave() ? e.preventDefault() : setOpen(false))} className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13.5px] text-neutral-400 hover:bg-white/5 hover:text-white">
          <UserCircle className={ic} />
          <span className="min-w-0">
            <span className="block truncate text-neutral-200">{user?.name}</span>
            <span className="block text-[11px] capitalize">{user?.role.toLowerCase()}</span>
          </span>
        </Link>
        <button type="button" onClick={() => confirmLeave() && logout()} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13.5px] text-neutral-400 hover:bg-white/5 hover:text-white">
          <LogOut className={ic} /> Sign out
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen lg:pl-60">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 bg-ink lg:block">{nav}</aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-ink">{nav}</aside>
        </div>
      )}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-neutral-200 bg-white/90 px-4 py-2.5 backdrop-blur lg:hidden">
        <button type="button" onClick={() => setOpen(true)} className="rounded p-1" aria-label="Open menu">
          <Menu className="size-5" />
        </button>
        <span className="font-semibold">
          WeSee<span className="text-accent-dark">.</span> Admin
        </span>
      </header>
      <main id="main" tabIndex={-1} className="mx-auto max-w-6xl px-4 py-6 focus:outline-none sm:px-6 lg:py-8">
        {children}
      </main>
    </div>
  );
}

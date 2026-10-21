import { useQueryClient } from "@tanstack/react-query";
import { ChevronRight, ExternalLink, LogOut, Menu, Search, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { prefetchFor } from "@/lib/queries";
import { useSchema } from "@/lib/schema";
import { confirmLeave } from "@/lib/unsaved";
import { CommandMenu } from "./CommandMenu";
import { findNav, isActive, navGroups, type NavItem } from "./nav";
import { Avatar, Button, cx } from "./ui";

function guard(e: React.MouseEvent, then?: () => void) {
  if (!confirmLeave()) e.preventDefault();
  else then?.();
}

function NavLink({ item, onNavigate }: { item: NavItem; onNavigate(): void }) {
  const [location] = useLocation();
  const qc = useQueryClient();
  const active = isActive(item.href, location);
  const Icon = item.icon;
  // Start fetching the screen's data on hover, so it's usually ready by the click.
  const prefetch = () => prefetchFor(qc, item.href);
  return (
    <Link
      href={item.href}
      onClick={(e) => guard(e, onNavigate)}
      onMouseEnter={prefetch}
      onFocus={prefetch}
      aria-current={active ? "page" : undefined}
      className={cx(
        "group relative flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-[13.5px] transition-colors",
        active ? "bg-white font-medium text-ink shadow-xs ring-1 ring-neutral-200" : "text-neutral-600 hover:bg-neutral-200/50 hover:text-ink",
      )}
    >
      <Icon className={cx("size-4 shrink-0", active ? "text-accent-dark" : "text-neutral-400 group-hover:text-neutral-600")} aria-hidden />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

export function Logo({ dark }: { dark?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className={cx("flex size-8 items-center justify-center rounded-lg text-[15px] font-bold tracking-tight", dark ? "bg-white text-ink" : "bg-ink text-white")}>
        W<span className="text-accent">.</span>
      </span>
      <span className="leading-tight">
        <span className={cx("block text-[15px] font-semibold tracking-tight", dark ? "text-white" : "text-ink")}>
          WeSee<span className="text-accent">.</span>
        </span>
        <span className={cx("block text-[11px] font-medium", dark ? "text-neutral-400" : "text-neutral-500")}>Content admin</span>
      </span>
    </span>
  );
}

function Breadcrumbs() {
  const [location] = useLocation();
  const schema = useSchema();
  const match = findNav(location);
  if (!match) return <span className="text-sm font-medium">{location === "/profile" ? "Your profile" : "Admin"}</span>;

  const rest = location.slice(match.item.href.length).split("/").filter(Boolean);
  let leaf: string | null = null;
  if (rest.length) {
    if (match.item.href === "/settings") leaf = schema.data?.settings.find((s) => s.key === rest[0])?.label ?? null;
    else leaf = rest[0] === "new" ? "New" : "Edit";
  }

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1.5 text-sm">
        {match.group && (
          <li className="hidden items-center gap-1.5 text-neutral-500 sm:flex">
            {match.group}
            <ChevronRight className="size-3.5 text-neutral-300" aria-hidden />
          </li>
        )}
        <li className="min-w-0 truncate">
          {leaf ? (
            <Link href={match.item.href} onClick={(e) => guard(e)} className="text-neutral-500 hover:text-ink">
              {match.item.label}
            </Link>
          ) : (
            <span className="font-medium text-ink" aria-current="page">
              {match.item.label}
            </span>
          )}
        </li>
        {leaf && (
          <li className="flex min-w-0 items-center gap-1.5">
            <ChevronRight className="size-3.5 shrink-0 text-neutral-300" aria-hidden />
            <span className="truncate font-medium text-ink" aria-current="page">
              {leaf}
            </span>
          </li>
        )}
      </ol>
    </nav>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout, can } = useAuth();
  const schema = useSchema();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [command, setCommand] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommand((c) => !c);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // New screen starts at the top.
  useEffect(() => {
    window.scrollTo(0, 0);
    panel.current?.scrollTo(0, 0);
  }, [location]);

  const nav = (
    <nav aria-label="Admin" className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 pb-4 pt-5">
        <Link href="/" onClick={(e) => guard(e, () => setOpen(false))} aria-label="WeSee admin home">
          <Logo />
        </Link>
        <button type="button" className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-200/60 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
          <X className="size-5" />
        </button>
      </div>

      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setCommand(true);
          }}
          className="flex h-9 w-full items-center gap-2 rounded-lg bg-white px-2.5 text-[13px] text-neutral-500 shadow-xs ring-1 ring-neutral-200 transition-colors hover:text-ink hover:ring-neutral-300"
        >
          <Search className="size-4" aria-hidden />
          <span className="flex-1 text-left">Jump to…</span>
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-3 pb-4 pt-1">
        {navGroups.map((g, i) => {
          const items = g.items.filter((it) => !it.permission || can(it.permission));
          if (!items.length) return null;
          return (
            <div key={i}>
              {g.label && <p className="mb-1 px-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-400">{g.label}</p>}
              <div className="space-y-px">
                {items.map((it) => (
                  <NavLink key={it.href} item={it} onNavigate={() => setOpen(false)} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-neutral-200/80 p-3">
        <div className="flex items-center gap-1 rounded-xl p-1 hover:bg-neutral-200/40">
          <Link href="/profile" onClick={(e) => guard(e, () => setOpen(false))} className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg p-1" title="Your profile">
            <Avatar name={user?.name} />
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-[13px] font-medium text-ink">{user?.name}</span>
              <span className="block truncate text-[11.5px] capitalize text-neutral-500">{user?.role.toLowerCase()}</span>
            </span>
          </Link>
          <button type="button" onClick={() => confirmLeave() && logout()} className="rounded-lg p-2 text-neutral-500 hover:bg-white hover:text-ink hover:shadow-xs" aria-label="Sign out" title="Sign out">
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-paper lg:pl-64">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:shadow-pop">
        Skip to content
      </a>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-paper lg:block">{nav}</aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-ink/40 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-paper shadow-pop">{nav}</aside>
        </div>
      )}

      <div className="lg:py-2 lg:pr-2">
        <div ref={panel} className="min-h-screen bg-white lg:h-[calc(100vh-1rem)] lg:min-h-0 lg:overflow-y-auto lg:rounded-2xl lg:shadow-card lg:ring-1 lg:ring-neutral-200/80">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-neutral-100 bg-white/85 px-4 backdrop-blur-md sm:px-6">
            <button type="button" onClick={() => setOpen(true)} className="-ml-1.5 rounded-lg p-1.5 text-neutral-600 hover:bg-neutral-100 lg:hidden" aria-label="Open menu">
              <Menu className="size-5" />
            </button>
            <div className="min-w-0 flex-1">
              <Breadcrumbs />
            </div>
            <Button size="sm" variant="ghost" className="lg:hidden" icon={<Search className="size-4" />} aria-label="Jump to" onClick={() => setCommand(true)} />
            {schema.data && (
              <a href={schema.data.siteUrl} target="_blank" rel="noopener noreferrer" className="hidden h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium text-neutral-600 hover:bg-neutral-100 hover:text-ink sm:inline-flex">
                <ExternalLink className="size-3.5" aria-hidden /> View website
              </a>
            )}
          </header>
          <main id="main" tabIndex={-1} className="mx-auto max-w-6xl px-4 py-6 focus:outline-none sm:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
      <CommandMenu open={command} onOpenChange={setCommand} />
    </div>
  );
}

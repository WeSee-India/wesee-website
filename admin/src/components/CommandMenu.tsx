import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRight, BookOpen, Briefcase, CornerDownLeft, ExternalLink, FolderKanban, ImagePlus, Search, UserCircle, type LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useSchema } from "@/lib/schema";
import type { Permission } from "@/lib/types";
import { confirmLeave } from "@/lib/unsaved";
import { navGroups } from "./nav";
import { cx, Kbd } from "./ui";

interface Command {
  id: string;
  label: string;
  section: string;
  icon: LucideIcon;
  href: string;
  external?: boolean;
  permission?: Permission;
}

const actions: Command[] = [
  { id: "new-article", label: "Write an article", section: "Create", icon: BookOpen, href: "/content/blogPosts/new", permission: "content.edit" },
  { id: "new-project", label: "Add a project", section: "Create", icon: FolderKanban, href: "/content/projects/new", permission: "content.edit" },
  { id: "new-job", label: "Post a job", section: "Create", icon: Briefcase, href: "/content/jobs/new", permission: "content.edit" },
  { id: "upload", label: "Upload media", section: "Create", icon: ImagePlus, href: "/media", permission: "media.upload" },
  { id: "profile", label: "Your profile", section: "Account", icon: UserCircle, href: "/profile" },
];

/** ⌘K: jump to any screen or start a common task by typing. */
export function CommandMenu({ open, onOpenChange }: { open: boolean; onOpenChange(o: boolean): void }) {
  const { can } = useAuth();
  const schema = useSchema();
  const [, navigate] = useLocation();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  const all = useMemo(() => {
    const nav: Command[] = navGroups.flatMap((g) => g.items.map((it) => ({ id: it.href, label: it.label, section: "Go to", icon: it.icon, href: it.href, permission: it.permission })));
    const site: Command[] = schema.data ? [{ id: "site", label: "View website", section: "Account", icon: ExternalLink, href: schema.data.siteUrl, external: true }] : [];
    return [...nav, ...actions, ...site].filter((c) => !c.permission || can(c.permission));
  }, [can, schema.data]);

  const term = q.trim().toLowerCase();
  const results = term ? all.filter((c) => c.label.toLowerCase().includes(term) || c.section.toLowerCase().includes(term)) : all;
  const current = Math.min(active, Math.max(0, results.length - 1));

  const close = (o: boolean) => {
    onOpenChange(o);
    if (!o) {
      setQ("");
      setActive(0);
    }
  };

  const run = (c: Command) => {
    if (c.external) {
      window.open(c.href, "_blank", "noopener");
      return close(false);
    }
    if (!confirmLeave()) return;
    close(false);
    navigate(c.href);
  };

  let lastSection = "";

  return (
    <Dialog.Root open={open} onOpenChange={close}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 animate-fade-in bg-ink/30 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-[12vh] z-50 flex max-h-[70vh] w-[min(94vw,560px)] -translate-x-1/2 animate-pop-in flex-col overflow-hidden rounded-2xl bg-white shadow-pop ring-1 ring-neutral-200">
          <Dialog.Title className="sr-only">Jump to</Dialog.Title>
          <Dialog.Description className="sr-only">Type to search screens and actions. Use the arrow keys and Enter to choose.</Dialog.Description>
          <div className="flex items-center gap-2.5 border-b border-neutral-100 px-4">
            <Search className="size-4 shrink-0 text-neutral-400" aria-hidden />
            <input
              autoFocus
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setActive(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActive((current + 1) % Math.max(1, results.length));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActive((current - 1 + results.length) % Math.max(1, results.length));
                } else if (e.key === "Enter" && results[current]) {
                  e.preventDefault();
                  run(results[current]);
                }
              }}
              placeholder="Search screens and actions…"
              aria-label="Search screens and actions"
              aria-controls="command-results"
              aria-activedescendant={results[current] ? `cmd-${results[current].id}` : undefined}
              className="h-12 flex-1 bg-transparent text-[15px] outline-none placeholder:text-neutral-400 focus-visible:outline-none"
            />
            <Kbd>Esc</Kbd>
          </div>
          <ul id="command-results" role="listbox" className="overflow-y-auto p-2">
            {!results.length && <li className="px-3 py-10 text-center text-sm text-neutral-500">Nothing matches “{q}”.</li>}
            {results.map((c, i) => {
              const heading = c.section !== lastSection ? c.section : null;
              lastSection = c.section;
              const Icon = c.icon;
              return (
                <li key={c.id} role="presentation">
                  {heading && <p className="px-2.5 pb-1 pt-2.5 text-[11px] font-medium uppercase tracking-wider text-neutral-400">{heading}</p>}
                  <button
                    id={`cmd-${c.id}`}
                    type="button"
                    role="option"
                    aria-selected={i === current}
                    onMouseMove={() => setActive(i)}
                    onClick={() => run(c)}
                    className={cx("flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm", i === current ? "bg-neutral-100 text-ink" : "text-neutral-700")}
                  >
                    <span className={cx("flex size-7 items-center justify-center rounded-md ring-1", i === current ? "bg-white text-accent-dark ring-neutral-200" : "bg-neutral-50 text-neutral-500 ring-neutral-200/70")}>
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span className="flex-1 truncate">{c.label}</span>
                    {i === current && (c.external ? <ExternalLink className="size-3.5 text-neutral-400" /> : c.section === "Go to" ? <ArrowRight className="size-3.5 text-neutral-400" /> : <CornerDownLeft className="size-3.5 text-neutral-400" />)}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center gap-4 border-t border-neutral-100 bg-neutral-50 px-4 py-2 text-[11.5px] text-neutral-500">
            <span className="inline-flex items-center gap-1">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd> to move
            </span>
            <span className="inline-flex items-center gap-1">
              <Kbd>↵</Kbd> to open
            </span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

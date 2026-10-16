import { useMemo } from "react";
import type { LucideIcon } from "lucide-react";
import { Gauge, LineChart, Sparkles, Target, TrendingUp, Zap } from "lucide-react";
import type { ServiceGrowthComparisonChart } from "@/data/services";

const CARD_ICONS: LucideIcon[] = [TrendingUp, Gauge, Zap, Target, LineChart, Sparkles];

/** Show exactly four result cards (2×2 phone, 1×4 desktop). */
const MAX_CARDS = 4;

function formatPct(n: number): string {
  const rounded = Math.abs(n - Math.round(n)) < 0.06 ? Math.round(n) : Math.round(n * 10) / 10;
  return `${rounded}%`;
}

type Props = {
  config: ServiceGrowthComparisonChart;
};

export default function ServiceImpactMetrics({ config }: Props) {
  const beforeLabel = config.beforeLabel ?? "Before";
  const afterLabel = config.afterLabel ?? "After 6 months";

  const prepared = useMemo(() => {
    return config.rows.slice(0, MAX_CARDS).map((r, i) => {
      const delta = r.after - r.before;
      const Icon = CARD_ICONS[i % CARD_ICONS.length];
      return { ...r, delta, Icon };
    });
  }, [config.rows]);

  return (
    <div className="w-full max-w-none">
      <h2 className="text-lg font-bold tracking-[-0.02em] text-neutral-900 md:text-2xl md:font-semibold md:text-[var(--foreground)] md:text-[1.75rem]">
        {config.title}
      </h2>
      {config.description ? (
        <p className="mt-3 max-w-[52rem] text-[15px] leading-[1.75] text-neutral-600 md:mt-4 md:text-[17px] md:leading-[1.78] md:text-[var(--ink-80)]">
          {config.description}
        </p>
      ) : null}

      <ul className="mt-8 grid list-none grid-cols-2 gap-2.5 p-0 sm:gap-3 md:mt-10 lg:grid-cols-4 lg:gap-4">
        {prepared.map((row, i) => {
          const Icon = row.Icon;
          return (
            <li
              key={`${row.label}-${i}`}
              className="group relative flex min-h-[142px] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white p-3.5 shadow-[0_1px_0_rgba(17,19,23,0.04)] sm:min-h-[154px] sm:rounded-[1.125rem] sm:p-4 md:border-[var(--border)] md:bg-[var(--card)] md:shadow-[0_1px_0_var(--ink-6)]"
            >
              {/* Soft gold / ink wash */}
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#c9a84c]/[0.07] via-transparent to-[#111317]/[0.02]"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -right-5 -top-8 h-24 w-24 rounded-full bg-[#c9a84c]/12 blur-2xl"
                aria-hidden
              />

              <Icon
                className="relative z-[1] h-[1.125rem] w-[1.125rem] shrink-0 text-[#b89547] sm:h-5 sm:w-5"
                strokeWidth={1.75}
                aria-hidden
              />

              <div className="relative z-[1] mt-auto flex min-w-0 flex-col pt-5 sm:pt-6">
                <p className="text-[12px] font-semibold leading-snug tracking-[-0.02em] text-neutral-900 sm:text-[13px] md:text-[var(--foreground)]">
                  {row.label}
                </p>
                <p className="mt-1.5 text-[clamp(1.35rem,3.8vw,1.65rem)] font-bold leading-none tracking-[-0.04em] tabular-nums text-neutral-900 sm:text-[clamp(1.45rem,3vw,1.85rem)] md:text-[var(--foreground)]">
                  {formatPct(row.after)}
                </p>

                <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[10px] leading-snug text-neutral-500 sm:text-[11px] md:text-[var(--muted-foreground)]">
                  <span className="tabular-nums">{formatPct(row.before)}</span>
                  <span className="text-neutral-300 md:text-[var(--ink-30)]" aria-hidden>
                    →
                  </span>
                  <span className="font-medium tabular-nums text-neutral-800 md:text-[var(--foreground)]">
                    {formatPct(row.after)}
                  </span>
                  {row.delta > 0 && row.before > 0 ? (
                    <span className="ml-0.5 rounded-md bg-[#c9a84c]/14 px-1.5 py-0.5 text-[9px] font-semibold tabular-nums text-[#9a7d32] sm:text-[10px]">
                      +{formatPct(row.delta)}
                    </span>
                  ) : null}
                  {row.before === 0 && row.after > 0 ? (
                    <span className="ml-0.5 rounded-md bg-neutral-100 px-1.5 py-0.5 text-[9px] font-medium text-neutral-600 sm:text-[10px] md:bg-[var(--paper-dark)] md:text-[var(--muted-foreground)]">
                      New
                    </span>
                  ) : null}
                </div>
                <p className="mt-1.5 text-[9px] font-medium uppercase tracking-[0.12em] text-neutral-400 sm:text-[10px] sm:tracking-[0.14em] md:text-[var(--muted-foreground)]">
                  {beforeLabel} → {afterLabel}
                </p>
                <span className="sr-only">
                  {beforeLabel} {formatPct(row.before)}, {afterLabel} {formatPct(row.after)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

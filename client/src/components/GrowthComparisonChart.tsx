import { useId, useMemo } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ServiceGrowthComparisonChart } from "@/data/services";

type Props = {
  config: ServiceGrowthComparisonChart;
};

const BEFORE_COLOR = "#737373";
const AFTER_COLOR = "#c9a84c";

function SeriesDotSwatch({
  color,
  label,
  showLabel = true,
}: {
  color: string;
  label: string;
  /** When false, only the dot shows (e.g. tooltip pills). */
  showLabel?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2" title={label}>
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full shadow-sm ring-1 ring-black/10 md:h-3 md:w-3"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      {showLabel ? (
        <span className="text-[12px] font-medium text-neutral-700 md:text-[13px] md:text-[var(--foreground)]">
          {label}
        </span>
      ) : (
        <span className="sr-only">{label}</span>
      )}
    </span>
  );
}

export default function GrowthComparisonChart({ config }: Props) {
  const fillGradientId = `growthAfterFill-${useId().replace(/:/g, "")}`;
  const beforeLabel = config.beforeLabel ?? "Before";
  const afterLabel = config.afterLabel ?? "After 6 Months";

  const { data, yMax } = useMemo(() => {
    const rows = config.rows.map((r) => ({
      metric: r.label,
      before: r.before,
      after: r.after,
    }));
    let max = 0;
    for (const r of rows) {
      max = Math.max(max, r.before, r.after);
    }
    const padded = Math.ceil((max * 1.08) / 10) * 10;
    return { data: rows, yMax: Math.max(60, padded) };
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

      <div
        className="mt-6 w-full max-w-none md:mt-8"
        role="img"
        aria-label={`${config.title}: ${beforeLabel} compared to ${afterLabel} across ${data.length} metrics.`}
      >
        <div className="h-[min(460px,75vh)] w-full min-h-[300px] sm:min-h-[340px] md:min-h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 16, right: 4, left: 0, bottom: 32 }}
            >
              <defs>
                <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c9a84c" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#c9a84c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 6"
                vertical={false}
                stroke="rgb(163 163 163 / 0.35)"
                className="md:stroke-[var(--border)]"
              />
              <XAxis
                dataKey="metric"
                tick={false}
                tickLine={false}
                axisLine={{ stroke: "rgb(212 212 212)", strokeWidth: 1 }}
                interval={0}
                height={8}
                tickMargin={4}
              />
              <YAxis
                domain={[0, yMax]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 11, fill: "currentColor" }}
                tickLine={false}
                axisLine={false}
                width={48}
                className="text-neutral-500 md:text-[var(--muted-foreground)]"
              />
              <Tooltip
                cursor={{ stroke: "rgb(163 163 163 / 0.5)", strokeWidth: 1 }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const linesOnly = payload.filter(
                    (p) => p.stroke != null && p.stroke !== "none"
                  );
                  return (
                    <div className="max-w-[min(100vw-2rem,20rem)] text-left">
                      <div className="flex flex-col gap-2.5 md:gap-3">
                        {linesOnly.map((p) => {
                          const color =
                            p.dataKey === "before" ? BEFORE_COLOR : p.color ?? AFTER_COLOR;
                          const dk = String(p.dataKey ?? "");
                          const nameStr =
                            dk === "before" ? beforeLabel : dk === "after" ? afterLabel : String(p.name ?? "");
                          return (
                            <div
                              key={String(p.dataKey)}
                              className="flex items-center justify-between gap-4 rounded-lg border border-neutral-200 bg-neutral-50/90 px-3.5 py-3 text-[12px] md:border-[var(--border)] md:bg-[var(--paper)] md:px-4 md:py-3.5 md:text-[13px]"
                            >
                              <SeriesDotSwatch color={color} label={nameStr} showLabel />
                              <span className="tabular-nums font-semibold text-neutral-900 md:text-[var(--foreground)]">
                                {typeof p.value === "number" ? p.value.toFixed(1) : p.value}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 12 }}
                content={({ payload }) => {
                  const raw =
                    payload?.filter((p) => p.dataKey === "before" || p.dataKey === "after") ??
                    [];
                  // Area + Line both use dataKey "after"; keep the Line (solid stroke), not the
                  // Area (gradient `url(#...)`) which shows as a hollow duplicate in the legend.
                  const isGradientSwatch = (p: (typeof raw)[number]) =>
                    String(p.color ?? "").trim().startsWith("url(");
                  const beforeEntry = raw.filter((p) => p.dataKey === "before").at(-1);
                  const afterCandidates = raw.filter((p) => p.dataKey === "after");
                  const afterEntry =
                    afterCandidates.find((p) => !isGradientSwatch(p)) ??
                    afterCandidates.at(-1);
                  const ordered = [beforeEntry, afterEntry].filter(
                    (p): p is (typeof raw)[number] => p != null
                  );
                  return (
                    <ul className="flex list-none flex-row flex-wrap items-center justify-end gap-x-5 gap-y-2 p-0 md:gap-x-6">
                      {ordered.map((p) => {
                        const color =
                          p.dataKey === "before" ? BEFORE_COLOR : p.color ?? AFTER_COLOR;
                        const dk = String(p.dataKey ?? "");
                        const legendLabel =
                          dk === "before" ? beforeLabel : dk === "after" ? afterLabel : String(p.value ?? "");
                        return (
                          <li key={String(p.dataKey)} className="inline-flex items-center">
                            <SeriesDotSwatch color={color} label={legendLabel} showLabel />
                          </li>
                        );
                      })}
                    </ul>
                  );
                }}
              />
              <Area
                type="linear"
                dataKey="after"
                stroke="none"
                fill={`url(#${fillGradientId})`}
                legendType="none"
                isAnimationActive
                animationDuration={1100}
                animationEasing="ease-out"
              />
              <Line
                type="linear"
                dataKey="before"
                name={beforeLabel}
                stroke={BEFORE_COLOR}
                strokeWidth={2.25}
                dot={{ r: 4, strokeWidth: 2, stroke: "#fff", fill: BEFORE_COLOR }}
                activeDot={{ r: 5 }}
                isAnimationActive
                animationDuration={1100}
                animationEasing="ease-out"
              />
              <Line
                type="linear"
                dataKey="after"
                name={afterLabel}
                stroke="#b89547"
                strokeWidth={2.75}
                dot={{ r: 4.5, fill: AFTER_COLOR, stroke: AFTER_COLOR, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: AFTER_COLOR, stroke: AFTER_COLOR, strokeWidth: 0 }}
                isAnimationActive
                animationDuration={1100}
                animationEasing="ease-out"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

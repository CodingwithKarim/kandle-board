import { Item } from "../types";
import Card from "./Card";

export default function SymbolMetrics({ items, loading = false }: {
  items: Item[]; loading?: boolean;
}) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it, i) => (
        <Card key={i}>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[12px] tracking-wide text-white/60">{it.label}</div>
              {loading ? (
                <div className="mt-2 h-7 w-28 animate-pulse rounded bg-white/10" />
              ) : (
                <div className="mt-1 text-2xl font-semibold">{it.value}</div>
              )}
            </div>

            {it.delta != null && (
              <span className={[
                "rounded-full px-2 py-1 text-[11px] font-medium border",
                it.intent === "up" ? "border-emerald-400/30 text-emerald-300 bg-emerald-400/10" :
                  it.intent === "down" ? "border-rose-400/30 text-rose-300 bg-rose-400/10" :
                    "border-white/15 text-white/70 bg-white/5"
              ].join(" ")}>
                {loading ? <span className="inline-block h-3 w-12 animate-pulse rounded bg-white/10" /> : it.delta}
              </span>
            )}
          </div>
          {loading ? (
            <div className="mt-4 h-10 rounded-md bg-white/5 animate-pulse" />
          ) : it.mini ? (
            <MiniSparkline data={it.mini} />
          ) : null}
        </Card>
      ))}
    </section>
  );
}

function MiniSparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  const w = 220, h = 40, pad = 4;
  const min = Math.min(...data), max = Math.max(...data);
  const span = Math.max(1e-9, max - min);
  const x = (i: number) => pad + (i / (data.length - 1)) * (w - 2 * pad);
  const y = (v: number) => pad + (1 - (v - min) / span) * (h - 2 * pad);
  const points = data.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const up = data[data.length - 1] >= data[0];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-4 h-10 w-full">
      <polyline points={points} fill="none" className={up ? "stroke-emerald-400" : "stroke-rose-400"} strokeWidth={1.5} />
    </svg>
  );
}

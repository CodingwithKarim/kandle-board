import { useState } from "react";
import { Candle, Interval } from "../../types";
import { toMs, yTicksOnEdge } from "./chartHelper";
import { xTicksByInterval, makeLabelFor } from "./chartHelper";

export function ChartBase({ data, interval }: { data: Candle[]; interval: Interval }) {
  const w = 600, h = 360, padL = 58, padR = 14, padT = 16, padB = 30;

  const [hover, setHover] = useState<null | { i: number; x: number; y: number }>(null);

  const n = data.length;
  if (!n) return <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full" />;

  const highs = data.map(d => +d.High).filter(Number.isFinite);
  const lows = data.map(d => +d.Low).filter(Number.isFinite);
  const minRaw = Math.min(...lows);
  const maxRaw = Math.max(...highs);

  const topPadPct = 0.1;
  const minP = minRaw;
  const maxP = maxRaw + (maxRaw - minRaw) * topPadPct;

  const yTicks = yTicksOnEdge(minP, maxP, 5);
  const yMin = yTicks[0];
  const yMax = yTicks[yTicks.length - 1];

  const ySpan = Math.max(1e-9, yMax - yMin);
  const y = (v: number) => padT + (1 - (v - yMin) / ySpan) * (h - padT - padB);

  const fmtPrice = (v: number) => (Math.abs(v) >= 1000 ? v.toFixed(0) : v.toFixed(2));
  const fmtVol = (n: number) => Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 2 }).format(n);

  const innerW = w - padL - padR;
  const step = innerW / Math.max(1, n - 1);
  const bodyW = Math.max(2, Math.min(8, step * 0.6));

  const idxs = xTicksByInterval(data, interval, innerW);
  const labelFor = makeLabelFor(interval);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full text-white/80 tabular-nums">
      {yTicks.map((v, i) => {
        const gy = y(v);
        return (
          <g key={`y${i}`}>
            <line x1={padL} x2={w - padR} y1={gy} y2={gy} className="stroke-white/10" />
            <text x={padL - 8} y={gy} textAnchor="end" dominantBaseline="middle" className="text-[10px] fill-white/60">
              {fmtPrice(v)}
            </text>
          </g>
        );
      })}
      <line x1={padL} x2={padL} y1={padT} y2={h - padB} className="stroke-white/10" />

      {idxs.map((i, k) => {
        const cx = padL + i * step;
        const ms = toMs(data[i].Time);
        return (
          <g key={`x${k}`}>
            <line x1={cx} x2={cx} y1={padT} y2={h - padB} className="stroke-white/5" />
            <text x={cx} y={h - padB + 16} textAnchor="middle" className="text-[10px] fill-white/60">
              {labelFor(ms)}
            </text>
          </g>
        );
      })}

      {data.map((d, i) => {
        const open = +d.Open, close = +d.Close, high = +d.High, low = +d.Low;
        const cx = padL + i * step;
        const yOpen = y(open), yClose = y(close);
        const yHigh = y(high), yLow = y(low);
        const isUp = close >= open;
        const top = Math.min(yOpen, yClose);
        const bodyH = Math.max(1, Math.abs(yOpen - yClose));

        return (
          <g key={i} className={isUp ? "text-emerald-400" : "text-rose-400"}>
            <line
              x1={cx} x2={cx} y1={yHigh} y2={yLow}
              className="stroke-current" strokeWidth={1}
              style={{ pointerEvents: "none" }}
            />
            <rect
              x={cx - bodyW / 2}
              y={top}
              width={bodyW}
              height={bodyH}
              className="fill-current"
              rx={1.5}
              onMouseEnter={(e) => {
                const el = (e.target as SVGRectElement).ownerSVGElement!;
                const pt = el.createSVGPoint();
                pt.x = e.clientX; pt.y = e.clientY;
                const { x, y } = pt.matrixTransform(el.getScreenCTM()!.inverse());
                setHover({ i, x, y });
              }}
              onMouseMove={(e) => {
                const el = (e.target as SVGRectElement).ownerSVGElement!;
                const pt = el.createSVGPoint();
                pt.x = e.clientX; pt.y = e.clientY;
                const { x, y } = pt.matrixTransform(el.getScreenCTM()!.inverse());
                setHover(prev => (prev ? { i, x, y } : prev));
              }}
              onMouseLeave={() => setHover(null)}
            />
          </g>
        );
      })}
      {hover && (() => {
        const d = data[hover.i];
        const cx = padL + hover.i * step;
        const ms = toMs(d.Time);
        const boxW = 170, boxH = 96;
        const bx = Math.min(w - padR - boxW, Math.max(padL, hover.x + 10));
        const by = Math.min(h - padB - boxH, Math.max(padT, hover.y - 40));
        return (
          <g>
            <line
              x1={cx} x2={cx} y1={padT} y2={h - padB}
              className="stroke-white/40"
              strokeDasharray="3 3"
            />
            <g transform={`translate(${bx},${by})`} pointerEvents="none">
              <rect width={boxW} height={boxH} rx={8} className="fill-black/80 stroke-white/20" />
              <text x="8" y="16" className="text-[11px] fill-white/90">{labelFor(ms)}</text>
              <text x="8" y="34" className="text-[11px] fill-white/70">O: {fmtPrice(+d.Open)}</text>
              <text x="88" y="34" className="text-[11px] fill-white/70">H: {fmtPrice(+d.High)}</text>
              <text x="8" y="50" className="text-[11px] fill-white/70">L: {fmtPrice(+d.Low)}</text>
              <text x="88" y="50" className="text-[11px] fill-white/70">C: {fmtPrice(+d.Close)}</text>
              <text x="8" y="70" className="text-[11px] fill-white/70">Vol: {fmtVol(+d.Volume)}</text>
            </g>
          </g>
        );
      })()}
    </svg>
  );
}

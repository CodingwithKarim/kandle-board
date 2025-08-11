import { Interval } from "../../types";

type TimeLike = string | number | Date;

export function yTicksOnEdge(minP: number, maxP: number, count = 5) {
    const step = niceStep(maxP - minP, count);
    const first = Math.ceil(minP / step) * step;
    const vals: number[] = [];
    for (let v = first; v <= maxP + 1e-9; v += step) vals.push(+v.toFixed(10));
    vals.unshift(minP);
    return vals;
}

export function niceStep(span: number, count = 5) {
    const raw = span / Math.max(1, count);
    const pow10 = Math.pow(10, Math.floor(Math.log10(raw)));
    const n = raw / pow10;
    const mul = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
    return mul * pow10;
}

export function toMs(t: string | number | Date | undefined) {
    if (t == null) return NaN;
    if (typeof t === "number") return t;
    if (typeof t === "string") return new Date(t).getTime();
    return t.getTime();
}

export function evenIdxTicks(n: number, maxTicks: number) {
    const count = Math.max(2, Math.min(maxTicks, n));
    const out: number[] = [];
    for (let i = 0; i < count; i++) out.push(Math.round((i * (n - 1)) / (count - 1)));
    return out;
}

export function monthTicksIdx(data: { Time?: TimeLike }[]) {
    const out: number[] = [];
    let lastM = -1, lastY = -1;
    for (let i = 0; i < data.length; i++) {
        const d = new Date(toMs(data[i].Time));
        const m = d.getMonth(), y = d.getFullYear();
        if (m !== lastM || y !== lastY) {
            out.push(i);
            lastM = m;
            lastY = y;
        }
    }
    return out;
}

export function quarterTicksIdx(data: { Time?: TimeLike }[]) {
    const out: number[] = [];
    let lastQ = -1, lastY = -1;
    for (let i = 0; i < data.length; i++) {
        const d = new Date(toMs(data[i].Time));
        const q = Math.floor(d.getMonth() / 3), y = d.getFullYear();
        if (q !== lastQ || y !== lastY) {
            out.push(i);
            lastQ = q;
            lastY = y;
        }
    }
    return out;
}

export function capTicks(idxs: number[], maxTicks: number) {
    if (idxs.length <= maxTicks) return idxs;
    const step = Math.ceil(idxs.length / maxTicks);
    return idxs.filter((_, i) => i % step === 0);
}


export function weekTicksIdx(data: { Time?: string | number | Date }[], maxTicks = 8) {
    return evenIdxTicks(data.length, maxTicks);
}

export const maxTicksForWidth = (innerWidth: number, minLabelPx = 80) =>
    Math.max(2, Math.floor(innerWidth / minLabelPx));

export function xTicksByInterval(
    data: { Time?: TimeLike }[],
    interval: Interval,
    innerWidth: number,
    minLabelPx = 80
) {
    const maxTicks = maxTicksForWidth(innerWidth, minLabelPx);
    if (interval === "1h" || interval === "1d") return evenIdxTicks(data.length, maxTicks);
    if (interval === "1mo") return capTicks(monthTicksIdx(data), maxTicks);
    return capTicks(quarterTicksIdx(data), maxTicks);
}

export function makeLabelFor(interval: Interval) {
    const fmtMD = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
    const fmtMon = new Intl.DateTimeFormat(undefined, { month: "short" });
    const fmtYear = (ms: number) => String(new Date(ms).getFullYear());
    return (ms: number) =>
        interval === "1h" ? fmtMD.format(ms) :
            interval === "1d" ? fmtMD.format(ms) :
                interval === "1mo" ? fmtMon.format(ms) :
                    fmtYear(ms);
}
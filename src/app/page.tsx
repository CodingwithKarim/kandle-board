"use client";

import Swal from 'sweetalert2';
import Toolbar from "./components/SymbolToolbar";
import CandlesChart from "./components/SymbolChart/SymbolChart";
import Card from "./components/Card";
import { useState } from "react";
import { Notes } from "./components/SymbolSummary";
import { Candle, CompanyInfo, Interval, LookupData, Stats } from "./types";
import { CompanyInfo as CompanyAboutMe } from "./components/SymbolBasicInfo";
import SymbolMetrics from './components/SymbolMetrics';

const fmtCompact = (n: number) => Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 2 }).format(n);

const volumeLabel = (interval: "1h"|"1d"|"1mo"|"3mo") => {
  return interval === "1h" ? "Avg Hourly Volume"
       : interval === "1d" ? "Avg Daily Volume"
       : interval === "1mo" ? "Avg Monthly Volume"
       :                       "Avg Quarterly Volume";
}

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [stats, setStats] = useState<Stats>(null);
  const [info, setInfo] = useState<CompanyInfo>(null);
  const [interval, setInterval] = useState<Interval>("1d");

  const getDataForSymbol = async (lookupData: LookupData) => {
    setLoading(true);

    try {
      const url = `http://localhost:5000/api/symbol/${lookupData.symbol}?asOf=${lookupData.end}&range_=${lookupData.range}&interval=${lookupData.interval}`;

      const response = await fetch(url);

      if (!response.ok) {
        Swal.fire({
          icon: "error",
          title: "Symbol Not Found",
          text: `We couldn't find "${lookupData.symbol}". Please check the ticker and try again.`,
        });
        setLoading(false);
        return;
      }

      const data = await response.json();

      setStats(data.stats ?? null);

      const arr: Candle[] = Array.isArray(data.candles)
        ? data.candles
        : Object.entries(data.candles).map(([time, v]: [string, any]) => ({
          Time: time,
          Open: v.Open,
          High: v.High,
          Low: v.Low,
          Close: v.Close,
          Volume: v.Volume,
        }));

      arr.sort(
        (a, b) =>
          new Date(a.Time as string).getTime() -
          new Date(b.Time as string).getTime()
      );

      setCandles(arr);

      setInfo({ ...(data.profile ?? {}), symbol: lookupData.symbol });

      if (lookupData.interval) {
        setInterval(lookupData.interval as Interval);
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Request Failed",
        text: "An unexpected error occurred. Please double check your symbol.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-7xl space-y-0">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(600px_300px_at_10%_10%,rgba(99,102,241,0.08),transparent),radial-gradient(600px_300px_at_90%_20%,rgba(16,185,129,0.08),transparent)]" />
      <header className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
          KandleBoard
        </h1>
      </header>
      <Toolbar onSearch={(symbol) => getDataForSymbol(symbol as any)} onReset={() => {
        setCandles([]); setStats(null); setInfo(null); setLoading(false);
      }} />
      <SymbolMetrics
        loading={loading}
        items={[
          { label: "Price (end)", value: stats?.price_end != null ? `$${stats.price_end.toFixed(2)}` : "—" },
          {
            label: "Return (selected range)", value: stats?.change_pct != null ? stats.change_pct.toFixed(2) : "—",
            delta: stats?.change_pct != null ? `${stats.change_pct.toFixed(2)}%` : undefined,
            intent: (stats?.change_pct ?? 0) >= 0 ? "up" : "down"
          },
          { label: "High (selected range", value: stats?.range_high != null ? `$${stats.range_high.toFixed(2)}` : "—" },
          { label: "Low (selected range)", value: stats?.range_low != null ? `$${stats.range_low.toFixed(2)}` : "—" },
          { label: volumeLabel(interval), value: stats?.avg_volume != null ? fmtCompact(stats.avg_volume).toLocaleString() : "—" },
          { label: "Annualized Volatility", value: stats?.volatility != null ? `${(stats.volatility * 100).toFixed(2)}%` : "—" },
        ]}
      />
      <section className="grid py-3 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        <CandlesChart candles={candles} loading={loading} interval={interval} />
        {!loading ? (
          <CompanyAboutMe info={info} />

        ) : (
          <Card header={<div className="text-sm text-white/70">Company</div>}>
            <div className="h-[360px] w-full animate-pulse rounded-xl bg-white/10" />
          </Card>
        )}
      </section>
      <Notes summary={info?.summary} />
    </main>
  );
}
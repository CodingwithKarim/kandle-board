"use client";
import { useEffect, useState } from "react";
import Card from "./Card";
import * as RSelect from "@radix-ui/react-select";
import { ALLOWED, FIRST_RANGE_FOR_INTERVAL, Interval, RangeOption, ToolbarProps } from "../types";

const fmtLocalDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default function Toolbar({ onSearch, onReset }: ToolbarProps) {
  const DEFAULTS = {
    symbol: "",
    end: fmtLocalDate(new Date()),
    preset: "1W" as RangeOption,
    interval: "1d" as Interval,
  } as const;

  const [symbol, setSymbol] = useState<string>(DEFAULTS.symbol);
  const [end, setEnd] = useState<string>(DEFAULTS.end);
  const [rangeOption, setRange] = useState<RangeOption>(DEFAULTS.preset);
  const [interval, setInterval] = useState<string>(DEFAULTS.interval);

  const isDirty =
    symbol !== DEFAULTS.symbol || end !== DEFAULTS.end || rangeOption !== DEFAULTS.preset || interval !== DEFAULTS.interval;
  const canLoad = symbol.trim().length > 0;

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!canLoad) return;
    const endDate = end ? new Date(end) : new Date();

    onSearch({
      symbol: symbol.trim().toUpperCase(),
      range: rangeOption,
      end: fmtLocalDate(endDate),
      interval,
    });
  }

  function handleReset() {
    setSymbol(DEFAULTS.symbol);
    setEnd(DEFAULTS.end);
    setRange(DEFAULTS.preset);
    setInterval(DEFAULTS.interval);
    onReset?.();
  }

  function onPickInterval(i: Interval) {
    setInterval(i);
    if (!ALLOWED[rangeOption].includes(i)) {
      setRange(FIRST_RANGE_FOR_INTERVAL[i]);
    }
  }

  function onPickRange(r: RangeOption) {
    if (ALLOWED[r].includes(interval as Interval)) {
      setRange(r);
    } else {
      setRange(FIRST_RANGE_FOR_INTERVAL[interval as Interval]);
    }
  }

  useEffect(() => {
    if (!ALLOWED[rangeOption].includes(interval as Interval)) {
      setRange(FIRST_RANGE_FOR_INTERVAL[interval as Interval]);
    }
  }, []);

  const intervals = ["1h", "1d", "1mo", "3mo"];

  return (
    <div className="-mx-2 px-2 py-3 bg-gradient-to-b from-[#0f172acc] to-transparent backdrop-blur-sm">
      <Card className="border-white/10 bg-white/[0.03] shadow-lg shadow-black/10 ring-1 ring-inset ring-white/10">
        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-11">
          <div className="md:col-span-3">
            <label className="mb-1 block text-[11px] tracking-wide text-white/60">SYMBOL</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-60">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M11 19a8 8 0 1 1 5.292-14.02A8 8 0 0 1 11 19Zm10 3-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
              <input
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="e.g., AAPL, MSFT, AMZN, BTC-USD"
                className="h-10 w-full rounded-2xl border border-white/10 bg-white/5 pl-9 pr-3 text-white outline-none transition focus:border-white/30 focus:ring-2 focus:ring-emerald-400/40"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="mb-1 block text-[11px] tracking-wide text-white/60">AS OF</label>

            <div className="flex h-10 w-full items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 text-white outline-none ring-0 transition focus-within:border-white/30 focus-within:ring-2 focus-within:ring-emerald-400/40">
              <span className="opacity-60 shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M7 3v3M17 3v3M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
              <input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="
                  flex-1 bg-transparent text-white outline-none h-[2.25rem]
                  [appearance:none] [-webkit-appearance:none] [line-height:normal]
                  [&::-webkit-datetime-edit]:p-0
                  [&::-webkit-date-and-time-value]:min-h-[1.5rem]
                  [&::-webkit-calendar-picker-indicator]:opacity-70
                  [&::-webkit-calendar-picker-indicator]:cursor-pointer
                "
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-[11px] tracking-wide text-white/60">INTERVAL</label>
            <RSelect.Root value={interval} onValueChange={(v) => onPickInterval(v as Interval)}>
              <RSelect.Trigger className="h-10 w-full rounded-2xl border border-white/10 bg-white/5 px-3 text-left text-white outline-none transition focus:border-white/30 focus:ring-2 focus:ring-emerald-400/40 data-[placeholder]:text-white/50 flex items-center justify-between">
                <RSelect.Value placeholder="Interval" />
                <RSelect.Icon className="opacity-70">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </RSelect.Icon>
              </RSelect.Trigger>

              <RSelect.Portal>
                <RSelect.Content
                  position="popper"
                  sideOffset={6}
                  className="z-50 overflow-hidden rounded-xl border border-white/10 bg-[#0b1220]/95 text-white shadow-xl backdrop-blur-xl"
                >
                  <RSelect.Viewport className="p-1">
                    {intervals.map((v) => {
                      return (
                        <RSelect.Item
                          key={v}
                          value={v}
                          className={`relative flex select-none items-center gap-2 rounded-md px-3 py-2 text-sm outline-none
                         
                        `}
                        >
                          <RSelect.ItemText>{v}</RSelect.ItemText>
                          <RSelect.ItemIndicator className="absolute right-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                              <path d="m20 6-11 11-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </RSelect.ItemIndicator>
                        </RSelect.Item>
                      );
                    })}
                  </RSelect.Viewport>
                </RSelect.Content>
              </RSelect.Portal>
            </RSelect.Root>
          </div>

          <div className="md:col-span-4">
            <label className="mb-1 block text-[11px] tracking-wide text-white/60">RANGE</label>
            <div role="tablist" className="flex flex-wrap gap-2">
              {(["1D", "1W", "1M", "3M", "1Y", "MAX"] as RangeOption[]).map((p) => {
                const active = rangeOption === p;
                const disabled = !ALLOWED[p].includes(interval as Interval);
                return (
                  <button
                    key={p}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => !disabled && onPickRange(p)}
                    disabled={disabled}
                    className={`h-10 rounded-2xl px-3 text-sm transition ${disabled
                      ? "cursor-not-allowed border border-white/10 bg-white/5 text-white/40"
                      : active
                        ? "bg-white text-black shadow"
                        : "border border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                      }`}
                    title={disabled ? `Not available for ${interval} interval` : undefined}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="md:col-span-12 mt-2 flex items-center gap-2">
            <button
              type="submit"
              disabled={!canLoad}
              className={`h-10 rounded-2xl px-5 font-medium text-white shadow transition ${canLoad ? "bg-emerald-500/90 hover:bg-emerald-500" : "cursor-not-allowed bg-emerald-500/40"
                }`}
            >
              Load
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={!isDirty}
              className={`h-10 rounded-2xl border px-5 text-white/80 transition ${isDirty ? "border-white/15 hover:bg-white/5" : "cursor-not-allowed border-white/10 opacity-50"
                }`}
            >
              Reset
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

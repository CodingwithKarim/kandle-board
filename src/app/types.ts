export type Candle = {
    Time?: string | number | Date
    Open: number;
    High: number;
    Low: number;
    Close: number;
    Volume: number;
}

export type Item = {
  label: string;
  value: string;
  delta?: string;
  intent?: "up" | "down" | "neutral";
  mini?: number[];
};

export type CompanyInfo = {
    symbol: string;
    longName?: string;
    shortName?: string;
    website?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    industry?: string;
    sector?: string;
    employees?: number;
    summary?: string;
    exchange?: string;
    currency?: string;
} | null;

export type Stats = {
    price_end: number;
    change_pct: number;
    range_high: number;
    range_low: number;
    avg_volume: number;
    volatility: number;
} | null


export type LookupData = {
    symbol: string;
    range: RangeOption;
    end: string | undefined;
    interval: string | undefined
}

export type RangeOption = "1D" | "1W" | "1M" | "3M" | "1Y" | "MAX";

export type Interval = "1h" | "1d" | "1mo" | "3mo";

export type ToolbarProps = {
  onSearch: (lookupData: LookupData) => void;
  onReset?: () => void;
};

export const ALLOWED: Record<RangeOption, Interval[]> = {
  "1D": ["1h"],          
  "1W": ["1h", "1d"],    
  "1M": ["1h", "1d",],
  "3M": ["1h", "1d", "1mo", "3mo"],
  "1Y": ["1d", "1mo", "3mo"],
  "MAX": ["1mo", "3mo"],
} as const;


export const FIRST_RANGE_FOR_INTERVAL: Record<Interval, RangeOption> = {
  "1h": "1D",
  "1d": "3M",
  "1mo": "MAX",
  "3mo": "MAX",
} as const;

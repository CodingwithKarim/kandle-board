from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import yfinance as yf

from helpers import (
    VALID_INTERVALS,
    VALID_RANGES,
    get_avg_volume,
    get_range_extremes,
    get_start_date,
    get_volatility,
)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/api/symbol/{symbol}")
def get_quote(
    symbol: str,
    asOf: Optional[datetime] = Query(None),
    range_: str = Query("1Y"),
    interval: str = Query("1mo"),
):
    try:
        if interval not in VALID_INTERVALS:
            raise HTTPException(status_code=400, detail=f"Unsupported interval: {interval}")

        rng = (range_ or "").upper()
        if rng not in VALID_RANGES:
            raise HTTPException(status_code=400, detail=f"Unsupported range: {range_}")

        if asOf is None:
            asOf = datetime.now(timezone.utc)
        elif asOf.tzinfo is None:
            asOf = asOf.replace(tzinfo=timezone.utc)

        start = get_start_date(rng, asOf)
        end_exclusive = asOf + timedelta(days=1)

        t = yf.Ticker(symbol)
        df: pd.DataFrame = t.history(start=start, end=end_exclusive, interval=interval)

        if df is None or df.empty:
            raise HTTPException(status_code=404, detail="No price data for requested symbol/interval/range")

        df = df.copy()

        if isinstance(df.index, pd.DatetimeIndex):
            if df.index.tz is not None:
                df.index = df.index.tz_convert("UTC").tz_localize(None)
            else:
                df.index = pd.to_datetime(df.index)
            df.index.name = "Time"
            df.reset_index(inplace=True)
        else:
            df = df.reset_index().rename(columns={"index": "Time"})

        cols = [c for c in ["Open", "High", "Low", "Close", "Volume"] if c in df.columns]
        if "Close" not in df.columns:
            raise HTTPException(status_code=404, detail="No Close column in returned data")

        if "Time" in df.columns and pd.api.types.is_datetime64_any_dtype(df["Time"]):
            df["Time"] = pd.to_datetime(df["Time"]).dt.strftime("%Y-%m-%dT%H:%M:%SZ")

        close_col = "Adj Close" if "Adj Close" in df.columns else "Close"
        first_close = float(df[close_col].iloc[0])
        last_close = float(df[close_col].iloc[-1])
        range_change_pct = (last_close / first_close - 1.0) * 100.0
        change_abs = last_close - first_close

        info = {}
        try:
            info = t.get_info() or {}
        except Exception:
            info = {}

        officers = info.get("companyOfficers") or []
        vip_name = None
        if isinstance(officers, list) and officers:
            first = officers[0] or {}
            vip_name = first.get("name")

        range_high, range_low = get_range_extremes(df)

        payload = {
            "stats": {
                "price_end": last_close,
                "change_pct": range_change_pct,
                "change_abs": change_abs,
                "range_high": range_high,
                "range_low": range_low,
                "avg_volume": get_avg_volume(df),
                "volatility": get_volatility(df, interval),
            },
            "candles": df.set_index("Time")[cols].to_dict(orient="index"),
            "profile": {
                "longName": info.get("longName"),
                "shortName": info.get("shortName"),
                "website": info.get("website"),
                "phone": info.get("phone"),
                "address": info.get("address1"),
                "city": info.get("city"),
                "state": info.get("state"),
                "zip": info.get("zip"),
                "country": info.get("country"),
                "industry": info.get("industry"),
                "sector": info.get("sector"),
                "exchange": info.get("exchange"),
                "currency": info.get("currency"),
                "employees": info.get("fullTimeEmployees"),
                "summary": info.get("longBusinessSummary"),
                "vip": vip_name,
            },
        }
        return payload

    except HTTPException:
        raise
    except Exception as err:
        print("get_quote error:", err)
        raise HTTPException(status_code=500, detail="Server error while fetching symbol")

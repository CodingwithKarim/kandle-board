import datetime
from datetime import timedelta
from typing import Optional, Tuple
import numpy as np
import pandas as pd

PERIODS_PER_YEAR = {"1h": 252 * 6.5, "1d": 252, "1mo": 12, "3mo": 4}
VALID_INTERVALS = {"1h", "1d", "1mo", "3mo"}
VALID_RANGES = {"1D","1W","1M","3M","1Y","MAX"}

def get_range_extremes(df: pd.DataFrame) -> Tuple[Optional[float], Optional[float]]:
    if df.empty:
        return None, None

    if "High" in df.columns and "Low" in df.columns:
        hi = df["High"].dropna()
        lo = df["Low"].dropna()
        if hi.empty or lo.empty:
            return None, None
        return float(hi.max()), float(lo.min())

    col = _close_col(df)
    if col in df.columns:
        s = df[col].dropna()
        if not s.empty:
            return float(s.max()), float(s.min())

    return None, None

def get_avg_volume(df: pd.DataFrame) -> Optional[float]:
    if df.empty or "Volume" not in df.columns:
        return None
    s = df["Volume"].dropna()
    return float(s.mean()) if not s.empty else None

def get_volatility(df, interval, annualize=True, min_obs=None):
    col = "Adj Close" if "Adj Close" in df.columns else "Close"
    s = pd.to_numeric(df.get(col), errors="coerce").dropna()
    s = s[s > 0]
    if s.size < 2:
        return None

    r = np.diff(np.log(s.to_numpy()))

    if min_obs is None:
        min_obs = 20 if interval == "1h" else 10

    if annualize and r.size < min_obs:
        return None

    vol = np.std(r, ddof=1)

    if annualize:
        factor = PERIODS_PER_YEAR.get(interval)
        if not factor:
            return None
        vol *= np.sqrt(factor)

    return float(vol)


def get_start_date(range_: str, today: datetime) -> datetime:
    key = (range_ or "").strip().upper()

    if key == "1D":
        return today - timedelta(days=2)
    if key == "1W":
        return today - timedelta(days=8)
    if key == "1M":
        return today - timedelta(days=32)
    if key == "3M":
        return today - timedelta(days=95)
    if key == "1Y":
        return today - timedelta(days=366)
    if key == "MAX":
        return datetime(1900, 1, 1)

    return today - timedelta(days=366)

def _close_col(df: pd.DataFrame) -> str:
    return "Adj Close" if "Adj Close" in df.columns else "Close"
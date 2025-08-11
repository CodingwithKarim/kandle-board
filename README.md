<h1 align="center">KandleBoard</h1>
<p align="center">A market dashboard for historical price insights.</p>

<img width="1301" height="928" alt="KandleBoard Screenshot" src="https://github.com/user-attachments/assets/61d787b8-e834-4919-a3ee-d85f1b77adeb" />

## What it does
KandleBoard lets you type a ticker (e.g., AAPL, SPY, BTC-USD), pick an interval and range, and instantly see:

- **Candlestick chart** with hover (O/H/L/C/Volume), clean grid and labels.
- **Core metrics** for the selected window:
  - **Price (end)** — closing price of the last candle in the selected interval + range
  - **Return (selected range)** — % change from the first close to the last close in the selected interval + range
  - **High / Low (selected range)** — highest and lowest prices reached in the selected interval + range
  - **Avg Volume** — average number of shares traded over the selected interval + range
  - **Annualized Volatility** — how much the price moves around, scaled to a yearly rate (log-return std dev)
- **Company snapshot** — name, sector, website, and a short summary when available

The UI enforces sensible interval ↔ range combos (interval decides the allowed ranges) so you don’t request data providers can’t serve (e.g., `1h` with `MAX`).

## Notes
- Some requests (especially small intervals that return many candles) can take a while to load. We’re on a free Render tier, so compute and especially cold starts can add a lot of latency.
- We don’t have real-time data via yfinance. True RT access requires paid subscriptions with exchanges or data vendors.
- Data from yfinance is generally delayed until closing of the financial day.

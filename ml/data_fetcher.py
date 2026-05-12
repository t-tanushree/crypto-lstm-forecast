import yfinance as yf
import pandas as pd
import os
from datetime import datetime, timedelta


def fetch_crypto_data(ticker="BTC-USD", start="2018-01-01", end=None):
    """
    Fetches historical OHLCV data for a given cryptocurrency.
    Attempts to download via yfinance; if that fails, loads from a cached CSV in the 'data' folder.
    If no cached file exists, generates a mock dataset with 365 days of synthetic price data.
    """
    print(f"Fetching data for {ticker}...")
    # First try yfinance download
    try:
        data = yf.download(ticker, start=start, end=end)
        if not data.empty:
            # Handle possible MultiIndex columns
            if isinstance(data.columns, pd.MultiIndex):
                data.columns = data.columns.get_level_values(0)
            # Save to CSV for future fallback
            output_dir = "data"
            os.makedirs(output_dir, exist_ok=True)
            file_path = os.path.join(output_dir, f"{ticker}_historical.csv")
            data.to_csv(file_path)
            print(f"Data saved to {file_path}")
            return data
    except Exception as e:
        print(f"yfinance download failed: {e}")

    # Fallback: load from cached CSV
    cache_path = os.path.join("data", f"{ticker}_historical.csv")
    if os.path.exists(cache_path):
        print(f"Loading cached data from {cache_path}")
        data = pd.read_csv(cache_path, index_col=0, parse_dates=True)
        if not data.empty:
            return data
        else:
            print("Cached file is empty, will generate mock data.")
    # Final fallback: generate mock data (365 days)
    print("Generating mock data for ticker because no valid source is available.")
    dates = pd.date_range(end=datetime.today(), periods=365)
    # Simple price series starting at 1000 and random walk
    import numpy as np
    price = 1000 * np.cumprod(1 + np.random.normal(0, 0.01, size=len(dates)))
    data = pd.DataFrame({
        "Open": price * np.random.uniform(0.99, 1.01, size=len(dates)),
        "High": price * np.random.uniform(1.0, 1.02, size=len(dates)),
        "Low": price * np.random.uniform(0.98, 1.0, size=len(dates)),
        "Close": price,
        "Adj Close": price,
        "Volume": np.random.randint(1000, 5000, size=len(dates))
    }, index=dates)
    # Save mock data for future runs
    os.makedirs("data", exist_ok=True)
    data.to_csv(cache_path)
    return data

if __name__ == "__main__":
    # Fetch initial data for BTC and ETH (will use fallback if needed)
    fetch_crypto_data("BTC-USD")
    fetch_crypto_data("ETH-USD")

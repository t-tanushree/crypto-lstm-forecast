import yfinance as yf
import pandas as pd
import os
from datetime import datetime

def calculate_indicators(df):
    # SMA
    df['sma20'] = df['close'].rolling(window=20).mean()
    df['sma50'] = df['close'].rolling(window=50).mean()
    
    # RSI
    delta = df['close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    df['rsi'] = 100 - (100 / (1 + rs))
    
    # Fill NaNs from rolling windows
    df.ffill(inplace=True)
    df.bfill(inplace=True)
    return df

def download_data(symbol, start_date="2018-01-01"):
    print(f"Downloading {symbol} data from {start_date}...")
    ticker = yf.Ticker(symbol)
    df = ticker.history(start=start_date, interval="1d")
    
    if df.empty:
        print(f"No data found for {symbol}")
        return None
        
    # Standardize column names
    df.columns = [col.lower() for col in df.columns]
    df = calculate_indicators(df)
    
    # Save to data/raw
    os.makedirs("data/raw", exist_ok=True)
    filename = f"data/raw/{symbol.replace('-', '_').lower()}_daily.csv"
    df.to_csv(filename)
    print(f"Saved {symbol} data with indicators to {filename}")
    return df

if __name__ == "__main__":
    symbols = ["BTC-USD", "ETH-USD", "SOL-USD"]
    for sym in symbols:
        download_data(sym)

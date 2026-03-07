import pandas as pd
from backend.database import SessionLocal, engine
from backend import models
import os

# Create tables
models.Base.metadata.create_all(bind=engine)

def migrate_data():
    db = SessionLocal()
    symbols = ["btc-usd", "eth-usd", "sol-usd"]
    
    for symbol in symbols:
        csv_path = f"data/raw/{symbol.replace('-', '_')}_daily.csv"
        if not os.path.exists(csv_path):
            print(f"Skipping {symbol}, CSV not found.")
            continue
            
        print(f"Migrating {symbol}...")
        df = pd.read_csv(csv_path)
        
        # Clear existing for this symbol to avoid duplicates during migration
        db.query(models.CryptoPrice).filter(models.CryptoPrice.symbol == symbol.upper()).delete()
        
        for _, row in df.iterrows():
            price = models.CryptoPrice(
                symbol=symbol.upper(),
                timestamp=pd.to_datetime(row['Date']),
                open=float(row['open']),
                high=float(row['high']),
                low=float(row['low']),
                close=float(row['close']),
                volume=float(row['volume'])
            )
            db.add(price)
            
    db.commit()
    db.close()
    print("Migration complete!")

if __name__ == "__main__":
    migrate_data()

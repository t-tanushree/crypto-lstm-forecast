import pandas as pd
from backend.database import SessionLocal, engine
from backend import models
import os

# Create tables
models.Base.metadata.create_all(bind=engine)

ML_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(ML_DIR)

def migrate_data():
    db = SessionLocal()
    symbols = ["btc-usd", "eth-usd", "sol-usd"]
    
    for symbol in symbols:
        # data folder is at PROJECT_ROOT/data
        csv_path = os.path.join(PROJECT_ROOT, "data", "raw", f"{symbol.replace('-', '_')}_daily.csv")
        if not os.path.exists(csv_path):
            print(f"Skipping {symbol}, CSV not found at {csv_path}")
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

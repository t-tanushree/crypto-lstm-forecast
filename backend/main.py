from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import desc
import pandas as pd
import numpy as np
import tensorflow as tf
import joblib
import os
import asyncio
import yfinance as yf
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from jose import JWTError, jwt
from passlib.context import CryptContext

from . import models, schemas, database
from .database import engine, get_db, SessionLocal

# Create tables
models.Base.metadata.create_all(bind=engine)

# Security Config
SECRET_KEY = "SUPER_SECRET_CHANGE_ME"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 1 day

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app = FastAPI(title="Crypto LSTM Forecast API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Features used in Phase 2
FEATURES = ['close', 'sma20', 'sma50', 'rsi']
MODELS = {}
SCALERS = {}
SENTIMENT_CACHE = {"data": None, "timestamp": 0}

def load_ml_assets():
    for symbol in ["btc-usd", "eth-usd", "sol-usd"]:
        model_path = f"models/{symbol}_lstm_model.h5"
        scaler_path = f"models/{symbol}_scaler.gz"
        if os.path.exists(model_path) and os.path.exists(scaler_path):
            MODELS[symbol] = tf.keras.models.load_model(model_path)
            SCALERS[symbol] = joblib.load(scaler_path)
            print(f"Loaded assets for {symbol}")
        else:
            print(f"Assets missing for {symbol}")

load_ml_assets()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

manager = ConnectionManager()

# Auth Utilities
def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    return user

async def update_prices_background():
    """Background task to fetch latest prices and broadcast to clients."""
    while True:
        try:
            symbols = ["BTC-USD", "ETH-USD", "SOL-USD"]
            db = SessionLocal()
            for symbol in symbols:
                ticker = yf.Ticker(symbol)
                data = ticker.history(period="1d", interval="1m")
                if not data.empty:
                    latest = data.iloc[-1]
                    price = float(latest['Close'])
                    
                    # Broadcast public price update
                    price_msg = {
                        "type": "price_update",
                        "symbol": symbol,
                        "price": price,
                        "timestamp": str(datetime.now())
                    }
                    await manager.broadcast(price_msg)
                    
                    # Check Alerts
                    alerts = db.query(models.Alert).filter(
                        models.Alert.symbol == symbol,
                        models.Alert.is_active == True
                    ).all()
                    
                    for alert in alerts:
                        triggered = False
                        if alert.condition_type == "PRICE_ABOVE" and price >= alert.target_value:
                            triggered = True
                        elif alert.condition_type == "PRICE_BELOW" and price <= alert.target_value:
                            triggered = True
                        
                        if triggered:
                            notify_msg = {
                                "type": "alert_triggered",
                                "symbol": symbol,
                                "price": price,
                                "alert_id": alert.id,
                                "condition": alert.condition_type,
                                "target": alert.target_value,
                                "user_id": alert.user_id
                            }
                            await manager.broadcast(notify_msg) # Simplification: notify all, frontend filters
                            # In production, we'd only notify the specific user
                            
            db.close()
            await asyncio.sleep(60) # Update every minute
        except Exception as e:
            print(f"Error in background task: {e}")
            await asyncio.sleep(10)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(update_prices_background())

@app.get("/")
def read_root():
    return {"message": "Crypto Price Forecasting API is running"}

@app.get("/forecast/{symbol}")
def get_forecast(symbol: str, db: Session = Depends(get_db)):
    sym = symbol.lower()
    if sym not in MODELS:
        load_ml_assets() # Try reloading
        if sym not in MODELS:
            raise HTTPException(status_code=404, detail="Model not found for this symbol")

    # Fetch from Database
    db_prices = db.query(models.CryptoPrice).filter(
        models.CryptoPrice.symbol == symbol.upper()
    ).order_by(desc(models.CryptoPrice.timestamp)).limit(100).all()
    
    if not db_prices:
        raise HTTPException(status_code=404, detail="No data found in database")

    # Convert to DataFrame for easier manipulation
    df = pd.DataFrame([
        {
            "Date": p.timestamp,
            "close": p.close,
            "open": p.open,
            "high": p.high,
            "low": p.low,
            "volume": p.volume
        } for p in reversed(db_prices)
    ])

    # Re-calculate indicators for the session (Phase 2 features)
    # Note: In production, these should be pre-calculated in DB
    from ml.data_loader import calculate_indicators
    df = calculate_indicators(df)
    
    # Get last 60 days of features
    input_data = df[FEATURES].tail(60).values
    scaler = SCALERS[sym]
    scaled_input = scaler.transform(input_data)
    
    # Multi-day forecast (7 days)
    forecast_7d = []
    current_scaled_seq = scaled_input.copy()
    
    for _ in range(7):
        X_input = np.reshape(current_scaled_seq, (1, 60, len(FEATURES)))
        pred_scaled = MODELS[sym].predict(X_input, verbose=0)
        
        dummy = np.zeros((1, len(FEATURES)))
        dummy[0, 0] = pred_scaled[0][0]
        inv_pred = scaler.inverse_transform(dummy)[0, 0]
        forecast_7d.append(float(inv_pred))
        
        new_row_scaled = np.zeros((1, len(FEATURES)))
        new_row_scaled[0, 0] = pred_scaled[0][0]
        new_row_scaled[0, 1:] = current_scaled_seq[-1, 1:]
        current_scaled_seq = np.append(current_scaled_seq[1:], new_row_scaled, axis=0)

    # Historical data (last 30)
    historical = [
        {
            "id": i, 
            "symbol": symbol, 
            "timestamp": str(row['Date'])[:10],
            "close": float(row['close']),
            "sma20": float(row.get('sma20', 0)),
            "rsi": float(row.get('rsi', 0))
        } for i, row in df.tail(30).iterrows()
    ]
    
    # Save Prediction to DB for future assessment
    try:
        target_date = datetime.now().date() + timedelta(days=1)
        existing_pred = db.query(models.Prediction).filter(
            models.Prediction.symbol == symbol.upper(),
            models.Prediction.target_date == target_date
        ).first()
        
        if not existing_pred:
            new_pred = models.Prediction(
                symbol=symbol.upper(),
                target_date=target_date,
                predicted_price=forecast_7d[0]
            )
            db.add(new_pred)
            db.commit()
    except Exception as e:
        print(f"Error saving prediction: {e}")

    return {
        "symbol": symbol,
        "current_price": float(df['close'].iloc[-1]),
        "predicted_next_day_price": float(forecast_7d[0]),
        "forecast_7d": forecast_7d,
        "historical_data": historical,
        "indicators": {
            "rsi": float(df['rsi'].iloc[-1]),
            "sma20": float(df['sma20'].iloc[-1]),
            "sma50": float(df['sma50'].iloc[-1])
        }
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text() # Keep alive
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/predictions/{symbol}")
def get_predictions(symbol: str, db: Session = Depends(get_db)):
    preds = db.query(models.Prediction).filter(
        models.Prediction.symbol == symbol.upper()
    ).order_by(desc(models.Prediction.target_date)).limit(10).all()
    
    return [
        {
            "target_date": str(p.target_date)[:10],
            "predicted_price": p.predicted_price,
            "actual_price": p.actual_price
        } for p in preds
    ]

# Auth Routes
@app.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_pwd)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/token", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

# Watchlist & Alert Routes
@app.get("/watchlist", response_model=List[schemas.Watchlist])
def get_watchlist(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Watchlist).filter(models.Watchlist.user_id == current_user.id).all()

@app.post("/watchlist", response_model=schemas.Watchlist)
def add_to_watchlist(item: schemas.WatchlistCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_item = models.Watchlist(symbol=item.symbol, user_id=current_user.id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.get("/alerts", response_model=List[schemas.Alert])
def get_alerts(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Alert).filter(models.Alert.user_id == current_user.id).all()

@app.post("/alerts", response_model=schemas.Alert)
def create_alert(alert: schemas.AlertCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_alert = models.Alert(
        user_id=current_user.id,
        symbol=alert.symbol,
        condition_type=alert.condition_type,
        target_value=alert.target_value
    )
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert

@app.get("/sandbox/{symbol}/{date}")
def get_sandbox_forecast(symbol: str, date: str, db: Session = Depends(get_db)):
    """Simulate a 7-day forecast from a specific historical date."""
    sym = symbol.lower()
    try:
        target_dt = datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    # Fetch data up to the requested date
    db_prices = db.query(models.CryptoPrice).filter(
        models.CryptoPrice.symbol == symbol.upper(),
        models.CryptoPrice.timestamp <= target_dt
    ).order_by(desc(models.CryptoPrice.timestamp)).limit(100).all()

    if len(db_prices) < 60:
        raise HTTPException(status_code=404, detail="Insufficient historical data for this date")

    df = pd.DataFrame([
        {
            "Date": p.timestamp,
            "close": p.close,
            "open": p.open,
            "high": p.high,
            "low": p.low,
            "volume": p.volume
        } for p in reversed(db_prices)
    ])

    from ml.data_loader import calculate_indicators
    df = calculate_indicators(df)
    
    input_data = df[FEATURES].tail(60).values
    scaler = SCALERS[sym]
    scaled_input = scaler.transform(input_data)
    
    forecast_7d = []
    current_scaled_seq = scaled_input.copy()
    
    for _ in range(7):
        X_input = np.reshape(current_scaled_seq, (1, 60, len(FEATURES)))
        pred_scaled = MODELS[sym].predict(X_input, verbose=0)
        
        dummy = np.zeros((1, len(FEATURES)))
        dummy[0, 0] = pred_scaled[0][0]
        inv_pred = scaler.inverse_transform(dummy)[0, 0]
        forecast_7d.append(float(inv_pred))
        
        new_row_scaled = np.zeros((1, len(FEATURES)))
        new_row_scaled[0, 0] = pred_scaled[0][0]
        new_row_scaled[0, 1:] = current_scaled_seq[-1, 1:]
        current_scaled_seq = np.append(current_scaled_seq[1:], new_row_scaled, axis=0)

    # Fetch actual prices for the following 7 days to compare
    actual_prices = db.query(models.CryptoPrice).filter(
        models.CryptoPrice.symbol == symbol.upper(),
        models.CryptoPrice.timestamp > target_dt
    ).order_by(models.CryptoPrice.timestamp).limit(7).all()

    return {
        "symbol": symbol,
        "sandbox_date": date,
        "forecast_7d": forecast_7d,
        "actual_7d": [p.close for p in actual_prices]
    }

@app.get("/sentiment")
async def get_market_sentiment():
    """Proxy for Crypto Fear & Greed Index with 1-hour caching."""
    import requests
    import time
    
    current_time = time.time()
    if SENTIMENT_CACHE["data"] and (current_time - SENTIMENT_CACHE["timestamp"] < 3600):
        return SENTIMENT_CACHE["data"]

    try:
        response = requests.get("https://api.alternative.me/fng/")
        data = response.json()
        sentiment_data = {
            "value": int(data['data'][0]['value']),
            "classification": data['data'][0]['value_classification'],
            "timestamp": data['data'][0]['timestamp']
        }
        SENTIMENT_CACHE["data"] = sentiment_data
        SENTIMENT_CACHE["timestamp"] = current_time
        return sentiment_data
    except Exception as e:
        print(f"Error fetching sentiment: {e}")
        return {"value": 50, "classification": "Neutral", "timestamp": "0"}

@app.get("/metrics/{symbol}")
def get_metrics(symbol: str):
    sym = symbol.lower()
    metrics_path = f"data/metrics/{sym}_metrics.json"
    if not os.path.exists(metrics_path):
        raise HTTPException(status_code=404, detail="Metrics not found")
        
    with open(metrics_path, "r") as f:
        import json
        return json.load(f)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

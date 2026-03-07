from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import List, Optional

class CryptoPriceBase(BaseModel):
    symbol: str
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float

class CryptoPriceCreate(CryptoPriceBase):
    pass

class CryptoPrice(CryptoPriceBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class PredictionBase(BaseModel):
    symbol: str
    predicted_at: datetime
    target_date: datetime
    predicted_price: float
    actual_price: Optional[float] = None

class Prediction(PredictionBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class ForecastResponse(BaseModel):
    symbol: str
    current_price: float
    predicted_next_day_price: float
    forecast_7d: List[float]
    historical_data: List[dict]
    indicators: dict # Current indicators: rsi, sma20, sma50

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class WatchlistBase(BaseModel):
    symbol: str

class WatchlistCreate(WatchlistBase):
    pass

class Watchlist(WatchlistBase):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)

class AlertBase(BaseModel):
    symbol: str
    condition_type: str
    target_value: float

class AlertCreate(AlertBase):
    pass

class Alert(AlertBase):
    id: int
    user_id: int
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

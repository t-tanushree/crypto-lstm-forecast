from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import datetime

Base = declarative_base()

class CryptoPrice(Base):
    __tablename__ = "crypto_prices"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    open = Column(Float)
    high = Column(Float)
    low = Column(Float)
    close = Column(Float)
    volume = Column(Float)

class Prediction(Base):
    __tablename__ = "predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True)
    predicted_at = Column(DateTime, default=datetime.datetime.utcnow)
    target_date = Column(DateTime, index=True)
    predicted_price = Column(Float)
    actual_price = Column(Float, nullable=True) # To be updated later

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    
    watchlist = relationship("Watchlist", back_populates="owner")
    alerts = relationship("Alert", back_populates="owner")

class Watchlist(Base):
    __tablename__ = "watchlists"
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    owner = relationship("User", back_populates="watchlist")

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    symbol = Column(String, index=True)
    condition_type = Column(String) # PRICE_ABOVE, PRICE_BELOW, RSI_ABOVE, RSI_BELOW
    target_value = Column(Float)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    owner = relationship("User", back_populates="alerts")

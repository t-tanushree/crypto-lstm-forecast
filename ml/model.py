import pandas as pd
import numpy as np
import os
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from sklearn.preprocessing import MinMaxScaler
import joblib

def create_sequences(data, seq_length):
    x = []
    y = []
    for i in range(len(data) - seq_length):
        # All columns as features for X
        x.append(data[i:(i + seq_length), :])
        # Target: Close price (first column)
        y.append(data[i + seq_length, 0])
    return np.array(x), np.array(y)

def train_model(symbol, seq_length=60):
    filename = f"data/raw/{symbol.replace('-', '_').lower()}_daily.csv"
    if not os.path.exists(filename):
        print(f"File {filename} not found.")
        return
        
    df = pd.read_csv(filename)
    # Selected features for Phase 2
    features = ['close', 'sma20', 'sma50', 'rsi']
    data = df[features].values
    
    # Scale data
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(data)
    
    # Create sequences
    x, y = create_sequences(scaled_data, seq_length)
    
    # No reshape needed here as create_sequences already returns [samples, time steps, features]
    
    # Split data
    train_size = int(len(x) * 0.8)
    x_train, x_test = x[:train_size], x[train_size:]
    y_train, y_test = y[:train_size], y[train_size:]
    
    # Build LSTM model
    model = Sequential([
        LSTM(units=100, return_sequences=True, input_shape=(x.shape[1], x.shape[2])),
        Dropout(0.2),
        LSTM(units=50, return_sequences=False),
        Dropout(0.2),
        Dense(units=25),
        Dense(units=1)
    ])
    
    model.compile(optimizer='adam', loss='mean_squared_error')
    
    # Train model
    print(f"Training model for {symbol} with features {features}...")
    model.fit(x_train, y_train, batch_size=32, epochs=20, validation_data=(x_test, y_test), verbose=1)
    
    # Save model and scaler
    os.makedirs("models", exist_ok=True)
    model.save(f"models/{symbol.lower()}_lstm_model.h5")
    joblib.dump(scaler, f"models/{symbol.lower()}_scaler.gz")
    print(f"Model and scaler saved for {symbol}")

if __name__ == "__main__":
    symbols = ["BTC-USD", "ETH-USD", "SOL-USD"]
    for sym in symbols:
        train_model(sym)

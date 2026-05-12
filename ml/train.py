import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from model import CryptoLSTM
from data_fetcher import fetch_crypto_data

def train_and_save(coin="BTC", epochs=10):
    """
    Complete pipeline to fetch data, preprocess, train LSTM, and save weights.
    """
    ticker = f"{coin}-USD"
    
    # 1. Fetch Data
    data = fetch_crypto_data(ticker)
    close_prices = data['Close'].values.reshape(-1, 1)
    
    # 2. Initialize Model & Preprocess
    lstm = CryptoLSTM(sequence_length=60)
    X, y = lstm.preprocess_data(close_prices)
    
    # 3. Split Data (80/20)
    train_size = int(len(X) * 0.8)
    X_train, X_test = X[:train_size], X[train_size:]
    y_train, y_test = y[:train_size], y[train_size:]
    
    # 4. Build & Train
    print(f"Training model for {coin}...")
    lstm.build_model((X_train.shape[1], 1))
    history = lstm.train(X_train, y_train, epochs=epochs, batch_size=32)
    
    # 5. Save Model & History
    if not os.path.exists('models'):
        os.makedirs('models')
        
    # Save weights
    # lstm.model.save_weights(f'models/{coin}_weights.h5')
    
    # Save history to CSV for frontend visualization
    hist_df = pd.DataFrame(history.history)
    hist_df.to_csv(f'models/{coin}_history.csv', index=False)
    
    print(f"Training complete. Weights and history saved for {coin}.")
    return history

if __name__ == "__main__":
    # Train for BTC as a default
    train_and_save("BTC", epochs=5)

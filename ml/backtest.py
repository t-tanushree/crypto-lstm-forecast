import pandas as pd
import numpy as np
import os
import tensorflow as tf
import joblib
from sklearn.metrics import mean_absolute_error, mean_squared_error
import json

def backtest_model(symbol, seq_length=60):
    model_path = f"models/{symbol.lower()}_lstm_model.h5"
    scaler_path = f"models/{symbol.lower()}_scaler.gz"
    data_path = f"data/raw/{symbol.replace('-', '_').lower()}_daily.csv"
    
    if not all(os.path.exists(p) for p in [model_path, scaler_path, data_path]):
        print(f"Missing files for {symbol}")
        return
        
    model = tf.keras.models.load_model(model_path)
    scaler = joblib.load(scaler_path)
    df = pd.read_csv(data_path)
    
    # Features from Phase 2
    features = ['close', 'sma20', 'sma50', 'rsi']
    data = df[features].values
    
    # Scale
    scaled_data = scaler.transform(data)
    
    # Create test set (last 20% of data)
    test_size = int(len(data) * 0.2)
    test_data = scaled_data[-test_size - seq_length:]
    
    x_test = []
    y_test = []
    for i in range(seq_length, len(test_data)):
        x_test.append(test_data[i-seq_length:i, :])
        y_test.append(test_data[i, 0])
        
    x_test, y_test = np.array(x_test), np.array(y_test)
    
    # Predict
    predictions_scaled = model.predict(x_test, verbose=0)
    
    # Inverse transform predictions and actuals
    # dummy for inverse
    dummy_pred = np.zeros((len(predictions_scaled), len(features)))
    dummy_pred[:, 0] = predictions_scaled[:, 0]
    inv_predictions = scaler.inverse_transform(dummy_pred)[:, 0]
    
    dummy_actual = np.zeros((len(y_test), len(features)))
    dummy_actual[:, 0] = y_test
    inv_actuals = scaler.inverse_transform(dummy_actual)[:, 0]
    
    # Calculate Metrics
    mae = mean_absolute_error(inv_actuals, inv_predictions)
    rmse = np.sqrt(mean_squared_error(inv_actuals, inv_predictions))
    mape = np.mean(np.abs((inv_actuals - inv_predictions) / inv_actuals)) * 100
    
    metrics = {
        "symbol": symbol,
        "mae": float(mae),
        "rmse": float(rmse),
        "mape": float(mape),
        "last_updated": str(pd.Timestamp.now())
    }
    
    os.makedirs("data/metrics", exist_ok=True)
    with open(f"data/metrics/{symbol.lower()}_metrics.json", "w") as f:
        json.dump(metrics, f, indent=4)
        
    print(f"Metrics saved for {symbol}: MAE={mae:.2f}, MAPE={mape:.2f}%")

if __name__ == "__main__":
    for sym in ["BTC-USD", "ETH-USD", "SOL-USD"]:
        backtest_model(sym)

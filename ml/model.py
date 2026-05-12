import numpy as np
import pandas as pd
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from sklearn.preprocessing import MinMaxScaler

class CryptoLSTM:
    def __init__(self, sequence_length=60):
        self.sequence_length = sequence_length
        self.model = None
        self.scaler = MinMaxScaler(feature_range=(0, 1))

    def build_model(self, input_shape):
        """
        Builds a multi-layer LSTM model for time-series forecasting.
        """
        model = Sequential([
            LSTM(units=50, return_sequences=True, input_shape=input_shape),
            Dropout(0.2),
            LSTM(units=50, return_sequences=True),
            Dropout(0.2),
            LSTM(units=50),
            Dropout(0.2),
            Dense(units=1) # Predicting the next close price
        ])
        
        model.compile(optimizer='adam', loss='mean_squared_error')
        self.model = model
        return model

    def preprocess_data(self, data):
        """
        Scales data and creates sequences for training.
        data: numpy array of shape (n_samples, 1)
        """
        scaled_data = self.scaler.fit_transform(data)
        
        X, y = [], []
        for i in range(self.sequence_length, len(scaled_data)):
            X.append(scaled_data[i-self.sequence_length:i, 0])
            y.append(scaled_data[i, 0])
            
        X, y = np.array(X), np.array(y)
        X = np.reshape(X, (X.shape[0], X.shape[1], 1))
        return X, y

    def train(self, X, y, epochs=20, batch_size=32):
        if self.model is None:
            self.build_model((X.shape[1], 1))
        
        return self.model.fit(X, y, epochs=epochs, batch_size=batch_size, verbose=1)

    def predict(self, last_sequence):
        """
        Predicts the next value based on the last sequence of data.
        last_sequence: numpy array of shape (sequence_length, 1)
        """
        scaled_seq = self.scaler.transform(last_sequence)
        input_seq = np.reshape(scaled_seq, (1, self.sequence_length, 1))
        
        prediction = self.model.predict(input_seq, verbose=0)
        return self.scaler.inverse_transform(prediction)

    def save(self, model_path, scaler_path):
        self.model.save(model_path)
        import joblib
        joblib.dump(self.scaler, scaler_path)

    def load(self, model_path, scaler_path):
        from tensorflow.keras.models import load_model
        import joblib
        self.model = load_model(model_path)
        self.scaler = joblib.load(scaler_path)

if __name__ == "__main__":
    print("LSTM Model Architecture initialized.")
    # Example usage (commented out):
    # model = CryptoLSTM()
    # model.build_model((60, 1))
    # model.model.summary()

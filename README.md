# Crypto LSTM Forecast 🚀

A professional-grade cryptocurrency price prediction dashboard powered by Deep Learning (LSTM) and real-time market data.

![Dashboard Preview](backend/assets/preview_placeholder.png) 

## 🌟 Features

- **LSTM Forecasting**: 7-day price predictions for BTC, ETH, and SOL using multi-feature analysis (Close, RSI, SMA).
- **Real-time Price Engine**: Live price updates via WebSockets.
- **Interactive Sandbox**: Point-in-time backtesting to verify model accuracy on historical dates.
- **Market Sentiment Meter**: Integrated Fear & Greed Index analysis.
- **Personalized Alerts**: Secure user authentication to set and manage custom price alerts.
- **Production Ready**: Fully containerized with Docker and SQLite persistence.

## 🛠️ Tech Stack

- **Backend**: FastAPI, TensorFlow, SQLAlchemy, Pydantic V2, passlib.
- **Frontend**: React (Vite), Tailwind CSS, Recharts, Lucide React.
- **ML**: LSTM Neural Networks, Scikit-learn, Pandas, YFinance.
- **DevOps**: Docker, Docker Compose.

## 🚀 Quick Start

### 📦 Using Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd crypto-lstm-forecast
   ```
2. Launch the stack:
   ```bash
   docker-compose up --build
   ```
3. Access the dashboard at `http://localhost:5173`.

### 🐍 Manual Setup

#### Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📊 ML Model Details

The model uses a Long Short-Term Memory (LSTM) network trained on standard OHLCV data + Technical Indicators:
- **RSI (14)**: Relative Strength Index.
- **SMA (20/50)**: Simple Moving Averages.

Retraining script: `python -m ml.model`
Backtesting script: `python -m ml.backtest`

## 🛡️ License

MIT License - See [LICENSE](LICENSE) for details.

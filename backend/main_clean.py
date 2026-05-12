from fastapi import FastAPI, HTTPException
import random
import datetime

app = FastAPI()

@app.get("/api/predict/{coin}")
async def get_prediction(coin: str):
    return {
        "coin": coin,
        "forecast": [{"date": datetime.date.today().isoformat(), "predicted": 100.0}],
        "confidence": 0.99
    }

@app.get("/")
async def root():
    return {"message": "CLEAN APP"}

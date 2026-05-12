import os
import sys
from datetime import datetime, timedelta
import random

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend'))

from backend.database import engine, Base, SessionLocal
from backend.models import User, CryptoPrice, Prediction, WatchlistItem

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password):
    return pwd_context.hash(password)


def seed_database():

    print("Dropping existing tables to reset environment...")
    Base.metadata.drop_all(bind=engine)

    print("Creating tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:

        print("Inserting sample Users...")

        test_user = User(
            username="testuser",
            email="testuser@example.com",
            hashed_password=get_password_hash("password123"),
            is_active=True
        )

        admin_user = User(
            username="admin",
            email="admin@example.com",
            hashed_password=get_password_hash("adminsecure123"),
            is_active=True
        )

        db.add(test_user)
        db.add(admin_user)

        db.commit()

        db.refresh(test_user)
        db.refresh(admin_user)

        print("Inserting sample Watchlist items...")

        wl1 = WatchlistItem(
            symbol="BTC-USD",
            user_id=test_user.id
        )

        wl2 = WatchlistItem(
            symbol="ETH-USD",
            user_id=test_user.id
        )

        db.add(wl1)
        db.add(wl2)

        print("Inserting sample Crypto Prices...")

        now = datetime.utcnow()

        symbols = ["BTC-USD", "ETH-USD"]

        base_prices = {
            "BTC-USD": 65000,
            "ETH-USD": 3500
        }

        for sym in symbols:

            current_price = base_prices[sym]

            for i in range(80, 0, -1):

                change = random.uniform(-0.02, 0.02)

                current_price = current_price * (1 + change)

                cp = CryptoPrice(
                    symbol=sym,
                    timestamp=now - timedelta(hours=i),
                    open=current_price * 0.99,
                    high=current_price * 1.01,
                    low=current_price * 0.98,
                    close=current_price,
                    volume=random.uniform(100, 1000)
                )

                db.add(cp)

        print("Inserting sample Predictions...")

        pred1 = Prediction(
            symbol="BTC-USD",
            predicted_at=now - timedelta(hours=24),
            target_date=now,
            predicted_price=66000.0,
            actual_price=None
        )

        pred2 = Prediction(
            symbol="ETH-USD",
            predicted_at=now - timedelta(days=2),
            target_date=now - timedelta(days=1),
            predicted_price=3600.0,
            actual_price=3550.0
        )

        db.add(pred1)
        db.add(pred2)

        db.commit()

        print("Environment setup complete.")
        print("Database seeded successfully.")

        print("\nLogin Credentials:")
        print("Email: testuser@example.com")
        print("Password: password123")

    except Exception as e:
        print(f"Error during database seeding: {e}")
        db.rollback()

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
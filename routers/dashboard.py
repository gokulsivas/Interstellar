from fastapi import APIRouter
import polars as pl
from datetime import datetime
import os

router = APIRouter(
    prefix="/api/dashboard",
    tags=["dashboard"],
)

@router.get("/stats")
async def get_dashboard_stats():
    try:
        if not os.path.exists("temp_imported_items.csv"):
            return {
                "success": False,
                "error": "No imported items data found"
            }

        # Read the items data
        items_df = pl.read_csv("temp_imported_items.csv")
        
        # Calculate cargo status distribution
        total_items = len(items_df)
        expired_items = len(items_df.filter(
            (pl.col("expiryDate").is_not_null()) &
            (pl.col("expiryDate") != "") &
            (pl.col("expiryDate").str.strptime(pl.Date, "%d-%m-%y") < datetime.now().date())
        ))
        
        # For demo purposes, we'll simulate some statuses
        in_storage = total_items - expired_items
        in_transit = int(in_storage * 0.2)  # 20% in transit
        retrieved = int(in_storage * 0.1)   # 10% retrieved
        in_storage = in_storage - in_transit - retrieved

        # Calculate monthly arrivals (using import dates or current date for demo)
        current_month = datetime.now().month
        monthly_arrivals = [
            len(items_df) if i == current_month - 1 else 0
            for i in range(12)
        ]

        # Calculate weight trends (last 7 days)
        weight_data = {
            "labels": [
                (datetime.now().date() - pl.duration(days=i)).strftime("%Y-%m-%d")
                for i in range(6, -1, -1)
            ],
            "data": [
                float(items_df["weight"].mean()) * (1 + i/10)  # Simulated trend
                for i in range(7)
            ]
        }

        return {
            "success": True,
            "inStorage": in_storage,
            "inTransit": in_transit,
            "retrieved": retrieved,
            "expired": expired_items,
            "monthlyArrivals": monthly_arrivals,
            "weightTrends": weight_data
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        } 
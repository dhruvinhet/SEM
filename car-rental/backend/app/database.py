import motor.motor_asyncio
from app.config import settings

client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGO_URI)
db = client[settings.DB_NAME]

# Collections
users_col = db["users"]
vehicles_col = db["vehicles"]
bookings_col = db["bookings"]
payments_col = db["payments"]
reviews_col = db["reviews"]
notifications_col = db["notifications"]
audit_logs_col = db["audit_logs"]
config_col = db["config"]
coupons_col = db["coupons"]
trip_reports_col = db["trip_reports"]
verifications_col = db["verifications"]
announcements_col = db["announcements"]
saved_searches_col = db["saved_searches"]
referrals_col = db["referrals"]
blacklist_col = db["blacklist"]
recently_viewed_col = db["recently_viewed"]


async def init_indexes():
    """Create required indexes on startup."""
    # Users
    await users_col.create_index("email", unique=True)

    # Vehicles
    await vehicles_col.create_index("ownerId")
    await vehicles_col.create_index("status")
    await vehicles_col.create_index([("title", "text"), ("description", "text")])

    # Bookings
    await bookings_col.create_index("vehicleId")
    await bookings_col.create_index("userId")
    await bookings_col.create_index("ownerId")
    await bookings_col.create_index("idempotencyKey", unique=True)
    await bookings_col.create_index([("vehicleId", 1), ("startDate", 1), ("endDate", 1)])
    await bookings_col.create_index("status")
    await bookings_col.create_index("holdExpiresAt")

    # Payments
    await payments_col.create_index("bookingId")

    # Notifications
    await notifications_col.create_index("userId")
    await notifications_col.create_index([("userId", 1), ("read", 1)])

    # Audit logs
    await audit_logs_col.create_index("actorId")
    await audit_logs_col.create_index("action")
    await audit_logs_col.create_index("createdAt")

    # Coupons
    await coupons_col.create_index("code", unique=True)
    await coupons_col.create_index("isActive")

    # Trip reports
    await trip_reports_col.create_index("bookingId")
    await trip_reports_col.create_index("reportType")

    # Verifications
    await verifications_col.create_index("userId")
    await verifications_col.create_index("status")

    # Announcements
    await announcements_col.create_index("createdAt")

    # Saved searches
    await saved_searches_col.create_index("userId")

    # Recently viewed
    await recently_viewed_col.create_index([("userId", 1), ("vehicleId", 1)])
    await recently_viewed_col.create_index("viewedAt")

    # Referrals
    await referrals_col.create_index("referrerId")
    await referrals_col.create_index("refereeId", unique=True)

    # Blacklist
    await blacklist_col.create_index("userId", unique=True)

    # Config / schema version
    existing = await config_col.find_one({"key": "schemaVersion"})
    if not existing:
        await config_col.insert_one({"key": "schemaVersion", "value": 2})

    # Seed default config values
    default_configs = [
        {"key": "gstPercentage", "value": 18.0, "description": "GST percentage"},
        {"key": "serviceFeePercentage", "value": 5.0, "description": "Platform service fee %"},
        {"key": "firstTimeDiscountPercent", "value": 10.0, "description": "Discount for first-time users"},
        {"key": "referralDiscountPercent", "value": 5.0, "description": "Referral reward discount %"},
        {"key": "platformCommissionPercent", "value": 15.0, "description": "Platform commission %"},
    ]
    for cfg in default_configs:
        if not await config_col.find_one({"key": cfg["key"]}):
            from datetime import datetime, timezone
            cfg["updatedAt"] = datetime.now(timezone.utc)
            await config_col.insert_one(cfg)


async def close_db():
    client.close()

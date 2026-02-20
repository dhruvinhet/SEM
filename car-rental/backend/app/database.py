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

    # Config / schema version
    existing = await config_col.find_one({"key": "schemaVersion"})
    if not existing:
        await config_col.insert_one({"key": "schemaVersion", "value": 1})


async def close_db():
    client.close()

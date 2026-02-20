"""
Seed data generator for Car Rental application.
Generates realistic demo data: users, vehicles, bookings, payments, reviews.
"""
import asyncio
import random
import uuid
from datetime import datetime, timedelta, timezone
from bson import ObjectId
from faker import Faker
from app.database import (
    users_col, vehicles_col, bookings_col, payments_col,
    reviews_col, notifications_col, audit_logs_col, init_indexes,
)
from app.auth import hash_password
from app.pricing import calculate_price

fake = Faker()

# Car data
CAR_MAKES = [
    ("Toyota", ["Yaris", "Corolla", "Camry", "RAV4", "Fortuner"]),
    ("Honda", ["City", "Civic", "Jazz", "WR-V", "Amaze"]),
    ("Hyundai", ["i20", "Creta", "Venue", "Verna", "Tucson"]),
    ("Maruti Suzuki", ["Swift", "Baleno", "Brezza", "Ertiga", "XL6"]),
    ("Tata", ["Nexon", "Harrier", "Safari", "Punch", "Altroz"]),
    ("Mahindra", ["XUV700", "Thar", "Scorpio", "XUV300", "Bolero"]),
    ("Kia", ["Seltos", "Sonet", "Carens", "EV6"]),
    ("BMW", ["3 Series", "5 Series", "X1", "X3", "X5"]),
    ("Mercedes-Benz", ["C-Class", "E-Class", "GLA", "GLC"]),
    ("Audi", ["A4", "A6", "Q3", "Q5"]),
]

COLORS = ["White", "Black", "Silver", "Red", "Blue", "Grey", "Pearl White", "Midnight Black"]
FUELS = ["petrol", "diesel", "electric", "hybrid"]
TRANSMISSIONS = ["auto", "manual"]
LOCATIONS = [
    "Mumbai, Maharashtra", "Delhi, NCR", "Bangalore, Karnataka",
    "Chennai, Tamil Nadu", "Hyderabad, Telangana", "Pune, Maharashtra",
    "Kolkata, West Bengal", "Ahmedabad, Gujarat", "Goa",
    "Jaipur, Rajasthan", "Kochi, Kerala", "Chandigarh",
]

SAMPLE_IMAGES = [
    {"url": "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800", "isPrimary": True},
    {"url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800", "isPrimary": False},
    {"url": "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800", "isPrimary": False},
    {"url": "https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=800", "isPrimary": False},
]

IMAGE_SETS = [
    [
        {"url": "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800", "isPrimary": True},
        {"url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800", "isPrimary": False},
        {"url": "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800", "isPrimary": False},
    ],
    [
        {"url": "https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=800", "isPrimary": True},
        {"url": "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800", "isPrimary": False},
        {"url": "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800", "isPrimary": False},
    ],
    [
        {"url": "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800", "isPrimary": True},
        {"url": "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800", "isPrimary": False},
        {"url": "https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=800", "isPrimary": False},
    ],
    [
        {"url": "https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=800", "isPrimary": True},
        {"url": "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800", "isPrimary": False},
        {"url": "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800", "isPrimary": False},
    ],
]


async def seed_database(
    num_users: int = 15,
    num_owners: int = 8,
    num_vehicles: int = 30,
    num_bookings: int = 100,
):
    """Generate seed data for the database."""
    print("🚗 Starting seed data generation...")

    # Clear existing data
    for col in [users_col, vehicles_col, bookings_col, payments_col, reviews_col, notifications_col, audit_logs_col]:
        await col.delete_many({})

    await init_indexes()

    # ─── Create Users ──────────────────────────────────────────
    print("  Creating users...")
    users = []
    user_ids = []

    # Admin user
    admin_doc = {
        "name": "Admin User",
        "email": "admin@carrental.com",
        "passwordHash": hash_password("admin123"),
        "role": "admin",
        "verified": True,
        "createdAt": datetime.now(timezone.utc) - timedelta(days=180),
        "profile": {"phone": "+91-9999000000"},
    }
    result = await users_col.insert_one(admin_doc)
    admin_id = result.inserted_id
    print(f"    Admin: admin@carrental.com / admin123")

    # Owner users
    owner_ids = []
    for i in range(num_owners):
        email = f"owner{i+1}@carrental.com" if i < 3 else fake.email()
        owner_doc = {
            "name": fake.name(),
            "email": email,
            "passwordHash": hash_password("owner123"),
            "role": "owner",
            "verified": True,
            "createdAt": datetime.now(timezone.utc) - timedelta(days=random.randint(30, 180)),
            "profile": {"phone": fake.phone_number(), "company": fake.company()},
        }
        result = await users_col.insert_one(owner_doc)
        owner_ids.append(result.inserted_id)
    print(f"    Created {num_owners} owners (owner1@carrental.com / owner123)")

    # Regular users
    for i in range(num_users):
        email = f"user{i+1}@carrental.com" if i < 3 else fake.email()
        user_doc = {
            "name": fake.name(),
            "email": email,
            "passwordHash": hash_password("user123"),
            "role": "user",
            "verified": random.random() > 0.1,
            "createdAt": datetime.now(timezone.utc) - timedelta(days=random.randint(1, 150)),
            "profile": {"phone": fake.phone_number()},
        }
        result = await users_col.insert_one(user_doc)
        user_ids.append(result.inserted_id)
    print(f"    Created {num_users} users (user1@carrental.com / user123)")

    # ─── Create Vehicles ───────────────────────────────────────
    print("  Creating vehicles...")
    vehicle_ids = []
    vehicle_docs = []
    for i in range(num_vehicles):
        make, models = random.choice(CAR_MAKES)
        model = random.choice(models)
        base_rate = random.choice([1500, 2000, 2500, 3000, 3500, 4000, 5000, 7500, 10000, 15000])

        vehicle_doc = {
            "ownerId": random.choice(owner_ids),
            "title": f"{make} {model}",
            "description": f"Well-maintained {make} {model} available for rent. {fake.sentence(nb_words=15)}",
            "images": random.choice(IMAGE_SETS),
            "specs": {
                "seats": random.choice([4, 5, 7]),
                "transmission": random.choice(TRANSMISSIONS),
                "fuel": random.choice(FUELS),
                "make": make,
                "model": model,
                "year": random.randint(2019, 2025),
                "color": random.choice(COLORS),
            },
            "pricing": {
                "currency": "INR",
                "baseRate": base_rate,
                "weekendRate": round(base_rate * 1.2),
                "minimumDays": random.choice([1, 1, 1, 2]),
                "discounts": {"weekly": 0.1, "monthly": 0.2},
                "cleaningFee": random.choice([0, 100, 200, 300, 500]),
                "securityDeposit": random.choice([0, 2000, 3000, 5000]),
            },
            "status": random.choices(["active", "active", "active", "paused"], weights=[7, 7, 7, 1])[0],
            "location": random.choice(LOCATIONS),
            "approvalMode": random.choice(["auto", "auto", "auto", "manual"]),
            "availability": [],
            "createdAt": datetime.now(timezone.utc) - timedelta(days=random.randint(5, 150)),
        }

        # Add some maintenance blocks
        if random.random() > 0.7:
            block_start = datetime.now(timezone.utc) + timedelta(days=random.randint(30, 90))
            vehicle_doc["availability"].append({
                "start": block_start,
                "end": block_start + timedelta(days=random.randint(2, 7)),
                "type": random.choice(["blocked", "maintenance"]),
            })

        result = await vehicles_col.insert_one(vehicle_doc)
        vehicle_ids.append(result.inserted_id)
        vehicle_docs.append(vehicle_doc)

    print(f"    Created {num_vehicles} vehicles")

    # ─── Create Bookings ───────────────────────────────────────
    print("  Creating bookings...")
    statuses_pool = (
        ["completed"] * 40 +
        ["confirmed"] * 15 +
        ["active"] * 10 +
        ["cancelled"] * 15 +
        ["held"] * 5 +
        ["disputed"] * 5 +
        ["refunded"] * 5 +
        ["archived"] * 5
    )

    booking_ids = []
    for i in range(num_bookings):
        vehicle_idx = random.randint(0, len(vehicle_ids) - 1)
        vehicle = vehicle_docs[vehicle_idx]
        user_id = random.choice(user_ids)
        status = random.choice(statuses_pool)

        # Generate dates spread across the past several months
        if status in ("completed", "archived", "cancelled", "refunded"):
            start_offset = random.randint(7, 150)
            start_date = datetime.now(timezone.utc) - timedelta(days=start_offset)
        elif status == "active":
            start_date = datetime.now(timezone.utc) - timedelta(days=random.randint(0, 3))
        else:
            start_date = datetime.now(timezone.utc) + timedelta(days=random.randint(1, 30))

        days = random.randint(1, 14)
        end_date = start_date + timedelta(days=days)

        pricing = vehicle.get("pricing", {})
        price = calculate_price(
            start_date=start_date,
            end_date=end_date,
            base_rate=pricing.get("baseRate", 2000),
            weekend_rate=pricing.get("weekendRate"),
            discounts=pricing.get("discounts"),
            cleaning_fee=pricing.get("cleaningFee", 0),
            security_deposit=pricing.get("securityDeposit", 0),
        )

        hold_expires = None
        if status == "held":
            hold_expires = datetime.now(timezone.utc) + timedelta(minutes=random.randint(5, 15))

        booking_doc = {
            "vehicleId": str(vehicle_ids[vehicle_idx]),
            "userId": str(user_id),
            "ownerId": str(vehicle["ownerId"]),
            "startDate": start_date,
            "endDate": end_date,
            "days": days,
            "priceBreakdown": price.model_dump(),
            "status": status,
            "holdExpiresAt": hold_expires,
            "idempotencyKey": f"seed_{uuid.uuid4().hex}",
            "paymentMethod": random.choice(["mock_card", "upi", "wallet"]),
            "createdAt": start_date - timedelta(days=random.randint(1, 7)),
            "updatedAt": start_date,
        }

        if status == "cancelled":
            booking_doc["cancelReason"] = random.choice([
                "Changed plans", "Found a better deal", "Trip cancelled", "Vehicle issue"
            ])

        result = await bookings_col.insert_one(booking_doc)
        booking_ids.append(result.inserted_id)

    print(f"    Created {num_bookings} bookings")

    # ─── Create Payments ───────────────────────────────────────
    print("  Creating payments...")
    payment_count = 0
    cursor = bookings_col.find({"status": {"$in": ["confirmed", "active", "completed", "archived"]}})
    async for booking in cursor:
        payment_doc = {
            "bookingId": str(booking["_id"]),
            "method": booking.get("paymentMethod", "mock_card"),
            "amount": booking.get("priceBreakdown", {}).get("total", 0),
            "status": "succeeded",
            "transactionRef": f"txn_{uuid.uuid4().hex[:12]}",
            "createdAt": booking.get("createdAt", datetime.now(timezone.utc)),
        }
        await payments_col.insert_one(payment_doc)
        payment_count += 1

    print(f"    Created {payment_count} payments")

    # ─── Create Reviews ────────────────────────────────────────
    print("  Creating reviews...")
    review_count = 0
    cursor = bookings_col.find({"status": {"$in": ["completed", "archived"]}})
    async for booking in cursor:
        if random.random() > 0.4:  # 60% of completed bookings get reviews
            review_doc = {
                "bookingId": str(booking["_id"]),
                "vehicleId": booking["vehicleId"],
                "userId": booking["userId"],
                "rating": random.choices([3, 4, 4, 5, 5, 5], weights=[1, 2, 2, 3, 3, 3])[0],
                "comment": random.choice([
                    "Great experience! Car was clean and well-maintained.",
                    "Smooth ride, owner was very helpful.",
                    "Good value for money. Would rent again.",
                    "Excellent vehicle, exactly as described.",
                    "Nice car, easy pickup and drop-off process.",
                    "Decent experience overall.",
                    "Car was in good condition. Recommended!",
                    "Perfect for our family trip. Very spacious.",
                    "Owner was responsive and accommodating.",
                    "Loved the car! Will definitely book again.",
                ]),
                "createdAt": booking.get("endDate", datetime.now(timezone.utc)) + timedelta(hours=random.randint(1, 72)),
            }
            await reviews_col.insert_one(review_doc)
            review_count += 1

    print(f"    Created {review_count} reviews")

    # ─── Create Notifications ──────────────────────────────────
    print("  Creating sample notifications...")
    for uid in user_ids[:5]:
        for _ in range(random.randint(2, 5)):
            await notifications_col.insert_one({
                "userId": str(uid),
                "message": random.choice([
                    "Your booking has been confirmed!",
                    "Reminder: Your rental starts tomorrow.",
                    "Your booking hold is expiring soon.",
                    "New vehicles available in your area!",
                    "Your rental has been completed. Please leave a review.",
                ]),
                "type": random.choice(["info", "success", "warning"]),
                "read": random.random() > 0.5,
                "createdAt": datetime.now(timezone.utc) - timedelta(hours=random.randint(1, 168)),
            })

    print("\n✅ Seed data generation complete!")
    print(f"   Admin: admin@carrental.com / admin123")
    print(f"   Owner: owner1@carrental.com / owner123")
    print(f"   User:  user1@carrental.com / user123")


async def main():
    await seed_database()


if __name__ == "__main__":
    asyncio.run(main())

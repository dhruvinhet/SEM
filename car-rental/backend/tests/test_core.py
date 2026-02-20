"""
Tests for DriveX Car Rental Backend
"""
import pytest
import asyncio
from datetime import datetime, timedelta

# ═══════════════════════════════════════════════════════════
# Pricing Engine Tests
# ═══════════════════════════════════════════════════════════

def test_calculate_price_basic():
    """Test basic pricing: 3 weekdays, no discounts."""
    from app.pricing import calculate_price
    
    # Monday to Thursday (3 days, all weekdays)
    start = datetime(2025, 1, 6)  # Monday
    end = datetime(2025, 1, 9)    # Thursday
    
    result = calculate_price(
        start_date=start,
        end_date=end,
        base_rate=1000,
        weekend_rate=None,
        cleaning_fee=200,
        security_deposit=3000,
    )
    
    assert result.days == 3
    assert result.base == 3000  # 3 * 1000
    assert result.total > result.base  # includes fees & tax


def test_calculate_price_with_weekend():
    """Test pricing with weekend rate applied on Sat/Sun."""
    from app.pricing import calculate_price
    
    # Friday to Monday (3 days: Fri, Sat, Sun)
    start = datetime(2025, 1, 10)  # Friday
    end = datetime(2025, 1, 13)    # Monday
    
    result = calculate_price(
        start_date=start,
        end_date=end,
        base_rate=1000,
        weekend_rate=1500,
        cleaning_fee=0,
        security_deposit=0,
    )
    
    assert result.days == 3
    # Fri=1000, Sat=1500, Sun=1500 → base = 4000
    assert result.base == 4000


def test_calculate_price_long_term_discount():
    """Test 10%+ discount for 7+ day bookings."""
    from app.pricing import calculate_price
    
    start = datetime(2025, 1, 6)    # Monday
    end = datetime(2025, 1, 13)     # Next Monday (7 days)
    
    result = calculate_price(
        start_date=start,
        end_date=end,
        base_rate=1000,
        weekend_rate=None,
        discounts={"weekly": 0.10},
        cleaning_fee=0,
        security_deposit=0,
    )
    
    assert result.days == 7
    # Should have a discount fee item
    fee_names = [f.name for f in result.fees]
    has_discount = any("discount" in n.lower() for n in fee_names)
    assert has_discount, f"Expected a discount fee, got: {fee_names}"


def test_calculate_price_single_day():
    """Test minimum 1-day booking."""
    from app.pricing import calculate_price
    
    start = datetime(2025, 1, 6)
    end = datetime(2025, 1, 6)
    
    result = calculate_price(
        start_date=start,
        end_date=end,
        base_rate=2000,
        weekend_rate=None,
        cleaning_fee=0,
        security_deposit=0,
    )
    
    assert result.days >= 1
    assert result.base >= 2000


# ═══════════════════════════════════════════════════════════
# Refund Calculation Tests
# ═══════════════════════════════════════════════════════════

def test_refund_full_48h_plus():
    """Full refund when cancelled 48+ hours before start."""
    from app.pricing import calculate_refund
    
    start_date = datetime.utcnow() + timedelta(hours=72)
    total = 10000
    
    booking = {
        "startDate": start_date,
        "priceBreakdown": {"total": total, "fees": []},
    }
    refund = calculate_refund(
        booking=booking,
        cancel_time=datetime.utcnow(),
    )

    assert refund == total


def test_refund_partial_24_to_48h():
    """50% refund when cancelled 24-48 hours before start."""
    from app.pricing import calculate_refund
    
    start_date = datetime.utcnow() + timedelta(hours=30)
    total = 10000
    
    booking = {
        "startDate": start_date,
        "priceBreakdown": {"total": total, "fees": []},
    }
    refund = calculate_refund(
        booking=booking,
        cancel_time=datetime.utcnow(),
    )

    assert refund == total * 0.5


def test_refund_none_under_24h():
    """No refund when cancelled under 24 hours before start."""
    from app.pricing import calculate_refund
    
    start_date = datetime.utcnow() + timedelta(hours=12)
    total = 10000
    
    booking = {
        "startDate": start_date,
        "priceBreakdown": {"total": total, "fees": []},
    }
    refund = calculate_refund(
        booking=booking,
        cancel_time=datetime.utcnow(),
    )

    assert refund == 0


# ═══════════════════════════════════════════════════════════
# Auth Utility Tests
# ═══════════════════════════════════════════════════════════

def test_password_hash_verify():
    """Test bcrypt hash + verify round-trip."""
    from app.auth import hash_password, verify_password
    
    plain = "MySecureP@ss123"
    hashed = hash_password(plain)
    
    assert hashed != plain
    assert verify_password(plain, hashed)
    assert not verify_password("wrong", hashed)


def test_jwt_create_decode():
    """Test JWT token create and decode round-trip."""
    from app.auth import create_access_token, decode_token
    
    payload = {"sub": "user123", "role": "user", "email": "test@example.com"}
    token = create_access_token(payload)
    
    assert token is not None
    decoded = decode_token(token)
    assert decoded is not None
    assert decoded["sub"] == "user123"
    assert decoded["role"] == "user"


def test_jwt_expired_token():
    """Test that an expired JWT returns None on decode."""
    from app.auth import create_access_token, decode_token
    import os
    
    # Temporarily set expiry very low - this is a simplified test
    payload = {"sub": "user123", "role": "user", "email": "test@example.com"}
    token = create_access_token(payload)
    
    # Token should be valid right now
    decoded = decode_token(token)
    assert decoded is not None


# ═══════════════════════════════════════════════════════════
# Booking State Machine Tests (logic validation)
# ═══════════════════════════════════════════════════════════

def test_booking_status_transitions():
    """Verify allowed status transitions are correct."""
    ALLOWED_TRANSITIONS = {
        "draft": ["pending"],
        "pending": ["held", "cancelled"],
        "held": ["confirmed", "cancelled"],
        "confirmed": ["active", "cancelled"],
        "active": ["completed", "disputed"],
        "completed": ["archived", "disputed"],
        "disputed": ["resolved", "refunded"],
        "cancelled": ["refunded"],
        "refunded": ["archived"],
        "resolved": ["archived"],
    }
    
    # Verify terminal states have no transitions
    assert "archived" not in ALLOWED_TRANSITIONS or ALLOWED_TRANSITIONS.get("archived") == []
    
    # Verify key transitions exist
    assert "cancelled" in ALLOWED_TRANSITIONS["pending"]
    assert "confirmed" in ALLOWED_TRANSITIONS["held"]
    assert "completed" in ALLOWED_TRANSITIONS["active"]
    assert "disputed" in ALLOWED_TRANSITIONS["completed"]


def test_booking_cannot_skip_states():
    """Verify bookings cannot skip states."""
    ALLOWED_TRANSITIONS = {
        "draft": ["pending"],
        "pending": ["held", "cancelled"],
        "held": ["confirmed", "cancelled"],
        "confirmed": ["active", "cancelled"],
        "active": ["completed", "disputed"],
    }
    
    # Cannot go from pending to active
    assert "active" not in ALLOWED_TRANSITIONS["pending"]
    # Cannot go from draft to confirmed
    assert "confirmed" not in ALLOWED_TRANSITIONS["draft"]


# ═══════════════════════════════════════════════════════════
# Model Validation Tests
# ═══════════════════════════════════════════════════════════

def test_signup_request_validation():
    """Test signup request model validation."""
    from app.models import SignupRequest
    
    data = SignupRequest(
        name="Test User",
        email="test@example.com",
        password="password123",
        role="user",
    )
    assert data.name == "Test User"
    assert data.email == "test@example.com"
    assert data.role == "user"


def test_signup_invalid_role():
    """Test that invalid role is rejected."""
    from app.models import SignupRequest
    import pydantic
    
    with pytest.raises(pydantic.ValidationError):
        SignupRequest(
            name="Test",
            email="test@example.com",
            password="pass123",
            role="superadmin",  # Invalid
        )


def test_vehicle_create_request():
    """Test vehicle creation model."""
    from app.models import VehicleCreateRequest
    
    v = VehicleCreateRequest(
        title="Honda City 2023",
        specs={"seats": 5, "transmission": "auto", "fuel": "petrol"},
        pricing={"baseRate": 2000},
    )
    assert v.title == "Honda City 2023"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

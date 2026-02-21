from math import ceil
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict
from app.config import settings
from app.models import FeeItem, PriceBreakdown


def is_weekend(dt: datetime) -> bool:
    return dt.weekday() in (5, 6)  # Saturday, Sunday


def is_peak_season(dt: datetime, peak_ranges: List[Dict]) -> bool:
    """Check if a date falls within a peak season range (MM-DD format)."""
    if not peak_ranges:
        return False
    month_day = f"{dt.month:02d}-{dt.day:02d}"
    for pr in peak_ranges:
        start = pr.get("start", "")
        end = pr.get("end", "")
        if not start or not end:
            continue
        # Handle year-wrap ranges (e.g., Dec 15 - Jan 15)
        if start <= end:
            if start <= month_day <= end:
                return True
        else:
            if month_day >= start or month_day <= end:
                return True
    return False


def calculate_price(
    start_date: datetime,
    end_date: datetime,
    base_rate: float,
    weekend_rate: Optional[float] = None,
    peak_season_rate: Optional[float] = None,
    peak_season_ranges: Optional[List[Dict]] = None,
    discounts: Optional[Dict[str, float]] = None,
    cleaning_fee: float = 0.0,
    security_deposit: float = 0.0,
    tax_percentage: Optional[float] = None,
    service_fee_percentage: Optional[float] = None,
    coupon_discount: float = 0.0,
    coupon_code: Optional[str] = None,
    surge_active: bool = False,
) -> PriceBreakdown:
    """Calculate the full price breakdown for a booking."""
    if tax_percentage is None:
        tax_percentage = settings.TAX_PERCENTAGE
    if service_fee_percentage is None:
        service_fee_percentage = settings.SERVICE_FEE_PERCENTAGE

    delta = end_date - start_date
    days = max(delta.days, 1)

    # Calculate base cost per day (weekday vs weekend vs peak season)
    base_total = 0.0
    for i in range(days):
        day = start_date + timedelta(days=i)
        if peak_season_rate and peak_season_ranges and is_peak_season(day, peak_season_ranges):
            base_total += peak_season_rate
        elif weekend_rate and is_weekend(day):
            base_total += weekend_rate
        else:
            base_total += base_rate

    # Apply surge pricing
    if surge_active:
        surge_amount = round(base_total * (settings.SURGE_MULTIPLIER - 1), 2)
        base_total = round(base_total * settings.SURGE_MULTIPLIER, 2)
    else:
        surge_amount = 0.0

    # Apply long-term discounts
    discount_amount = 0.0
    if discounts:
        if days >= 30 and "monthly" in discounts:
            discount_amount = round(base_total * discounts["monthly"], 2)
        elif days >= 7 and "weekly" in discounts:
            discount_amount = round(base_total * discounts["weekly"], 2)

    base_after_discount = round(base_total - discount_amount, 2)

    # Build fees
    fees: List[FeeItem] = []
    if surge_amount > 0:
        fees.append(FeeItem(name="Surge Pricing", amount=round(surge_amount, 2)))
    if cleaning_fee > 0:
        fees.append(FeeItem(name="Cleaning Fee", amount=round(cleaning_fee, 2)))

    service_fee = round(base_after_discount * service_fee_percentage / 100, 2)
    if service_fee > 0:
        fees.append(FeeItem(name="Service Fee", amount=service_fee))

    if security_deposit > 0:
        fees.append(FeeItem(name="Security Deposit", amount=round(security_deposit, 2)))

    if discount_amount > 0:
        fees.append(FeeItem(name="Long-term Discount", amount=-round(discount_amount, 2)))

    subtotal = base_after_discount + sum(
        f.amount for f in fees
        if f.name not in ("Security Deposit", "Long-term Discount")
    )

    # Apply coupon discount
    if coupon_discount > 0:
        fees.append(FeeItem(name=f"Coupon ({coupon_code})", amount=-round(coupon_discount, 2)))
        subtotal = max(0, subtotal - coupon_discount)

    tax = round(subtotal * tax_percentage / 100, 2)
    total = round(subtotal + tax + security_deposit, 2)

    return PriceBreakdown(
        days=days,
        base=round(base_total, 2),
        fees=fees,
        tax=tax,
        total=total,
        couponDiscount=round(coupon_discount, 2),
        couponCode=coupon_code,
    )


def calculate_refund(
    booking: dict,
    cancel_time: Optional[datetime] = None,
    policy: str = "moderate",
) -> float:
    """Calculate refund amount based on cancellation policy."""
    if cancel_time is None:
        cancel_time = datetime.now(timezone.utc)

    start_date = booking["startDate"]
    if isinstance(start_date, str):
        start_date = datetime.fromisoformat(start_date.replace("Z", "+00:00"))

    if start_date.tzinfo is None:
        start_date = start_date.replace(tzinfo=timezone.utc)
    if cancel_time.tzinfo is None:
        cancel_time = cancel_time.replace(tzinfo=timezone.utc)

    hours_before = (start_date - cancel_time).total_seconds() / 3600
    total = booking.get("priceBreakdown", {}).get("total", 0)

    # Remove security deposit from refund calculation
    deposit = 0
    for fee in booking.get("priceBreakdown", {}).get("fees", []):
        if fee.get("name") == "Security Deposit":
            deposit = fee.get("amount", 0)

    refundable = total - deposit

    if policy == "non_refundable":
        refund = 0.0
    elif policy == "flexible":
        # Full refund >24h, 50% >12h, no refund after
        if hours_before > 24:
            refund = refundable
        elif hours_before > 12:
            refund = round(refundable * 0.5, 2)
        else:
            refund = 0.0
    elif policy == "strict":
        # 50% refund >72h, no refund after
        if hours_before > 72:
            refund = round(refundable * 0.5, 2)
        else:
            refund = 0.0
    else:
        # moderate (default): Full >48h, 50% >24h, none after
        if hours_before > 48:
            refund = refundable
        elif hours_before > 24:
            refund = round(refundable * 0.5, 2)
        else:
            refund = 0.0

    # Always refund security deposit
    return round(refund + deposit, 2)


def calculate_late_return_fee(
    vehicle: dict,
    scheduled_end: datetime,
    actual_return: datetime,
) -> float:
    """Calculate fee for late return based on hours over schedule."""
    if actual_return <= scheduled_end:
        return 0.0
    late_hours = ceil((actual_return - scheduled_end).total_seconds() / 3600)
    late_fee_per_hour = vehicle.get("pricing", {}).get("lateFeePerHour", 0)
    if late_fee_per_hour <= 0:
        # Default: charge 1.5x hourly base rate
        base_rate = vehicle.get("pricing", {}).get("baseRate", 0)
        late_fee_per_hour = round((base_rate / 24) * 1.5, 2)
    return round(late_hours * late_fee_per_hour, 2)


def apply_coupon_discount(
    coupon: dict,
    booking_amount: float,
) -> float:
    """Calculate the discount amount for a given coupon and booking amount."""
    if coupon.get("type") == "percentage":
        discount = round(booking_amount * coupon["value"] / 100, 2)
        if coupon.get("maxDiscount"):
            discount = min(discount, coupon["maxDiscount"])
    else:  # fixed
        discount = min(coupon["value"], booking_amount)
    return round(discount, 2)


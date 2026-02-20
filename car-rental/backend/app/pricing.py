from math import ceil
from datetime import datetime, timezone
from typing import List, Optional, Dict
from app.config import settings
from app.models import FeeItem, PriceBreakdown


def is_weekend(dt: datetime) -> bool:
    return dt.weekday() in (5, 6)  # Saturday, Sunday


def calculate_price(
    start_date: datetime,
    end_date: datetime,
    base_rate: float,
    weekend_rate: Optional[float] = None,
    discounts: Optional[Dict[str, float]] = None,
    cleaning_fee: float = 0.0,
    security_deposit: float = 0.0,
    tax_percentage: Optional[float] = None,
    service_fee_percentage: Optional[float] = None,
) -> PriceBreakdown:
    """Calculate the full price breakdown for a booking."""
    if tax_percentage is None:
        tax_percentage = settings.TAX_PERCENTAGE
    if service_fee_percentage is None:
        service_fee_percentage = settings.SERVICE_FEE_PERCENTAGE

    delta = end_date - start_date
    days = max(delta.days, 1)

    # Calculate base cost per day (weekday vs weekend)
    base_total = 0.0
    current = start_date
    from datetime import timedelta
    for i in range(days):
        day = start_date + timedelta(days=i)
        if weekend_rate and is_weekend(day):
            base_total += weekend_rate
        else:
            base_total += base_rate

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
    if cleaning_fee > 0:
        fees.append(FeeItem(name="Cleaning Fee", amount=round(cleaning_fee, 2)))
    
    service_fee = round(base_after_discount * service_fee_percentage / 100, 2)
    if service_fee > 0:
        fees.append(FeeItem(name="Service Fee", amount=service_fee))

    if security_deposit > 0:
        fees.append(FeeItem(name="Security Deposit", amount=round(security_deposit, 2)))

    if discount_amount > 0:
        fees.append(FeeItem(name="Long-term Discount", amount=-round(discount_amount, 2)))

    subtotal = base_after_discount + sum(f.amount for f in fees if f.name != "Security Deposit" and f.name != "Long-term Discount")
    tax = round(subtotal * tax_percentage / 100, 2)
    total = round(subtotal + tax + security_deposit, 2)

    return PriceBreakdown(
        days=days,
        base=round(base_total, 2),
        fees=fees,
        tax=tax,
        total=total,
    )


def calculate_refund(
    booking: dict,
    cancel_time: Optional[datetime] = None,
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

    if hours_before > 48:
        refund = refundable  # Full refund
    elif hours_before > 24:
        refund = round(refundable * 0.5, 2)  # 50% refund
    else:
        refund = 0  # No refund

    # Always refund security deposit
    return round(refund + deposit, 2)

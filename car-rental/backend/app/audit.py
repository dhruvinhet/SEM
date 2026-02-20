from datetime import datetime, timezone
from typing import Optional, Dict, Any
from app.database import audit_logs_col


async def log_audit(
    actor_id: str,
    action: str,
    resource_type: str,
    resource_id: str,
    payload: Optional[Dict[str, Any]] = None,
):
    """Record an audit log entry for major actions."""
    await audit_logs_col.insert_one({
        "actorId": actor_id,
        "action": action,
        "resourceType": resource_type,
        "resourceId": resource_id,
        "payload": payload or {},
        "createdAt": datetime.now(timezone.utc),
    })

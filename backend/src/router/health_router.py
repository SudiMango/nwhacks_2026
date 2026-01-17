from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["health"])

@router.get("/", summary="Liveness probe")
async def ping():
    return {"status": "ok"}
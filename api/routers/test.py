from fastapi import APIRouter, HTTPException

router = APIRouter()

@router.get("/")
async def test():
    return {"It works ?": "yes"}
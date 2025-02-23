from services.chat.Chat import generate_dummy_response
from fastapi import APIRouter, HTTPException

router = APIRouter()

@router.get("/")
async def chat_response():
    return generate_dummy_response()
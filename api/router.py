from fastapi import APIRouter
from .routers import test
from .routers import chat

api_router = APIRouter()

#include the test router
api_router.include_router (test.router, prefix="/test")
api_router.include_router (chat.router, prefix="/chat")

v1_router = APIRouter()
v1_router.include_router(api_router,prefix ="/api/v1")
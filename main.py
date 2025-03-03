from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.router import v1_router
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


# add a default route
@app.get("/")
async def root():
    return {"message": "OK"}


# Include routers
app.include_router(v1_router)


# uvicorn main:app --host 0.0.0.0 --port 8888 --reload

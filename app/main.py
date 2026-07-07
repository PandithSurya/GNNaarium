from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from app.api import router as api_router
from app.auth_routes import router as auth_router
from app.database import connect_to_mongo, close_mongo_connection
from dotenv import load_dotenv
import os

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

app = FastAPI(title="GNNaarium Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("JWT_SECRET_KEY", "your-secret-key")
)

app.include_router(api_router, prefix="/api")
app.include_router(auth_router)

# Dev-only bypass — only active when ENVIRONMENT != production
if os.getenv("ENVIRONMENT") != "production":
    from fastapi.responses import RedirectResponse
    from app.database import create_jwt_token
    import urllib.parse, json

    @app.get("/auth/dev-login")
    async def dev_login(origin: str = "http://localhost:3000"):
        user_data = {"email": "dev@localhost", "name": "Dev User", "profile_pic": None}
        token = create_jwt_token(user_data)
        encoded = urllib.parse.quote(json.dumps(user_data))
        return RedirectResponse(url=f"{origin}?token={token}&user={encoded}")

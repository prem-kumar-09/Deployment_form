from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, form

app = FastAPI(
    title="Deployment Request API",
    description="Dynamic deployment request form with user and admin roles",
    version="1.0.0",
)

origins = [o.strip() for o in settings.cors_origins.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(form.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok"}

from typing import Annotated

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.database import get_db

from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.categories import router as categories_router
from app.routers.products import router as products_router
from app.routers.customers import router as customers_router
from app.routers.pricing_rules import router as pricing_rules_router
from app.routers.promotions import router as promotions_router
from app.routers.pricing_calculations import (
    router as pricing_calculations_router,
)


app = FastAPI(
    title="Dynamic Pricing & Business Rules Engine",
    description=(
        "Configurable business rules and dynamic pricing platform "
        "for calculating product prices dynamically."
    ),
    version="1.0.0",
)


# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# API Routers
# ---------------------------------------------------------------------------

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(categories_router)
app.include_router(products_router)
app.include_router(customers_router)
app.include_router(pricing_rules_router)
app.include_router(promotions_router)
app.include_router(pricing_calculations_router)


# ---------------------------------------------------------------------------
# System Endpoints
# ---------------------------------------------------------------------------

@app.get(
    "/",
    tags=["System"],
)
def root() -> dict[str, str]:
    return {
        "message": "Dynamic Pricing & Business Rules Engine API",
        "status": "running",
    }


@app.get(
    "/health",
    tags=["System"],
)
def health_check(
    db: Annotated[Session, Depends(get_db)],
) -> dict[str, str]:
    db.execute(text("SELECT 1"))

    return {
        "status": "healthy",
        "database": "connected",
    }
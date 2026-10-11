import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import get_settings
from app.routers import activity, auth, consumption, hydration, meal_planner, nutrition, profile

logger = logging.getLogger("nutriguide")

app = FastAPI(title="NutriGuide AI API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for r in (auth, profile, nutrition, meal_planner, consumption, hydration, activity):
    app.include_router(r.router)


@app.exception_handler(SQLAlchemyError)
async def db_error_handler(request: Request, exc: SQLAlchemyError):
    logger.exception("Database error")  # full trace stays in server logs only
    return JSONResponse(status_code=500, content={"detail": "Something went wrong. Please try again."})


@app.exception_handler(Exception)
async def unhandled_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error")
    return JSONResponse(status_code=500, content={"detail": "Something went wrong. Please try again."})


@app.get("/api/health", tags=["meta"])
def health():
    return {"status": "ok"}

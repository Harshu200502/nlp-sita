"""
main.py — Application Entry Point
===================================
Initializes the FastAPI app with:
  - CORS middleware (allows React dev server + production origins)
  - Static file serving (serves the static HTML fallback at /ui)
  - API router from app/api.py
  - OpenAPI metadata

Run with:
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from app.api import router
from app.auth import auth_router

# ─────────────────────────────────────────────────────────────────────────────
# App definition
# ─────────────────────────────────────────────────────────────────────────────

app = FastAPI(
    title       = "SITA — Smart Instruction & Task Authoring Assistant",
    description = (
        "Analyzes vague instructions and technical communication. "
        "Expands IT abbreviations, detects ambiguity, extracts structured fields, "
        "and suggests clearer rewrites — powered by spaCy NLP."
    ),
    version     = "2.0.0",
    docs_url    = "/docs",
    redoc_url   = "/redoc",
)

# ─────────────────────────────────────────────────────────────────────────────
# CORS middleware — allow React dev server (port 5173) and production builds
# ─────────────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:3000",   # CRA dev server
        "http://localhost:8000",   # Same-origin (static HTML fallback)
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
    ],
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)

# ─────────────────────────────────────────────────────────────────────────────
# API routes
# ─────────────────────────────────────────────────────────────────────────────

app.include_router(auth_router)
app.include_router(router)

# ─────────────────────────────────────────────────────────────────────────────
# Static files (serves the vanilla HTML fallback at /ui)
# ─────────────────────────────────────────────────────────────────────────────

_static_dir = os.path.join(os.path.dirname(__file__), "app", "static")
if os.path.isdir(_static_dir):
    app.mount("/ui", StaticFiles(directory=_static_dir, html=True), name="static")

# ─────────────────────────────────────────────────────────────────────────────
# Root redirect
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/", include_in_schema=False)
def root():
    """Root endpoint — confirms the API is live."""
    return {
        "service": "SITA — Smart Instruction & Task Authoring Assistant",
        "version": "2.0.0",
        "docs":    "/docs",
        "redoc":   "/redoc",
        "ui":      "/ui",
        "status":  "running",
    }
"""
app/api.py — FastAPI Router
============================
Exposes all API endpoints:
  POST /analyze  — single text analysis
  POST /batch    — batch analysis (up to 20 texts)
  GET  /health   — service health check
  POST /improve-writing — research writing assistant

Each endpoint:
  1. Validates input via Pydantic models (models.py)
  2. Delegates processing to the NLP pipeline (nlp/__init__.py)
  3. Returns a typed, documented response
"""

from fastapi import APIRouter, HTTPException, Depends
from app.auth import get_current_user
from app.nlp.research import improve_research_writing
from app.models import (
    AnalyzeRequest,
    AnalyzeResponse,
    BatchAnalyzeRequest,
    BatchAnalyzeResponse,
    ExtractedInfo,
    POSTag,
    EntitySpan,
    GeneratedContent,
    PromptBuilderRequest,
    PromptBuilderResponse,
    ImproveWritingRequest,
    ImproveWritingResponse,
)
from app.nlp import analyze_text
from app.nlp.prompt_builder import build_smart_prompt

router = APIRouter()

# ─────────────────────────────────────────────────────────────────────────────
# HELPER: dict → response model
# ─────────────────────────────────────────────────────────────────────────────

def _build_response(result: dict) -> AnalyzeResponse:
    """Convert the raw dict from analyze_text() into a typed AnalyzeResponse."""
    extracted_data = result["extracted"]
    return AnalyzeResponse(
        original_text       = result["original_text"],
        interpreted_text    = result["interpreted_text"],
        abbreviations_found = result["abbreviations_found"],
        task_type           = result.get("task_type", "General Task"),
        extracted = ExtractedInfo(
            action     = extracted_data.get("action"),
            person     = extracted_data.get("person"),
            deadline   = extracted_data.get("deadline"),
            tech_terms = extracted_data.get("tech_terms", []),
        ),
        pos_tags = [
            POSTag(text=t["text"], pos=t["pos"], tag=t["tag"])
            for t in result.get("pos_tags", [])
        ],
        entities = [
            EntitySpan(text=e["text"], label=e["label"], start=e["start"], end=e["end"])
            for e in result.get("entities", [])
        ],
        issues           = result["issues"],
        ambiguous_words  = result["ambiguous_words"],
        clarity_score    = result["clarity_score"],
        structured_instruction = result["structured_instruction"],
        generated_content = GeneratedContent(
            type=result["generated_content"]["type"],
            title=result["generated_content"]["title"],
            sections=result["generated_content"]["sections"]
        ),
    )


# ─────────────────────────────────────────────────────────────────────────────
# POST /analyze
# ─────────────────────────────────────────────────────────────────────────────

@router.post(
    "/analyze",
    response_model=AnalyzeResponse,
    summary="Analyze a single instruction for clarity",
    tags=["Analysis"],
)
def analyze(request: AnalyzeRequest, current_user: str = Depends(get_current_user)) -> AnalyzeResponse:
    """
    Analyze a single instruction text:
    - Expands abbreviations (EOD → End of Day, ASAP → As Soon As Possible, …)
    - Runs spaCy NLP pipeline (tokenization, POS tagging, NER)
    - Detects missing info and ambiguous words
    - Generates a structured, clearer suggestion
    - Returns a clarity score (0–100)
    """
    try:
        result = analyze_text(request.text, request.user_type)
        return _build_response(result)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ─────────────────────────────────────────────────────────────────────────────
# POST /batch
# ─────────────────────────────────────────────────────────────────────────────

@router.post(
    "/batch",
    response_model=BatchAnalyzeResponse,
    summary="Analyze multiple instructions in one request",
    tags=["Analysis"],
)
def batch_analyze(request: BatchAnalyzeRequest, current_user: str = Depends(get_current_user)) -> BatchAnalyzeResponse:
    """
    Analyze up to 20 instructions in a single API call.
    Returns individual results plus aggregate average clarity score.
    """
    texts = request.texts[:20]  # Hard cap at 20 items

    if not texts:
        raise HTTPException(status_code=422, detail="Provide at least one instruction text.")

    results = []
    for text in texts:
        text = text.strip()
        if not text:
            continue
        try:
            # For batch, use a default user_type if not handling array properly, but we can just use "Professional"
            result = analyze_text(text, "Professional")
            results.append(_build_response(result))
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Error processing '{text}': {exc}")

    if not results:
        raise HTTPException(status_code=422, detail="No valid (non-empty) texts provided.")

    avg_clarity = round(sum(r.clarity_score for r in results) / len(results), 1)

    return BatchAnalyzeResponse(
        results     = results,
        total       = len(results),
        avg_clarity = avg_clarity,
    )


# ─────────────────────────────────────────────────────────────────────────────
# GET /health
# ─────────────────────────────────────────────────────────────────────────────

@router.get(
    "/health",
    summary="Service health check",
    tags=["System"],
)
def health():
    """Returns 200 OK when the service is running."""
    return {"status": "ok", "service": "SITA — Smart Instruction & Task Authoring Assistant"}


# ─────────────────────────────────────────────────────────────────────────────
# GET /abbreviations
# ─────────────────────────────────────────────────────────────────────────────

@router.get(
    "/abbreviations",
    summary="Get the full domain abbreviation dictionary",
    tags=["System"],
)
def get_abbreviations(current_user: str = Depends(get_current_user)):
    """Returns the complete domain abbreviation map used by the NLP pipeline."""
    from app.nlp.domain_dict import ABBREVIATION_MAP
    return {"abbreviations": ABBREVIATION_MAP, "total": len(ABBREVIATION_MAP)}


# ─────────────────────────────────────────────────────────────────────────────
# POST /build_prompt
# ─────────────────────────────────────────────────────────────────────────────

@router.post(
    "/build_prompt",
    response_model=PromptBuilderResponse,
    summary="Builds a smart prompt based on user and task type",
    tags=["Prompt"],
)
def build_prompt(request: PromptBuilderRequest, current_user: str = Depends(get_current_user)) -> PromptBuilderResponse:
    """
    Generate structured output, detailed prompts, and Ready-to-Use prompts.
    """
    try:
        result = build_smart_prompt(request.text, request.user_type, request.task_type)
        return PromptBuilderResponse(**result)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ─────────────────────────────────────────────────────────────────────────────
# POST /improve-writing
# ─────────────────────────────────────────────────────────────────────────────

@router.post(
    "/improve-writing",
    response_model=ImproveWritingResponse,
    summary="Enhance research writing for academic tone and clarity",
    tags=["Research"],
)
def improve_writing(request: ImproveWritingRequest, current_user: str = Depends(get_current_user)) -> ImproveWritingResponse:
    """
    Analyzes research/academic text and provides:
    - Grammar and tone corrections
    - Academic suggestions
    - An improved formal version
    """
    try:
        result = improve_research_writing(request.text)
        return ImproveWritingResponse(**result)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
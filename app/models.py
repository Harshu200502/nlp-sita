"""
app/models.py — Pydantic Request & Response Schemas
=====================================================
Defines the data shapes that FastAPI uses to:
  - Validate incoming JSON input
  - Serialize outgoing JSON output

Using Pydantic V2 ensures automatic type-checking and
clean OpenAPI / Swagger documentation generation.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


# ─────────────────────────────────────────────────────────────────────────────
# REQUEST MODELS
# ─────────────────────────────────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    """
    Input schema for POST /analyze.
    Fields:
        text (str): The raw, potentially vague instruction to be analyzed.
    """
    text: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="The instruction or sentence to analyze for clarity.",
        examples=["Send report EOD ASAP"]
    )


class BatchAnalyzeRequest(BaseModel):
    """
    Input schema for POST /batch — analyze multiple texts in one call.
    Fields:
        texts (List[str]): Up to 20 instructions to analyze in batch.
    """
    texts: List[str] = Field(
        ...,
        min_length=1,
        description="List of instructions to analyze (max 20).",
        examples=[["Send the report EOD", "Push code to repo ASAP"]]
    )


# ─────────────────────────────────────────────────────────────────────────────
# NESTED RESPONSE MODELS
# ─────────────────────────────────────────────────────────────────────────────

class ExtractedInfo(BaseModel):
    """
    Structured information extracted from the input via spaCy NLP.
    Fields:
        action     : The main verb / action (lemmatized).
        person     : Named entity representing a person, if found.
        deadline   : Time expression or deadline, if detected.
        tech_terms : List of recognized technical terms found in the text.
    """
    action:     Optional[str]       = Field(None, description="Main verb / action (lemmatized).")
    person:     Optional[str]       = Field(None, description="Named person entity, if detected.")
    deadline:   Optional[str]       = Field(None, description="Time expression or deadline, if detected.")
    tech_terms: List[str]           = Field(default_factory=list, description="Recognized technical terms.")


class POSTag(BaseModel):
    """Single token with its Part-of-Speech information."""
    text: str
    pos:  str   # coarse-grained POS (VERB, NOUN, etc.)
    tag:  str   # fine-grained Penn Treebank tag


class EntitySpan(BaseModel):
    """Named entity span detected by spaCy NER."""
    text:  str
    label: str  # PERSON, DATE, TIME, ORG, GPE, etc.
    start: int  # character offset start
    end:   int  # character offset end


class ContentSuggestion(BaseModel):
    """Context-aware content suggestions inferred from task keywords."""
    type: str         = Field(..., description="Inferred task type (e.g. Report, Code task, Meeting).")
    title: str        = Field(..., description="Suggested title for the content.")
    description: str  = Field(..., description="Short explanation of the content.")
    sections: List[str] = Field(..., description="Suggested structural sections or steps.")


# ─────────────────────────────────────────────────────────────────────────────
# PRIMARY RESPONSE MODEL
# ─────────────────────────────────────────────────────────────────────────────

class AnalyzeResponse(BaseModel):
    """
    Output schema returned by POST /analyze.

    Fields:
        original_text       : The exact input text echoed back.
        interpreted_text    : Text after abbreviation expansion.
        abbreviations_found : Dict of {abbreviation: expansion} pairs detected.
        extracted           : Structured breakdown (action, person, deadline, tech_terms).
        pos_tags            : Per-token POS tags for frontend highlighting.
        entities            : Named entity spans.
        issues              : List of detected problems.
        ambiguous_words     : List of vague / ambiguous terms found.
        suggestion          : An improved, clearer version of the original instruction.
        clarity_score       : Integer 0–100 (higher = clearer).
    """
    original_text:       str                    = Field(..., description="The original input text.")
    interpreted_text:    str                    = Field(..., description="Text after abbreviation expansion.")
    abbreviations_found: Dict[str, str]         = Field(default_factory=dict, description="Abbreviations detected and their expansions.")
    extracted:           ExtractedInfo          = Field(..., description="NLP-extracted structured info.")
    pos_tags:            List[POSTag]           = Field(default_factory=list, description="Per-token POS tags.")
    entities:            List[EntitySpan]       = Field(default_factory=list, description="Named entity spans.")
    issues:              List[str]              = Field(..., description="Detected ambiguities and missing fields.")
    ambiguous_words:     List[str]              = Field(default_factory=list, description="Vague terms detected.")
    suggestion:          str                    = Field(..., description="Improved, clearer version of the instruction.")
    clarity_score:       int                    = Field(..., ge=0, le=100, description="Clarity score 0–100.")
    content_suggestions: ContentSuggestion      = Field(..., description="Intelligently inferred content suggestions.")


# ─────────────────────────────────────────────────────────────────────────────
# BATCH RESPONSE MODEL
# ─────────────────────────────────────────────────────────────────────────────

class BatchAnalyzeResponse(BaseModel):
    """
    Output schema returned by POST /batch.
    Fields:
        results     : List of AnalyzeResponse objects, one per input text.
        total       : Total number of texts analyzed.
        avg_clarity : Average clarity score across all analyzed texts.
    """
    results:     List[AnalyzeResponse] = Field(..., description="Analysis results, one per input text.")
    total:       int                   = Field(..., description="Number of texts analyzed.")
    avg_clarity: float                 = Field(..., description="Average clarity score across all inputs.")


# ─────────────────────────────────────────────────────────────────────────────
# PROMPT BUILDER MODELS
# ─────────────────────────────────────────────────────────────────────────────

class PromptBuilderRequest(BaseModel):
    """
    Input schema for POST /build_prompt.
    """
    text: str = Field(..., description="The user input/task description.")
    user_type: str = Field(..., description="User type, e.g., 'Student' or 'Working Professional'.")
    task_type: str = Field(..., description="Task type, e.g., 'Report', 'Assignment', 'Email', etc.")

class PromptBuilderResponse(BaseModel):
    """
    Output schema returned by POST /build_prompt.
    """
    original_text: str
    user_type: str
    task_type: str
    structured_prompt: str
    detailed_prompt: str
    ai_ready_prompt: str
    content_structure: List[str]

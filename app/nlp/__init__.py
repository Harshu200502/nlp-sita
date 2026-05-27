"""
app/nlp/ — NLP processing sub-package
======================================
Exports the top-level pipeline function `analyze_text` which orchestrates:
  1. Abbreviation expansion     (domain_dict)
  2. Information extraction     (extractor)
  3. Vague-word detection       (domain_dict)
  4. Issue compilation
  5. Suggestion generation      (suggestion)
  6. Clarity scoring
"""

from app.nlp.domain_dict  import expand_abbreviations, detect_vague_words
from app.nlp.extractor    import extract_info
from app.nlp.suggestion   import generate_suggestion
from app.nlp.content_suggester import generate_content_suggestion


def analyze_text(text: str) -> dict:
    """
    Full NLP pipeline: raw text → structured analysis result.

    Returns a dict matching the AnalyzeResponse schema:
      original_text, interpreted_text, abbreviations_found,
      extracted, issues, ambiguous_words, suggestion, clarity_score
    """
    # ── Step 1: Expand abbreviations ─────────────────────────────────────────
    interpreted_text, abbreviations_found = expand_abbreviations(text)

    # ── Step 2: Extract structured info from interpreted text ─────────────────
    extracted = extract_info(interpreted_text, text)

    # ── Step 3: Detect vague words (on original — catches "ASAP" etc.) ───────
    ambiguous_words = detect_vague_words(text)
    # Also check interpreted text for expanded forms like "As Soon As Possible"
    ambiguous_interp = detect_vague_words(interpreted_text)
    # Merge, deduplicate
    all_vague = list(dict.fromkeys(ambiguous_words + ambiguous_interp))

    # ── Step 4: Build issues list ─────────────────────────────────────────────
    issues: list[str] = []

    if not extracted["action"]:
        issues.append("No clear action found in the instruction.")
    if not extracted["person"]:
        issues.append("Missing person — who should receive or act on this?")
    if not extracted["deadline"]:
        issues.append("Missing deadline — when should this be done?")
    for vague in all_vague:
        issues.append(f"Ambiguous term: '{vague}' — please specify a concrete timeframe.")

    # ── Step 5: Content Suggestion ───────────────────────────────────────────
    content_suggestions = generate_content_suggestion(text)

    # ── Step 6: Generate suggestion ───────────────────────────────────────────
    suggestion = generate_suggestion(extracted, text, abbreviations_found, content_suggestions)

    # ── Step 7: Clarity score ─────────────────────────────────────────────────
    # Base: action +40, person +30, deadline +30  → max 100
    # Penalty: −10 per vague word (floor at 0)
    score = 0
    if extracted["action"]:   score += 40
    if extracted["person"]:   score += 30
    if extracted["deadline"]: score += 30
    score -= 10 * len(all_vague)
    score = max(0, min(100, score))

    return {
        "original_text":       text,
        "interpreted_text":    interpreted_text,
        "abbreviations_found": abbreviations_found,
        "extracted":           {
            "action":     extracted["action"],
            "person":     extracted["person"],
            "deadline":   extracted["deadline"],
            "tech_terms": extracted["tech_terms"],
        },
        "pos_tags":            extracted["pos_tags"],
        "entities":            extracted["entities"],
        "issues":              issues,
        "ambiguous_words":     all_vague,
        "suggestion":          suggestion,
        "clarity_score":       score,
        "content_suggestions": content_suggestions,
    }

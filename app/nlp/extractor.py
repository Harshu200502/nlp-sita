"""
app/nlp/extractor.py — NLP Information Extractor
=================================================
Uses spaCy to extract structured fields from text that has already
been through abbreviation expansion (interpreted text).

Extracted fields:
  - action   : root verb of the sentence (the main thing to do)
  - person   : named PERSON entity (recipient or actor)
  - deadline : DATE or TIME entity
  - tech_terms : list of recognized technical terms found in original text
"""

import spacy
from app.nlp.domain_dict import TECHNICAL_TERMS

# Load the small English model once at import time.
# 'en_core_web_sm' ships with tok2vec, tagger, parser, senter, ner, attribute_ruler, lemmatizer.
try:
    _nlp = spacy.load("en_core_web_sm")
except OSError:
    raise RuntimeError(
        "spaCy model 'en_core_web_sm' not found. "
        "Run: python -m spacy download en_core_web_sm"
    )


def extract_info(interpreted_text: str, original_text: str) -> dict:
    """
    Run spaCy pipeline on the *interpreted* (abbrev-expanded) text.

    Args:
        interpreted_text : text after abbreviation expansion
        original_text    : the raw user input (used for tech-term detection)

    Returns dict with keys: action, person, deadline, tech_terms, pos_tags, entities
    """
    doc = _nlp(interpreted_text)

    action: str | None   = None
    person: str | None   = None
    deadline: str | None = None

    # ── 1. ROOT VERB → action ────────────────────────────────────────────────
    # Prefer the syntactic ROOT token if it's a VERB; otherwise take first VERB.
    for token in doc:
        if token.dep_ == "ROOT" and token.pos_ == "VERB":
            action = token.lemma_   # lemma gives cleaner base form (e.g. "sends" → "send")
            break
    if action is None:
        for token in doc:
            if token.pos_ == "VERB":
                action = token.lemma_
                break

    # ── 2. NAMED ENTITIES → person, deadline ────────────────────────────────
    for ent in doc.ents:
        if ent.label_ == "PERSON" and person is None:
            person = ent.text
        elif ent.label_ in ("DATE", "TIME") and deadline is None:
            deadline = ent.text

    # ── 3. TECHNICAL TERMS in original text ─────────────────────────────────
    orig_lower = original_text.lower()
    found_tech = [term for term in TECHNICAL_TERMS if term in orig_lower]

    # ── 4. POS TAGS (for frontend highlighting) ──────────────────────────────
    pos_tags = [
        {"text": token.text, "pos": token.pos_, "tag": token.tag_}
        for token in doc
        if not token.is_space
    ]

    # ── 5. Named entities for display ────────────────────────────────────────
    entities = [
        {"text": ent.text, "label": ent.label_, "start": ent.start_char, "end": ent.end_char}
        for ent in doc.ents
    ]

    return {
        "action":     action,
        "person":     person,
        "deadline":   deadline,
        "tech_terms": found_tech,
        "pos_tags":   pos_tags,
        "entities":   entities,
    }
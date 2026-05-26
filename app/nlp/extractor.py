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

Fallback PERSON detection (added):
  spaCy NER fails on short / command-style sentences like
  "Naveen analyze the document". Four rule-based fallbacks activate
  only when NER returns no PERSON — they never override NER.
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


# ── FALLBACK PERSON DETECTION HELPERS ────────────────────────────────────────

# Rule 3: Seed list of common Indian and global names for a confidence boost.
# spaCy misses these in short / grammar-less command sentences.
_KNOWN_NAMES: set = {
    # Indian names
    "naveen", "rahul", "priya", "ananya", "arjun", "amit", "vijay", "sunita",
    "deepak", "pooja", "ravi", "meera", "suresh", "kavitha", "harshitha",
    "harsha", "kiran", "sanjay", "rekha", "divya", "arun", "lakshmi",
    "venkat", "prasad", "naresh", "swetha", "madhavi", "ramesh", "geeta",
    # Global / Western names
    "john", "alice", "bob", "charlie", "david", "eve", "frank", "grace",
    "henry", "iris", "jack", "karen", "leo", "mary", "nathan", "olivia",
    "peter", "quinn", "rose", "sam", "tina", "uma", "victor", "wendy",
}

# Common English verbs and stopwords — first-word candidates that are NOT names.
_NOT_A_NAME: set = {
    "send", "analyze", "check", "review", "write", "update", "create",
    "delete", "fix", "open", "close", "read", "run", "start", "stop",
    "make", "get", "set", "go", "do", "tell", "ask", "call", "show",
    "find", "list", "add", "remove", "the", "a", "an", "this", "that",
    "please", "kindly", "ensure", "verify", "confirm", "prepare", "submit",
    "complete", "schedule", "assign", "share", "download", "upload",
    "hello", "hi", "hey", "dear", "note", "urgent", "asap",
}

# Prepositions that introduce a recipient name (Rule 4).
_TO_VERBS: set = {
    "send", "forward", "report", "assign", "delegate",
    "cc", "notify", "inform", "submit", "deliver",
}


def _fallback_person_detection(doc, text: str):
    """
    Four-rule fallback for PERSON detection when spaCy NER returns nothing.

    Rule 1 — Capitalized first word (PROPN):
        If the first token is a PROPN, capitalized, and not in the
        stopword/verb blacklist → treat as a person name.

    Rule 2 — Imperative [Name] + VERB structure:
        If token[0] is immediately followed by a VERB token,
        the sentence is almost certainly "Name, do this" → first token = PERSON.
        (Works even when spaCy tags first token as NOUN, not PROPN.)

    Rule 3 — Known-name seed list:
        If any token (any position) matches our curated name list
        (case-insensitive) → mark as PERSON.

    Rule 4 — "send/report to [Name]" pattern:
        If a TO-verb appears followed by "to" and then a capitalized word
        → that word is the PERSON.
    """
    tokens = [t for t in doc if not t.is_space]
    if not tokens:
        return None

    first = tokens[0]
    first_lower = first.text.lower()

    # ── Rule 2: Imperative [Name] + VERB — highest confidence ───────────────
    # "Naveen analyze the document" → tokens[0]=Naveen(PROPN/NOUN), tokens[1]=analyze(VERB)
    if (
        len(tokens) >= 2
        and tokens[1].pos_ == "VERB"
        and first.text[0].isupper()
        and first_lower not in _NOT_A_NAME
    ):
        return first.text

    # ── Rule 1: Capitalized PROPN as first word ──────────────────────────────
    if (
        first.pos_ == "PROPN"
        and first.text[0].isupper()
        and first_lower not in _NOT_A_NAME
    ):
        return first.text

    # ── Rule 3: Known-name seed list (any position in sentence) ─────────────
    for token in tokens:
        if token.text.lower() in _KNOWN_NAMES:
            return token.text   # preserve original casing from input

    # ── Rule 4: "send/report to [Name]" pattern ──────────────────────────────
    for i, token in enumerate(tokens):
        if token.lemma_.lower() in _TO_VERBS:
            for j in range(i + 1, len(tokens)):
                if tokens[j].text.lower() == "to" and j + 1 < len(tokens):
                    candidate = tokens[j + 1]
                    if candidate.text[0].isupper():
                        return candidate.text
                    break

    return None  # No fallback matched — leave person as None


# ─────────────────────────────────────────────────────────────────────────────

def extract_info(interpreted_text: str, original_text: str) -> dict:
    """
    Run spaCy pipeline on the *interpreted* (abbrev-expanded) text.

    Args:
        interpreted_text : text after abbreviation expansion
        original_text    : the raw user input (used for tech-term detection)

    Returns dict with keys: action, person, deadline, tech_terms, pos_tags, entities
    """
    doc = _nlp(interpreted_text)

    action   = None
    person   = None
    deadline = None

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

    # ── 2b. FALLBACK PERSON DETECTION ────────────────────────────────────────
    # spaCy NER fails on short / command-style sentences like
    # "Naveen analyze the document". The fallback fires ONLY when NER found
    # nothing — it never overrides a valid spaCy PERSON entity.
    if person is None:
        person = _fallback_person_detection(doc, interpreted_text)

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
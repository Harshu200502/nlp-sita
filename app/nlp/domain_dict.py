"""
app/nlp/domain_dict.py — Domain-Aware Dictionary
==================================================
This module provides:
  1. ABBREVIATION_MAP  — Maps IT / professional shortforms to their full meanings.
  2. expand_abbreviations() — Pre-processes raw text before NLP pipeline.
  3. TECHNICAL_TERMS   — Set of recognized technical verbs/nouns.
  4. VAGUE_WORDS        — Words that signal temporal or qualitative ambiguity.

WHY THIS MATTERS:
  spaCy's NER & POS tagger work on surface text. If the model sees "EOD"
  it has no idea that means "End of Day" — a TIME entity. By expanding
  abbreviations first, we feed meaningful tokens into the pipeline.
"""

import re
from typing import Tuple

# ─────────────────────────────────────────────────────────────────────────────
# ABBREVIATION MAP  (case-insensitive keys stored in UPPER)
# ─────────────────────────────────────────────────────────────────────────────
ABBREVIATION_MAP: dict[str, str] = {
    # ── Time / Urgency ────────────────────────────────────────────────────────
    "EOD":    "End of Day",
    "EOM":    "End of Month",
    "EOW":    "End of Week",
    "ASAP":   "As Soon As Possible",
    "ETA":    "Estimated Time of Arrival",
    "ETD":    "Estimated Time of Departure",
    "SLA":    "Service Level Agreement",
    "TAT":    "Turnaround Time",

    # ── Communication ─────────────────────────────────────────────────────────
    "FYI":    "For Your Information",
    "FYA":    "For Your Action",
    "FYR":    "For Your Reference",
    "FWIW":   "For What It's Worth",
    "TBD":    "To Be Decided",
    "TBC":    "To Be Confirmed",
    "TBA":    "To Be Announced",
    "RSVP":   "Please Respond",
    "OOO":    "Out of Office",
    "WFH":    "Work From Home",
    "WFO":    "Work From Office",
    "OOH":    "Out of Hours",

    # ── IT / Dev ──────────────────────────────────────────────────────────────
    "PR":     "Pull Request",
    "MR":     "Merge Request",
    "CR":     "Code Review",
    "CI":     "Continuous Integration",
    "CD":     "Continuous Deployment",
    "CICD":   "Continuous Integration and Continuous Deployment",
    "API":    "Application Programming Interface",
    "SDK":    "Software Development Kit",
    "CLI":    "Command Line Interface",
    "UI":     "User Interface",
    "UX":     "User Experience",
    "DB":     "Database",
    "SQL":    "Structured Query Language",
    "DNS":    "Domain Name System",
    "VPN":    "Virtual Private Network",
    "SSH":    "Secure Shell",
    "VM":     "Virtual Machine",
    "K8S":    "Kubernetes",
    "IaC":    "Infrastructure as Code",
    "ENV":    "Environment",
    "QA":     "Quality Assurance",
    "UAT":    "User Acceptance Testing",
    "POC":    "Proof of Concept",
    "MVP":    "Minimum Viable Product",
    "REPO":   "Repository",

    # ── Business / Management ─────────────────────────────────────────────────
    "KPI":    "Key Performance Indicator",
    "OKR":    "Objectives and Key Results",
    "ROI":    "Return on Investment",
    "P&L":    "Profit and Loss",
    "CSAT":   "Customer Satisfaction Score",
    "NPS":    "Net Promoter Score",
    "CRM":    "Customer Relationship Management",
    "ERP":    "Enterprise Resource Planning",
    "HR":     "Human Resources",
    "PTO":    "Paid Time Off",
    "PO":     "Purchase Order",
    "SOW":    "Statement of Work",
    "RFP":    "Request for Proposal",
    "SOP":    "Standard Operating Procedure",
    "SME":    "Subject Matter Expert",
    "POC_PERSON": "Point of Contact",   # Disambiguation: separate from Proof of Concept
    "SPOC":    "Single Point of Contact",
    "MoM":    "Minutes of Meeting",
    "MoU":    "Memorandum of Understanding",
    "NDA":    "Non-Disclosure Agreement",
    "COB":    "Close of Business",
    "BOD":    "Beginning of Day",
    "CXO":    "C-Suite Executive",
    "CC":     "Carbon Copy",
    "BCC":    "Blind Carbon Copy",
}

# ─────────────────────────────────────────────────────────────────────────────
# TECHNICAL TERMS  — recognized specialized verbs and nouns
# ─────────────────────────────────────────────────────────────────────────────
TECHNICAL_TERMS: set[str] = {
    # Dev operations
    "deploy", "rollback", "commit", "push", "pull", "merge", "rebase",
    "fork", "clone", "branch", "checkout", "stash", "tag", "release",
    "build", "compile", "lint", "test", "debug", "refactor", "scaffold",

    # Infrastructure
    "provision", "containerize", "orchestrate", "scale", "migrate",
    "backup", "restore", "failover", "replicate", "monitor", "alert",

    # Data
    "ingest", "transform", "pipeline", "query", "index", "cache",
    "aggregate", "export", "import", "sync",

    # Communication
    "escalate", "prioritize", "triage", "assign", "review", "approve",
    "sign-off", "kickoff", "onboard",
}

# ─────────────────────────────────────────────────────────────────────────────
# VAGUE / AMBIGUOUS WORDS
# ─────────────────────────────────────────────────────────────────────────────
VAGUE_WORDS: set[str] = {
    "soon", "later", "quickly", "sometime", "eventually", "shortly",
    "whenever", "someday", "urgently", "fast", "promptly", "immediately",
    "right away", "at some point", "in a bit", "whenever possible",
    "as soon as possible",   # expanded form (if abbreviation already expanded)
    "timely",
}


# ─────────────────────────────────────────────────────────────────────────────
# EXPAND ABBREVIATIONS
# ─────────────────────────────────────────────────────────────────────────────
def expand_abbreviations(text: str) -> Tuple[str, dict[str, str]]:
    """
    Replace known abbreviations in `text` with their full forms.

    Returns:
        interpreted_text  — text after expansion
        found_abbrevs     — {abbrev: expansion} pairs detected in input
    """
    found: dict[str, str] = {}

    # We iterate from longest keys to shortest to avoid partial matches
    # (e.g., "CICD" before "CI" or "CD")
    sorted_keys = sorted(ABBREVIATION_MAP.keys(), key=len, reverse=True)

    result = text
    for abbrev in sorted_keys:
        # Match whole-word only (case-insensitive boundary)
        pattern = r'\b' + re.escape(abbrev) + r'\b'
        if re.search(pattern, result, flags=re.IGNORECASE):
            expansion = ABBREVIATION_MAP[abbrev]
            found[abbrev] = expansion
            result = re.sub(pattern, expansion, result, flags=re.IGNORECASE)

    return result, found


# ─────────────────────────────────────────────────────────────────────────────
# DETECT VAGUE WORDS
# ─────────────────────────────────────────────────────────────────────────────
def detect_vague_words(text: str) -> list[str]:
    """
    Return list of vague / ambiguous tokens found in the text.
    Works on the ORIGINAL text (before or after expansion — both useful).
    """
    text_lower = text.lower()
    found_vague = []

    # Check multi-word phrases first
    for phrase in sorted(VAGUE_WORDS, key=len, reverse=True):
        if phrase in text_lower:
            found_vague.append(phrase)
            # Mask found phrase so sub-words aren't double-counted
            text_lower = text_lower.replace(phrase, " " * len(phrase))

    return found_vague

# SITA — Smart Instruction & Task Authoring Assistant

> Transform vague instructions into clear, structured, actionable communication — powered by spaCy, FastAPI, and React.

---

## Features

| Feature | Details |
|---|---|
| **Abbreviation Expansion** | 60+ IT/business abbreviations: EOD → End of Day, ASAP → As Soon As Possible, PR → Pull Request, KPI → Key Performance Indicator… |
| **NLP Pipeline** | spaCy tokenization, POS tagging, NER — runs on *interpreted* (expanded) text |
| **Information Extraction** | Action (root verb), Person (NER), Deadline (DATE/TIME entity), Technical Terms |
| **Ambiguity Detection** | Flags vague words: "soon", "quickly", "urgently", etc. |
| **Clarity Scoring** | 0–100 score: Action +40, Person +30, Deadline +30, −10 per vague word |
| **Suggestion Engine** | Action-specific templates + object inference + abbreviation notes |
| **Real-time Analysis** | Debounced API calls as you type (500ms) |
| **Batch Analysis** | Up to 20 instructions at once with CSV export |
| **History** | LocalStorage-persisted analysis history with restore |
| **Word Highlighting** | Color-coded highlights: vague=red, abbreviations=purple |

---

## Project Structure

```
NLP/
├── main.py                    # FastAPI app entry point (CORS, static, router)
├── requirements.txt
├── app/
│   ├── __init__.py
│   ├── api.py                 # API routes (/analyze, /batch, /health, /abbreviations)
│   ├── models.py              # Pydantic request/response schemas
│   ├── static/
│   │   └── index.html         # Vanilla HTML fallback UI (served at /ui)
│   └── nlp/
│       ├── __init__.py        # Pipeline orchestrator (analyze_text)
│       ├── domain_dict.py     # Abbreviation map + vague word list + tech terms
│       ├── extractor.py       # spaCy NLP extractor
│       └── suggestion.py      # Suggestion template engine
└── frontend/                  # React + Vite + Tailwind frontend
    ├── src/
    │   ├── App.jsx            # Main app shell (tabs, input, state)
    │   ├── api.js             # Axios API client
    │   ├── hooks/
    │   │   └── useAnalyze.js  # Custom hooks for analysis + history
    │   └── components/
    │       ├── ResultCard.jsx    # Full result display
    │       ├── ScoreGauge.jsx    # Animated score bar
    │       ├── HighlightedText.jsx # Token-level highlights
    │       ├── BatchPanel.jsx    # Batch input + results
    │       └── HistoryPanel.jsx  # History list
    ├── tailwind.config.js
    └── package.json
```

---

## Quick Start

### 1. Backend Setup

```bash
# Navigate to the project root
cd NLP

# Install Python dependencies
pip install -r requirements.txt

# Download spaCy English model
python -m spacy download en_core_web_sm

# Start the backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend available at: http://localhost:8000  
Swagger UI: http://localhost:8000/docs  
Vanilla HTML UI: http://localhost:8000/ui

---

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd NLP/frontend

# Install dependencies
npm install

# Start the React dev server
npm run dev
```

React app available at: http://localhost:5173

---

## API Reference

### `POST /analyze`
Analyze a single instruction.

**Request:**
```json
{ "text": "Send report EOD ASAP" }
```

**Response:**
```json
{
  "original_text": "Send report EOD ASAP",
  "interpreted_text": "Send report End of Day As Soon As Possible",
  "abbreviations_found": { "EOD": "End of Day", "ASAP": "As Soon As Possible" },
  "extracted": {
    "action": "send",
    "person": null,
    "deadline": "End of Day",
    "tech_terms": []
  },
  "issues": [
    "Missing person — who should receive or act on this?",
    "Ambiguous term: 'as soon as possible' — please specify a concrete timeframe."
  ],
  "ambiguous_words": ["as soon as possible"],
  "suggestion": "Send the report to [Recipient] by End of Day. (Note: EOD = End of Day, ASAP = As Soon As Possible)",
  "clarity_score": 60
}
```

### `POST /batch`
Analyze up to 20 instructions.

**Request:**
```json
{ "texts": ["Send report EOD", "Push code to repo ASAP"] }
```

### `GET /health`
Health check → `{ "status": "ok" }`

### `GET /abbreviations`
Returns the full domain abbreviation dictionary.

---

## Clarity Score Logic

```
Base Score:
  + 40  if action detected
  + 30  if person/recipient detected
  + 30  if deadline/time detected
  = 100 max

Penalty:
  - 10  per vague/ambiguous word

Final Score = max(0, min(100, base + penalty))
```

---

## Supported Abbreviations (sample)

| Abbreviation | Expansion |
|---|---|
| EOD | End of Day |
| ASAP | As Soon As Possible |
| FYI | For Your Information |
| ETA | Estimated Time of Arrival |
| PR | Pull Request |
| KPI | Key Performance Indicator |
| SLA | Service Level Agreement |
| CICD | Continuous Integration and Continuous Deployment |
| K8S | Kubernetes |
| MoM | Minutes of Meeting |
| TBD | To Be Decided |
| OKR | Objectives and Key Results |

...and 50+ more. See `/abbreviations` endpoint for the full list.

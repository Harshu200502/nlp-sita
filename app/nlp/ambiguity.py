VAGUE_WORDS = [
    "soon", "later", "asap", "quickly", "sometime",
    "eventually", "shortly", "whenever", "someday",
    "urgently", "fast", "promptly"
]

def detect_ambiguity(text):
    words = text.lower().split()
    return [word for word in words if word in VAGUE_WORDS]
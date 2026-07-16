from pydantic import BaseModel

class ReviewCheck(BaseModel):
    criterion: str
    passed: bool
    details: str

class ReviewResult(BaseModel):
    approved: bool
    checks: list[ReviewCheck]
    revision_notes: list[str]
    confidence_score: float

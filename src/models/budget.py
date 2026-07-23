from pydantic import BaseModel

class BudgetCategory(BaseModel):
    category: str
    allocated_inr: float
    estimated_inr: float
    notes: str

class BudgetBreakdown(BaseModel):
    total_budget_inr: float
    total_estimated_inr: float
    categories: list[BudgetCategory]
    within_budget: bool
    warnings: list[str]
    suggestions: list[str]

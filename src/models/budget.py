from pydantic import BaseModel

class BudgetCategory(BaseModel):
    category: str
    allocated_usd: float
    estimated_usd: float
    notes: str

class BudgetBreakdown(BaseModel):
    total_budget_usd: float
    total_estimated_usd: float
    categories: list[BudgetCategory]
    within_budget: bool
    warnings: list[str]
    suggestions: list[str]

from langchain_core.tools import tool

@tool
def convert_currency(amount: float, from_currency: str, to_currency: str) -> float:
    """Convert an amount from one currency to another.
    
    Args:
        amount: The amount to convert.
        from_currency: The currency code to convert from (e.g., 'USD', 'AED').
        to_currency: The currency code to convert to (e.g., 'USD', 'AED').
        
    Returns:
        The converted amount.
    """
    # Hardcoded fallback rate for Phase 2
    USD_TO_AED = 3.67
    
    from_currency = from_currency.upper()
    to_currency = to_currency.upper()
    
    if from_currency == to_currency:
        return float(amount)
        
    if from_currency == 'USD' and to_currency == 'AED':
        return round(amount * USD_TO_AED, 2)
    elif from_currency == 'AED' and to_currency == 'USD':
        return round(amount / USD_TO_AED, 2)
        
    # If it's another currency pair, just return a dummy conversion or error
    # For this exercise we assume only USD/AED are strictly needed
    return round(amount, 2)

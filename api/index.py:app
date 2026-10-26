from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

class FeatureItem(BaseModel):
    name: str
    hours: float
    rate: float

class ScopeCalculationRequest(BaseModel):
    project_name: str
    client_name: str
    base_rate: float
    contingency_percent: float = 10.0
    features: List[FeatureItem]

@app.post("/api/calculate")
def calculate_scope(payload: ScopeCalculationRequest):
    subtotal = sum(item.hours * item.rate for item in payload.features)
    contingency = subtotal * (payload.contingency_percent / 100.0)
    total_estimated_price = subtotal + contingency
    
    return {
        "status": "success",
        "project_name": payload.project_name,
        "client_name": payload.client_name,
        "subtotal": round(subtotal, 2),
        "contingency": round(contingency, 2),
        "total_price": round(total_estimated_price, 2),
        "recommended_deposit": round(total_estimated_price * 0.50, 2),
        "summary_text": f"مشروع {payload.project_name} بتكلفة إجمالية قدرها {round(total_estimated_price, 2)} دولار مع دفعة مقدمة 50%."
  }

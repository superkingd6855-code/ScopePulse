from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

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
    # حساب المجموع الفرعي لكل مهمة بدقة
    if payload.features:
        subtotal = sum(max(0.0, item.hours) * max(0.0, item.rate) for item in payload.features)
    else:
        subtotal = max(0.0, payload.base_rate) * 10.0

    # حساب نسبة الطوارئ / المخاطر
    contingency_pct = max(0.0, min(payload.contingency_percent, 50.0))
    contingency = subtotal * (contingency_pct / 100.0)
    
    # التكلفة الإجمالية والدفعة المقدمة (50%)
    total_price = subtotal + contingency
    recommended_deposit = total_price * 0.50

    return {
        "status": "success",
        "project_name": payload.project_name or "مشروع جديد",
        "client_name": payload.client_name or "عميل مميز",
        "subtotal": round(subtotal, 2),
        "contingency": round(contingency, 2),
        "contingency_percent": contingency_pct,
        "total_price": round(total_price, 2),
        "recommended_deposit": round(recommended_deposit, 2),
        "summary_text": f"عرض سعر مشروع '{payload.project_name}' للعميل '{payload.client_name}' - التكلفة الإجمالية: ${round(total_price, 2)}"
    }

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import models
from chains import AIHandler
from datetime import datetime, timedelta
from pydantic import BaseModel
from typing import List, Optional
from fastapi.responses import FileResponse
from utils.pdf_generator import generate_invoice_pdf
import os

# Database Setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./invoicezap.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="InvoiceZap API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

ai_handler = AIHandler()

# Pydantic Schemas
class ClientCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    gstin: Optional[str] = None

class InvoiceCreate(BaseModel):
    client_id: int
    due_date: str
    line_items: List[dict]
    subtotal: float
    tax_rate: float = 0.0
    tax_amount: float = 0.0
    total_amount: float
    notes: Optional[str] = None

class AIInput(BaseModel):
    user_input: str

# API Routes

@app.get("/")
async def root():
    return {"message": "InvoiceZap API is running"}

# AI Endpoints
@app.post("/api/ai/extract")
async def extract_invoice(data: AIInput):
    try:
        result = await ai_handler.extract_invoice_data(data.user_input)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/reminders")
async def get_reminders(client_name: str, amount: float, days_overdue: int, business_name: str = "My Business"):
    try:
        result = await ai_handler.generate_reminders(client_name, amount, days_overdue, business_name)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Client Endpoints
@app.get("/api/clients")
def get_clients(db: Session = Depends(get_db)):
    return db.query(models.Client).all()

@app.post("/api/clients")
def create_client(client: ClientCreate, db: Session = Depends(get_db)):
    db_client = models.Client(**client.dict())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

# Invoice Endpoints
@app.get("/api/invoices")
def get_invoices(db: Session = Depends(get_db)):
    return db.query(models.Invoice).all()

@app.post("/api/invoices")
def create_invoice(invoice: InvoiceCreate, db: Session = Depends(get_db)):
    # Simple invoice number generation: INV-YYYYMMDD-COUNT
    count = db.query(models.Invoice).count() + 1
    invoice_number = f"INV-{datetime.now().strftime('%Y%m%d')}-{count:03d}"
    
    db_invoice = models.Invoice(
        **invoice.dict(),
        invoice_number=invoice_number,
        date=datetime.now(),
        due_date=datetime.fromisoformat(invoice.due_date) if invoice.due_date else datetime.now() + timedelta(days=15)
    )
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

@app.get("/api/dashboard/stats")
def get_stats(db: Session = Depends(get_db)):
    invoices = db.query(models.Invoice).all()
    total_revenue = sum(inv.total_amount for inv in invoices if inv.status == "Paid")
    total_outstanding = sum(inv.total_amount for inv in invoices if inv.status != "Paid")
    overdue_count = len([inv for inv in invoices if inv.status == "Overdue" or (inv.status == "Pending" and inv.due_date < datetime.now())])
    
    # Revenue trend (last 6 months - simplified)
    # In a real app we'd group by month
    revenue_trend = [
        {"month": "Jan", "amount": 4000},
        {"month": "Feb", "amount": 3000},
        {"month": "Mar", "amount": 2000},
        {"month": "Apr", "amount": 2780},
        {"month": "May", "amount": 1890},
        {"month": "Jun", "amount": 2390},
    ]
    
    return {
        "total_revenue": total_revenue,
        "total_outstanding": total_outstanding,
        "overdue_count": overdue_count,
        "revenue_trend": revenue_trend,
        "recent_invoices": sorted(invoices, key=lambda x: x.date, reverse=True)[:5]
    }

@app.get("/api/invoices/{invoice_id}/pdf")
def get_invoice_pdf(invoice_id: int, db: Session = Depends(get_db)):
    invoice = db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    client = db.query(models.Client).filter(models.Client.id == invoice.client_id).first()
    business = db.query(models.BusinessProfile).first()
    
    file_path = f"invoice_{invoice.invoice_number}.pdf"
    success = generate_invoice_pdf(business, client, invoice, file_path)
    
    if success:
        return FileResponse(file_path, filename=f"Invoice-{invoice.invoice_number}.pdf")
    else:
        # Fallback to HTML if PDF generation failed
        html_path = file_path.replace(".pdf", ".html")
        return FileResponse(html_path, filename=f"Invoice-{invoice.invoice_number}.html")

# Settings Endpoints
@app.get("/api/settings/profile")
def get_profile(db: Session = Depends(get_db)):
    profile = db.query(models.BusinessProfile).first()
    if not profile:
        profile = models.BusinessProfile(name="My Business")
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@app.put("/api/settings/profile")
def update_profile(data: dict, db: Session = Depends(get_db)):
    profile = db.query(models.BusinessProfile).first()
    for key, value in data.items():
        setattr(profile, key, value)
    db.commit()
    db.refresh(profile)
    return profile

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

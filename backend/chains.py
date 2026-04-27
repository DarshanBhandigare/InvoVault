import os
from typing import List, Optional
from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv

load_dotenv()

# Data Models
class LineItem(BaseModel):
    description: str = Field(description="Description of the service or product")
    quantity: float = Field(description="Quantity of the item")
    price: float = Field(description="Price per unit")
    amount: float = Field(description="Total amount for this line item (quantity * price)")

class InvoiceData(BaseModel):
    client_name: str = Field(description="Name of the client being billed")
    line_items: List[LineItem] = Field(description="List of items or services billed")
    total_amount: float = Field(description="Total invoice amount")
    due_date: Optional[str] = Field(description="Due date in YYYY-MM-DD format. Default to 15 days from now if not mentioned.")
    notes: Optional[str] = Field(description="Additional notes or context")

class ReminderMessages(BaseModel):
    friendly: str
    formal: str
    urgent: str

class AIHandler:
    def __init__(self):
        # Using Google Gemini via AI Studio
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            temperature=0
        )
        
    async def extract_invoice_data(self, user_input: str) -> InvoiceData:
        structured_llm = self.llm.with_structured_output(InvoiceData)
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", "Extract invoice details from natural language. Default currency INR. If due date is not specified, assume 15 days from today ({today}). Format output as JSON."),
            ("human", "{user_input}")
        ])
        
        # We'll pass today's date to the prompt
        from datetime import datetime
        today = datetime.now().strftime("%Y-%m-%d")
        
        chain = prompt | structured_llm
        return await chain.ainvoke({"user_input": user_input, "today": today})

    async def generate_reminders(self, client_name: str, amount: float, days_overdue: int, business_name: str) -> ReminderMessages:
        structured_llm = self.llm.with_structured_output(ReminderMessages)
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", """Generate 3 payment reminder messages: Friendly, Formal, Urgent.
            Keep under 100 words each. Sound human, not robotic. Context: Indian SME audience.
            Use emojis where appropriate for friendly/formal, but keep urgent serious.
            Default language: English (Indian style)."""),
            ("human", "Client: {client_name}, Amount: ₹{amount}, Overdue by: {days_overdue} days, Business: {business_name}")
        ])
        
        chain = prompt | structured_llm
        return await chain.ainvoke({
            "client_name": client_name,
            "amount": amount,
            "days_overdue": days_overdue,
            "business_name": business_name
        })

    async def get_smart_nudge(self, overdue_invoices: List[dict]) -> str:
        if not overdue_invoices:
            return "All set! No overdue invoices today."
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an AI financial assistant for an Indian SME. Give a short, snappy nudge (1 sentence) about overdue invoices to the business owner."),
            ("human", "Here are the overdue invoices: {invoices_summary}")
        ])
        
        summary = ", ".join([f"{inv['client']} owes ₹{inv['amount']}" for inv in overdue_invoices])
        
        chain = prompt | self.llm
        response = await chain.ainvoke({"invoices_summary": summary})
        return response.content

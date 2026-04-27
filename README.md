# InvoiceZap — Smart AI Invoice Manager for Micro-SMEs

AI-powered invoice management platform built for Indian micro-SMEs to save 10+ hours weekly.

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Anthropic API Key (Claude)

### Backend Setup
1. Navigate to `backend/`
2. Create a `.env` file:
   ```env
   ANTHROPIC_API_KEY=your_api_key_here
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the server:
   ```bash
   python main.py
   ```

### Frontend Setup
1. Navigate to `frontend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000)

## 🧠 Key Features
- **AI Quick Create**: Describe your invoice in plain English (e.g. "Bill Suresh ₹5000 for web design") and let Claude extract the data.
- **Smart Reminders**: Generate Friendly, Formal, or Urgent payment reminders for overdue invoices.
- **Premium Dashboard**: Real-time revenue tracking and overdue alerts.
- **GST Ready**: Built for the Indian market with GSTIN and INR support.
- **PDF Generation**: Professional, branded PDF invoices at the click of a button.

## 🛠 Tech Stack
- **Backend**: FastAPI, LangChain, Claude 3.5 Sonnet, SQLAlchemy, SQLite.
- **Frontend**: Next.js 14, Tailwind CSS 4, Framer Motion, Recharts, Lucide Icons.

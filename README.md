# 🛡️ InvoVault
### *Secure AI Invoice Manager for Modern Businesses*

InvoVault is a premium, AI-powered invoice management platform designed to help micro-SMEs and freelancers track their finances, get paid faster, and gain intelligent insights into their business health.

![InvoVault Dashboard](https://raw.githubusercontent.com/your-username/invoicezap/main/public/screenshot-dashboard.png)

## 🌟 Key Features

- **🧠 Smart AI Insights**: A deterministic engine that analyzes your financial data in real-time to provide actionable advice on cash flow and overdue payments.
- **🌓 Dynamic Theme System**: A fully custom-built light and dark mode system with smooth transitions across the entire webpage.
- **🚨 Intelligent Overdue Tracking**: Automatically flags pending invoices as overdue based on real-time date comparison—never miss a payment follow-up.
- **📊 Financial Analytics**: Beautifully visualized growth charts and revenue trends powered by Recharts.
- **💎 Premium Design**: A modern, glassmorphic UI built with Tailwind CSS v4 and Framer Motion for a state-of-the-art user experience.
- **📄 Professional Invoices**: Quick creation with support for GST, custom tax rates, and instant PDF generation.

## 🛠 Tech Stack

- **Core**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, Framer Motion (Animations), Lucide Icons
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **State Management**: React Context (Custom Theme System)
- **Charts**: Recharts
- **Date Management**: Date-fns

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Supabase Project

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/invoicezap.git
   cd invoicezap/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env.local` file in the `frontend` directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open the app**:
   Visit [http://localhost:3000](http://localhost:3000)

## 🛡 Security
InvoVault implements **Row Level Security (RLS)** in Supabase, ensuring that users can only view and manage their own invoices, clients, and business profiles. All data is scoped to the `auth.uid()`.

---
Built with ❤️ by the InvoVault Team.

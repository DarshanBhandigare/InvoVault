# 🛡️ InvoVault
### *Secure AI Invoice Manager for Modern Businesses*

InvoVault is a premium, AI-powered invoice management platform designed to help micro-SMEs and freelancers track their finances, get paid faster, and gain intelligent insights into their business health.

<img src="https://i.ibb.co/dwW5LPLS/invovault-dashboard.png" alt="InvoVault Dashboard" width="800"/>

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

## 🛡 Security
InvoVault implements **Row Level Security (RLS)** in Supabase, ensuring that users can only view and manage their own invoices, clients, and business profiles. All data is scoped to the `auth.uid()`.



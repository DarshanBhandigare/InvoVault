// Smart, data-driven insights generated from real invoice data

export interface InsightData {
  totalInvoices: number;
  totalOutstanding: number;
  totalPaidMonth: number;
  overdueCount: number;
  rejectedCount: number;
  pendingCount: number;
  paidCount: number;
  pendingAmount: number;
  overdueAmount: number;
  recentInvoices: {
    client: string;
    amount: number;
    status: string;
    date: string;
  }[];
}

export interface Insight {
  emoji: string;
  text: string;
  type: "warning" | "success" | "info" | "urgent";
}

export function generateInsights(data: InsightData): Insight[] {
  const insights: Insight[] = [];

  // --- Pending payments ---
  if (data.pendingCount > 0) {
    insights.push({
      emoji: "⏳",
      text: `You have ${data.pendingCount} pending payment${data.pendingCount > 1 ? "s" : ""} worth ₹${data.pendingAmount.toLocaleString()}.`,
      type: "warning",
    });
  }

  // --- Overdue invoices ---
  if (data.overdueCount > 0) {
    insights.push({
      emoji: "🚨",
      text: `${data.overdueCount} invoice${data.overdueCount > 1 ? "s are" : " is"} overdue totaling ₹${data.overdueAmount.toLocaleString()}. Follow up now!`,
      type: "urgent",
    });
  }

  // --- Rejected invoices ---
  if (data.rejectedCount > 0) {
    insights.push({
      emoji: "❌",
      text: `${data.rejectedCount} invoice${data.rejectedCount > 1 ? "s were" : " was"} rejected. Review and resend to avoid revenue loss.`,
      type: "warning",
    });
  }

  // --- Great month ---
  if (data.totalPaidMonth > 0) {
    insights.push({
      emoji: "💰",
      text: `₹${data.totalPaidMonth.toLocaleString()} collected this month. ${data.totalPaidMonth > data.totalOutstanding ? "You're ahead — great work!" : "Keep pushing to clear outstanding dues!"}`,
      type: data.totalPaidMonth > data.totalOutstanding ? "success" : "info",
    });
  }

  // --- All clear ---
  if (data.overdueCount === 0 && data.pendingCount === 0 && data.totalInvoices > 0) {
    insights.push({
      emoji: "✅",
      text: "All invoices are settled. Your books are clean!",
      type: "success",
    });
  }

  // --- No invoices yet ---
  if (data.totalInvoices === 0) {
    insights.push({
      emoji: "📄",
      text: "No invoices yet. Create your first invoice to start tracking!",
      type: "info",
    });
  }

  // --- Outstanding amount high ---
  if (data.totalOutstanding > 5000) {
    insights.push({
      emoji: "📊",
      text: `₹${data.totalOutstanding.toLocaleString()} is outstanding. Consider sending payment reminders.`,
      type: "info",
    });
  }

  // --- Collection rate ---
  if (data.totalInvoices > 0 && data.paidCount > 0) {
    const collectionRate = Math.round((data.paidCount / data.totalInvoices) * 100);
    if (collectionRate >= 80) {
      insights.push({
        emoji: "🎯",
        text: `${collectionRate}% collection rate — excellent payment follow-through!`,
        type: "success",
      });
    } else if (collectionRate < 50) {
      insights.push({
        emoji: "⚠️",
        text: `Only ${collectionRate}% of invoices are paid. Time to follow up on collections.`,
        type: "warning",
      });
    }
  }

  // Return top 3 most relevant insights (prioritize urgent > warning > info > success)
  const priority = { urgent: 0, warning: 1, info: 2, success: 3 };
  insights.sort((a, b) => priority[a.type] - priority[b.type]);

  return insights.slice(0, 3);
}

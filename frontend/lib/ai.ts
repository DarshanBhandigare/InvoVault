const apiKey = process.env.OPENROUTER_API_KEY || "";

function cleanResponse(text: string): string {
  // Remove common thinking patterns
  let cleaned = text;

  // Remove <think>...</think> blocks
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, "");

  // Remove lines that look like reasoning/thinking
  const lines = cleaned.split("\n").filter((line) => {
    const l = line.trim().toLowerCase();
    if (!l) return false;
    if (l.startsWith("we need to")) return false;
    if (l.startsWith("let me")) return false;
    if (l.startsWith("i need to")) return false;
    if (l.startsWith("data:")) return false;
    if (l.startsWith("insight:")) return true;
    if (l.startsWith("provide actionable")) return false;
    if (l.startsWith("analysis:")) return false;
    return true;
  });

  cleaned = lines
    .join(" ")
    .replace(/^insight:\s*/i, "")
    .trim();

  // If still too long or messy, take just the last 2 sentences
  const sentences = cleaned.match(/[^.!?]+[.!?]+/g);
  if (sentences && sentences.length > 2) {
    cleaned = sentences.slice(-2).join(" ").trim();
  }

  return cleaned || "Your financial overview is ready. Check your invoices for details.";
}

async function callOpenRouter(prompt: string): Promise<string> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "InvoiceZap",
    },
    body: JSON.stringify({
      model: "nvidia/nemotron-3-super-120b-a12b:free",
      messages: [
        {
          role: "system",
          content: "You are a concise financial advisor. Reply with ONLY 1-2 sentences of direct advice. No thinking, no reasoning, no preamble, no data repetition.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 120,
      temperature: 0.6,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter request failed (${res.status}): ${err}`);
  }

  const json = await res.json();
  const raw = json.choices?.[0]?.message?.content?.trim() || "";
  return cleanResponse(raw);
}

export async function getAIInsights(data: any): Promise<string> {
  if (!apiKey) {
    return "API Key not configured. Please add OPENROUTER_API_KEY to your .env.local file.";
  }

  const prompt = `You are a professional financial advisor for "InvoiceZap". Provide 1-2 sentences of actionable business advice based on this data. Do not repeat the data.

DATA:
- Total Invoices: ${data.totalInvoices}
- Unpaid (Outstanding): ₹${data.totalOutstanding}
- Paid this month: ₹${data.totalPaidMonth}
- Overdue Invoices: ${data.overdueCount}
- Rejected Invoices: ${data.rejectedCount}

ADVICE (Direct and helpful):`;

  try {
    return await callOpenRouter(prompt);
  } catch (error) {
    console.error("AI Insights error:", error);
    return "Could not generate insights at this time. Please try again later.";
  }
}

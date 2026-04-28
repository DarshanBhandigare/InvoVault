"use client";

import * as React from "react";

// Simple theme provider that locks to dark mode without next-themes
// (next-themes v0.4.x injects a <script> tag that causes hydration errors in Next.js 16)
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

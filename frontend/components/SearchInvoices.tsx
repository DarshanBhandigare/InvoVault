"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export default function SearchInvoices() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const currentSearch = searchParams.get("search") || "";
  const [value, setValue] = useState(currentSearch);

  // Update local state if URL param changes (e.g. on navigation)
  useEffect(() => {
    setValue(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (value === currentSearch) return;

      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }

      startTransition(() => {
        router.push(`/invoices?${params.toString()}`);
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [value, currentSearch, router, searchParams]);

  return (
    <div className="relative w-full md:w-80">
      <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isPending ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
      <input 
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search invoice # or client..." 
        className="w-full bg-card border border-border rounded-2xl pl-12 pr-10 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
      />
      {value && (
        <button 
          onClick={() => setValue("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

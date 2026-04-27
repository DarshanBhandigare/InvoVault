"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toJpeg } from "html-to-image";
import jsPDF from "jspdf";

interface Props {
  elementId: string;
  filename: string;
}

export default function DownloadPdfButton({ elementId, filename }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Target element #${elementId} not found in DOM.`);
      }

      // html-to-image is much better with modern CSS (oklch, oklab, etc.)
      const dataUrl = await toJpeg(element, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(dataUrl, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(filename);
    } catch (error: any) {
      console.error("PDF Generation Error:", error);
      alert(`PDF Error: ${error.message || "Unknown error occurred"}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button 
      onClick={handleDownload}
      disabled={isGenerating}
      title="Download as PDF"
      className="flex items-center gap-2 p-3 bg-card border border-border rounded-xl hover:bg-muted transition-colors shadow-sm disabled:opacity-50 text-primary hover:text-primary/80"
    >
      {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
      <span className="hidden sm:inline text-sm font-bold">Save PDF</span>
    </button>
  );
}

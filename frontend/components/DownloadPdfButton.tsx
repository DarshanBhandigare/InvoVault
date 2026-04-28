"use client";

import { Download, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { toJpeg } from "html-to-image";
import jsPDF from "jspdf";
import { format } from "date-fns";

interface Props {
  invoice: any;
  business: any;
  filename: string;
}

export default function DownloadPdfButton({ invoice, business, filename }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      if (!printRef.current) return;

      // Ensure the hidden element is visible for the capture, but off-screen
      const element = printRef.current;
      
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

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (pdf.internal.pageSize.getHeight());
      
      // We want to fit it to the page
      pdf.addImage(dataUrl, "JPEG", 0, 0, pdfWidth, 0); // 0 height auto-scales
      pdf.save(filename);
    } catch (error: any) {
      console.error("PDF Generation Error:", error);
      alert(`PDF Error: ${error.message || "Unknown error occurred"}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <button 
        onClick={handleDownload}
        disabled={isGenerating}
        title="Download as PDF"
        className="flex items-center gap-2 p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50"
      >
        {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
        <span className="hidden sm:inline text-sm font-bold">Download PDF</span>
      </button>

      {/* HIDDEN A4 TEMPLATE FOR EXPORT ONLY */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <div 
          ref={printRef}
          style={{ width: '794px', minHeight: '1123px' }} // A4 dimensions at 96 DPI
          className="bg-white text-slate-950 p-12 font-sans"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-16">
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">From</p>
              <h1 className="text-2xl font-black text-indigo-600">{business?.name || 'Your Business'}</h1>
              <div className="text-sm text-slate-500 space-y-1">
                <p>{business?.address || 'No address provided'}</p>
                <p>{business?.email}</p>
                <p>{business?.phone}</p>
                {business?.gstin && <p className="font-bold text-slate-900 pt-2">GSTIN: {business.gstin}</p>}
              </div>
            </div>
            <div className="text-right space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">To</p>
              <h2 className="text-2xl font-black text-slate-900">{invoice.clients?.name}</h2>
              <div className="text-sm text-slate-500 space-y-1">
                <p>{invoice.clients?.address || 'No address provided'}</p>
                <p>{invoice.clients?.email}</p>
                {invoice.clients?.gstin && <p className="font-bold text-slate-900 pt-2">GSTIN: {invoice.clients.gstin}</p>}
              </div>
            </div>
          </div>

          {/* Summary Row */}
          <div className="grid grid-cols-4 border-y border-slate-100 mb-16">
            <div className="py-8 text-center border-r border-slate-100">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Invoice #</p>
              <p className="font-bold text-slate-900 uppercase">{invoice.invoice_number}</p>
            </div>
            <div className="py-8 text-center border-r border-slate-100">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Issued Date</p>
              <p className="font-bold text-slate-900">{format(new Date(invoice.issued_date), 'dd MMM, yyyy')}</p>
            </div>
            <div className="py-8 text-center border-r border-slate-100">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Due Date</p>
              <p className="font-bold text-rose-500">{format(new Date(invoice.due_date), 'dd MMM, yyyy')}</p>
            </div>
            <div className="py-8 text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Amount Due</p>
              <p className="font-black text-slate-900">₹{Number(invoice.amount).toLocaleString()}</p>
            </div>
          </div>

          {/* Table */}
          <table className="w-full mb-16">
            <thead>
              <tr className="text-left">
                <th className="pb-6 text-[9px] font-black uppercase tracking-widest text-slate-400">Description</th>
                <th className="pb-6 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Qty</th>
                <th className="pb-6 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Price</th>
                <th className="pb-6 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Array.isArray(invoice.line_items) && invoice.line_items.map((item: any, i: number) => (
                <tr key={i}>
                  <td className="py-6 font-bold text-slate-900">{item.description}</td>
                  <td className="py-6 text-center text-slate-600">{item.quantity}</td>
                  <td className="py-6 text-right text-slate-600">₹{Number(item.price).toLocaleString()}</td>
                  <td className="py-6 text-right font-bold text-slate-900">₹{(item.quantity * item.price).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-24">
            <div className="w-64 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Subtotal</span>
                <span className="font-bold text-slate-900">₹{Number(invoice.subtotal || invoice.amount).toLocaleString()}</span>
              </div>
              {invoice.tax_percent > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Tax / GST ({invoice.tax_percent}%)</span>
                  <span className="font-bold text-amber-600">+ ₹{Number(invoice.tax_amount).toLocaleString()}</span>
                </div>
              )}
              <div className="pt-4 border-t-2 border-indigo-600 flex justify-between items-baseline">
                <span className="text-lg font-black uppercase tracking-widest text-slate-900">Total</span>
                <span className="text-3xl font-black text-indigo-600">₹{Number(invoice.amount).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="pt-12 border-t border-slate-100">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4">Notes & Instructions</p>
              <p className="text-sm text-slate-500 italic leading-relaxed">{invoice.notes}</p>
            </div>
          )}

          {/* Bank Info */}
          {business?.bank_name && (
            <div className="mt-12 p-8 bg-slate-50 rounded-3xl border border-slate-100">
              <p className="text-[9px] font-black uppercase tracking-widest text-indigo-600 mb-4">Payment Details</p>
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <p className="text-[8px] uppercase text-slate-400 mb-1">Bank Name</p>
                  <p className="text-xs font-bold text-slate-900">{business.bank_name}</p>
                </div>
                <div>
                  <p className="text-[8px] uppercase text-slate-400 mb-1">Account Number</p>
                  <p className="text-xs font-bold text-slate-900">{business.account_number}</p>
                </div>
                <div>
                  <p className="text-[8px] uppercase text-slate-400 mb-1">IFSC Code</p>
                  <p className="text-xs font-bold text-slate-900">{business.ifsc}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

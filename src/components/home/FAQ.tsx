"use client";

import React, { useState } from "react";
import { ChevronUp } from "lucide-react";

function FaqItem({ question, answer, dark }: { question: string; answer: string; dark: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-xl overflow-hidden ${dark ? "border border-gray-800" : "border border-gray-200"}`}>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between p-5 text-left transition-colors ${
          dark ? "hover:bg-white/5" : "hover:bg-gray-50"
        }`}
      >
        <span className="font-semibold text-sm">{question}</span>
        <ChevronUp size={18} className={`transition-transform duration-200 ${dark ? "text-gray-500" : "text-gray-400"} ${open ? "" : "rotate-180"}`} />
      </button>
      {open && <div className={`px-5 pb-5 text-sm leading-relaxed ${dark ? "text-gray-400" : "text-gray-600"}`}>{answer}</div>}
    </div>
  );
}

export default function FAQ({ dark: d }: { dark: boolean }) {
  return (
    <section id="faq" className={`py-20 px-6 ${d ? "bg-gray-900/30" : "bg-gray-50/80"}`}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
        </div>
        <div className="space-y-3">
          {[
            { q: "What format are the templates in?", a: "All templates are Excel (.xlsx) files. They work in Microsoft Excel, Google Sheets, and other spreadsheet apps." },
            { q: "Do the charts update automatically?", a: "Yes! All charts are linked to your data cells. Enter numbers, charts update instantly." },
            { q: "Can I use this on my phone?", a: "Absolutely. Open in Google Sheets or Excel app on your phone." },
            { q: "Do I get free updates?", a: "Yes, lifetime access to all future updates." },
            { q: "How do I receive the file?", a: "After payment, get an instant download link on the orders page." },
            { q: "Can I get a refund?", a: "Yes, 7-day refund policy. Not satisfied? Full refund." },
          ].map((faq, idx) => (
            <FaqItem key={idx} question={faq.q} answer={faq.a} dark={d} />
          ))}
        </div>
      </div>
    </section>
  );
}

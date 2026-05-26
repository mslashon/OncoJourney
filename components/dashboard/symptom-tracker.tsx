"use client";

import { useState } from "react";

const symptoms = [
  { id: "fatigue", label: "Fatigue" },
  { id: "nausea", label: "Nausea" },
  { id: "pain", label: "Pain" },
  { id: "appetite", label: "Low appetite" },
  { id: "sleep", label: "Poor sleep" },
] as const;

const levels = ["None", "Mild", "Moderate", "Severe"] as const;

export function SymptomTracker() {
  const [ratings, setRatings] = useState<Record<string, number>>({});

  return (
    <section className="min-w-0 w-full rounded-2xl border border-white/80 bg-white p-5 shadow-sm shadow-[#8bc4a8]/10 sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f5ee] text-lg"
          aria-hidden
        >
          📋
        </span>
        <div>
          <h2 className="text-lg font-semibold text-[#1e3a4f]">Symptom tracker</h2>
          <p className="mt-0.5 text-sm text-[#64748b]">
            Log how you feel today to share with your care team later.
          </p>
        </div>
      </div>
      <ul className="space-y-4">
        {symptoms.map((symptom) => (
          <li key={symptom.id}>
            <div className="mb-2 flex justify-between text-sm">
              <span className="font-medium text-[#1e3a4f]">{symptom.label}</span>
              <span className="text-[#64748b]">
                {ratings[symptom.id] !== undefined
                  ? levels[ratings[symptom.id]]
                  : "—"}
              </span>
            </div>
            <div className="flex gap-1">
              {levels.map((level, index) => (
                <button
                  key={level}
                  type="button"
                  onClick={() =>
                    setRatings((prev) => ({ ...prev, [symptom.id]: index }))
                  }
                  className={`h-2 flex-1 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5a9e7a] focus-visible:ring-offset-1 ${
                    ratings[symptom.id] !== undefined &&
                    index <= ratings[symptom.id]
                      ? index === 0
                        ? "bg-[#8bc4a8]"
                        : index === 1
                          ? "bg-[#7eb8da]"
                          : index === 2
                            ? "bg-[#b8b0d4]"
                            : "bg-[#c4a8b0]"
                      : "bg-[#e8f2fa]"
                  }`}
                  aria-label={`${symptom.label}: ${level}`}
                  title={level}
                />
              ))}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

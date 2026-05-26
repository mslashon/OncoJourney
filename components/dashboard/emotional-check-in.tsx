"use client";

import { useState } from "react";

const moods = [
  { label: "Calm", emoji: "🌿", color: "bg-[#e8f5ee] ring-[#8bc4a8]" },
  { label: "Okay", emoji: "🙂", color: "bg-[#e8f2fa] ring-[#7eb8da]" },
  { label: "Tired", emoji: "😴", color: "bg-[#f0eef8] ring-[#b8b0d4]" },
  { label: "Anxious", emoji: "💭", color: "bg-[#fef3e8] ring-[#e8c49a]" },
  { label: "Low", emoji: "🌧️", color: "bg-[#eef0f8] ring-[#a8b0d4]" },
] as const;

export function EmotionalCheckIn() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <section className="min-w-0 w-full rounded-2xl border border-white/80 bg-white p-5 shadow-sm shadow-[#7eb8da]/10 sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f0eef8] text-lg"
          aria-hidden
        >
          💚
        </span>
        <div>
          <h2 className="text-lg font-semibold text-[#1e3a4f]">
            Emotional check-in
          </h2>
          <p className="mt-0.5 text-sm text-[#64748b]">
            How are you feeling right now? There&apos;s no wrong answer.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap">
        {moods.map((mood) => (
          <button
            key={mood.label}
            type="button"
            onClick={() => setSelected(mood.label)}
            className={`flex w-full flex-row items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 lg:min-w-[4.5rem] lg:flex-1 lg:flex-col lg:items-center lg:gap-1 lg:px-3 ${
              mood.color
            } ${
              selected === mood.label
                ? "ring-2 ring-offset-1"
                : "ring-1 ring-transparent"
            }`}
            aria-pressed={selected === mood.label}
          >
            <span className="text-2xl" aria-hidden>
              {mood.emoji}
            </span>
            <span className="font-medium text-[#1e3a4f]">{mood.label}</span>
          </button>
        ))}
      </div>
      {selected && (
        <p className="mt-4 rounded-xl bg-[#e8f2fa]/60 px-4 py-3 text-sm text-[#4a7fa8]">
          Thank you for checking in. You&apos;re feeling{" "}
          <strong>{selected.toLowerCase()}</strong> today — we&apos;re here with
          you.
        </p>
      )}
    </section>
  );
}

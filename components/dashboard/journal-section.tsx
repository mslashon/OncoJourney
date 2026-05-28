"use client";

import { useEffect, useMemo, useState } from "react";

type JournalEntry = {
  id: string;
  text: string;
  createdAt: string;
};

const STORAGE_KEY = "oncojourney-journal-entries";

export function JournalSection() {
  const [draft, setDraft] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setIsLoaded(true);
        return;
      }

      const parsed = JSON.parse(raw) as JournalEntry[];
      if (Array.isArray(parsed)) {
        setEntries(parsed);
      }
    } catch {
      // Ignore malformed localStorage and continue with empty state.
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries, isLoaded]);

  const isSaveDisabled = useMemo(() => draft.trim().length === 0, [draft]);

  const handleSave = () => {
    const text = draft.trim();
    if (!text) return;

    const newEntry: JournalEntry = {
      id: crypto.randomUUID(),
      text,
      createdAt: new Date().toISOString(),
    };

    setEntries((prev) => [newEntry, ...prev]);
    setDraft("");
  };

  const handleDelete = (entryId: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
  };

  return (
    <section className="min-w-0 w-full rounded-2xl border border-white/80 bg-white p-5 shadow-sm shadow-[#8bc4a8]/10 sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f5ee] text-lg"
          aria-hidden
        >
          📖
        </span>
        <div>
          <h2 className="text-lg font-semibold text-[#1e3a4f]">Journal</h2>
          <p className="mt-0.5 text-sm text-[#64748b]">Reflect at your own pace</p>
        </div>
      </div>

      <textarea
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        className="min-h-[140px] w-full resize-y rounded-xl border border-[#e8f5ee] bg-[#f4f8fc]/40 px-4 py-3 text-sm text-[#1e3a4f] placeholder:text-[#94a3b8] focus:border-[#8bc4a8] focus:outline-none focus:ring-2 focus:ring-[#8bc4a8]/25"
        placeholder="Write how you felt today, what helped, or anything you'd like to remember..."
        aria-label="Write a journal entry"
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={isSaveDisabled}
        className="mt-3 w-full rounded-xl bg-[#5a9e7a] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#4e8c6c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8bc4a8] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#9fcdb6] sm:w-auto"
      >
        Save Entry
      </button>

      <ul className="mt-5 space-y-3">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="rounded-xl border border-[#e8f5ee] bg-[#f4f8fc]/40 px-4 py-3"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <time
                className="text-xs font-medium text-[#5a9e7a]"
                dateTime={entry.createdAt}
              >
                {new Date(entry.createdAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </time>
              <button
                type="button"
                onClick={() => handleDelete(entry.id)}
                className="w-full rounded-lg border border-[#e8f2fa] bg-white px-3 py-1.5 text-xs font-medium text-[#4a7fa8] transition-colors hover:bg-[#e8f2fa] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7eb8da] sm:w-auto"
              >
                Delete
              </button>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#1e3a4f]">
              {entry.text}
            </p>
          </li>
        ))}
      </ul>

      {isLoaded && entries.length === 0 && (
        <p className="mt-4 rounded-xl bg-[#e8f5ee]/45 px-4 py-3 text-sm text-[#5a9e7a]">
          No journal entries yet. Add one above and it will stay saved on this
          device.
        </p>
      )}
    </section>
  );
}

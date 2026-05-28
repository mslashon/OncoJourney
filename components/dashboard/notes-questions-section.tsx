"use client";

import { useEffect, useMemo, useState } from "react";

type NoteItem = {
  id: string;
  text: string;
  createdAt: string;
};

const STORAGE_KEY = "oncojourney-notes-questions";

export function NotesQuestionsSection() {
  const [draft, setDraft] = useState("");
  const [items, setItems] = useState<NoteItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setIsLoaded(true);
        return;
      }

      const parsed = JSON.parse(raw) as NoteItem[];
      if (Array.isArray(parsed)) {
        setItems(parsed);
      }
    } catch {
      // Ignore malformed storage and continue with empty state.
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, isLoaded]);

  const isSaveDisabled = useMemo(() => draft.trim().length === 0, [draft]);

  const handleSave = () => {
    const text = draft.trim();
    if (!text) return;

    const newItem: NoteItem = {
      id: crypto.randomUUID(),
      text,
      createdAt: new Date().toISOString(),
    };

    setItems((prev) => [newItem, ...prev]);
    setDraft("");
  };

  const handleDelete = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  return (
    <section className="min-w-0 w-full rounded-2xl border border-white/80 bg-white p-5 shadow-sm shadow-[#7eb8da]/10 sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f2fa] text-lg"
          aria-hidden
        >
          ❓
        </span>
        <div>
          <h2 className="text-lg font-semibold text-[#1e3a4f]">Notes & questions</h2>
          <p className="mt-0.5 text-sm text-[#64748b]">
            Jot down what to ask at your next visit
          </p>
        </div>
      </div>

      <textarea
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        className="min-h-[140px] w-full resize-y rounded-xl border border-[#e8f2fa] bg-[#f4f8fc]/50 px-4 py-3 text-sm text-[#1e3a4f] placeholder:text-[#94a3b8] focus:border-[#7eb8da] focus:outline-none focus:ring-2 focus:ring-[#7eb8da]/20"
        placeholder="e.g. Side effects from last cycle, medication timing, support resources..."
        aria-label="Notes and questions for your care team"
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={isSaveDisabled}
        className="mt-3 w-full rounded-xl bg-[#4a7fa8] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#3d6d92] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7eb8da] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#99b9d1] sm:w-auto"
      >
        Save note
      </button>

      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-xl border border-[#e8f2fa] bg-[#f4f8fc]/40 px-4 py-3"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <time
                className="text-xs font-medium text-[#4a7fa8]"
                dateTime={item.createdAt}
              >
                {new Date(item.createdAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </time>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="w-full rounded-lg border border-[#e8f2fa] bg-white px-3 py-1.5 text-xs font-medium text-[#4a7fa8] transition-colors hover:bg-[#e8f2fa] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7eb8da] sm:w-auto"
              >
                Delete
              </button>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#1e3a4f]">
              {item.text}
            </p>
          </li>
        ))}
      </ul>

      {isLoaded && items.length === 0 && (
        <p className="mt-4 rounded-xl bg-[#e8f2fa]/50 px-4 py-3 text-sm text-[#4a7fa8]">
          No saved notes yet. Add one above and it will stay saved on this device.
        </p>
      )}
    </section>
  );
}

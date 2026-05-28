"use client";

import { useEffect, useMemo, useState } from "react";

const moods = [
  { label: "Calm", emoji: "🌿", color: "bg-[#e8f5ee] ring-[#8bc4a8]" },
  { label: "Okay", emoji: "🙂", color: "bg-[#e8f2fa] ring-[#7eb8da]" },
  { label: "Tired", emoji: "😴", color: "bg-[#f0eef8] ring-[#b8b0d4]" },
  { label: "Anxious", emoji: "💭", color: "bg-[#fef3e8] ring-[#e8c49a]" },
  { label: "Low", emoji: "🌧️", color: "bg-[#eef0f8] ring-[#a8b0d4]" },
] as const;

type MoodLabel = (typeof moods)[number]["label"];
type FilterType = "today" | "week" | "month" | "custom";

type CheckInEntry = {
  id: string;
  mood: MoodLabel;
  createdAt: string;
};

const STORAGE_KEY = "oncojourney-emotional-checkins";

export function EmotionalCheckIn() {
  const [selected, setSelected] = useState<MoodLabel | null>(null);
  const [history, setHistory] = useState<CheckInEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>("today");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setIsLoaded(true);
        return;
      }
      const parsed = JSON.parse(raw) as CheckInEntry[];
      if (Array.isArray(parsed)) {
        setHistory(parsed);
      }
    } catch {
      // Ignore malformed storage and continue.
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history, isLoaded]);

  const saveCheckIn = () => {
    if (!selected) return;

    const newEntry: CheckInEntry = {
      id: crypto.randomUUID(),
      mood: selected,
      createdAt: new Date().toISOString(),
    };

    setHistory((prev) => [newEntry, ...prev]);
  };

  const deleteCheckIn = (entryId: string) => {
    setHistory((prev) => prev.filter((entry) => entry.id !== entryId));
  };

  const filterOptions: { id: FilterType; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "week", label: "This Week" },
    { id: "month", label: "This Month" },
    { id: "custom", label: "Custom Date Range" },
  ];

  const filteredHistory = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return history.filter((entry) => {
      const entryDate = new Date(entry.createdAt);
      const entryDay = new Date(
        entryDate.getFullYear(),
        entryDate.getMonth(),
        entryDate.getDate()
      );

      if (filterType === "today") {
        return entryDay.getTime() === startOfToday.getTime();
      }

      if (filterType === "week") {
        return entryDay >= startOfWeek && entryDay <= now;
      }

      if (filterType === "month") {
        return entryDay >= startOfMonth && entryDay <= now;
      }

      if (!customStartDate || !customEndDate) return false;
      const customStart = new Date(`${customStartDate}T00:00:00`);
      const customEnd = new Date(`${customEndDate}T23:59:59`);
      return entryDate >= customStart && entryDate <= customEnd;
    });
  }, [customEndDate, customStartDate, filterType, history]);

  const trendPoints = useMemo(() => {
    return [...filteredHistory]
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
      .map((entry) => {
        const moodIndex = moods.findIndex((mood) => mood.label === entry.mood);
        const safeIndex = moodIndex >= 0 ? moodIndex : 0;
        const moodMeta = moods[safeIndex];
        return {
          id: entry.id,
          label: new Date(entry.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          value: safeIndex + 1,
          emoji: moodMeta.emoji,
        };
      });
  }, [filteredHistory]);

  const filterLabel = useMemo(() => {
    const option = filterOptions.find((item) => item.id === filterType);
    return option ? option.label : "Today";
  }, [filterType]);

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

      <button
        type="button"
        onClick={saveCheckIn}
        disabled={!selected}
        className="mt-4 w-full rounded-xl bg-[#4a7fa8] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#3d6d92] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7eb8da] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#99b9d1] sm:w-auto"
      >
        Save today&apos;s check-in
      </button>

      <div className="mt-5 rounded-xl border border-[#e8f2fa] bg-[#f4f8fc]/35 p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-[#1e3a4f]">Trends &amp; History</h3>
          <span className="text-xs text-[#64748b]">{filterLabel}</span>
        </div>
        {history.length === 0 ? (
          <p className="rounded-lg bg-[#e8f2fa]/50 px-3 py-2 text-sm text-[#4a7fa8]">
            Save an entry to see your trends.
          </p>
        ) : trendPoints.length > 0 ? (
          <ul className="flex items-end gap-2 overflow-x-auto pb-2">
            {trendPoints.map((point) => (
              <li key={point.id} className="min-w-10 flex-1">
                <div className="flex h-28 items-end">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-[#8bc4a8] via-[#7eb8da] to-[#b8b0d4]"
                    style={{ height: `${Math.max(10, (point.value / moods.length) * 100)}%` }}
                    aria-hidden
                  />
                </div>
                <p className="mt-1 text-center text-sm" aria-hidden>
                  {point.emoji}
                </p>
                <p className="text-center text-[10px] text-[#64748b]">{point.label}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg bg-[#e8f2fa]/50 px-3 py-2 text-sm text-[#4a7fa8]">
            No check-ins for this filter yet.
          </p>
        )}
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-[#1e3a4f]">
            Emotional check-in history
          </h3>
          <span className="text-xs text-[#64748b]">{filteredHistory.length} saved</span>
        </div>
        <ul className="space-y-3">
          {filteredHistory.map((entry) => {
            const moodMeta =
              moods.find((mood) => mood.label === entry.mood) ?? moods[0];

            return (
              <li
                key={entry.id}
                className="rounded-xl border border-[#e8f2fa] bg-[#f4f8fc]/40 px-4 py-3"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <time
                    className="text-xs font-medium text-[#4a7fa8]"
                    dateTime={entry.createdAt}
                  >
                    {new Date(entry.createdAt).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                  <button
                    type="button"
                    onClick={() => deleteCheckIn(entry.id)}
                    className="w-full rounded-lg border border-[#e8f2fa] bg-white px-3 py-1.5 text-xs font-medium text-[#4a7fa8] transition-colors hover:bg-[#e8f2fa] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7eb8da] sm:w-auto"
                  >
                    Delete
                  </button>
                </div>
                <p className="mt-2 text-sm text-[#1e3a4f]">
                  <span aria-hidden>{moodMeta.emoji}</span>{" "}
                  <span className="font-medium">{entry.mood}</span>
                </p>
              </li>
            );
          })}
        </ul>

        {isLoaded && history.length > 0 && filteredHistory.length === 0 && (
          <p className="mt-3 rounded-xl bg-[#e8f2fa]/50 px-4 py-3 text-sm text-[#4a7fa8]">
            No emotional check-ins in this date range yet.
          </p>
        )}
      </div>

      <div className="mt-5 rounded-xl border border-[#e8f2fa] bg-[#f4f8fc]/40 p-4">
        <h3 className="text-sm font-semibold text-[#1e3a4f]">Filter history</h3>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {filterOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setFilterType(option.id)}
              className={`w-full rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:w-auto ${
                filterType === option.id
                  ? "bg-[#e8f2fa] text-[#4a7fa8]"
                  : "bg-white text-[#64748b] hover:bg-[#eef6fb]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {filterType === "custom" && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <label className="text-xs text-[#64748b]">
              Start date
              <input
                type="date"
                value={customStartDate}
                onChange={(event) => setCustomStartDate(event.target.value)}
                className="mt-1 w-full rounded-lg border border-[#e8f2fa] bg-white px-3 py-2 text-sm text-[#1e3a4f] focus:border-[#7eb8da] focus:outline-none focus:ring-2 focus:ring-[#7eb8da]/20"
              />
            </label>
            <label className="text-xs text-[#64748b]">
              End date
              <input
                type="date"
                value={customEndDate}
                onChange={(event) => setCustomEndDate(event.target.value)}
                className="mt-1 w-full rounded-lg border border-[#e8f2fa] bg-white px-3 py-2 text-sm text-[#1e3a4f] focus:border-[#7eb8da] focus:outline-none focus:ring-2 focus:ring-[#7eb8da]/20"
              />
            </label>
          </div>
        )}
      </div>
    </section>
  );
}

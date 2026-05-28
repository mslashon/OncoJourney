"use client";

import { useEffect, useMemo, useState } from "react";

const symptoms = [
  { id: "fatigue", label: "Fatigue" },
  { id: "nausea", label: "Nausea" },
  { id: "pain", label: "Pain" },
  { id: "appetite", label: "Low appetite" },
  { id: "sleep", label: "Poor sleep" },
] as const;

const levels = ["None", "Mild", "Moderate", "Severe"] as const;
const STORAGE_KEY = "oncojourney-symptom-history";

type SymptomId = (typeof symptoms)[number]["id"];
type SymptomRatings = Partial<Record<SymptomId, number>>;
type FilterType = "today" | "week" | "month" | "custom";

type SymptomEntry = {
  id: string;
  createdAt: string;
  ratings: SymptomRatings;
};

export function SymptomTracker() {
  const [ratings, setRatings] = useState<SymptomRatings>({});
  const [history, setHistory] = useState<SymptomEntry[]>([]);
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

      const parsed = JSON.parse(raw) as SymptomEntry[];
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

  const filterOptions: { id: FilterType; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "week", label: "This Week" },
    { id: "month", label: "This Month" },
    { id: "custom", label: "Custom Date Range" },
  ];

  const isSaveDisabled = useMemo(
    () => symptoms.every((symptom) => ratings[symptom.id] === undefined),
    [ratings]
  );

  const saveCurrentEntry = () => {
    if (isSaveDisabled) return;

    const newEntry: SymptomEntry = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ratings,
    };

    setHistory((prev) => [newEntry, ...prev]);
    setRatings({});
  };

  const deleteEntry = (entryId: string) => {
    setHistory((prev) => prev.filter((entry) => entry.id !== entryId));
  };

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
        const values = symptoms
          .map((symptom) => entry.ratings[symptom.id])
          .filter((value): value is number => value !== undefined);
        const avg = values.length
          ? values.reduce((sum, value) => sum + value, 0) / values.length
          : 0;
        return {
          id: entry.id,
          label: new Date(entry.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          avg,
        };
      });
  }, [filteredHistory]);

  const filterLabel = useMemo(() => {
    const option = filterOptions.find((item) => item.id === filterType);
    return option ? option.label : "Today";
  }, [filterType]);

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
                {(() => {
                  const currentRating = ratings[symptom.id];
                  return currentRating !== undefined ? levels[currentRating] : "—";
                })()}
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

      <button
        type="button"
        onClick={saveCurrentEntry}
        disabled={isSaveDisabled}
        className="mt-4 w-full rounded-xl bg-[#5a9e7a] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#4e8c6c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8bc4a8] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#9fcdb6] sm:w-auto"
      >
        Save symptom entry
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
                    className="w-full rounded-t-md bg-gradient-to-t from-[#5a9e7a] via-[#7eb8da] to-[#b8b0d4]"
                    style={{ height: `${Math.max(8, (point.avg / 3) * 100)}%` }}
                    aria-hidden
                  />
                </div>
                <p className="mt-1 text-center text-[10px] text-[#64748b]">
                  {point.label}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg bg-[#e8f2fa]/50 px-3 py-2 text-sm text-[#4a7fa8]">
            No entries for this filter yet.
          </p>
        )}
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-[#1e3a4f]">Symptom history</h3>
          <span className="text-xs text-[#64748b]">
            {filteredHistory.length} saved
          </span>
        </div>
        <ul className="space-y-3">
          {filteredHistory.map((entry) => (
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
                  onClick={() => deleteEntry(entry.id)}
                  className="w-full rounded-lg border border-[#e8f2fa] bg-white px-3 py-1.5 text-xs font-medium text-[#4a7fa8] transition-colors hover:bg-[#e8f2fa] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7eb8da] sm:w-auto"
                >
                  Delete
                </button>
              </div>
              <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                {symptoms.map((symptom) => {
                  const value = entry.ratings[symptom.id];
                  return (
                    <li
                      key={`${entry.id}-${symptom.id}`}
                      className="text-sm text-[#1e3a4f]"
                    >
                      <span className="font-medium">{symptom.label}:</span>{" "}
                      <span className="text-[#64748b]">
                        {value !== undefined ? levels[value] : "—"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>

        {isLoaded && history.length > 0 && filteredHistory.length === 0 && (
          <p className="mt-3 rounded-xl bg-[#e8f2fa]/50 px-4 py-3 text-sm text-[#4a7fa8]">
            No symptom history in this date range yet.
          </p>
        )}
      </div>

      <div className="mt-5 rounded-xl border border-[#e8f5ee] bg-[#f4f8fc]/40 p-4">
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

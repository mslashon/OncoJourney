import { EmotionalCheckIn } from "@/components/dashboard/emotional-check-in";
import { JournalSection } from "@/components/dashboard/journal-section";
import { NotesQuestionsSection } from "@/components/dashboard/notes-questions-section";
import { SymptomTracker } from "@/components/dashboard/symptom-tracker";

const timeline = [
  {
    date: "Mar 12",
    title: "Diagnosis & planning",
    status: "done" as const,
    note: "Met with oncologist; treatment plan outlined.",
  },
  {
    date: "Apr 3",
    title: "Cycle 1 — Chemotherapy",
    status: "done" as const,
    note: "First infusion completed. Rest day scheduled.",
  },
  {
    date: "May 18",
    title: "Cycle 2 — Chemotherapy",
    status: "current" as const,
    note: "Upcoming this week. Pre-visit labs on file.",
  },
  {
    date: "Jun 8",
    title: "Follow-up imaging",
    status: "upcoming" as const,
    note: "Scan to assess response; results ~1 week later.",
  },
];

const encouragement =
  "You are doing something brave every single day. Healing isn't linear — rest, ask questions, and let others show up for you.";

export default function Home() {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f8fc] via-white to-[#f0eef8]">
      <header className="border-b border-[#e8f2fa] bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#7eb8da] to-[#8b7fc4] text-white shadow-sm"
              aria-hidden
            >
              <span className="text-lg font-bold">OJ</span>
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight text-[#1e3a4f]">
                OncoJourney
              </p>
              <p className="text-xs text-[#64748b]">Your care companion</p>
            </div>
          </div>
          <time
            className="hidden text-sm text-[#64748b] sm:block"
            dateTime={new Date().toISOString().split("T")[0]}
          >
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </time>
        </div>
      </header>

      <main className="mx-auto max-w-6xl overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
        <section className="mb-8">
          <p className="text-sm font-medium text-[#5a9e7a]">{greeting}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#1e3a4f] sm:text-3xl">
            Welcome back — we&apos;re glad you&apos;re here
          </h1>
          <p className="mt-2 max-w-2xl text-[#64748b]">
            This is your calm space to check in, track symptoms, and prepare for
            what&apos;s ahead. Take it one moment at a time.
          </p>
        </section>

        <div className="mb-6 rounded-2xl border border-[#b8b0d4]/30 bg-gradient-to-r from-[#f0eef8] via-[#e8f2fa] to-[#e8f5ee] p-5 sm:p-6">
          <p className="text-sm font-medium text-[#8b7fc4]">A note for you</p>
          <p className="mt-2 text-base leading-relaxed text-[#1e3a4f] sm:text-lg">
            {encouragement}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
          <div className="min-w-0 w-full">
            <EmotionalCheckIn />
          </div>
          <div className="min-w-0 w-full">
            <SymptomTracker />
          </div>

          <section className="min-w-0 w-full rounded-2xl border border-white/80 bg-white p-5 shadow-sm shadow-[#b8b0d4]/10 sm:p-6 lg:col-span-2">
            <div className="mb-5 flex items-start gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f0eef8] text-lg"
                aria-hidden
              >
                🗓️
              </span>
              <div>
                <h2 className="text-lg font-semibold text-[#1e3a4f]">
                  Treatment timeline
                </h2>
                <p className="mt-0.5 text-sm text-[#64748b]">
                  Key milestones on your journey
                </p>
              </div>
            </div>
            <ol className="relative space-y-0 border-l-2 border-[#e8f2fa] pl-6 sm:pl-8">
              {timeline.map((item, index) => (
                <li key={item.title} className="relative pb-8 last:pb-0">
                  <span
                    className={`absolute -left-[1.65rem] flex h-5 w-5 items-center justify-center rounded-full border-2 border-white sm:-left-[1.85rem] sm:h-6 sm:w-6 ${
                      item.status === "done"
                        ? "bg-[#8bc4a8]"
                        : item.status === "current"
                          ? "bg-[#7eb8da] ring-4 ring-[#7eb8da]/25"
                          : "bg-[#e8f2fa]"
                    }`}
                    aria-hidden
                  />
                  {index < timeline.length - 1 && (
                    <span
                      className="absolute -left-px top-5 h-full w-0.5 bg-[#e8f2fa]"
                      aria-hidden
                    />
                  )}
                  <div className="ml-2 sm:ml-4">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-xs font-medium uppercase tracking-wide text-[#8b7fc4]">
                        {item.date}
                      </span>
                      {item.status === "current" && (
                        <span className="rounded-full bg-[#e8f2fa] px-2 py-0.5 text-xs font-medium text-[#4a7fa8]">
                          Current
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1 font-semibold text-[#1e3a4f]">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-[#64748b]">{item.note}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <NotesQuestionsSection />

          <JournalSection />
        </div>
      </main>

      <footer className="mt-8 border-t border-[#e8f2fa] bg-white/50 py-6 text-center text-xs text-[#64748b]">
        <p>OncoJourney · For informational support only — not medical advice</p>
      </footer>
    </div>
  );
}

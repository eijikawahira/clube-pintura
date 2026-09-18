import Link from "next/link";
import { db, type MeetingRow } from "@/lib/db";
import { createMeeting } from "@/lib/actions/meetings";
import { formatDateLong } from "@/lib/format";
import { AddressInput } from "./AddressInput";

export default function EncontrosAdminPage() {
  const meetings = db
    .prepare("SELECT * FROM meetings ORDER BY date DESC")
    .all() as MeetingRow[];

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Novo encontro
        </h1>
        <form
          action={createMeeting}
          className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2 dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="flex flex-col gap-1">
            <label
              htmlFor="date"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Data
            </label>
            <input
              id="date"
              name="date"
              type="date"
              required
              className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="time"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Horário
            </label>
            <input
              id="time"
              name="time"
              type="time"
              className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label
              htmlFor="location"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Local
            </label>
            <AddressInput />
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label
              htmlFor="notes"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Notas
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 sm:w-fit"
          >
            Criar encontro
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">
          Encontros cadastrados
        </h2>
        {meetings.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Nenhum encontro ainda.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {meetings.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/admin/encontros/${m.id}`}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-500"
                >
                  <span className="capitalize text-slate-900 dark:text-slate-100">
                    {formatDateLong(m.date)}
                    {m.time ? ` às ${m.time}` : ""}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {m.location ?? ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

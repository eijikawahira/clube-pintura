import { db, type MeetingRow } from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatDateLong, formatDateShort, todayIso } from "@/lib/format";
import { PreparationChecklist } from "./PreparationChecklist";

type AssignmentWithMiniature = {
  miniature_id: number;
  notes: string | null;
  miniature_name: string;
  dimensions: string | null;
  image_path: string | null;
};

export default async function DashboardPage() {
  const session = await auth();
  const userId = Number(session!.user.id);
  const today = todayIso();

  const nextMeeting = db
    .prepare("SELECT * FROM meetings WHERE date >= ? ORDER BY date ASC LIMIT 1")
    .get(today) as MeetingRow | undefined;

  const preparations = nextMeeting
    ? (db
        .prepare(
          `SELECT p.id, p.description,
                  EXISTS (
                    SELECT 1 FROM preparation_checks pc
                    WHERE pc.preparation_id = p.id AND pc.user_id = ?
                  ) AS checked
           FROM preparations p
           WHERE p.meeting_id = ?
           ORDER BY p.id ASC`
        )
        .all(userId, nextMeeting.id) as {
        id: number;
        description: string;
        checked: number;
      }[])
    : [];

  const myAssignment = nextMeeting
    ? (db
        .prepare(
          `SELECT a.miniature_id, a.notes, m.name AS miniature_name,
                  m.dimensions, m.image_path
           FROM assignments a
           JOIN miniatures m ON m.id = a.miniature_id
           WHERE a.meeting_id = ? AND a.user_id = ?`
        )
        .get(nextMeeting.id, userId) as AssignmentWithMiniature | undefined)
    : undefined;

  const pastMeetings = db
    .prepare(
      `SELECT m.*, mn.name AS miniature_name
       FROM meetings m
       LEFT JOIN assignments a ON a.meeting_id = m.id AND a.user_id = ?
       LEFT JOIN miniatures mn ON mn.id = a.miniature_id
       WHERE m.date < ?
       ORDER BY m.date DESC
       LIMIT 10`
    )
    .all(userId, today) as (MeetingRow & { miniature_name: string | null })[];

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Próximo encontro
        </h1>

        {!nextMeeting ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-6 text-slate-500 dark:border-slate-600 dark:text-slate-400">
            Nenhum encontro agendado no momento.
          </p>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xl font-medium capitalize text-slate-900 dark:text-slate-100">
                  {formatDateLong(nextMeeting.date)}
                  {nextMeeting.time ? ` às ${nextMeeting.time}` : ""}
                </p>
                {nextMeeting.location && (
                  <p className="mt-1 text-slate-600 dark:text-slate-400">
                    📍 {nextMeeting.location}
                  </p>
                )}
              </div>
              <a
                href={`/api/calendar/${nextMeeting.id}`}
                className="shrink-0 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                📅 Adicionar ao calendário
              </a>
            </div>
            {nextMeeting.notes && (
              <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-400">
                {nextMeeting.notes}
              </p>
            )}

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <h2 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Preparativos
                </h2>
                {preparations.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Nenhum preparativo cadastrado ainda.
                  </p>
                ) : (
                  <PreparationChecklist
                    items={preparations.map((p) => ({
                      id: p.id,
                      description: p.description,
                      checked: p.checked === 1,
                    }))}
                  />
                )}
              </div>

              <div>
                <h2 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Sua miniatura
                </h2>
                {myAssignment ? (
                  <div className="flex gap-3">
                    {myAssignment.image_path && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={myAssignment.image_path}
                        alt={myAssignment.miniature_name}
                        className="h-20 w-20 shrink-0 rounded-md object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {myAssignment.miniature_name}
                      </p>
                      {myAssignment.dimensions && (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {myAssignment.dimensions}
                        </p>
                      )}
                      {myAssignment.notes && (
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                          {myAssignment.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Ainda não atribuída para este encontro.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">
          Histórico
        </h2>
        {pastMeetings.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Nenhum encontro anterior.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-2 font-medium">Data</th>
                  <th className="px-4 py-2 font-medium">Local</th>
                  <th className="px-4 py-2 font-medium">Sua miniatura</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 dark:text-slate-300">
                {pastMeetings.map((m) => (
                  <tr key={m.id}>
                    <td className="px-4 py-2">{formatDateShort(m.date)}</td>
                    <td className="px-4 py-2">{m.location ?? "—"}</td>
                    <td className="px-4 py-2">
                      {m.miniature_name ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

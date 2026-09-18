import {
  db,
  type AssignmentRow,
  type MeetingRow,
  type PreparationRow,
} from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatDateLong, formatDateShort, todayIso } from "@/lib/format";

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
          "SELECT * FROM preparations WHERE meeting_id = ? ORDER BY id ASC"
        )
        .all(nextMeeting.id) as PreparationRow[])
    : [];

  const myAssignment = nextMeeting
    ? (db
        .prepare(
          "SELECT * FROM assignments WHERE meeting_id = ? AND user_id = ?"
        )
        .get(nextMeeting.id, userId) as AssignmentRow | undefined)
    : undefined;

  const pastMeetings = db
    .prepare(
      `SELECT m.*, a.miniature_name, a.miniature_notes
       FROM meetings m
       LEFT JOIN assignments a ON a.meeting_id = m.id AND a.user_id = ?
       WHERE m.date < ?
       ORDER BY m.date DESC
       LIMIT 10`
    )
    .all(userId, today) as (MeetingRow & {
    miniature_name: string | null;
    miniature_notes: string | null;
  })[];

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="mb-4 text-lg font-semibold text-slate-900">
          Próximo encontro
        </h1>

        {!nextMeeting ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-6 text-slate-500">
            Nenhum encontro agendado no momento.
          </p>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xl font-medium capitalize text-slate-900">
              {formatDateLong(nextMeeting.date)}
            </p>
            {nextMeeting.location && (
              <p className="mt-1 text-slate-600">📍 {nextMeeting.location}</p>
            )}
            {nextMeeting.notes && (
              <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">
                {nextMeeting.notes}
              </p>
            )}

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <h2 className="mb-2 text-sm font-semibold text-slate-700">
                  Preparativos
                </h2>
                {preparations.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Nenhum preparativo cadastrado ainda.
                  </p>
                ) : (
                  <ul className="list-inside list-disc space-y-1 text-sm text-slate-700">
                    {preparations.map((p) => (
                      <li key={p.id}>{p.description}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h2 className="mb-2 text-sm font-semibold text-slate-700">
                  Sua miniatura
                </h2>
                {myAssignment ? (
                  <div>
                    <p className="font-medium text-slate-900">
                      {myAssignment.miniature_name}
                    </p>
                    {myAssignment.miniature_notes && (
                      <p className="mt-1 text-sm text-slate-600">
                        {myAssignment.miniature_notes}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    Ainda não atribuída para este encontro.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold text-slate-900">
          Histórico
        </h2>
        {pastMeetings.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum encontro anterior.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-2 font-medium">Data</th>
                  <th className="px-4 py-2 font-medium">Local</th>
                  <th className="px-4 py-2 font-medium">Sua miniatura</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
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

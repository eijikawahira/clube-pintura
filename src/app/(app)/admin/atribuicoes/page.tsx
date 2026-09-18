import Link from "next/link";
import {
  db,
  type AssignmentRow,
  type MeetingRow,
  type MiniatureRow,
  type UserRow,
} from "@/lib/db";
import { setAssignment } from "@/lib/actions/assignments";
import { formatDateLong } from "@/lib/format";

export default async function AtribuicoesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ meetingId?: string }>;
}) {
  const { meetingId: meetingIdParam } = await searchParams;

  const meetings = db
    .prepare("SELECT * FROM meetings ORDER BY date DESC")
    .all() as MeetingRow[];

  const meetingId = meetingIdParam
    ? Number(meetingIdParam)
    : meetings[0]?.id;

  const selectedMeeting = meetings.find((m) => m.id === meetingId);

  const members = db
    .prepare("SELECT * FROM users ORDER BY name ASC")
    .all() as UserRow[];

  const miniatures = db
    .prepare("SELECT * FROM miniatures ORDER BY name ASC")
    .all() as MiniatureRow[];

  const assignments = selectedMeeting
    ? (db
        .prepare("SELECT * FROM assignments WHERE meeting_id = ?")
        .all(selectedMeeting.id) as AssignmentRow[])
    : [];

  const assignmentByUser = new Map(assignments.map((a) => [a.user_id, a]));

  const usedCountByMiniature = new Map<number, number>();
  for (const a of assignments) {
    usedCountByMiniature.set(
      a.miniature_id,
      (usedCountByMiniature.get(a.miniature_id) ?? 0) + 1
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Atribuições de miniaturas
        </h1>

        <form method="get" className="flex items-center gap-3">
          <label
            htmlFor="meetingId"
            className="text-sm text-slate-700 dark:text-slate-300"
          >
            Encontro:
          </label>
          <select
            id="meetingId"
            name="meetingId"
            defaultValue={selectedMeeting?.id}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
            {meetings.map((m) => (
              <option key={m.id} value={m.id}>
                {formatDateLong(m.date)}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
          >
            Ver
          </button>
        </form>
      </div>

      {!selectedMeeting ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Cadastre um encontro primeiro em &ldquo;Encontros&rdquo;.
        </p>
      ) : miniatures.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Cadastre ao menos uma miniatura primeiro em{" "}
          <Link
            href="/admin/miniaturas"
            className="text-indigo-600 underline dark:text-indigo-400"
          >
            Miniaturas
          </Link>
          .
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="grid grid-cols-[1fr_1.2fr_1.2fr_auto] gap-x-3 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            <span>Participante</span>
            <span>Miniatura</span>
            <span>Notas</span>
            <span />
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {members.map((member) => {
              const assignment = assignmentByUser.get(member.id);
              const setAssignmentForUser = setAssignment.bind(
                null,
                selectedMeeting.id,
                member.id
              );
              return (
                <form
                  key={member.id}
                  action={setAssignmentForUser}
                  className="grid grid-cols-[1fr_1.2fr_1.2fr_auto] items-center gap-x-3 px-4 py-2"
                >
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {member.name}
                  </span>
                  <select
                    name="miniature_id"
                    defaultValue={assignment?.miniature_id ?? ""}
                    className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  >
                    <option value="">Nenhuma</option>
                    {miniatures.map((m) => {
                      const isCurrent = assignment?.miniature_id === m.id;
                      const totalUsed = usedCountByMiniature.get(m.id) ?? 0;
                      const usedByOthers = isCurrent
                        ? totalUsed - 1
                        : totalUsed;
                      const available = m.stock - usedByOthers;

                      if (available <= 0 && !isCurrent) return null;

                      return (
                        <option key={m.id} value={m.id}>
                          {m.name}
                          {m.dimensions ? ` (${m.dimensions})` : ""} —{" "}
                          {available} {available === 1 ? "disponível" : "disponíveis"}
                        </option>
                      );
                    })}
                  </select>
                  <input
                    name="notes"
                    type="text"
                    defaultValue={assignment?.notes ?? ""}
                    placeholder="Ex: esquema de cores"
                    className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  />
                  <button
                    type="submit"
                    className="rounded-md bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
                  >
                    Salvar
                  </button>
                </form>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

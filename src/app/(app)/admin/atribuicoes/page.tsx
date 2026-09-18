import {
  db,
  type AssignmentRow,
  type MeetingRow,
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

  const assignments = selectedMeeting
    ? (db
        .prepare("SELECT * FROM assignments WHERE meeting_id = ?")
        .all(selectedMeeting.id) as AssignmentRow[])
    : [];

  const assignmentByUser = new Map(assignments.map((a) => [a.user_id, a]));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="mb-4 text-lg font-semibold text-slate-900">
          Atribuições de miniaturas
        </h1>

        <form method="get" className="flex items-center gap-3">
          <label htmlFor="meetingId" className="text-sm text-slate-700">
            Encontro:
          </label>
          <select
            id="meetingId"
            name="meetingId"
            defaultValue={selectedMeeting?.id}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            {meetings.map((m) => (
              <option key={m.id} value={m.id}>
                {formatDateLong(m.date)}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100"
          >
            Ver
          </button>
        </form>
      </div>

      {!selectedMeeting ? (
        <p className="text-sm text-slate-500">
          Cadastre um encontro primeiro em &ldquo;Encontros&rdquo;.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-[1fr_1.2fr_1.2fr_auto] gap-x-3 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-500">
            <span>Participante</span>
            <span>Miniatura</span>
            <span>Notas</span>
            <span />
          </div>
          <div className="divide-y divide-slate-100">
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
                  <span className="font-medium text-slate-900">
                    {member.name}
                  </span>
                  <input
                    name="miniature_name"
                    type="text"
                    defaultValue={assignment?.miniature_name ?? ""}
                    placeholder="Nome da miniatura"
                    className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                  />
                  <input
                    name="miniature_notes"
                    type="text"
                    defaultValue={assignment?.miniature_notes ?? ""}
                    placeholder="Opcional"
                    className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                  />
                  <button
                    type="submit"
                    className="rounded-md bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-700"
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

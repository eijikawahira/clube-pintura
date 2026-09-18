import { notFound } from "next/navigation";
import Link from "next/link";
import { db, type MeetingRow, type PreparationRow } from "@/lib/db";
import {
  addPreparation,
  deleteMeeting,
  deletePreparation,
  updateMeeting,
} from "@/lib/actions/meetings";

export default async function EncontroDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const meetingId = Number(id);

  const meeting = db
    .prepare("SELECT * FROM meetings WHERE id = ?")
    .get(meetingId) as MeetingRow | undefined;

  if (!meeting) notFound();

  const preparations = db
    .prepare("SELECT * FROM preparations WHERE meeting_id = ? ORDER BY id ASC")
    .all(meetingId) as PreparationRow[];

  const updateMeetingWithId = updateMeeting.bind(null, meetingId);
  const deleteMeetingWithId = deleteMeeting.bind(null, meetingId);
  const addPreparationWithId = addPreparation.bind(null, meetingId);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <Link href="/admin/encontros" className="text-sm text-indigo-600">
          ← Voltar para encontros
        </Link>
        <Link
          href={`/admin/atribuicoes?meetingId=${meetingId}`}
          className="text-sm text-indigo-600"
        >
          Gerenciar atribuições de miniaturas →
        </Link>
      </div>

      <section>
        <h1 className="mb-4 text-lg font-semibold text-slate-900">
          Editar encontro
        </h1>
        <form
          action={updateMeetingWithId}
          className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2"
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="date" className="text-sm font-medium text-slate-700">
              Data
            </label>
            <input
              id="date"
              name="date"
              type="date"
              required
              defaultValue={meeting.date}
              className="rounded-md border border-slate-300 px-3 py-2"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="location"
              className="text-sm font-medium text-slate-700"
            >
              Local
            </label>
            <input
              id="location"
              name="location"
              type="text"
              defaultValue={meeting.location ?? ""}
              className="rounded-md border border-slate-300 px-3 py-2"
            />
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label htmlFor="notes" className="text-sm font-medium text-slate-700">
              Notas
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              defaultValue={meeting.notes ?? ""}
              className="rounded-md border border-slate-300 px-3 py-2"
            />
          </div>
          <div className="flex gap-3 sm:col-span-2">
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500"
            >
              Salvar alterações
            </button>
          </div>
        </form>

        <form action={deleteMeetingWithId} className="mt-3">
          <button
            type="submit"
            className="text-sm text-red-600 hover:underline"
          >
            Excluir este encontro
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold text-slate-900">
          Preparativos
        </h2>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {preparations.length === 0 ? (
            <p className="mb-4 text-sm text-slate-500">
              Nenhum preparativo cadastrado ainda.
            </p>
          ) : (
            <ul className="mb-4 flex flex-col gap-2">
              {preparations.map((p) => {
                const deletePreparationWithId = deletePreparation.bind(
                  null,
                  meetingId,
                  p.id
                );
                return (
                  <li
                    key={p.id}
                    className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm"
                  >
                    <span>{p.description}</span>
                    <form action={deletePreparationWithId}>
                      <button
                        type="submit"
                        className="text-xs text-red-600 hover:underline"
                      >
                        Remover
                      </button>
                    </form>
                  </li>
                );
              })}
            </ul>
          )}

          <form action={addPreparationWithId} className="flex gap-2">
            <input
              name="description"
              type="text"
              required
              placeholder="Ex: trazer tintas base"
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Adicionar
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

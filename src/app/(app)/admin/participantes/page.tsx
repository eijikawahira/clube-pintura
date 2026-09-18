import { db, type UserRow } from "@/lib/db";
import { deleteUser, resetPassword } from "@/lib/actions/users";
import { NewUserForm } from "./NewUserForm";

export default function ParticipantesAdminPage() {
  const users = db
    .prepare("SELECT * FROM users ORDER BY name ASC")
    .all() as UserRow[];

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="mb-4 text-lg font-semibold text-slate-900">
          Novo participante
        </h1>
        <NewUserForm />
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold text-slate-900">
          Participantes
        </h2>
        <div className="flex flex-col gap-3">
          {users.map((u) => {
            const resetPasswordWithId = resetPassword.bind(null, u.id);
            const deleteUserWithId = deleteUser.bind(null, u.id);
            return (
              <div
                key={u.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {u.name}{" "}
                    {u.role === "admin" && (
                      <span className="ml-1 rounded bg-indigo-100 px-1.5 py-0.5 text-xs text-indigo-700">
                        admin
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-slate-500">@{u.username}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <form
                    action={resetPasswordWithId}
                    className="flex items-center gap-2"
                  >
                    <input
                      name="password"
                      type="password"
                      placeholder="Nova senha"
                      minLength={6}
                      className="w-32 rounded-md border border-slate-300 px-2 py-1 text-sm"
                    />
                    <button
                      type="submit"
                      className="rounded-md border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100"
                    >
                      Redefinir senha
                    </button>
                  </form>
                  <form action={deleteUserWithId}>
                    <button
                      type="submit"
                      className="rounded-md border border-red-200 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                    >
                      Remover
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

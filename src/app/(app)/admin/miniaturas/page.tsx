import { db, type MiniatureRow } from "@/lib/db";
import { NewMiniatureForm } from "./NewMiniatureForm";
import { EditMiniatureForm } from "./EditMiniatureForm";

export default function MiniaturasAdminPage() {
  const miniatures = db
    .prepare("SELECT * FROM miniatures ORDER BY name ASC")
    .all() as MiniatureRow[];

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Nova miniatura
        </h1>
        <NewMiniatureForm />
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">
          Catálogo e estoque
        </h2>
        {miniatures.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Nenhuma miniatura cadastrada ainda.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {miniatures.map((m) => (
              <EditMiniatureForm key={m.id} miniature={m} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

"use client";

import { useActionState } from "react";
import type { MiniatureRow } from "@/lib/db";
import { deleteMiniature, updateMiniature } from "@/lib/actions/miniatures";

export function EditMiniatureForm({ miniature }: { miniature: MiniatureRow }) {
  const updateMiniatureWithId = updateMiniature.bind(null, miniature.id);
  const [state, formAction, pending] = useActionState(
    updateMiniatureWithId,
    undefined
  );
  const deleteMiniatureWithId = deleteMiniature.bind(null, miniature.id);

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex aspect-square items-center justify-center bg-slate-100 dark:bg-slate-900">
        {miniature.image_path ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={miniature.image_path}
            alt={miniature.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Sem imagem
          </span>
        )}
      </div>

      <form action={formAction} className="flex flex-1 flex-col gap-2 p-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Nome
          </span>
          <input
            name="name"
            type="text"
            required
            defaultValue={miniature.name}
            className="rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Dimensões
          </span>
          <input
            name="dimensions"
            type="text"
            defaultValue={miniature.dimensions ?? ""}
            className="rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Estoque
          </span>
          <input
            name="stock"
            type="number"
            min={0}
            step={1}
            required
            defaultValue={miniature.stock}
            className="rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Trocar imagem (opcional)
          </span>
          <input
            name="image"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="text-xs file:mr-2 file:rounded file:border-0 file:bg-slate-900 file:px-2 file:py-1 file:text-xs file:text-white dark:text-slate-300 dark:file:bg-slate-700"
          />
        </label>

        {state?.error && (
          <p className="text-xs text-red-600 dark:text-red-400" role="alert">
            {state.error}
          </p>
        )}

        <div className="mt-1 flex items-center justify-between">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
          >
            {pending ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>

      <form
        action={deleteMiniatureWithId}
        className="border-t border-slate-100 px-3 py-2 dark:border-slate-700"
      >
        <button
          type="submit"
          className="text-xs text-red-600 hover:underline dark:text-red-400"
        >
          Remover miniatura
        </button>
      </form>
    </div>
  );
}

"use client";

import { useActionState, useRef, useEffect } from "react";
import { createMiniature } from "@/lib/actions/miniatures";

export function NewMiniatureForm() {
  const [state, formAction, pending] = useActionState(
    createMiniature,
    undefined
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state === undefined) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2 dark:border-slate-700 dark:bg-slate-800"
    >
      <div className="flex flex-col gap-1">
        <label
          htmlFor="name"
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Nome
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="Ex: Space Marine Intercessor"
          className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="dimensions"
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Dimensões
        </label>
        <input
          id="dimensions"
          name="dimensions"
          type="text"
          placeholder="Ex: 28mm, base 32mm"
          className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="stock"
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Estoque (unidades físicas)
        </label>
        <input
          id="stock"
          name="stock"
          type="number"
          min={0}
          step={1}
          defaultValue={1}
          required
          className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

      <div className="flex flex-col gap-1 sm:col-span-2">
        <label
          htmlFor="image"
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Imagem
        </label>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-slate-900 file:px-3 file:py-1 file:text-sm file:text-white dark:border-slate-600 dark:text-slate-300 dark:file:bg-slate-700"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 sm:col-span-2 dark:text-red-400" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 disabled:opacity-60 sm:w-fit"
      >
        {pending ? "Salvando..." : "Adicionar miniatura"}
      </button>
    </form>
  );
}

"use client";

import { useOptimistic, useTransition } from "react";
import { selectMiniature } from "@/lib/actions/assignments";

export type MiniatureOption = {
  id: number;
  name: string;
  dimensions: string | null;
  imagePath: string | null;
  available: number;
  isMine: boolean;
};

export function MiniatureSelector({
  meetingId,
  miniatures,
}: {
  meetingId: number;
  miniatures: MiniatureOption[];
}) {
  const currentSelectionId = miniatures.find((m) => m.isMine)?.id ?? null;
  const [selectedId, setSelectedId] = useOptimistic(currentSelectionId);
  const [isPending, startTransition] = useTransition();

  function handleSelect(id: number) {
    const nextSelection = selectedId === id ? null : id;
    startTransition(async () => {
      setSelectedId(nextSelection);
      await selectMiniature(meetingId, nextSelection);
    });
  }

  if (miniatures.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Nenhuma miniatura cadastrada ainda.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {miniatures.map((m) => {
        const isMine = selectedId === m.id;
        const disabled = !isMine && m.available <= 0;

        return (
          <button
            key={m.id}
            type="button"
            disabled={disabled || isPending}
            onClick={() => handleSelect(m.id)}
            className={[
              "flex flex-col overflow-hidden rounded-lg border text-left transition",
              isMine
                ? "border-indigo-500 ring-2 ring-indigo-500"
                : "border-slate-200 dark:border-slate-700",
              disabled
                ? "cursor-not-allowed opacity-40"
                : "cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500",
            ].join(" ")}
          >
            <div className="flex aspect-square items-center justify-center bg-slate-100 dark:bg-slate-900">
              {m.imagePath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.imagePath}
                  alt={m.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs text-slate-400">Sem imagem</span>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-0.5 p-2">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {m.name}
                {isMine && (
                  <span className="ml-1 text-indigo-600 dark:text-indigo-400">
                    ✓
                  </span>
                )}
              </p>
              {m.dimensions && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {m.dimensions}
                </p>
              )}
              <p
                className={
                  isMine || m.available > 0
                    ? "text-xs text-slate-500 dark:text-slate-400"
                    : "text-xs text-red-500 dark:text-red-400"
                }
              >
                {!isMine && m.available <= 0
                  ? "Esgotada"
                  : `${m.available} ${
                      m.available === 1 ? "disponível" : "disponíveis"
                    }`}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

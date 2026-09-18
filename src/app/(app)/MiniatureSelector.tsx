"use client";

import { useState, useTransition } from "react";
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
  const savedId = miniatures.find((m) => m.isMine)?.id ?? null;
  const [pendingId, setPendingId] = useState<number | null>(savedId);
  const [isPending, startTransition] = useTransition();
  const [justSaved, setJustSaved] = useState(false);

  // Mantém a seleção pendente em sincronia se o dado do servidor mudar
  // (ex.: após salvar, ou se a atribuição for alterada em outra aba).
  // Ajuste de estado durante a renderização em vez de useEffect, seguindo
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [prevSavedId, setPrevSavedId] = useState(savedId);
  if (savedId !== prevSavedId) {
    setPrevSavedId(savedId);
    setPendingId(savedId);
  }

  const hasChanges = pendingId !== savedId;

  function handleCardClick(id: number, disabled: boolean) {
    if (disabled) return;
    setPendingId((prev) => (prev === id ? null : id));
    setJustSaved(false);
  }

  function handleSave() {
    startTransition(async () => {
      await selectMiniature(meetingId, pendingId);
      setJustSaved(true);
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
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {miniatures.map((m) => {
          const isPendingPick = pendingId === m.id;
          const disabled = !m.isMine && m.available <= 0;

          return (
            <button
              key={m.id}
              type="button"
              disabled={disabled}
              onClick={() => handleCardClick(m.id, disabled)}
              className={[
                "flex flex-col overflow-hidden rounded-lg border text-left transition",
                isPendingPick
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
                  {isPendingPick && (
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
                    m.isMine || m.available > 0
                      ? "text-xs text-slate-500 dark:text-slate-400"
                      : "text-xs text-red-500 dark:text-red-400"
                  }
                >
                  {!m.isMine && m.available <= 0
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

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasChanges || isPending}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600"
        >
          {isPending ? "Salvando..." : "Salvar seleção"}
        </button>
        {hasChanges && !isPending && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Você tem uma seleção não salva.
          </span>
        )}
        {!hasChanges && justSaved && (
          <span className="text-xs text-green-600 dark:text-green-400">
            Salvo ✓
          </span>
        )}
      </div>
    </div>
  );
}

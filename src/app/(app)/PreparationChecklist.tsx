"use client";

import { useOptimistic, useTransition } from "react";
import { togglePreparationCheck } from "@/lib/actions/preparations";

type Item = {
  id: number;
  description: string;
  checked: boolean;
};

export function PreparationChecklist({ items }: { items: Item[] }) {
  const [optimisticItems, setOptimisticItems] = useOptimistic(
    items,
    (state, toggledId: number) =>
      state.map((item) =>
        item.id === toggledId ? { ...item, checked: !item.checked } : item
      )
  );
  const [, startTransition] = useTransition();

  return (
    <ul className="space-y-2 text-sm">
      {optimisticItems.map((item) => (
        <li key={item.id} className="flex items-start gap-2">
          <input
            id={`prep-${item.id}`}
            type="checkbox"
            checked={item.checked}
            onChange={() => {
              startTransition(async () => {
                setOptimisticItems(item.id);
                await togglePreparationCheck(item.id);
              });
            }}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 dark:border-slate-600 dark:bg-slate-900"
          />
          <label
            htmlFor={`prep-${item.id}`}
            className={
              item.checked
                ? "text-slate-400 line-through dark:text-slate-600"
                : "text-slate-700 dark:text-slate-300"
            }
          >
            {item.description}
          </label>
        </li>
      ))}
    </ul>
  );
}

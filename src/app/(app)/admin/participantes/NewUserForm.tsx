"use client";

import { useActionState, useRef, useEffect } from "react";
import { createUser } from "@/lib/actions/users";

export function NewUserForm() {
  const [state, formAction, pending] = useActionState(createUser, undefined);
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
      className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium text-slate-700">
          Nome
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="rounded-md border border-slate-300 px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="username" className="text-sm font-medium text-slate-700">
          Usuário (login)
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          minLength={3}
          className="rounded-md border border-slate-300 px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-slate-700">
          Senha inicial
        </label>
        <input
          id="password"
          name="password"
          type="text"
          required
          minLength={6}
          className="rounded-md border border-slate-300 px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="role" className="text-sm font-medium text-slate-700">
          Papel
        </label>
        <select
          id="role"
          name="role"
          defaultValue="member"
          className="rounded-md border border-slate-300 px-3 py-2"
        >
          <option value="member">Participante</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 sm:col-span-2" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 disabled:opacity-60 sm:w-fit"
      >
        {pending ? "Criando..." : "Criar participante"}
      </button>
    </form>
  );
}

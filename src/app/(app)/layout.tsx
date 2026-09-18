import Link from "next/link";
import { auth } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth";
import { ThemeToggle } from "@/app/ThemeToggle";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/" className="font-semibold text-slate-900 dark:text-slate-100">
              Clube de Pintura
            </Link>
            {user?.role === "admin" && (
              <nav className="flex gap-4 text-sm text-slate-600 dark:text-slate-400">
                <Link
                  href="/admin/encontros"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Encontros
                </Link>
                <Link
                  href="/admin/participantes"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Participantes
                </Link>
                <Link
                  href="/admin/miniaturas"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Miniaturas
                </Link>
                <Link
                  href="/admin/atribuicoes"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Atribuições
                </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
            <ThemeToggle />
            {user && (
              <>
                <span>{user.name}</span>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
                  >
                    Sair
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}

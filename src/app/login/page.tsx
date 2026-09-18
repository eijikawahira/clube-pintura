import { ThemeToggle } from "@/app/ThemeToggle";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-900">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h1 className="mb-1 text-xl font-semibold text-slate-900 dark:text-slate-100">
          Clube de Pintura
        </h1>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          Entre com seu usuário e senha para ver o próximo encontro.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}

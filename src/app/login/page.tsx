import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold text-slate-900">
          Clube de Pintura
        </h1>
        <p className="mb-6 text-sm text-slate-500">
          Entre com seu usuário e senha para ver o próximo encontro.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}

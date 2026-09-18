import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clube de Pintura",
  description: "Encontros, preparativos e miniaturas do clube de pintura.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}

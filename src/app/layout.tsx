import type { Metadata } from "next";
import Link from "next/link";
import { Toaster } from "sonner";
import "./globals.css";


export const metadata: Metadata = {
  title: "Reseña de Libros",
  description: "App para buscar libros, reseñararlos y mirar sus detalles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="border-b bg-[#b3cdd1]">
          <nav className="max-w-5xl mx-auto flex items-center gap-6 p-4">
            <Link href="/" className="font-semibold">Reseña de Libros</Link>
          </nav>
        </header>
        <main className="max-w-5xl mx-auto p-4">{children}</main>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}

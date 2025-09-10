import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import Navbar from "../components/ui/Navbar";
import { UserProvider } from "@/context/UserContext";

export const metadata: Metadata = {
  title: "Reseña de Libros",
  description: "App para buscar libros, reseñararlos y mirar sus detalles",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <header className="w-full">
            <Navbar />
          </header>
          <main className="max-w-5xl mx-auto p-4">{children}</main>
          <Toaster position="top-right" />
        </UserProvider>
      </body>
    </html>
  );
}

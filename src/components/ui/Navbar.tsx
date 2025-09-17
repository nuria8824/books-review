"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";

export default function Navbar() {
  const { user, setUser } = useUser();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      }
    };
    fetchUser();
  }, [setUser]);

  return (
    <nav className="w-full mx-auto flex items-center justify-between gap-6 p-4 bg-[#b3cdd1] border-b">
      <Link href="/" className="font-semibold text-lg px-6">
        Reseña de Libros
      </Link>

      <div className="flex items-center gap-4 px-6">
        {user ? (
          <Link
            href="/perfil"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            Perfil
          </Link>
        ) : (
          <>
            <Link
              href="/auth/register"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer"
            >
              Registrarse
            </Link>
            <Link
              href="/auth/login"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
            >
              Login
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

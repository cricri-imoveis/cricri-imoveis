"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { cores, serif } from "@/lib/theme";

export default function Nav() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function sair() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1.1rem 2rem",
        borderBottom: `1px solid ${cores.borda}`,
        background: cores.fundo,
      }}
    >
      <Link href="/" style={{ textDecoration: "none", color: cores.escuro }}>
        <span style={{ fontFamily: serif, fontSize: 22, fontWeight: 700 }}>
          Cricri <span style={{ color: cores.dourado }}>Imoveis</span>
        </span>
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <Link href="/busca" style={{ textDecoration: "none", color: cores.escuro, fontSize: 14, fontWeight: 500 }}>
          Buscar
        </Link>
        <Link href="/avaliar" style={{ textDecoration: "none", color: cores.escuro, fontSize: 14, fontWeight: 500 }}>
          Avaliar
        </Link>
        {email ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, color: cores.suave, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {email}
            </span>
            <button
              onClick={sair}
              style={{ background: "transparent", border: `1px solid ${cores.borda}`, color: cores.escuro, padding: "7px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer" }}
            >
              Sair
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            style={{ background: cores.escuro, color: cores.fundo, padding: "9px 18px", borderRadius: 8, textDecoration: "none", fontSize: 14, fontWeight: 500 }}
          >
            Entrar
          </Link>
        )}
      </div>
    </nav>
  );
}

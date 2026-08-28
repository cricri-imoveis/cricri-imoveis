"use client";

import { useState } from "react";
import Nav from "@/components/Nav";
import { supabase } from "@/lib/supabase";
import { cores, serif } from "@/lib/theme";

export default function LoginPage() {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function entrarComGoogle() {
    setCarregando(true);
    setErro(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setErro(error.message);
      setCarregando(false);
    }
  }

  return (
    <main style={{ background: cores.fundo, minHeight: "100vh", color: cores.escuro, fontFamily: "Inter, sans-serif" }}>
      <Nav />
      <section style={{ maxWidth: 420, margin: "0 auto", padding: "5rem 1.5rem", textAlign: "center" }}>
        <h1 style={{ fontFamily: serif, fontSize: 34, fontWeight: 700, marginBottom: 12 }}>Entrar</h1>
        <p style={{ color: cores.suave, fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
          Entre para avaliar imoveis onde voce morou e para liberar as avaliacoes que quiser consultar.
        </p>

        <button
          onClick={entrarComGoogle}
          disabled={carregando}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            background: cores.branco,
            border: `1px solid ${cores.borda}`,
            color: cores.escuro,
            padding: "14px 20px",
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 600,
            cursor: carregando ? "default" : "pointer",
            opacity: carregando ? 0.6 : 1,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.3 0 24 0 14.6 0 6.4 5.4 2.5 13.3l7.9 6.1C12.3 13.2 17.7 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.1 5.3-4.6 7l7.1 5.5c4.1-3.8 6.5-9.4 6.5-16z" />
            <path fill="#FBBC05" d="M10.4 28.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6l-7.9-6.1C.9 16.5 0 20.1 0 24s.9 7.5 2.5 10.7l7.9-6.1z" />
            <path fill="#34A853" d="M24 48c6.3 0 11.6-2.1 15.5-5.7l-7.1-5.5c-2 1.4-4.6 2.2-8.4 2.2-6.3 0-11.7-3.7-13.6-9.4l-7.9 6.1C6.4 42.6 14.6 48 24 48z" />
          </svg>
          {carregando ? "Redirecionando..." : "Entrar com Google"}
        </button>

        {erro && <p style={{ color: "#B4453B", fontSize: 13, marginTop: 16 }}>{erro}</p>}

        <p style={{ color: cores.claro, fontSize: 12, marginTop: 28, lineHeight: 1.6 }}>
          Ao entrar, voce concorda em usar a plataforma de forma responsavel e verdadeira.
        </p>
      </section>
    </main>
  );
}

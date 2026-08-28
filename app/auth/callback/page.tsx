"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { cores, serif } from "@/lib/theme";

export default function CallbackPage() {
  const router = useRouter();
  const [msg, setMsg] = useState("Entrando...");

  useEffect(() => {
    let feito = false;
    const destino = (typeof window !== "undefined" && sessionStorage.getItem("pos_login")) || "/busca";

    function concluir() {
      if (feito) return;
      feito = true;
      if (typeof window !== "undefined") sessionStorage.removeItem("pos_login");
      router.replace(destino);
    }

    // O cliente do Supabase detecta o codigo na URL e cria a sessao automaticamente.
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) concluir();
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) concluir();
    });

    const timeout = setTimeout(() => {
      if (!feito) setMsg("Demorou mais que o esperado. Tente entrar novamente.");
    }, 8000);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <main style={{ background: cores.fundo, minHeight: "100vh", color: cores.escuro, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
      <p style={{ fontFamily: serif, fontSize: 20 }}>{msg}</p>
    </main>
  );
}

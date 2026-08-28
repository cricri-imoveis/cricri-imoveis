"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Nav from "@/components/Nav";
import { supabase } from "@/lib/supabase";
import { cores, serif, PRECO_POR_IMOVEL } from "@/lib/theme";
import { enderecoLinha } from "@/lib/util";

type ImovelResumo = {
  id: string; rua: string; numero: string; complemento: string | null;
  bairro: string | null; cidade: string; estado: string | null;
};

function CheckoutConteudo() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ids = (searchParams.get("imovel") || "").split(",").map((s) => s.trim()).filter(Boolean);

  const [imoveis, setImoveis] = useState<ImovelResumo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        sessionStorage.setItem("pos_login", `/checkout?imovel=${ids.join(",")}`);
        router.push("/login");
        return;
      }
      if (ids.length === 0) { setCarregando(false); return; }
      const { data } = await supabase
        .from("imoveis_resumo")
        .select("id,rua,numero,complemento,bairro,cidade,estado")
        .in("id", ids);
      setImoveis((data as ImovelResumo[]) ?? []);
      setCarregando(false);
    }
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = imoveis.length * PRECO_POR_IMOVEL;

  async function pagar() {
    setProcessando(true);
    setErro(null);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) { router.push("/login"); return; }

    // ==== LIBERACAO SIMULADA (sem cobranca) ====
    // Quando o Mercado Pago estiver ligado, esta parte sera substituida:
    // o site cria uma preferencia de pagamento, o usuario paga, e o SERVIDOR
    // grava o acesso apenas apos a confirmacao do pagamento.
    const linhas = imoveis.map((i) => ({ user_id: uid, imovel_id: i.id, pagamento_ref: "simulado" }));
    const { error } = await supabase.from("acessos").upsert(linhas, { onConflict: "user_id,imovel_id" });
    setProcessando(false);
    if (error) { setErro("Nao foi possivel liberar: " + error.message); return; }
    router.push(`/imovel/${imoveis[0].id}`);
  }

  if (carregando) {
    return <p style={{ textAlign: "center", padding: "4rem", color: cores.suave }}>Carregando...</p>;
  }

  if (imoveis.length === 0) {
    return <p style={{ textAlign: "center", padding: "4rem", color: cores.suave }}>Nenhum imovel selecionado para liberar.</p>;
  }

  return (
    <section style={{ maxWidth: 560, margin: "0 auto", padding: "3.5rem 1.5rem" }}>
      <h1 style={{ fontFamily: serif, fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Liberar avaliacoes</h1>
      <p style={{ color: cores.suave, fontSize: 15, marginBottom: 28 }}>
        Voce tera acesso completo as avaliacoes {imoveis.length > 1 ? "dos imoveis" : "do imovel"} abaixo.
      </p>

      <div style={{ background: cores.branco, border: `1px solid ${cores.borda}`, borderRadius: 14, overflow: "hidden", marginBottom: 24 }}>
        {imoveis.map((i, idx) => (
          <div key={i.id} style={{ padding: "16px 20px", borderTop: idx ? `1px solid ${cores.borda}` : "none", display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontFamily: serif, fontSize: 16, fontWeight: 700 }}>{i.rua}, {i.numero}</div>
              <div style={{ color: cores.suave, fontSize: 12 }}>
                {enderecoLinha({ complemento: i.complemento, bairro: i.bairro, cidade: i.cidade, estado: i.estado })}
              </div>
            </div>
            <div style={{ fontWeight: 600, whiteSpace: "nowrap" }}>R$ {PRECO_POR_IMOVEL.toFixed(2).replace(".", ",")}</div>
          </div>
        ))}
        <div style={{ padding: "16px 20px", borderTop: `2px solid ${cores.borda}`, display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 17 }}>
          <span>Total</span>
          <span>R$ {total.toFixed(2).replace(".", ",")}</span>
        </div>
      </div>

      <div style={{ background: "rgba(200,169,110,0.14)", border: `1px solid ${cores.dourado}`, borderRadius: 10, padding: "12px 16px", fontSize: 13, color: cores.suave, marginBottom: 20 }}>
        Modo demonstracao: o pagamento pelo Mercado Pago ainda nao esta ativo. Ao confirmar, as avaliacoes serao liberadas sem cobranca.
      </div>

      {erro && <p style={{ color: "#B4453B", fontSize: 14, marginBottom: 12 }}>{erro}</p>}

      <button
        onClick={pagar}
        disabled={processando}
        style={{ width: "100%", background: cores.escuro, color: cores.fundo, border: "none", padding: "15px", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", opacity: processando ? 0.6 : 1 }}
      >
        {processando ? "Processando..." : `Confirmar e liberar (R$ ${total.toFixed(2).replace(".", ",")})`}
      </button>
    </section>
  );
}

export default function CheckoutPage() {
  return (
    <main style={{ background: cores.fundo, minHeight: "100vh", color: cores.escuro, fontFamily: "Inter, sans-serif" }}>
      <Nav />
      <Suspense fallback={<p style={{ textAlign: "center", padding: "4rem", color: cores.suave }}>Carregando...</p>}>
        <CheckoutConteudo />
      </Suspense>
    </main>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import { Estrelas } from "@/components/Estrelas";
import { supabase } from "@/lib/supabase";
import { cores, serif } from "@/lib/theme";
import { normalizar, enderecoLinha } from "@/lib/util";

type Resumo = {
  id: string;
  rua: string;
  numero: string;
  complemento: string | null;
  bairro: string | null;
  cidade: string;
  estado: string | null;
  qtd_avaliacoes: number;
  nota_media: number | null;
};

export default function BuscaPage() {
  const [termo, setTermo] = useState("");
  const [resultados, setResultados] = useState<Resumo[] | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function buscar(e: React.FormEvent) {
    e.preventDefault();
    const t = normalizar(termo);
    if (t.length < 2) return;
    setCarregando(true);
    setErro(null);
    const { data, error } = await supabase
      .from("imoveis_resumo")
      .select("id,rua,numero,complemento,bairro,cidade,estado,qtd_avaliacoes,nota_media")
      .ilike("chave_busca", `%${t}%`)
      .order("qtd_avaliacoes", { ascending: false })
      .limit(30);
    setCarregando(false);
    if (error) {
      setErro(error.message);
      return;
    }
    setResultados((data ?? []) as Resumo[]);
  }

  return (
    <main style={{ background: cores.fundo, minHeight: "100vh", color: cores.escuro, fontFamily: "Inter, sans-serif" }}>
      <Nav />
      <section style={{ maxWidth: 760, margin: "0 auto", padding: "3.5rem 1.5rem" }}>
        <h1 style={{ fontFamily: serif, fontSize: 34, fontWeight: 700, marginBottom: 8 }}>Consultar imoveis</h1>
        <p style={{ color: cores.suave, fontSize: 15, marginBottom: 28 }}>
          Digite o endereco, o bairro ou a cidade do imovel que voce quer conhecer.
        </p>

        <form onSubmit={buscar} style={{ display: "flex", gap: 10, marginBottom: 32 }}>
          <input
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Ex: Rua Prudente de Morais, 200, Rio de Janeiro"
            style={{ flex: 1, padding: "13px 16px", borderRadius: 10, border: `1px solid ${cores.borda}`, fontSize: 15, background: cores.branco, color: cores.escuro }}
          />
          <button
            type="submit"
            disabled={carregando}
            style={{ background: cores.escuro, color: cores.fundo, border: "none", padding: "0 24px", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer" }}
          >
            {carregando ? "..." : "Buscar"}
          </button>
        </form>

        {erro && <p style={{ color: "#B4453B", fontSize: 14 }}>Erro: {erro}</p>}

        {resultados && resultados.length === 0 && (
          <div style={{ textAlign: "center", padding: "3rem 1rem", border: `1px dashed ${cores.borda}`, borderRadius: 12 }}>
            <p style={{ color: cores.suave, fontSize: 15, marginBottom: 16 }}>
              Nenhum imovel encontrado para essa busca.
            </p>
            <Link href="/avaliar" style={{ color: cores.escuro, fontWeight: 600, fontSize: 14 }}>
              Seja o primeiro a avaliar este imovel →
            </Link>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {resultados?.map((r) => (
            <Link
              key={r.id}
              href={`/imovel/${r.id}`}
              style={{ textDecoration: "none", color: cores.escuro }}
            >
              <div style={{ background: cores.branco, border: `1px solid ${cores.borda}`, borderRadius: 12, padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: serif, fontSize: 17, fontWeight: 700, marginBottom: 4 }}>
                    {r.rua}, {r.numero}
                  </div>
                  <div style={{ color: cores.suave, fontSize: 13 }}>
                    {enderecoLinha({ complemento: r.complemento, bairro: r.bairro, cidade: r.cidade, estado: r.estado })}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  {r.qtd_avaliacoes > 0 ? (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                        <Estrelas nota={r.nota_media ?? 0} tamanho={16} />
                        <span style={{ fontWeight: 700, fontSize: 15 }}>{(r.nota_media ?? 0).toFixed(1)}</span>
                      </div>
                      <div style={{ color: cores.claro, fontSize: 12, marginTop: 2 }}>
                        {r.qtd_avaliacoes} avaliacao{r.qtd_avaliacoes > 1 ? "es" : ""}
                      </div>
                    </>
                  ) : (
                    <span style={{ color: cores.claro, fontSize: 13 }}>Sem avaliacoes ainda</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

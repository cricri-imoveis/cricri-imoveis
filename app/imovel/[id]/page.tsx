"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import { Estrelas } from "@/components/Estrelas";
import { supabase } from "@/lib/supabase";
import { cores, serif, CATEGORIAS, PRECO_POR_IMOVEL } from "@/lib/theme";
import { enderecoLinha } from "@/lib/util";

type Resumo = {
  id: string; rua: string; numero: string; complemento: string | null;
  bairro: string | null; cidade: string; estado: string | null;
  qtd_avaliacoes: number; nota_media: number | null;
};

type Avaliacao = {
  id: string; criado_em: string; autor_id: string; tipo_morador: string | null; comentario: string | null;
  nota_conservacao: number; nota_vizinhanca: number; nota_relacao: number;
  nota_seguranca: number; nota_custo: number;
};

function mediaDaAvaliacao(a: Avaliacao): number {
  return (a.nota_conservacao + a.nota_vizinhanca + a.nota_relacao + a.nota_seguranca + a.nota_custo) / 5;
}

export default function ImovelPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [liberado, setLiberado] = useState(false);
  const [logado, setLogado] = useState(false);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      const { data: r } = await supabase.from("imoveis_resumo").select("*").eq("id", id).single();
      setResumo((r as Resumo) ?? null);

      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      setLogado(!!uid);

      if (uid) {
        const { data: acesso } = await supabase
          .from("acessos").select("id").eq("imovel_id", id).eq("user_id", uid).maybeSingle();
        setLiberado(!!acesso);
        // As regras de seguranca (RLS) retornam as avaliacoes do proprio autor sempre,
        // e todas as avaliacoes quando o usuario tem acesso pago a este imovel.
        const { data: avs } = await supabase
          .from("avaliacoes").select("*").eq("imovel_id", id).order("criado_em", { ascending: false });
        setAvaliacoes((avs as Avaliacao[]) ?? []);
      }
      setCarregando(false);
    }
    carregar();
  }, [id]);

  function liberar() {
    if (!logado) {
      sessionStorage.setItem("pos_login", `/checkout?imovel=${id}`);
      router.push("/login");
      return;
    }
    router.push(`/checkout?imovel=${id}`);
  }

  if (carregando) {
    return (
      <main style={{ background: cores.fundo, minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
        <Nav />
        <p style={{ textAlign: "center", padding: "4rem", color: cores.suave }}>Carregando...</p>
      </main>
    );
  }

  if (!resumo) {
    return (
      <main style={{ background: cores.fundo, minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
        <Nav />
        <p style={{ textAlign: "center", padding: "4rem", color: cores.suave }}>Imovel nao encontrado.</p>
      </main>
    );
  }

  return (
    <main style={{ background: cores.fundo, minHeight: "100vh", color: cores.escuro, fontFamily: "Inter, sans-serif" }}>
      <Nav />
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "3rem 1.5rem" }}>
        <Link href="/busca" style={{ color: cores.suave, fontSize: 13, textDecoration: "none" }}>← Voltar para a busca</Link>

        <h1 style={{ fontFamily: serif, fontSize: 30, fontWeight: 700, margin: "14px 0 4px" }}>
          {resumo.rua}, {resumo.numero}
        </h1>
        <p style={{ color: cores.suave, fontSize: 14, marginBottom: 24 }}>
          {enderecoLinha({ complemento: resumo.complemento, bairro: resumo.bairro, cidade: resumo.cidade, estado: resumo.estado })}
        </p>

        {/* Resumo publico (gratis) */}
        <div style={{ background: cores.branco, border: `1px solid ${cores.borda}`, borderRadius: 14, padding: "22px 24px", display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
          {resumo.qtd_avaliacoes > 0 ? (
            <>
              <div style={{ fontFamily: serif, fontSize: 44, fontWeight: 700, lineHeight: 1 }}>{(resumo.nota_media ?? 0).toFixed(1)}</div>
              <div>
                <Estrelas nota={resumo.nota_media ?? 0} tamanho={20} />
                <div style={{ color: cores.suave, fontSize: 13, marginTop: 4 }}>
                  Media de {resumo.qtd_avaliacoes} avaliacao{resumo.qtd_avaliacoes > 1 ? "es" : ""} de ex-moradores
                </div>
              </div>
            </>
          ) : (
            <div style={{ color: cores.suave, fontSize: 15 }}>
              Este imovel ainda nao tem avaliacoes.{" "}
              <Link href="/avaliar" style={{ color: cores.escuro, fontWeight: 600 }}>Seja o primeiro a avaliar.</Link>
            </div>
          )}
        </div>

        {/* Avaliacoes que o usuario pode ver: as proprias sempre; todas quando liberado */}
        {avaliacoes.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
            {avaliacoes.map((a) => (
              <div key={a.id} style={{ background: cores.branco, border: `1px solid ${cores.borda}`, borderRadius: 14, padding: "20px 22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Estrelas nota={mediaDaAvaliacao(a)} tamanho={18} />
                    <span style={{ fontWeight: 700 }}>{mediaDaAvaliacao(a).toFixed(1)}</span>
                  </div>
                  <span style={{ fontSize: 12, color: cores.claro }}>
                    {a.tipo_morador === "proprietario" ? "Ex-proprietario" : "Ex-locatario"}
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px", marginBottom: a.comentario ? 14 : 0 }}>
                  {CATEGORIAS.map((c) => (
                    <div key={c.chave} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: cores.suave }}>
                      <span>{c.rotulo}</span>
                      <Estrelas nota={(a as unknown as Record<string, number>)["nota_" + c.chave] ?? 0} tamanho={13} />
                    </div>
                  ))}
                </div>
                {a.comentario && (
                  <p style={{ fontSize: 14, lineHeight: 1.65, color: cores.escuro, borderTop: `1px solid ${cores.borda}`, paddingTop: 14, margin: 0 }}>
                    “{a.comentario}”
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Conteudo ainda bloqueado: existem avaliacoes de outras pessoas nao liberadas */}
        {!liberado && resumo.qtd_avaliacoes > avaliacoes.length && (
          <div style={{ background: cores.escuro, color: cores.fundo, borderRadius: 14, padding: "28px 24px", textAlign: "center" }}>
            <p style={{ fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", color: cores.dourado, marginBottom: 10 }}>
              Conteudo exclusivo
            </p>
            <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              {avaliacoes.length > 0 ? "Veja as avaliacoes dos outros ex-moradores" : "Veja o que os ex-moradores escreveram"}
            </h2>
            <p style={{ color: "rgba(240,237,230,0.75)", fontSize: 14, lineHeight: 1.6, marginBottom: 20, maxWidth: 420, marginInline: "auto" }}>
              Notas por categoria (conservacao, vizinhanca, seguranca e mais) e os comentarios completos de quem morou aqui.
            </p>
            <button
              onClick={liberar}
              style={{ background: cores.dourado, color: cores.escuro, border: "none", padding: "13px 28px", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" }}
            >
              Liberar por R$ {PRECO_POR_IMOVEL.toFixed(2).replace(".", ",")}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { Estrelas } from "@/components/Estrelas";
import { supabase } from "@/lib/supabase";
import { cores, serif, CATEGORIAS } from "@/lib/theme";
import { chaveBusca } from "@/lib/util";

const rotuloEstilo: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: cores.suave, marginBottom: 6 };
const inputEstilo: React.CSSProperties = { width: "100%", padding: "11px 14px", borderRadius: 9, border: `1px solid ${cores.borda}`, fontSize: 15, background: cores.branco, color: cores.escuro };

export default function AvaliarPage() {
  const router = useRouter();
  const [logado, setLogado] = useState<boolean | null>(null);

  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [tipo, setTipo] = useState("apartamento");
  const [nomeCondominio, setNomeCondominio] = useState("");
  const [tipoMorador, setTipoMorador] = useState("locatario");
  const [comentario, setComentario] = useState("");
  const [notas, setNotas] = useState<Record<string, number>>({});

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setLogado(!!data.user));
  }, []);

  function setNota(chave: string, n: number) {
    setNotas((prev) => ({ ...prev, [chave]: n }));
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!rua || !numero || !cidade) {
      setErro("Preencha ao menos rua, numero e cidade.");
      return;
    }
    if (CATEGORIAS.some((c) => !notas[c.chave])) {
      setErro("Dê uma nota (de 1 a 5 estrelas) em todas as categorias.");
      return;
    }

    setSalvando(true);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) {
      sessionStorage.setItem("pos_login", "/avaliar");
      router.push("/login");
      return;
    }

    const chave = chaveBusca({ rua, numero, cidade });

    // 1) Encontrar imovel existente com esse endereco, ou criar um novo.
    let imovelId: string | null = null;
    const { data: existente } = await supabase.from("imoveis").select("id").eq("chave_busca", chave).maybeSingle();
    if (existente) {
      imovelId = existente.id;
    } else {
      const { data: novo, error: erroImovel } = await supabase
        .from("imoveis")
        .insert({
          rua, numero,
          complemento: complemento || null,
          bairro: bairro || null,
          cidade,
          estado: estado || null,
          tipo,
          nome_condominio: nomeCondominio || null,
          chave_busca: chave,
        })
        .select("id")
        .single();
      if (erroImovel || !novo) {
        setSalvando(false);
        setErro("Nao foi possivel salvar o imovel: " + (erroImovel?.message ?? ""));
        return;
      }
      imovelId = novo.id;
    }

    // 2) Gravar a avaliacao.
    const { error: erroAv } = await supabase.from("avaliacoes").insert({
      imovel_id: imovelId,
      autor_id: uid,
      tipo_morador: tipoMorador,
      nota_conservacao: notas["conservacao"],
      nota_vizinhanca: notas["vizinhanca"],
      nota_relacao: notas["relacao"],
      nota_seguranca: notas["seguranca"],
      nota_custo: notas["custo"],
      comentario: comentario || null,
    });

    setSalvando(false);
    if (erroAv) {
      setErro("Nao foi possivel salvar a avaliacao: " + erroAv.message);
      return;
    }
    router.push(`/imovel/${imovelId}`);
  }

  if (logado === false) {
    return (
      <main style={{ background: cores.fundo, minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
        <Nav />
        <section style={{ maxWidth: 440, margin: "0 auto", padding: "5rem 1.5rem", textAlign: "center" }}>
          <h1 style={{ fontFamily: serif, fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Entre para avaliar</h1>
          <p style={{ color: cores.suave, fontSize: 15, marginBottom: 24 }}>
            Para garantir avaliacoes verdadeiras, so quem esta logado pode avaliar um imovel.
          </p>
          <button
            onClick={() => { sessionStorage.setItem("pos_login", "/avaliar"); router.push("/login"); }}
            style={{ background: cores.escuro, color: cores.fundo, border: "none", padding: "13px 28px", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer" }}
          >
            Entrar
          </button>
        </section>
      </main>
    );
  }

  return (
    <main style={{ background: cores.fundo, minHeight: "100vh", color: cores.escuro, fontFamily: "Inter, sans-serif" }}>
      <Nav />
      <section style={{ maxWidth: 640, margin: "0 auto", padding: "3.5rem 1.5rem" }}>
        <h1 style={{ fontFamily: serif, fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Avaliar um imovel</h1>
        <p style={{ color: cores.suave, fontSize: 15, marginBottom: 32 }}>
          Conte como foi morar nesse imovel. Sua avaliacao ajuda quem esta pensando em morar la.
        </p>

        <form onSubmit={enviar} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {/* Endereco */}
          <div>
            <label style={rotuloEstilo}>Rua / logradouro *</label>
            <input value={rua} onChange={(e) => setRua(e.target.value)} style={inputEstilo} placeholder="Rua Prudente de Morais" />
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            <div style={{ flex: 1 }}>
              <label style={rotuloEstilo}>Numero *</label>
              <input value={numero} onChange={(e) => setNumero(e.target.value)} style={inputEstilo} placeholder="200" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={rotuloEstilo}>Complemento</label>
              <input value={complemento} onChange={(e) => setComplemento(e.target.value)} style={inputEstilo} placeholder="Apto 501" />
            </div>
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            <div style={{ flex: 2 }}>
              <label style={rotuloEstilo}>Bairro</label>
              <input value={bairro} onChange={(e) => setBairro(e.target.value)} style={inputEstilo} placeholder="Ipanema" />
            </div>
            <div style={{ flex: 2 }}>
              <label style={rotuloEstilo}>Cidade *</label>
              <input value={cidade} onChange={(e) => setCidade(e.target.value)} style={inputEstilo} placeholder="Rio de Janeiro" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={rotuloEstilo}>UF</label>
              <input value={estado} onChange={(e) => setEstado(e.target.value)} maxLength={2} style={inputEstilo} placeholder="RJ" />
            </div>
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            <div style={{ flex: 1 }}>
              <label style={rotuloEstilo}>Tipo</label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={inputEstilo}>
                <option value="apartamento">Apartamento</option>
                <option value="casa">Casa</option>
              </select>
            </div>
            <div style={{ flex: 2 }}>
              <label style={rotuloEstilo}>Nome do predio / condominio</label>
              <input value={nomeCondominio} onChange={(e) => setNomeCondominio(e.target.value)} style={inputEstilo} placeholder="Edificio Maravilha" />
            </div>
          </div>

          <div>
            <label style={rotuloEstilo}>Voce morou aqui como</label>
            <select value={tipoMorador} onChange={(e) => setTipoMorador(e.target.value)} style={inputEstilo}>
              <option value="locatario">Locatario (aluguel)</option>
              <option value="proprietario">Proprietario</option>
            </select>
          </div>

          {/* Notas por categoria */}
          <div style={{ background: cores.branco, border: `1px solid ${cores.borda}`, borderRadius: 12, padding: "20px 22px" }}>
            <p style={{ fontFamily: serif, fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Suas notas</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {CATEGORIAS.map((c) => (
                <div key={c.chave} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 14 }}>{c.rotulo}</span>
                  <Estrelas nota={notas[c.chave] ?? 0} aoMudar={(n) => setNota(c.chave, n)} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label style={rotuloEstilo}>Comentario (opcional)</label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={5}
              style={{ ...inputEstilo, resize: "vertical" }}
              placeholder="O que quem vai morar aqui precisa saber?"
            />
          </div>

          {erro && <p style={{ color: "#B4453B", fontSize: 14 }}>{erro}</p>}

          <button
            type="submit"
            disabled={salvando}
            style={{ background: cores.escuro, color: cores.fundo, border: "none", padding: "15px", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", opacity: salvando ? 0.6 : 1 }}
          >
            {salvando ? "Enviando..." : "Enviar avaliacao"}
          </button>
        </form>
      </section>
    </main>
  );
}

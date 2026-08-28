// Normaliza texto (sem acentos, minusculo) para agrupar/buscar enderecos.
export function normalizar(texto: string): string {
  return (texto || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// Chave unica de um imovel a partir do endereco (rua + numero + cidade).
export function chaveBusca(e: { rua: string; numero: string; cidade: string }): string {
  return normalizar(`${e.rua} ${e.numero} ${e.cidade}`);
}

type EnderecoParcial = {
  rua?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
};

// Monta o endereco em uma linha legivel.
export function enderecoLinha(i: EnderecoParcial): string {
  const p1 = [i.rua, i.numero].filter(Boolean).join(", ");
  const extra = [i.complemento, i.bairro].filter(Boolean).join(" - ");
  const p2 = [i.cidade, i.estado].filter(Boolean).join("/");
  return [p1, extra, p2].filter(Boolean).join("  ·  ");
}

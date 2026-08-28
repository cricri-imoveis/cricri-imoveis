// Identidade visual do Cricri Imoveis (mesma paleta da homepage).
export const cores = {
  fundo: "#F0EDE6",
  escuro: "#0F1923",
  dourado: "#C8A96E",
  suave: "#5C6670",
  claro: "#9BA3AB",
  borda: "rgba(15,25,35,0.12)",
  branco: "#FBFAF7",
};

export const serif = "Georgia, serif";
export const sans = "Inter, system-ui, sans-serif";

// Categorias de avaliacao do imovel (1 a 5 estrelas cada).
export const CATEGORIAS = [
  { chave: "conservacao", rotulo: "Conservacao do imovel" },
  { chave: "vizinhanca", rotulo: "Vizinhanca e barulho" },
  { chave: "relacao", rotulo: "Relacao com proprietario / sindico" },
  { chave: "seguranca", rotulo: "Seguranca" },
  { chave: "custo", rotulo: "Custo-beneficio" },
] as const;

// Preco por imovel liberado (ajuste quando quiser).
export const PRECO_POR_IMOVEL = 9.9;

"use client";

import { cores } from "@/lib/theme";

// Exibe estrelas (somente leitura) ou permite escolher a nota (interativo).
export function Estrelas({
  nota,
  aoMudar,
  tamanho = 22,
}: {
  nota: number;
  aoMudar?: (n: number) => void;
  tamanho?: number;
}) {
  const interativo = typeof aoMudar === "function";
  return (
    <span style={{ display: "inline-flex", gap: 3 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          onClick={interativo ? () => aoMudar!(n) : undefined}
          style={{
            fontSize: tamanho,
            lineHeight: 1,
            cursor: interativo ? "pointer" : "default",
            color: n <= Math.round(nota) ? cores.dourado : "rgba(15,25,35,0.18)",
            userSelect: "none",
          }}
          role={interativo ? "button" : undefined}
          aria-label={interativo ? `${n} estrelas` : undefined}
        >
          ★
        </span>
      ))}
    </span>
  );
}

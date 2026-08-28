import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cricri Imoveis — a reputacao do imovel que voce merece saber",
  description:
    "Ex-moradores avaliam imoveis onde viveram. Consulte as notas antes de assinar qualquer contrato de compra ou aluguel.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

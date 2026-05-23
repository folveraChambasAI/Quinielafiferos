import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Quiniela Pokemachos · Mundial 2026",
  description:
    "La quiniela oficial de los Pokemachos para el Mundial 2026. 12 compas, 1 bote, 0 morosos permitidos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-field min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

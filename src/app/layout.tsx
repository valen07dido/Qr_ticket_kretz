// src/app/layout.tsx
import type { Metadata } from "next";
// Importamos la fuente
import { Roboto } from "next/font/google";
import "./globals.css";

// Configuración de la fuente
const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Sistema de Tickets",
  description: "Reporte de incidencias para Odoo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      {/* Aplicamos la fuente al body */}
      <body className={roboto.className}>{children}</body>
    </html>
  );
}
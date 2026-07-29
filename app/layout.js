import { Inter, Inter_Tight, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const interTight = Inter_Tight({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-ui",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: "Gestion Vendedores | CRM y Landings para equipos comerciales",
  description: "Gestion Vendedores: CRM, landings, leads, WhatsApp y facturación para vendedores y equipos comerciales.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-CL" className={`${interTight.variable} ${inter.variable} ${plexMono.variable}`}>
      <head>
        <link rel="icon" href="https://www.tumundo.cl/wp-content/uploads/2022/12/isotipo.png" sizes="32x32" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" />
      </head>
      <body style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}>{children}</body>
    </html>
  );
}

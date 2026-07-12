import { Outfit, Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-ui",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Tu Ejecutiva Mundo - Fibra Óptica, TV HD y Telefonía Hogar",
  description: "Contrata Internet Fibra Óptica, TV Smart GO! y Telefonía Móvil al mejor precio con tu ejecutiva de ventas autorizada.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-CL" className={`${outfit.variable} ${plusJakarta.variable} ${spaceGrotesk.variable}`}>
      <head>
        <link rel="icon" href="https://www.tumundo.cl/wp-content/uploads/2022/12/isotipo.png" sizes="32x32" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" />
      </head>
      <body style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}>{children}</body>
    </html>
  );
}

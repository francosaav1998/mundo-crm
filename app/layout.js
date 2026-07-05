import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
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
    <html lang="es-CL" className={inter.variable}>
      <head>
        <link rel="icon" href="https://www.tumundo.cl/wp-content/uploads/2022/12/isotipo.png" sizes="32x32" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}

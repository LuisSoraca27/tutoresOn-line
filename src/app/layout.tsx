import type { Metadata } from "next";
import Script from "next/script";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { sitio } from "@/config/sitio";
import { Fondo } from "@/components/layout/fondo";
import { FiltroVidrio } from "@/components/ui/filtro-vidrio";
import { usuarioActual } from "@/features/auth/sesion";
import { Proveedores } from "./proveedores";
import "./globals.css";

const fuenteUi = Plus_Jakarta_Sans({
  variable: "--fuente-ui",
  subsets: ["latin"],
  display: "swap",
});

/** Serif con carácter, reservada para títulos: le da tono académico sin restar legibilidad. */
const fuenteDisplay = Fraunces({
  variable: "--fuente-display",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${sitio.nombre} · Tutorías en línea y presenciales`,
    template: `%s · ${sitio.nombre}`,
  },
  description: sitio.descripcion,
};

/**
 * Aplica el tema guardado antes del primer pintado para que no haya
 * parpadeo blanco al recargar en modo oscuro. Usa la misma clave que
 * `useTheme` de HeroUI ("heroui-theme").
 */
const GUION_TEMA = `
(function () {
  try {
    var guardado = localStorage.getItem("heroui-theme");
    var oscuro = guardado === "dark" ||
      ((!guardado || guardado === "system") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    var tema = oscuro ? "dark" : "light";
    document.documentElement.classList.add(tema);
    document.documentElement.setAttribute("data-theme", tema);
  } catch (e) {}
})();
`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Único punto donde se lee la sesión para la interfaz: de aquí baja al
  // contexto de cliente y de ahí a la barra, el menú y los paneles.
  const usuario = await usuarioActual();

  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${fuenteUi.variable} ${fuenteDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Script
          id="tema-inicial"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: GUION_TEMA }}
        />
        <Fondo />
        <FiltroVidrio />
        <Proveedores usuario={usuario}>{children}</Proveedores>
      </body>
    </html>
  );
}

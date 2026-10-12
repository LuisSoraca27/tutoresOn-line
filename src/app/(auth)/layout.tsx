import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { SelectorTema } from "@/components/layout/selector-tema";
import { sitio } from "@/config/sitio";

/**
 * Marco de las pantallas de cuenta (M1).
 *
 * Deliberadamente sin barra de navegación ni menú lateral: quien está
 * entrando o creando su cuenta todavía no tiene panel al que ir, y cada
 * enlace de más en esta página es una salida antes de terminar.
 */
export default function DisposicionCuenta({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <Logo />
        <div className="ml-auto">
          <SelectorTema />
        </div>
      </header>

      <main className="flex flex-1 items-start justify-center px-4 py-8 sm:px-6 sm:py-12">
        {children}
      </main>

      <footer className="px-4 py-8 text-center text-xs text-[var(--muted)] sm:px-6">
        <p>
          Al crear tu cuenta aceptas los términos de uso y el tratamiento de datos de{" "}
          {sitio.nombre}.{" "}
          <Link
            href="/"
            className="underline underline-offset-2 outline-none hover:text-[var(--foreground)] focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
          >
            Volver al inicio
          </Link>
        </p>
      </footer>
    </div>
  );
}

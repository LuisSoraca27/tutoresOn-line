import { BarraSuperior } from "@/components/layout/barra-superior";
import { sitio } from "@/config/sitio";

/** Marco de las páginas públicas: portada, búsqueda y perfiles de tutor. */
export default function DisposicionPublica({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <BarraSuperior />
      <main className="flex-1">{children}</main>

      <footer className="border-t border-[var(--border)] py-8">
        <div className="mx-auto flex w-full max-w-[1240px] flex-wrap items-center gap-x-6 gap-y-2 px-4 text-sm text-[var(--muted)] sm:px-6">
          <span>{sitio.nombre} · Proyecto final · Product Owner: Prof. Edgar Morillo</span>
          <span className="sm:ml-auto">Next.js · HeroUI · FastAPI · PostgreSQL</span>
        </div>
      </footer>
    </div>
  );
}

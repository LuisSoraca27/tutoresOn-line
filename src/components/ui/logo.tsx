import Link from "next/link";
import { sitio } from "@/config/sitio";

/** Marca de la plataforma. La "O" del logo es el punto de encuentro entre las dos partes. */
export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="group flex shrink-0 items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2"
      aria-label={`${sitio.nombre} — ir al inicio`}
    >
      <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true" className="shrink-0">
        <circle cx="16" cy="16" r="15" className="fill-[var(--accent)]" />
        <circle cx="16" cy="16" r="6.4" className="fill-[var(--accent-foreground)]" />
        <circle cx="16" cy="16" r="2.6" className="fill-[var(--accent)]" />
      </svg>
      <span className="titulo text-[17px] leading-none whitespace-nowrap">
        Tutores<span className="text-[var(--accent)]">On</span>-Line
      </span>
    </Link>
  );
}

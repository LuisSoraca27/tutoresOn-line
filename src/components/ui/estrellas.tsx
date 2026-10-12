import { calificacion as formatearCalificacion } from "@/lib/formato";

/**
 * HeroUI v3 no trae componente de calificación, así que la plataforma
 * tiene el suyo: cinco estrellas con relleno parcial mediante un degradado.
 */
export function Estrellas({
  valor,
  total,
  tamano = 15,
  mostrarValor = true,
}: {
  valor: number;
  /** Cantidad de reseñas; si se pasa, se muestra junto al promedio. */
  total?: number;
  tamano?: number;
  /** En `false` deja solo las estrellas, para cuando el número ya se muestra aparte. */
  mostrarValor?: boolean;
}) {
  const etiqueta =
    total === undefined
      ? `${formatearCalificacion(valor)} de 5 estrellas`
      : `${formatearCalificacion(valor)} de 5 estrellas en ${total} reseñas`;

  return (
    <span className="flex items-center gap-1.5" title={etiqueta}>
      <span className="flex items-center gap-0.5" role="img" aria-label={etiqueta}>
        {[1, 2, 3, 4, 5].map((posicion) => {
          const relleno = Math.max(0, Math.min(1, valor - posicion + 1));
          return <Estrella key={posicion} relleno={relleno} tamano={tamano} />;
        })}
      </span>
      {mostrarValor ? (
        <span className="text-sm font-medium tabular-nums">{formatearCalificacion(valor)}</span>
      ) : null}
      {mostrarValor && total !== undefined ? (
        <span className="text-sm text-[var(--muted)] tabular-nums">({total})</span>
      ) : null}
    </span>
  );
}

function Estrella({ relleno, tamano }: { relleno: number; tamano: number }) {
  const id = `estrella-${Math.round(relleno * 100)}`;
  const trazo = "m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1.1 5.9-5.3-2.9-5.3 2.9 1.1-5.9L3.5 9.7l5.9-.8Z";

  return (
    <svg viewBox="0 0 24 24" width={tamano} height={tamano} aria-hidden="true">
      <defs>
        <linearGradient id={id}>
          <stop offset={`${relleno * 100}%`} stopColor="var(--estado-pendiente)" />
          <stop offset={`${relleno * 100}%`} stopColor="transparent" />
        </linearGradient>
      </defs>
      <path
        d={trazo}
        fill={`url(#${id})`}
        stroke="var(--estado-pendiente)"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
    </svg>
  );
}

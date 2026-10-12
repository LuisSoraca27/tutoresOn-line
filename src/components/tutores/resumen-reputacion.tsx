import { ProgressBar } from "@heroui/react";
import { Estrellas } from "@/components/ui/estrellas";
import type { Reputacion } from "@/features/tutores";
import { calificacion } from "@/lib/formato";

const ESCALONES = ["5", "4", "3", "2", "1"] as const;

/**
 * Reputación al estilo de un marketplace (F8.3).
 *
 * El promedio solo no dice nada: 4,8 con 200 reseñas y 4,8 con tres no son
 * lo mismo. Por eso se muestran el total y el reparto por cantidad de estrellas.
 */
export function ResumenReputacion({ reputacion }: { reputacion: Reputacion }) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
      <div className="shrink-0 text-center sm:w-40">
        <p className="titulo text-5xl leading-none tabular-nums">
          {calificacion(reputacion.promedio)}
        </p>
        <div className="mt-2 flex justify-center">
          <Estrellas valor={reputacion.promedio} tamano={16} mostrarValor={false} />
        </div>
        <p className="mt-1.5 text-sm text-[var(--muted)] tabular-nums">
          {reputacion.total} {reputacion.total === 1 ? "reseña" : "reseñas"}
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-1.5">
        {ESCALONES.map((escalon) => {
          const cantidad = reputacion.distribucion[escalon];
          const porcentaje = reputacion.total ? (cantidad / reputacion.total) * 100 : 0;

          return (
            <div key={escalon} className="flex items-center gap-3">
              <span className="w-10 shrink-0 text-right text-sm tabular-nums text-[var(--muted)]">
                {escalon} ★
              </span>

              <ProgressBar
                className="flex-1"
                value={cantidad}
                maxValue={reputacion.total || 1}
                aria-label={`${cantidad} reseñas de ${escalon} estrellas`}
              >
                <ProgressBar.Track>
                  <ProgressBar.Fill />
                </ProgressBar.Track>
              </ProgressBar>

              <span className="w-14 shrink-0 text-right text-sm tabular-nums text-[var(--muted)]">
                {Math.round(porcentaje)} %
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

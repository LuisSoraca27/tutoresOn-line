import { Avatar, Chip, Separator } from "@heroui/react";
import { ReportarResena } from "@/components/resenas/reportar-resena";
import { Estrellas } from "@/components/ui/estrellas";
import { CRITERIOS, type Resena } from "@/features/resenas";
import { nombreEstudiante } from "@/mocks/estudiantes";
import { fechaLarga } from "@/lib/formato";
import { iniciales } from "@/lib/texto";

/**
 * Reseñas de un tutor (F8.4), con la respuesta pública debajo (F8.6).
 *
 * La respuesta va indentada y con otro fondo: se lee como lo que es, la voz
 * del tutor contestando, no otra reseña más.
 */
export function ListaResenas({
  resenas,
  motivosReporte,
}: {
  resenas: Resena[];
  /** Si se pasan, cada reseña puede denunciarse (F8.7). */
  motivosReporte?: readonly string[];
}) {
  if (resenas.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[var(--muted)]">
        Este tutor todavía no tiene comentarios escritos en la plataforma.
      </p>
    );
  }

  return (
    <ul className="flex flex-col">
      {resenas.map((resena, indice) => (
        <li key={resena.id}>
          {indice > 0 ? <Separator className="my-5" /> : null}

          <article className="flex gap-3">
            <Avatar size="sm" className="shrink-0">
              <Avatar.Fallback>
                {iniciales(nombreEstudiante(resena.estudianteId))}
              </Avatar.Fallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-medium">{nombreEstudiante(resena.estudianteId)}</span>
                <Estrellas valor={resena.puntaje} tamano={14} mostrarValor={false} />
                <span className="text-sm text-[var(--muted)] first-letter:uppercase">
                  {fechaLarga(resena.creadaEn)}
                </span>
              </div>

              <p className="pt-2 leading-relaxed">{resena.comentario}</p>

              {resena.criterios ? (
                <div className="flex flex-wrap gap-1.5 pt-3">
                  {CRITERIOS.map((criterio) => (
                    <Chip key={criterio.id} size="sm" variant="soft">
                      {criterio.etiqueta}: {resena.criterios![criterio.id]}/5
                    </Chip>
                  ))}
                </div>
              ) : null}

              {motivosReporte ? (
                <div className="pt-2">
                  <ReportarResena
                    resenaId={resena.id}
                    motivos={motivosReporte}
                    yaReportada={resena.reporte !== undefined}
                  />
                </div>
              ) : null}

              {resena.respuestaTutor ? (
                <div className="mt-4 rounded-lg bg-[var(--surface-2)] p-3">
                  <p className="text-xs tracking-wide text-[var(--muted)] uppercase">
                    Respuesta del tutor
                  </p>
                  <p className="pt-1.5 text-sm leading-relaxed">{resena.respuestaTutor}</p>
                </div>
              ) : null}
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}

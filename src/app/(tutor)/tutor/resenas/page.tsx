import type { Metadata } from "next";
import { Avatar, Chip, EmptyState, Separator } from "@heroui/react";
import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";
import { ResponderResena } from "@/components/resenas/responder-resena";
import { Estrellas } from "@/components/ui/estrellas";
import { IconoEstrella } from "@/components/ui/iconos";
import { ResumenReputacion } from "@/components/tutores/resumen-reputacion";
import { combinarReputacion, CRITERIOS, resenasRepo } from "@/features/resenas";
import { tutorActual } from "@/features/sesion/identidades";
import { tutoresRepo } from "@/features/tutores";
import { fechaLarga } from "@/lib/formato";
import { nombreEstudiante } from "@/mocks/estudiantes";
import { iniciales } from "@/lib/texto";

export const metadata: Metadata = { title: "Mis reseñas" };

/** Datos de una persona concreta: no se prerenderizan en el build. */
export const dynamic = "force-dynamic";

export default async function PaginaResenas() {
  const tutorId = await tutorActual();

  const [resenas, yo] = await Promise.all([
    resenasRepo.deTutor(tutorId),
    tutoresRepo.obtener(tutorId),
  ]);

  const reputacion = yo ? combinarReputacion(yo.reputacion, resenas) : null;
  const sinResponder = resenas.filter((resena) => !resena.respuestaTutor).length;

  return (
    <>
      <EncabezadoPagina
        titulo="Mis reseñas"
        descripcion="Lo que escriben tus estudiantes después de cada sesión. Responder en público dice tanto como la calificación."
      />

      {reputacion ? (
        <div className="rounded-xl border border-[var(--border)] p-6">
          <ResumenReputacion reputacion={reputacion} />
        </div>
      ) : null}

      <section className="pt-8">
        <div className="flex flex-wrap items-center gap-3 pb-5">
          <h2 className="titulo text-xl">Comentarios</h2>
          {sinResponder > 0 ? (
            <Chip size="sm" color="warning" variant="soft">
              {sinResponder} sin responder
            </Chip>
          ) : null}
        </div>

        {resenas.length === 0 ? (
          <EmptyState className="py-12 text-center">
            <IconoEstrella className="mx-auto size-8 text-[var(--muted)]" />
            <p className="mx-auto max-w-[46ch] pt-3 text-sm text-[var(--muted)]">
              Todavía nadie ha escrito una reseña en la plataforma. Aparecen aquí cuando cierras
              una sesión y el estudiante la califica.
            </p>
          </EmptyState>
        ) : (
          <ul className="flex flex-col">
            {resenas.map((resena, indice) => (
              <li key={resena.id}>
                {indice > 0 ? <Separator className="my-6" /> : null}

                <article className="flex gap-3">
                  <Avatar size="sm" className="shrink-0">
                    <Avatar.Fallback>
                      {iniciales(nombreEstudiante(resena.estudianteId))}
                    </Avatar.Fallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="font-medium">
                        {nombreEstudiante(resena.estudianteId)}
                      </span>
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

                    <div className="pt-4">
                      {resena.respuestaTutor ? (
                        <div className="rounded-lg bg-[var(--surface-2)] p-3">
                          <p className="text-xs tracking-wide text-[var(--muted)] uppercase">
                            Tu respuesta
                          </p>
                          <p className="pt-1.5 text-sm leading-relaxed">
                            {resena.respuestaTutor}
                          </p>
                        </div>
                      ) : (
                        <ResponderResena resenaId={resena.id} />
                      )}
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

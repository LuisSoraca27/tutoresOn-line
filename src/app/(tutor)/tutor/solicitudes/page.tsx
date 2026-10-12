import type { Metadata } from "next";
import { Avatar, Card, Chip, EmptyState, Separator } from "@heroui/react";
import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";
import { AccionesSolicitud } from "@/components/reservas/acciones-solicitud";
import { ChipEstado } from "@/components/reservas/chip-estado";
import { IconoBandeja } from "@/components/ui/iconos";
import { catalogosRepo } from "@/features/catalogos";
import { reservasRepo } from "@/features/reservas";
import { aVista, type ReservaVista } from "@/features/reservas/vista";
import { tutorActual } from "@/features/sesion/identidades";
import { tutoresRepo } from "@/features/tutores";
import { fechaLarga, precio } from "@/lib/formato";
import { iniciales } from "@/lib/texto";

export const metadata: Metadata = { title: "Solicitudes" };

/** Datos de una persona concreta: no se prerenderizan en el build. */
export const dynamic = "force-dynamic";

export default async function PaginaSolicitudes() {
  const tutorId = await tutorActual();

  const [reservas, tutores, materias, niveles] = await Promise.all([
    reservasRepo.deTutor(tutorId),
    tutoresRepo.buscar({ porPagina: 100 }).then((pagina) => pagina.items),
    catalogosRepo.materias(),
    catalogosRepo.niveles(),
  ]);

  const vistas = aVista(reservas, { tutores, materias, niveles });
  const pendientes = vistas
    .filter((reserva) => reserva.estado === "pendiente")
    .sort((a, b) => a.inicio.localeCompare(b.inicio));

  const respondidas = vistas
    .filter((reserva) => reserva.estado === "aceptada" || reserva.estado === "rechazada")
    .sort((a, b) => b.inicio.localeCompare(a.inicio))
    .slice(0, 5);

  return (
    <>
      <EncabezadoPagina
        titulo="Solicitudes"
        descripcion="Cada una bloquea ese horario en tu agenda desde que llega, así que responder rápido libera turnos para otros estudiantes."
      />

      {pendientes.length === 0 ? (
        <EmptyState className="py-16 text-center">
          <IconoBandeja className="mx-auto size-8 text-[var(--muted)]" />
          <h2 className="titulo pt-3 text-lg">Nada por responder</h2>
          <p className="mx-auto max-w-[46ch] pt-1.5 text-sm text-[var(--muted)]">
            Cuando un estudiante reserve uno de tus turnos, la solicitud aparecerá aquí.
          </p>
        </EmptyState>
      ) : (
        <>
          <p className="pb-4 text-sm text-[var(--muted)]">
            <span className="font-medium text-[var(--foreground)] tabular-nums">
              {pendientes.length}
            </span>{" "}
            {pendientes.length === 1 ? "solicitud pendiente" : "solicitudes pendientes"}
          </p>

          <div className="flex flex-col gap-4">
            {pendientes.map((reserva) => (
              <TarjetaSolicitud key={reserva.id} reserva={reserva} />
            ))}
          </div>
        </>
      )}

      {respondidas.length > 0 ? (
        <section className="pt-10">
          <h2 className="titulo text-xl">Respondidas recientemente</h2>

          <div className="mt-4 flex flex-col rounded-xl border border-[var(--border)]">
            {respondidas.map((reserva, indice) => (
              <div key={reserva.id}>
                {indice > 0 ? <Separator /> : null}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
                  <span className="min-w-0 flex-1 truncate text-sm">
                    <span className="font-medium">{reserva.estudianteNombre}</span> ·{" "}
                    {reserva.materiaNombre}
                  </span>
                  <span className="text-sm text-[var(--muted)] tabular-nums">
                    {reserva.fecha} · {reserva.horaInicio}
                  </span>
                  <ChipEstado estado={reserva.estado} />
                </div>
                {reserva.motivoRechazo ? (
                  <p className="px-4 pb-4 text-sm text-[var(--muted)]">
                    Motivo: {reserva.motivoRechazo}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

function TarjetaSolicitud({ reserva }: { reserva: ReservaVista }) {
  return (
    <Card>
      <Card.Header className="flex flex-row items-start gap-3">
        <Avatar size="md" className="shrink-0">
          <Avatar.Fallback>{iniciales(reserva.estudianteNombre)}</Avatar.Fallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <Card.Title className="text-base">{reserva.estudianteNombre}</Card.Title>
          <Card.Description>
            {reserva.materiaNombre} · {reserva.nivelNombre}
          </Card.Description>
        </div>

        <Chip size="sm" variant="soft" className="tabular-nums">
          {precio(reserva.precio)}
        </Chip>
      </Card.Header>

      <Card.Content className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <span className="first-letter:uppercase">{fechaLarga(`${reserva.fecha}T00:00`)}</span>
          <span className="text-[var(--muted)] tabular-nums">
            {reserva.horaInicio} a {reserva.horaFin} ({reserva.duracionMinutos} min)
          </span>
          <span className="text-[var(--muted)]">
            {reserva.modalidad === "virtual" ? "Virtual" : "Presencial"}
          </span>
        </div>

        {reserva.lugar ? (
          <p className="text-sm text-[var(--muted)]">Punto de encuentro: {reserva.lugar}</p>
        ) : null}

        {reserva.notaEstudiante ? (
          <blockquote className="border-l-2 border-[var(--border)] pl-3 text-sm text-[var(--muted)] italic">
            {reserva.notaEstudiante}
          </blockquote>
        ) : null}
      </Card.Content>

      <Card.Footer className="border-t border-[var(--border)] pt-4">
        <AccionesSolicitud reservaId={reserva.id} estudiante={reserva.estudianteNombre} />
      </Card.Footer>
    </Card>
  );
}

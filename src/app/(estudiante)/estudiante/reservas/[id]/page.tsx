import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Alert, Avatar, Button, Card, Separator } from "@heroui/react";
import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";
import { AccionesEstudiante } from "@/components/reservas/acciones-estudiante";
import { ReprogramarReserva } from "@/components/reservas/reprogramar-reserva";
import { ChipEstado } from "@/components/reservas/chip-estado";
import { FormularioResena } from "@/components/resenas/formulario-resena";
import { ListaResenas } from "@/components/resenas/lista-resenas";
import { catalogosRepo } from "@/features/catalogos";
import { resenasRepo } from "@/features/resenas";
import { reservasRepo } from "@/features/reservas";
import { aVista } from "@/features/reservas/vista";
import { estudianteActual } from "@/features/sesion/identidades";
import { tutoresRepo } from "@/features/tutores";
import { fechaLarga, precio } from "@/lib/formato";
import { iniciales } from "@/lib/texto";

export const metadata: Metadata = { title: "Detalle de la reserva" };

/** Datos de una persona concreta: no se prerenderizan en el build. */
export const dynamic = "force-dynamic";

export default async function DetalleReserva({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const estudianteId = await estudianteActual();

  const { id } = await params;
  const reserva = await reservasRepo.obtener(id);

  // Una reserva de otra persona no existe para quien la pide.
  if (!reserva || reserva.estudianteId !== estudianteId) notFound();

  const [tutor, materias, niveles, ciudades, resena] = await Promise.all([
    tutoresRepo.obtener(reserva.tutorId),
    catalogosRepo.materias(),
    catalogosRepo.niveles(),
    catalogosRepo.ciudades(),
    resenasRepo.deReserva(reserva.id),
  ]);

  const [vista] = aVista([reserva], {
    tutores: tutor ? [tutor] : [],
    materias,
    niveles,
    ciudades,
  });

  const sePuedeCancelar = vista.esFutura && (vista.estado === "pendiente" || vista.estado === "aceptada");
  const puedeEntrar = vista.estado === "aceptada" || vista.estado === "en-curso";

  // Solo se califica una sesión finalizada a la que el estudiante asistió.
  const puedeCalificar =
    vista.estado === "finalizada" && vista.cierre?.asistio !== false && !resena;

  const filas: [string, string][] = [
    ["Fecha", fechaLarga(`${vista.fecha}T00:00`)],
    ["Hora", `${vista.horaInicio} a ${vista.horaFin} (${vista.duracionMinutos} min)`],
    ["Materia", `${vista.materiaNombre} · ${vista.nivelNombre}`],
    ["Modalidad", vista.modalidad === "virtual" ? "Virtual, por videollamada" : "Presencial"],
  ];

  if (vista.lugar) filas.push(["Punto de encuentro", vista.lugar]);
  filas.push(["Código", vista.id]);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <EncabezadoPagina
        titulo="Detalle de la reserva"
        descripcion="Todo lo acordado con el tutor y lo que puedes hacer desde aquí."
      />

      <Card>
        <Card.Header className="flex flex-row items-start gap-3">
          <Avatar size="md" className="shrink-0">
            <Avatar.Fallback>{iniciales(vista.tutorNombre)}</Avatar.Fallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <Card.Title className="text-base">
              <Link href={`/tutores/${vista.tutorId}`} className="rounded hover:underline">
                {vista.tutorNombre}
              </Link>
            </Card.Title>
            <Card.Description>{tutor?.titulo}</Card.Description>
          </div>

          <ChipEstado estado={vista.estado} />
        </Card.Header>

        <Card.Content className="flex flex-col gap-5">
          {vista.estado === "pendiente" ? (
            <Alert status="warning">
              <Alert.Content>
                <Alert.Title>Esperando respuesta del tutor</Alert.Title>
                <Alert.Description>
                  El horario ya está reservado a tu nombre. Te avisamos apenas responda.
                </Alert.Description>
              </Alert.Content>
            </Alert>
          ) : null}

          {vista.estado === "rechazada" && vista.motivoRechazo ? (
            <Alert status="danger">
              <Alert.Content>
                <Alert.Title>El tutor no pudo tomar esta sesión</Alert.Title>
                <Alert.Description>{vista.motivoRechazo}</Alert.Description>
              </Alert.Content>
            </Alert>
          ) : null}

          <dl className="flex flex-col">
            {filas.map(([etiqueta, valor]) => (
              <div
                key={etiqueta}
                className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-b border-[var(--border)] py-2.5 text-sm last:border-0"
              >
                <dt className="text-[var(--muted)]">{etiqueta}</dt>
                <dd className="text-right first-letter:uppercase">{valor}</dd>
              </div>
            ))}
          </dl>

          {vista.notaEstudiante ? (
            <div>
              <p className="pb-1 text-sm text-[var(--muted)]">Tu nota para el tutor</p>
              <blockquote className="border-l-2 border-[var(--border)] pl-3 text-sm italic">
                {vista.notaEstudiante}
              </blockquote>
            </div>
          ) : null}

          {vista.cierre ? (
            <div className="rounded-lg bg-[var(--surface-2)] p-3">
              <p className="text-xs tracking-wide text-[var(--muted)] uppercase">
                Cierre del tutor
              </p>
              <p className="pt-1.5 text-sm">
                {vista.cierre.asistio
                  ? `Sesión dictada, ${vista.cierre.duracionReal} minutos reales.`
                  : "El tutor registró que no asististe a la sesión."}
              </p>
              {vista.cierre.observaciones ? (
                <p className="pt-1.5 text-sm leading-relaxed">{vista.cierre.observaciones}</p>
              ) : null}
            </div>
          ) : null}

          <Separator />

          <div className="flex items-baseline justify-between gap-6">
            <span className="font-medium">Total</span>
            <span className="titulo text-xl tabular-nums">{precio(vista.precio)}</span>
          </div>
        </Card.Content>

        <Card.Footer className="flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-4">
          {puedeEntrar ? (
            <Button variant="primary" size="sm">
              <Link href={`/sesion/${vista.id}`}>Entrar a la sesión</Link>
            </Button>
          ) : null}

          {sePuedeCancelar ? <AccionesEstudiante reservaId={vista.id} /> : null}

          <Button variant="ghost" size="sm">
            <Link href="/estudiante/reservas">Volver</Link>
          </Button>

        </Card.Footer>
      </Card>

      {sePuedeCancelar ? <ReprogramarReserva reserva={reserva} /> : null}

      {puedeCalificar ? (
        <div className="pt-6">
          <FormularioResena
            reservaId={vista.id}
            estudianteId={estudianteId}
            tutor={vista.tutorNombre}
          />
        </div>
      ) : null}

      {resena ? (
        <section className="pt-8">
          <h2 className="titulo text-xl">Tu reseña</h2>
          <div className="mt-4 rounded-xl border border-[var(--border)] p-5">
            <ListaResenas resenas={[resena]} />
          </div>
        </section>
      ) : null}
    </div>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { Button, Card, Chip, Separator } from "@heroui/react";
import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";
import { TarjetaAcceso } from "@/components/layout/tarjeta-acceso";
import { BandejaExpress } from "@/components/express/bandeja-express";
import { ChipEstado } from "@/components/reservas/chip-estado";
import { catalogosRepo } from "@/features/catalogos";
import { aIsoFecha } from "@/features/disponibilidad/calcular-turnos";
import { reservasRepo } from "@/features/reservas";
import { aVista, porDia } from "@/features/reservas/vista";
import { tutorActual } from "@/features/sesion/identidades";
import { tutoresRepo } from "@/features/tutores";
import { calificacion, fechaLarga, precio } from "@/lib/formato";

export const metadata: Metadata = { title: "Mi panel" };

/** Datos de una persona concreta: no se prerenderizan en el build. */
export const dynamic = "force-dynamic";

export default async function PanelTutor() {
  const tutorId = await tutorActual();

  const [reservas, yo, tutores, materias, niveles] = await Promise.all([
    reservasRepo.deTutor(tutorId),
    tutoresRepo.obtener(tutorId),
    tutoresRepo.buscar({ porPagina: 100 }).then((pagina) => pagina.items),
    catalogosRepo.materias(),
    catalogosRepo.niveles(),
  ]);

  const vistas = aVista(reservas, { tutores, materias, niveles });

  const hoy = aIsoFecha(new Date());
  const finDeSemana = new Date();
  finDeSemana.setDate(finDeSemana.getDate() + 7);
  const hasta = aIsoFecha(finDeSemana);

  const pendientes = vistas.filter((reserva) => reserva.estado === "pendiente");
  const deHoy = vistas.filter(
    (reserva) => reserva.fecha === hoy && (reserva.estado === "aceptada" || reserva.estado === "pendiente"),
  );
  const deLaSemana = vistas.filter(
    (reserva) =>
      reserva.fecha >= hoy && reserva.fecha <= hasta && reserva.estado === "aceptada",
  );
  const finalizadas = vistas.filter((reserva) => reserva.estado === "finalizada" && reserva.cierre?.asistio !== false);
  const respondidas = vistas.filter(
    (reserva) => reserva.estado === "aceptada" || reserva.estado === "rechazada",
  );
  const aceptadas = vistas.filter((reserva) => reserva.estado === "aceptada");

  const ingresos = finalizadas.reduce((total, reserva) => total + reserva.precio, 0);
  const tasaAceptacion = respondidas.length
    ? Math.round((aceptadas.length / respondidas.length) * 100)
    : null;

  const indicadores = [
    { etiqueta: "Sesiones hoy", valor: String(deHoy.length) },
    { etiqueta: "Esta semana", valor: String(deLaSemana.length) },
    { etiqueta: "Ingresos por sesiones", valor: precio(ingresos) },
    {
      etiqueta: "Calificación",
      valor: yo ? calificacion(yo.reputacion.promedio) : "—",
    },
    {
      etiqueta: "Tasa de aceptación",
      valor: tasaAceptacion === null ? "—" : `${tasaAceptacion} %`,
    },
  ];

  const proximas = porDia(
    vistas
      .filter((reserva) => reserva.fecha >= hoy && reserva.estado === "aceptada")
      .sort((a, b) => a.inicio.localeCompare(b.inicio)),
  ).slice(0, 2);

  return (
    <>
      <EncabezadoPagina
        titulo={`Hola, ${yo?.nombre.split(" ")[0] ?? "tutor"}`}
        descripcion="Lo que tienes por responder y lo que viene en tu agenda."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {indicadores.map((indicador) => (
          <Card key={indicador.etiqueta}>
            <Card.Content className="py-4">
              <p className="text-xs tracking-wide text-[var(--muted)] uppercase">
                {indicador.etiqueta}
              </p>
              <p className="titulo pt-1 text-2xl tabular-nums">{indicador.valor}</p>
            </Card.Content>
          </Card>
        ))}
      </div>

      <div className="pt-6">
        <BandejaExpress
          tutorId={tutorId}
          disponiblePorDefecto={yo?.disponibleAhora ?? false}
          nombresMateria={Object.fromEntries(materias.map((m) => [m.id, m.nombre]))}
        />
      </div>

      <div className="grid gap-4 pt-4 lg:grid-cols-2">
        <Card>
          <Card.Header className="flex flex-row items-center gap-3">
            <div className="flex-1">
              <Card.Title className="text-base">Solicitudes por responder</Card.Title>
              <Card.Description>
                Cada una bloquea ese turno hasta que respondas.
              </Card.Description>
            </div>
            {pendientes.length > 0 ? (
              <Chip size="sm" color="warning" variant="soft" className="tabular-nums">
                {pendientes.length}
              </Chip>
            ) : null}
          </Card.Header>

          <Card.Content>
            {pendientes.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">Estás al día. No hay nada pendiente.</p>
            ) : (
              <ul className="flex flex-col">
                {pendientes.slice(0, 3).map((reserva, indice) => (
                  <li key={reserva.id}>
                    {indice > 0 ? <Separator className="my-2" /> : null}
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <span className="text-sm font-medium">{reserva.estudianteNombre}</span>
                      <span className="text-sm text-[var(--muted)] tabular-nums">
                        {reserva.fecha} · {reserva.horaInicio}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--muted)]">
                      {reserva.materiaNombre} · {reserva.nivelNombre}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card.Content>

          <Card.Footer className="border-t border-[var(--border)] pt-4">
            <Button variant="outline" size="sm">
              <Link href="/tutor/solicitudes">Ver todas las solicitudes</Link>
            </Button>
          </Card.Footer>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title className="text-base">Lo que viene</Card.Title>
            <Card.Description>Tus próximas sesiones confirmadas.</Card.Description>
          </Card.Header>

          <Card.Content>
            {proximas.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">
                No tienes sesiones confirmadas todavía.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {proximas.map((dia) => (
                  <div key={dia.fecha}>
                    <p className="pb-1.5 text-sm font-medium first-letter:uppercase">
                      {fechaLarga(`${dia.fecha}T00:00`)}
                    </p>
                    <ul className="flex flex-col gap-1.5">
                      {dia.sesiones.map((sesion) => (
                        <li
                          key={sesion.id}
                          className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm"
                        >
                          <span className="tabular-nums">{sesion.horaInicio}</span>
                          <span className="min-w-0 flex-1 truncate">
                            {sesion.estudianteNombre} · {sesion.materiaNombre}
                          </span>
                          <ChipEstado estado={sesion.estado} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </Card.Content>

          <Card.Footer className="border-t border-[var(--border)] pt-4">
            <Button variant="outline" size="sm">
              <Link href="/tutor/agenda">Ver mi agenda</Link>
            </Button>
          </Card.Footer>
        </Card>
      </div>

      <div className="grid gap-4 pt-4 lg:grid-cols-2">
        <TarjetaAcceso
          titulo="Reseñas recibidas"
          descripcion="Los comentarios de tus estudiantes y tu respuesta pública a cada uno."
          href="/tutor/resenas"
          accion="Ver y responder reseñas"
        />
        <TarjetaAcceso
          titulo="Ingresos por periodo"
          descripcion="Resumen y detalle de lo cobrado, con filtro por rango de fechas."
          href="/tutor/ingresos"
          accion="Consultar ingresos y retiros"
        />
      </div>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Button, Card, EmptyState, Table } from "@heroui/react";
import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";
import {
  DescargarComprobante,
  DescargarIngresos,
} from "@/components/ingresos/descargar-ingresos";
import { PanelRetiros } from "@/components/ingresos/panel-retiros";
import { ingresosRepo } from "@/features/ingresos";
import { env } from "@/lib/env";
import { IconoDinero } from "@/components/ui/iconos";
import { catalogosRepo } from "@/features/catalogos";
import { reservasRepo } from "@/features/reservas";
import { aVista, type ReservaVista } from "@/features/reservas/vista";
import { tutorActual } from "@/features/sesion/identidades";
import { tutoresRepo } from "@/features/tutores";
import { fechaLarga, precio } from "@/lib/formato";

export const metadata: Metadata = { title: "Ingresos" };

/** Datos de una persona concreta: no se prerenderizan. */
export const dynamic = "force-dynamic";

/** "2026-08" → "agosto de 2026" */
function nombreMes(clave: string): string {
  const [anio, mes] = clave.split("-").map(Number);
  return new Date(anio, mes - 1, 1).toLocaleDateString("es-CO", {
    month: "long",
    year: "numeric",
  });
}

function esFecha(valor: string | undefined): valor is string {
  if (!valor || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const fecha = new Date(`${valor}T00:00:00Z`);
  return (
    !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor
  );
}

export default async function PaginaIngresos({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string }>;
}) {
  const tutorId = await tutorActual();
  const filtros = await searchParams;
  const desde = esFecha(filtros.desde) ? filtros.desde : undefined;
  const hasta = esFecha(filtros.hasta) ? filtros.hasta : undefined;
  const rangoInvalido = Boolean(
    (filtros.desde && !desde) ||
    (filtros.hasta && !hasta) ||
    (desde && hasta && desde > hasta),
  );

  const [reservas, tutores, materias, niveles, balance, retiros] =
    await Promise.all([
      reservasRepo.deTutor(tutorId),
      tutoresRepo.buscar({ porPagina: 100 }).then((pagina) => pagina.items),
      catalogosRepo.materias(),
      catalogosRepo.niveles(),
      ingresosRepo.balance(tutorId),
      ingresosRepo.retiros(tutorId),
    ]);

  // Solo cuenta lo finalizado: una sesión aceptada todavía puede caerse.
  const cobradas = aVista(reservas, { tutores, materias, niveles })
    .filter(
      (reserva) =>
        reserva.estado === "finalizada" && reserva.cierre?.asistio !== false,
    )
    .filter(
      (reserva) =>
        !rangoInvalido &&
        (!desde || reserva.fecha >= desde) &&
        (!hasta || reserva.fecha <= hasta),
    )
    .sort((a, b) => b.inicio.localeCompare(a.inicio));

  const total = cobradas.reduce((suma, reserva) => suma + reserva.precio, 0);
  const horas =
    cobradas.reduce(
      (suma, reserva) =>
        suma + (reserva.cierre?.duracionReal ?? reserva.duracionMinutos),
      0,
    ) / 60;

  const porHora = horas > 0 ? Math.round(total / horas) : 0;

  // Agrupado por mes: es el periodo con el que la gente piensa sus ingresos.
  const meses = new Map<string, ReservaVista[]>();
  for (const reserva of cobradas) {
    const clave = reserva.fecha.slice(0, 7);
    meses.set(clave, [...(meses.get(clave) ?? []), reserva]);
  }

  const indicadores = [
    { etiqueta: "Total cobrado", valor: precio(total) },
    { etiqueta: "Sesiones", valor: String(cobradas.length) },
    {
      etiqueta: "Horas dictadas",
      valor: horas.toLocaleString("es-CO", { maximumFractionDigits: 1 }),
    },
    { etiqueta: "Promedio por hora", valor: precio(porHora) },
  ];

  return (
    <>
      <EncabezadoPagina
        titulo="Ingresos"
        descripcion="Solo cuenta lo que ya se dictó y se cerró: una sesión aceptada todavía se puede caer."
      />

      <form method="get" className="mb-6 flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Desde
          <input
            aria-label="Desde"
            type="date"
            name="desde"
            defaultValue={desde}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-base focus-visible:outline-2 focus-visible:outline-[var(--focus)]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Hasta
          <input
            aria-label="Hasta"
            type="date"
            name="hasta"
            defaultValue={hasta}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-base focus-visible:outline-2 focus-visible:outline-[var(--focus)]"
          />
        </label>
        <Button type="submit" variant="primary">
          Filtrar periodo
        </Button>
        <Link
          href="/tutor/ingresos"
          className="rounded text-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-[var(--focus)]"
        >
          Ver todos
        </Link>
        <DescargarIngresos
          reservas={cobradas}
          periodo={`${desde ?? "inicio"}_${hasta ?? "hoy"}`}
        />
      </form>
      {rangoInvalido ? (
        <p role="alert" className="mb-4 text-sm text-[var(--danger)]">
          Revisa las fechas: el inicio del periodo debe ser anterior o igual al
          final.
        </p>
      ) : null}

      {cobradas.length === 0 ? (
        <EmptyState className="py-16 text-center">
          <IconoDinero className="mx-auto size-8 text-[var(--muted)]" />
          <h2 className="titulo pt-3 text-lg">
            {desde || hasta
              ? "Sin ingresos en este periodo"
              : "Todavía no has cobrado nada"}
          </h2>
          <p className="mx-auto max-w-[46ch] pt-1.5 text-sm text-[var(--muted)]">
            Los ingresos aparecen aquí cuando cierras una sesión desde su sala.
          </p>
        </EmptyState>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {indicadores.map((indicador) => (
              <Card key={indicador.etiqueta}>
                <Card.Content className="py-4">
                  <p className="text-xs tracking-wide text-[var(--muted)] uppercase">
                    {indicador.etiqueta}
                  </p>
                  <p className="titulo pt-1 text-2xl tabular-nums">
                    {indicador.valor}
                  </p>
                </Card.Content>
              </Card>
            ))}
          </div>

          <div className="flex flex-col gap-6 pt-8">
            {[...meses.entries()].map(([clave, sesiones]) => {
              const delMes = sesiones.reduce(
                (suma, reserva) => suma + reserva.precio,
                0,
              );

              return (
                <section key={clave}>
                  <div className="flex flex-wrap items-baseline justify-between gap-3 pb-3">
                    <h2 className="titulo text-lg first-letter:uppercase">
                      {nombreMes(clave)}
                    </h2>
                    <span className="tabular-nums">
                      <span className="text-[var(--muted)]">
                        {sesiones.length} sesiones ·{" "}
                      </span>
                      <span className="font-medium">{precio(delMes)}</span>
                    </span>
                  </div>

                  <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] md:hidden">
                    {sesiones.map((reserva) => (
                      <li key={reserva.id} className="flex flex-col gap-2 p-4">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="text-sm first-letter:uppercase">{fechaLarga(`${reserva.fecha}T00:00`)}</span>
                          <span className="font-medium tabular-nums">{precio(reserva.precio)}</span>
                        </div>
                        <p className="text-sm">{reserva.estudianteNombre} · {reserva.materiaNombre}</p>
                        <div className="flex items-center justify-between gap-2"><span className="text-xs text-[var(--muted)]">{reserva.id}</span><DescargarComprobante reserva={reserva} /></div>
                      </li>
                    ))}
                  </ul>

                  <Table className="hidden md:block">
                    <Table.ScrollContainer>
                      <Table.Content
                        aria-label={`Sesiones cobradas en ${nombreMes(clave)}`}
                      >
                        <Table.Header>
                          <Table.Column isRowHeader>Fecha</Table.Column>
                          <Table.Column>Estudiante</Table.Column>
                          <Table.Column>Materia</Table.Column>
                          <Table.Column>Valor</Table.Column>
                          <Table.Column>Comprobante</Table.Column>
                        </Table.Header>

                        <Table.Body>
                          {sesiones.map((reserva) => (
                            <Table.Row key={reserva.id} id={reserva.id}>
                              <Table.Cell className="first-letter:uppercase">
                                {fechaLarga(`${reserva.fecha}T00:00`)}
                              </Table.Cell>
                              <Table.Cell>
                                {reserva.estudianteNombre}
                              </Table.Cell>
                              <Table.Cell>{reserva.materiaNombre}</Table.Cell>
                              <Table.Cell className="tabular-nums whitespace-nowrap">
                                {precio(reserva.precio)}
                              </Table.Cell>
                              <Table.Cell>
                                <DescargarComprobante reserva={reserva} />
                              </Table.Cell>
                            </Table.Row>
                          ))}
                        </Table.Body>
                      </Table.Content>
                    </Table.ScrollContainer>
                  </Table>
                </section>
              );
            })}
          </div>
        </>
      )}

      <PanelRetiros
        balance={balance}
        retiros={retiros}
        simulado={env.usarDatosSimulados}
      />
    </>
  );
}

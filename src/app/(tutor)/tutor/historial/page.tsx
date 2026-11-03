import type { Metadata } from "next";
import { Chip, EmptyState, Table, Tabs } from "@heroui/react";
import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";
import { ChipEstado } from "@/components/reservas/chip-estado";
import { IconoHistorial } from "@/components/ui/iconos";
import { exigirUsuario } from "@/features/auth/sesion";
import { consultarHistorial, type SesionHistorial } from "@/features/historial/real";
import { precio } from "@/lib/formato";

export const metadata: Metadata = { title: "Historial" };

/** Datos de una persona concreta: no se prerenderizan. */
export const dynamic = "force-dynamic";

export default async function PaginaHistorial() {
  await exigirUsuario("tutor");
  const vistas = await consultarHistorial();

  const dictadas = vistas.filter((reserva) => reserva.estado === "finalizada" && reserva.cierre?.asistio === true);
  const noDadas = vistas.filter(
    (reserva) => reserva.estado === "cancelada" || reserva.estado === "rechazada" || (reserva.estado === "finalizada" && reserva.cierre?.asistio === false),
  );

  const pestanas = [
    { id: "dictadas", etiqueta: "Dictadas", datos: dictadas, vacio: "Todavía no has cerrado ninguna sesión." },
    { id: "todas", etiqueta: "Todas", datos: vistas, vacio: "No tienes sesiones registradas." },
    { id: "no-dadas", etiqueta: "No se dieron", datos: noDadas, vacio: "Ninguna cancelada, rechazada o sin asistencia." },
  ];

  return (
    <>
      <EncabezadoPagina
        titulo="Historial"
        descripcion="Tus reservas y sesiones, ordenadas por fecha, de la más reciente a la más antigua."
      />

      <Tabs>
        <Tabs.ListContainer>
          <Tabs.List aria-label="Filtro del historial">
            {pestanas.map((pestana) => (
              <Tabs.Tab key={pestana.id} id={pestana.id}>
                {pestana.etiqueta}
                {pestana.datos.length > 0 ? (
                  <Chip size="sm" variant="soft" className="ml-2 tabular-nums">
                    {pestana.datos.length}
                  </Chip>
                ) : null}
                <Tabs.Indicator />
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.ListContainer>

        {pestanas.map((pestana) => (
          <Tabs.Panel key={pestana.id} id={pestana.id} className="pt-6">
            <TablaHistorial reservas={pestana.datos} vacio={pestana.vacio} />
          </Tabs.Panel>
        ))}
      </Tabs>
    </>
  );
}

const fechaHistorial = new Intl.DateTimeFormat("es-CO", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long", year: "numeric" });

function TablaHistorial({ reservas, vacio }: { reservas: SesionHistorial[]; vacio: string }) {
  if (reservas.length === 0) {
    return (
      <EmptyState className="py-12 text-center">
        <IconoHistorial className="mx-auto size-8 text-[var(--muted)]" />
        <p className="pt-3 text-sm text-[var(--muted)]">{vacio}</p>
      </EmptyState>
    );
  }

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label="Historial de sesiones">
          <Table.Header>
            <Table.Column isRowHeader>Cuándo</Table.Column>
            <Table.Column>Estudiante</Table.Column>
            <Table.Column>Materia</Table.Column>
            <Table.Column>Duración</Table.Column>
            <Table.Column>Estado</Table.Column>
            <Table.Column>Valor</Table.Column>
          </Table.Header>

          <Table.Body>
            {reservas.map((reserva) => (
              <Table.Row key={reserva.id} id={reserva.id}>
                <Table.Cell>
                  <span className="block first-letter:uppercase">
                    {fechaHistorial.format(new Date(`${reserva.inicio.slice(0, 10)}T12:00:00Z`))}
                  </span>
                  <span className="block text-sm text-[var(--muted)] tabular-nums">
                    {reserva.inicio.slice(11, 16)} a {reserva.fin.slice(11, 16)} · Bogotá
                  </span>
                </Table.Cell>

                <Table.Cell>{reserva.estudianteNombre}</Table.Cell>

                <Table.Cell>
                  <span className="block">{reserva.materiaNombre}</span>
                  <span className="block text-sm text-[var(--muted)]">{reserva.nivelNombre}</span>
                </Table.Cell>

                <Table.Cell className="tabular-nums whitespace-nowrap">
                  {reserva.cierre
                    ? `${reserva.cierre.duracionReal} min reales`
                    : `${reserva.duracionMinutos} min`}
                </Table.Cell>

                <Table.Cell>
                  {reserva.estado === "finalizada" && reserva.cierre?.asistio === false ? <Chip color="warning" variant="soft" size="sm">Sin asistencia</Chip> : <ChipEstado estado={reserva.estado} />}
                  {reserva.estado === "finalizada" && !reserva.cierre ? <span className="block text-xs text-[var(--muted)]">Sin registro de asistencia</span> : null}
                </Table.Cell>

                <Table.Cell className="tabular-nums whitespace-nowrap">
                  {precio(reserva.precio)}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}

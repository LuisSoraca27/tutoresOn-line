import Link from "next/link";
import { EmptyState, Table } from "@heroui/react";
import { ChipEstado } from "@/components/reservas/chip-estado";
import type { ReservaVista } from "@/features/reservas/vista";
import { fechaLarga, precio } from "@/lib/formato";

/**
 * Listado de reservas del estudiante (F6.2, F6.4).
 *
 * La fecha se muestra escrita, no en números: "Viernes, 28 de agosto" se lee
 * de un vistazo y "28/08/2026" hay que descifrarlo.
 *
 * Dos formas para los mismos datos. Una tabla de cinco columnas no cabe en un
 * teléfono: o se desplaza de lado —y el estado y el precio quedan escondidos
 * fuera de la pantalla— o parte cada fecha en tres líneas. Por debajo de `md`
 * cada reserva se dibuja como una ficha apilada, que es la misma información
 * ordenada de arriba abajo en vez de a lo ancho.
 */
export function TablaReservas({
  reservas,
  vacio,
}: {
  reservas: ReservaVista[];
  vacio: string;
}) {
  if (reservas.length === 0) {
    return (
      <EmptyState className="py-12 text-center text-sm text-[var(--muted)]">{vacio}</EmptyState>
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-2.5 md:hidden">
        {reservas.map((reserva) => (
          <li key={reserva.id}>
            <Link
              href={`/estudiante/reservas/${reserva.id}`}
              className="flex flex-col gap-2 rounded-[var(--vidrio-radio)] border border-[var(--border)] p-3.5 outline-none hover:bg-[var(--default-soft)] focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
            >
              <span className="flex items-start justify-between gap-3">
                <span className="min-w-0">
                  <span className="block text-sm font-medium first-letter:uppercase">
                    {fechaLarga(`${reserva.fecha}T00:00`)}
                  </span>
                  <span className="block text-sm text-[var(--muted)] tabular-nums">
                    {reserva.horaInicio} a {reserva.horaFin}
                  </span>
                </span>
                <ChipEstado estado={reserva.estado} />
              </span>

              {/* Una sola línea: el tutor y la materia se recortan si hace
                  falta —el detalle está a un toque— pero el precio nunca se
                  parte ni baja de renglón. */}
              <span className="flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 truncate text-[var(--muted)]">
                  <span className="text-[var(--foreground)]">{reserva.tutorNombre}</span> ·{" "}
                  {reserva.materiaNombre} · {reserva.nivelNombre}
                </span>
                <span className="shrink-0 font-medium tabular-nums">
                  {precio(reserva.precio)}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="hidden md:block">
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Mis reservas">
              <Table.Header>
                <Table.Column isRowHeader>Cuándo</Table.Column>
                <Table.Column>Tutor</Table.Column>
                <Table.Column>Materia</Table.Column>
                <Table.Column>Estado</Table.Column>
                <Table.Column>Precio</Table.Column>
              </Table.Header>

              <Table.Body>
                {reservas.map((reserva) => (
                  <Table.Row key={reserva.id} id={reserva.id}>
                    <Table.Cell>
                      <Link
                        href={`/estudiante/reservas/${reserva.id}`}
                        className="rounded hover:underline focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:outline-none"
                      >
                        <span className="block first-letter:uppercase">
                          {fechaLarga(`${reserva.fecha}T00:00`)}
                        </span>
                        <span className="block text-sm text-[var(--muted)] tabular-nums">
                          {reserva.horaInicio} a {reserva.horaFin}
                        </span>
                      </Link>
                    </Table.Cell>

                    <Table.Cell>{reserva.tutorNombre}</Table.Cell>

                    <Table.Cell>
                      <span className="block">{reserva.materiaNombre}</span>
                      <span className="block text-sm text-[var(--muted)]">
                        {reserva.nivelNombre}
                      </span>
                    </Table.Cell>

                    <Table.Cell>
                      <ChipEstado estado={reserva.estado} />
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
      </div>
    </>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { Button, Chip, EmptyState, Separator, Tabs } from "@heroui/react";
import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";
import { ChipEstado } from "@/components/reservas/chip-estado";
import { IconoCalendario } from "@/components/ui/iconos";
import { catalogosRepo } from "@/features/catalogos";
import { aIsoFecha } from "@/features/disponibilidad/calcular-turnos";
import { reservasRepo } from "@/features/reservas";
import { aVista, porDia, type ReservaVista } from "@/features/reservas/vista";
import { tutorActual } from "@/features/sesion/identidades";
import { tutoresRepo } from "@/features/tutores";
import { fechaLarga, precio } from "@/lib/formato";

export const metadata: Metadata = { title: "Mi agenda" };

/** Datos de una persona concreta: no se prerenderizan en el build. */
export const dynamic = "force-dynamic";

/** Las tres vistas de la agenda son el mismo listado con distinto horizonte. */
const VISTAS = [
  { id: "hoy", etiqueta: "Hoy", dias: 1 },
  { id: "semana", etiqueta: "Esta semana", dias: 7 },
  { id: "mes", etiqueta: "Este mes", dias: 30 },
];

export default async function PaginaAgenda() {
  const tutorId = await tutorActual();

  const [reservas, tutores, materias, niveles] = await Promise.all([
    reservasRepo.deTutor(tutorId),
    tutoresRepo.buscar({ porPagina: 100 }).then((pagina) => pagina.items),
    catalogosRepo.materias(),
    catalogosRepo.niveles(),
  ]);

  const vistas = aVista(reservas, { tutores, materias, niveles });

  // Solo lo que sigue vivo ocupa la agenda: lo rechazado y lo cancelado no.
  const agendadas = vistas.filter(
    (reserva) => reserva.estado === "aceptada" || reserva.estado === "pendiente",
  );

  const hoy = aIsoFecha(new Date());

  return (
    <>
      <EncabezadoPagina
        titulo="Mi agenda"
        descripcion="Tus sesiones confirmadas y las que todavía esperan tu respuesta, en orden."
      />

      {/* Arranca en la semana: "hoy" está vacío casi siempre y sería una
          primera impresión engañosa de una agenda que sí tiene sesiones. */}
      <Tabs defaultSelectedKey="semana">
        <Tabs.ListContainer>
          <Tabs.List aria-label="Horizonte de la agenda">
            {VISTAS.map((vista) => (
              <Tabs.Tab key={vista.id} id={vista.id}>
                {vista.etiqueta}
                <Tabs.Indicator />
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.ListContainer>

        {VISTAS.map((vista) => {
          const limite = new Date();
          limite.setDate(limite.getDate() + vista.dias - 1);
          const hasta = aIsoFecha(limite);

          const delRango = agendadas.filter(
            (reserva) => reserva.fecha >= hoy && reserva.fecha <= hasta,
          );

          return (
            <Tabs.Panel key={vista.id} id={vista.id} className="pt-6">
              <ListaAgenda sesiones={delRango} etiqueta={vista.etiqueta.toLowerCase()} hoy={hoy} />
            </Tabs.Panel>
          );
        })}
      </Tabs>
    </>
  );
}

function ListaAgenda({
  sesiones,
  etiqueta,
  hoy,
}: {
  sesiones: ReservaVista[];
  etiqueta: string;
  hoy: string;
}) {
  if (sesiones.length === 0) {
    return (
      <EmptyState className="py-12 text-center">
        <IconoCalendario className="mx-auto size-8 text-[var(--muted)]" />
        <p className="pt-3 text-sm text-[var(--muted)]">
          No tienes sesiones para {etiqueta}.
        </p>
      </EmptyState>
    );
  }

  const dias = porDia(sesiones);
  const horas = sesiones.reduce((total, sesion) => total + sesion.duracionMinutos, 0) / 60;
  const ingresos = sesiones.reduce((total, sesion) => total + sesion.precio, 0);

  return (
    <>
      <p className="pb-5 text-sm text-[var(--muted)]">
        <span className="font-medium text-[var(--foreground)] tabular-nums">
          {sesiones.length}
        </span>{" "}
        {sesiones.length === 1 ? "sesión" : "sesiones"} ·{" "}
        <span className="tabular-nums">
          {horas.toLocaleString("es-CO", { maximumFractionDigits: 1 })} h
        </span>{" "}
        · <span className="tabular-nums">{precio(ingresos)}</span>
      </p>

      <div className="flex flex-col gap-6">
        {dias.map((dia) => (
          <section key={dia.fecha}>
            <div className="flex items-center gap-3 pb-3">
              <h3 className="text-sm font-medium first-letter:uppercase">
                {fechaLarga(`${dia.fecha}T00:00`)}
              </h3>
              {dia.fecha === hoy ? (
                <Chip size="sm" color="accent" variant="soft">
                  Hoy
                </Chip>
              ) : null}
            </div>

            <div className="flex flex-col rounded-xl border border-[var(--border)]">
              {dia.sesiones.map((sesion, indice) => (
                <div key={sesion.id}>
                  {indice > 0 ? <Separator /> : null}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
                    <span className="w-28 shrink-0 text-sm tabular-nums">
                      {sesion.horaInicio} – {sesion.horaFin}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{sesion.estudianteNombre}</span>
                      <span className="block truncate text-sm text-[var(--muted)]">
                        {sesion.materiaNombre} · {sesion.nivelNombre} ·{" "}
                        {sesion.modalidad === "virtual" ? "Virtual" : "Presencial"}
                      </span>
                    </span>

                    <ChipEstado estado={sesion.estado} />

                    <span className="text-sm tabular-nums">{precio(sesion.precio)}</span>

                    {sesion.estado === "aceptada" ? (
                      <span className="flex w-full flex-wrap gap-2 sm:w-auto">
                        <Button variant="outline" size="sm">
                          <Link href={`/sesion/${sesion.id}`}>Entrar</Link>
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Link href={`/sesion/${sesion.id}/cierre`}>Cerrar</Link>
                        </Button>
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

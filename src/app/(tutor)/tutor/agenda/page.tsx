import Link from "next/link";
import type { Metadata } from "next";
import { Button, Chip, EmptyState, Separator, Tabs } from "@heroui/react";
import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";
import { ChipEstado } from "@/components/reservas/chip-estado";
import { IconoCalendario } from "@/components/ui/iconos";
import { exigirUsuario } from "@/features/auth/sesion";
import { consultarAgenda, type SesionAgenda } from "@/features/agenda/agenda";
import { precio } from "@/lib/formato";

export const metadata: Metadata = { title: "Mi agenda" };
export const dynamic = "force-dynamic";

const fechaColombia = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota", year: "numeric", month: "2-digit", day: "2-digit" });
const fechaTitulo = new Intl.DateTimeFormat("es-CO", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long" });
const sumarDias = (fecha: string, dias: number) => {
  const d = new Date(`${fecha}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
};

export default async function PaginaAgenda() {
  await exigirUsuario("tutor");
  const hoy = fechaColombia.format(new Date());
  const diaSemana = new Date(`${hoy}T00:00:00Z`).getUTCDay();
  const lunes = sumarDias(hoy, -((diaSemana + 6) % 7));
  const mesInicio = `${hoy.slice(0, 7)}-01`;
  const primeroMesSiguiente = new Date(`${mesInicio}T00:00:00Z`);
  primeroMesSiguiente.setUTCMonth(primeroMesSiguiente.getUTCMonth() + 1);
  const mesFin = sumarDias(primeroMesSiguiente.toISOString().slice(0, 10), -1);
  const [hoyItems, semanaItems, mesItems] = await Promise.all([
    consultarAgenda(hoy, hoy), consultarAgenda(lunes, sumarDias(lunes, 6)), consultarAgenda(mesInicio, mesFin),
  ]);
  const vistas = [
    { id: "hoy", etiqueta: "Hoy", items: hoyItems },
    { id: "semana", etiqueta: "Esta semana", items: semanaItems },
    { id: "mes", etiqueta: "Este mes", items: mesItems },
  ];
  return <>
    <EncabezadoPagina titulo="Mi agenda" descripcion="Tus solicitudes pendientes y sesiones confirmadas, en hora de Bogotá." />
    <Tabs defaultSelectedKey="semana">
      <Tabs.ListContainer><Tabs.List aria-label="Período de la agenda">
        {vistas.map((v) => <Tabs.Tab key={v.id} id={v.id}>{v.etiqueta}<Tabs.Indicator /></Tabs.Tab>)}
      </Tabs.List></Tabs.ListContainer>
      {vistas.map((v) => <Tabs.Panel key={v.id} id={v.id} className="pt-6"><ListaAgenda sesiones={v.items} etiqueta={v.etiqueta.toLowerCase()} hoy={hoy} /></Tabs.Panel>)}
    </Tabs>
  </>;
}

function ListaAgenda({ sesiones, etiqueta, hoy }: { sesiones: SesionAgenda[]; etiqueta: string; hoy: string }) {
  if (!sesiones.length) return <EmptyState className="py-12 text-center">
    <IconoCalendario className="mx-auto size-8 text-[var(--muted)]" />
    <p className="pt-3 text-sm text-[var(--muted)]">No tienes sesiones para {etiqueta}.</p>
  </EmptyState>;
  const porDia = new Map<string, SesionAgenda[]>();
  for (const sesion of sesiones) {
    const dia = sesion.inicio.slice(0, 10);
    porDia.set(dia, [...(porDia.get(dia) ?? []), sesion]);
  }
  const horas = sesiones.reduce((total, sesion) => total + sesion.duracionMinutos, 0) / 60;
  const valor = sesiones.reduce((total, sesion) => total + sesion.precio, 0);
  return <>
    <p className="pb-5 text-sm text-[var(--muted)]">{sesiones.length} {sesiones.length === 1 ? "sesión" : "sesiones"} · {horas.toLocaleString("es-CO", { maximumFractionDigits: 1 })} h · Valor programado: {precio(valor)}</p>
    <div className="flex flex-col gap-6">{[...porDia].map(([fecha, items]) => <section key={fecha}>
      <div className="flex items-center gap-3 pb-3"><h3 className="text-sm font-medium first-letter:uppercase">{fechaTitulo.format(new Date(`${fecha}T12:00:00Z`))}</h3>{fecha === hoy ? <Chip size="sm" color="accent" variant="soft">Hoy</Chip> : null}</div>
      <div className="flex flex-col rounded-xl border border-[var(--border)]">{items.map((sesion, indice) => <div key={sesion.id}>
        {indice > 0 ? <Separator /> : null}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
          <span className="w-28 shrink-0 text-sm tabular-nums">{sesion.inicio.slice(11, 16)} – {sesion.fin.slice(11, 16)}</span>
          <span className="min-w-0 flex-1"><span className="block truncate font-medium">{sesion.estudianteNombre}</span><span className="block truncate text-sm text-[var(--muted)]">{sesion.materiaNombre} · {sesion.nivelNombre} · {sesion.modalidad === "virtual" ? "Virtual" : "Presencial"}</span>{sesion.lugar ? <span className="block text-sm text-[var(--muted)]">Punto de encuentro: {sesion.lugar}</span> : null}</span>
          <ChipEstado estado={sesion.estado} /><span className="text-sm tabular-nums">{precio(sesion.precio)}</span>
          {sesion.estado === "pendiente" ? <Button variant="outline" size="sm"><Link href="/tutor/solicitudes">Responder</Link></Button> : null}
        </div>
      </div>)}</div>
    </section>)}</div>
  </>;
}

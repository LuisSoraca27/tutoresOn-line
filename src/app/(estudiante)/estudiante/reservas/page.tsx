import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "@heroui/react";
import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";
import { ChipEstado } from "@/components/reservas/chip-estado";
import { exigirUsuario } from "@/features/auth/sesion";
import { misReservas } from "@/features/reservas/reales";
import { precio } from "@/lib/formato";
import { FormularioResena } from "@/components/resenas/formulario-resena";
import { CancelarReservaReal } from "@/components/reservas/cancelar-reserva-real";
import { ReprogramarReserva } from "@/components/reservas/reprogramar-reserva";

export const metadata: Metadata = { title: "Mis reservas" };
export const dynamic = "force-dynamic";

export default async function PaginaReservas() {
  const usuario = await exigirUsuario("estudiante");
  const reservas = await misReservas();
  return <>
    <EncabezadoPagina titulo="Mis reservas" descripcion="Consulta el estado de tus solicitudes y sesiones." />
    {reservas.length === 0 ? <p className="text-sm text-[var(--muted)]">Todavía no tienes reservas. <Link className="underline" href="/buscar">Busca un tutor</Link>.</p> :
      <div className="flex flex-col gap-4">{reservas.map((r) => <Card key={r.id}>
        <Card.Header><Card.Title>{r.tutorNombre}</Card.Title><Card.Description>{r.materiaNombre} · {r.nivelNombre}</Card.Description></Card.Header>
        <Card.Content className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <span>{r.inicio.slice(0, 10)} · {r.inicio.slice(11, 16)}–{r.fin.slice(11, 16)} (hora de Bogotá)</span>
          <span>{r.modalidad === "virtual" ? "Virtual" : "Presencial"}</span><span>{precio(r.precio)}</span><ChipEstado estado={r.estado} />
          {r.motivoRechazo ? <p className="w-full">Motivo: {r.motivoRechazo}</p> : null}
          {r.puedeModificar ? <div className="w-full"><CancelarReservaReal id={r.id} /><ReprogramarReserva reserva={r} /></div> : null}
          {r.puedeResenar ? <div className="w-full pt-3"><FormularioResena reservaId={r.id} estudianteId={usuario.id} tutor={r.tutorNombre} /></div> : null}
        </Card.Content>
      </Card>)}</div>}
  </>;
}

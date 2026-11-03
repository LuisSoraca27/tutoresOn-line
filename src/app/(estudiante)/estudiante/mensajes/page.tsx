import type { Metadata } from "next";
import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";
import { BandejaMensajes } from "@/components/mensajes/bandeja-mensajes";
import { exigirUsuario } from "@/features/auth/sesion";
import { contactosReales } from "@/features/mensajes/reales";

export const metadata: Metadata = { title: "Mensajes" };
export const dynamic = "force-dynamic";
export default async function MensajesEstudiante() {
  const usuario = await exigirUsuario("estudiante");
  const contactos = await contactosReales();
  return <><EncabezadoPagina titulo="Mensajes" descripcion="Habla con los tutores con quienes tienes una reserva." /><BandejaMensajes usuarioId={usuario.id} contactos={contactos} /><p className="pt-5 text-xs text-[var(--muted)]">La conversación se actualiza cada cinco segundos. Shift + Enter agrega una línea.</p></>;
}

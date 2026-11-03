import type { Metadata } from "next";
import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";
import { BandejaMensajes } from "@/components/mensajes/bandeja-mensajes";
import { exigirUsuario } from "@/features/auth/sesion";
import { contactosReales } from "@/features/mensajes/reales";

export const metadata: Metadata = { title: "Mensajes" };
export const dynamic = "force-dynamic";
export default async function MensajesTutor() {
  const usuario = await exigirUsuario("tutor");
  const contactos = await contactosReales();
  return <><EncabezadoPagina titulo="Mensajes" descripcion="Habla con tus estudiantes para acordar detalles de sus tutorías." /><BandejaMensajes usuarioId={usuario.id} contactos={contactos} /></>;
}

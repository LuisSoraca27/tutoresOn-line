import type { Metadata } from "next";
import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";
import {
  BandejaMensajes,
  type Contacto,
} from "@/components/mensajes/bandeja-mensajes";
import { exigirUsuario } from "@/features/auth/sesion";
import { authRepo } from "@/features/auth";
import { reservasRepo } from "@/features/reservas";
import { catalogosRepo } from "@/features/catalogos";
import { nombreEstudiante } from "@/mocks/estudiantes";
export const metadata: Metadata = { title: "Mensajes" };
export const dynamic = "force-dynamic";
export default async function MensajesTutor() {
  const usuario = await exigirUsuario("tutor");
  const [reservas, materias] = await Promise.all([
    reservasRepo.deTutor(usuario.id),
    catalogosRepo.materias(),
  ]);
  const recientes = [...reservas].sort((a, b) =>
    b.inicio.localeCompare(a.inicio),
  );
  const porEstudiante = new Map<string, (typeof reservas)[number]>();
  for (const reserva of recientes)
    if (!porEstudiante.has(reserva.estudianteId))
      porEstudiante.set(reserva.estudianteId, reserva);
  const contactos: Contacto[] = await Promise.all(
    [...porEstudiante.values()].map(async (reserva) => ({
      tutorId: usuario.id,
      estudianteId: reserva.estudianteId,
      nombre:
        (await authRepo.porId(reserva.estudianteId))?.nombre ??
        nombreEstudiante(reserva.estudianteId),
      titulo: "Estudiante",
      motivo: `${materias.find((materia) => materia.id === reserva.materiaId)?.nombre ?? reserva.materiaId} · ${reserva.inicio.slice(0, 10)}`,
    })),
  );
  return (
    <>
      <EncabezadoPagina
        titulo="Mensajes"
        descripcion="Habla con tus estudiantes para acordar detalles de sus tutorías."
      />
      <BandejaMensajes usuarioId={usuario.id} contactos={contactos} />
    </>
  );
}

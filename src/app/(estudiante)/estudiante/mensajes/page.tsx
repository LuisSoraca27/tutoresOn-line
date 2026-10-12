import type { Metadata } from "next";
import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";
import { BandejaMensajes, type Contacto } from "@/components/mensajes/bandeja-mensajes";
import { catalogosRepo } from "@/features/catalogos";
import { reservasRepo } from "@/features/reservas";
import { aVista } from "@/features/reservas/vista";
import { estudianteActual } from "@/features/sesion/identidades";
import { tutoresRepo } from "@/features/tutores";
import { fechaLarga } from "@/lib/formato";

export const metadata: Metadata = { title: "Mensajes" };

/** Datos de una persona concreta: no se prerenderizan. */
export const dynamic = "force-dynamic";

export default async function PaginaMensajes() {
  const estudianteId = await estudianteActual();

  const [reservas, tutores, materias, niveles] = await Promise.all([
    reservasRepo.deEstudiante(estudianteId),
    tutoresRepo.buscar({ porPagina: 100 }).then((pagina) => pagina.items),
    catalogosRepo.materias(),
    catalogosRepo.niveles(),
  ]);

  const vistas = aVista(reservas, { tutores, materias, niveles }).sort((a, b) =>
    b.inicio.localeCompare(a.inicio),
  );

  // Un contacto por tutor con el que hay historia, con la sesión más reciente
  // como referencia de por qué aparece.
  const porTutor = new Map<string, Contacto>();

  for (const reserva of vistas) {
    if (porTutor.has(reserva.tutorId)) continue;

    const tutor = tutores.find((candidato) => candidato.id === reserva.tutorId);
    if (!tutor) continue;

    porTutor.set(reserva.tutorId, {
      tutorId: tutor.id,
      estudianteId,
      nombre: tutor.nombre,
      titulo: tutor.titulo,
      motivo: `${reserva.materiaNombre} · ${fechaLarga(`${reserva.fecha}T00:00`)}`,
    });
  }

  return (
    <>
      <EncabezadoPagina
        titulo="Mensajes"
        descripcion="Habla con los tutores con los que ya tienes una reserva, para acordar detalles antes de la clase."
      />

      <BandejaMensajes usuarioId={estudianteId} contactos={[...porTutor.values()]} />

      <p className="pt-5 text-xs text-[var(--muted)]">
        La conversación se actualiza automáticamente cada cinco segundos. Shift + Enter agrega una línea.
      </p>
    </>
  );
}

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";
import { FormularioCierre } from "@/components/sesion/formulario-cierre";
import { reservasRepo } from "@/features/reservas";
import { exigirUsuario } from "@/features/auth/sesion";
import { nombreEstudiante } from "@/mocks/estudiantes";

export const metadata: Metadata = { title: "Cerrar la sesión" };

/** Datos de una sesión concreta: no se prerenderiza. */
export const dynamic = "force-dynamic";

export default async function CierreSesion({ params }: { params: Promise<{ id: string }> }) {
  const tutorId = (await exigirUsuario("tutor")).id;

  const { id } = await params;
  const reserva = await reservasRepo.obtener(id);

  // Solo el tutor cierra su propia sesión.
  if (!reserva || reserva.tutorId !== tutorId) notFound();

  return (
    <div className="mx-auto w-full max-w-xl">
      <EncabezadoPagina
        titulo="Cerrar la sesión"
        descripcion="Registra qué pasó de verdad. Es lo que cuenta para tus ingresos y lo que habilita la reseña del estudiante."
      />

      <FormularioCierre
        reservaId={reserva.id}
        estudiante={nombreEstudiante(reserva.estudianteId)}
        duracionPrevista={reserva.duracionMinutos}
      />
    </div>
  );
}

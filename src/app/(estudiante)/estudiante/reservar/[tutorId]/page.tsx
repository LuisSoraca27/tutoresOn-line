import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Avatar, Chip } from "@heroui/react";
import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";
import { AsistenteReserva } from "@/components/reservas/asistente-reserva";
import { Estrellas } from "@/components/ui/estrellas";
import { catalogosRepo } from "@/features/catalogos";
import { disponibilidadRepo } from "@/features/disponibilidad";
import { estudianteActual } from "@/features/sesion/identidades";
import { tutoresRepo } from "@/features/tutores";
import { iniciales } from "@/lib/texto";

export const metadata: Metadata = { title: "Reservar una sesión" };

export default async function PaginaReserva({
  params,
}: {
  params: Promise<{ tutorId: string }>;
}) {
  const estudianteId = await estudianteActual();

  const { tutorId } = await params;

  const [tutor, materias, niveles, ciudades, disponibilidad] = await Promise.all([
    tutoresRepo.obtener(tutorId),
    catalogosRepo.materias(),
    catalogosRepo.niveles(),
    catalogosRepo.ciudades(),
    disponibilidadRepo.obtener(tutorId),
  ]);

  if (!tutor) notFound();

  const ciudad = tutor.ciudadId
    ? ciudades.find((candidata) => candidata.id === tutor.ciudadId)?.nombre
    : undefined;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <EncabezadoPagina
        titulo="Reservar una sesión"
        descripcion="Tres pasos: qué necesitas, cuándo puedes y confirmar. La reserva queda pendiente hasta que el tutor la acepte."
      />

      <div className="mb-6 flex items-center gap-3 rounded-xl border border-[var(--border)] p-4">
        <Avatar size="md" className="shrink-0">
          <Avatar.Fallback>{iniciales(tutor.nombre)}</Avatar.Fallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <Link
            href={`/tutores/${tutor.id}`}
            className="rounded font-medium hover:underline focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:outline-none"
          >
            {tutor.nombre}
          </Link>
          <p className="truncate text-sm text-[var(--muted)]">{tutor.titulo}</p>
        </div>

        <div className="hidden sm:block">
          <Estrellas valor={tutor.reputacion.promedio} total={tutor.reputacion.total} />
        </div>

        {tutor.disponibleAhora ? (
          <Chip size="sm" color="success" variant="soft">
            En línea
          </Chip>
        ) : null}
      </div>

      <AsistenteReserva
        tutor={tutor}
        materias={materias}
        niveles={niveles}
        duraciones={disponibilidad.reglas.duraciones}
        estudianteId={estudianteId}
        ciudad={ciudad}
        puedeReservar
      />
    </div>
  );
}

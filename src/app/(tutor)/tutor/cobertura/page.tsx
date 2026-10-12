import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";
import { EditorCobertura } from "@/components/tutor/editor-cobertura";
import { catalogosRepo } from "@/features/catalogos";
import { tutorActual } from "@/features/sesion/identidades";
import { tutoresRepo } from "@/features/tutores";

export const metadata: Metadata = { title: "Cobertura" };

/** Perfil de una persona concreta: no se prerenderiza. */
export const dynamic = "force-dynamic";

export default async function PaginaCobertura() {
  const tutorId = await tutorActual();

  const [tutor, ciudades] = await Promise.all([
    tutoresRepo.obtener(tutorId),
    catalogosRepo.ciudades(),
  ]);

  if (!tutor) notFound();

  return (
    <>
      <EncabezadoPagina
        titulo="Cobertura"
        descripcion="Si atiendes en persona, hasta dónde te desplazas. Es lo que usa el filtro de ciudad de la búsqueda."
      />

      <EditorCobertura
        tutorId={tutor.id}
        modalidadInicial={tutor.modalidad}
        ciudadInicial={tutor.ciudadId}
        radioInicial={tutor.radioKm}
        ciudades={ciudades}
      />
    </>
  );
}

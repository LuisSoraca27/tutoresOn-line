import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";
import { EditorMateriasTutor } from "@/components/tutor/editor-materias-tutor";
import { catalogosPublicosRepo as catalogosRepo } from "@/features/catalogos/publicos";
import { exigirUsuario } from "@/features/auth/sesion";
import { tutoresPublicosRepo as tutoresRepo } from "@/features/tutores/publicos";

export const metadata: Metadata = { title: "Materias y tarifas" };

/** Perfil de una persona concreta: no se prerenderiza. */
export const dynamic = "force-dynamic";

export default async function PaginaMaterias() {
  const tutorId = (await exigirUsuario("tutor")).id;

  const [tutor, catalogo, niveles] = await Promise.all([
    tutoresRepo.obtener(tutorId),
    catalogosRepo.materias(),
    catalogosRepo.niveles(),
  ]);

  if (!tutor) notFound();

  return (
    <>
      <EncabezadoPagina
        titulo="Materias y tarifas"
        descripcion="Determina en qué búsquedas apareces y cuánto cuesta cada sesión. El precio de una reserva sale de aquí."
      />

      <EditorMateriasTutor
        tutorId={tutor.id}
        materiasIniciales={tutor.materias}
        catalogo={catalogo}
        niveles={niveles}
      />
    </>
  );
}

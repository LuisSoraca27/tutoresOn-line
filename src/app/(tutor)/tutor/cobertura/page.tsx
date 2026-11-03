import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";
import { EditorCobertura } from "@/components/tutor/editor-cobertura";
import { catalogosPublicosRepo as catalogosRepo } from "@/features/catalogos/publicos";
import { exigirUsuario } from "@/features/auth/sesion";
import { tutoresPublicosRepo as tutoresRepo } from "@/features/tutores/publicos";

export const metadata: Metadata = { title: "Cobertura" };

/** Perfil de una persona concreta: no se prerenderiza. */
export const dynamic = "force-dynamic";

export default async function PaginaCobertura() {
  const tutorId = (await exigirUsuario("tutor")).id;

  const [tutor, ciudades] = await Promise.all([
    tutoresRepo.obtener(tutorId),
    catalogosRepo.ciudades(),
  ]);

  if (!tutor) notFound();

  return (
    <>
      <EncabezadoPagina
        titulo="Cobertura"
        descripcion="Elige tu modalidad y, si atiendes en persona, la ciudad y la distancia que estás dispuesto a recorrer."
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

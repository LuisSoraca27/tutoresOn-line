import type { Metadata } from "next";
import { EditorHorario } from "@/components/disponibilidad/editor-horario";
import { ExcepcionesCalendario } from "@/components/disponibilidad/excepciones-calendario";
import { ReglasAgendaFormulario } from "@/components/disponibilidad/reglas-agenda";
import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";
import { disponibilidadRepo } from "@/features/disponibilidad";
import { tutorActual } from "@/features/sesion/identidades";

export const metadata: Metadata = { title: "Mi disponibilidad" };
/**
 * Datos de una persona concreta: no se pueden prerenderizar en el build.
 * Cuando entre la sesión real, la cookie hará esto automático, pero
 * mientras tanto hay que decirlo explícitamente.
 */
export const dynamic = "force-dynamic";


export default async function PaginaDisponibilidad() {
  const tutorId = await tutorActual();

  const disponibilidad = await disponibilidadRepo.obtener(tutorId);

  return (
    <>
      <EncabezadoPagina
        titulo="Mi disponibilidad"
        descripcion="Lo que definas aquí es exactamente lo que el estudiante puede reservar. Primero el horario que se repite cada semana, después las reglas de tus sesiones y por último los días sueltos que bloqueas."
      />

      <div className="flex flex-col gap-5">
        <EditorHorario tutorId={tutorId} bloquesIniciales={disponibilidad.bloques} />
        <ReglasAgendaFormulario tutorId={tutorId} reglasIniciales={disponibilidad.reglas} />
        <ExcepcionesCalendario
          tutorId={tutorId}
          excepcionesIniciales={disponibilidad.excepciones}
        />
      </div>
    </>
  );
}

import type { Metadata } from "next";
import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";
import { BuscadorExpress } from "@/components/express/buscador-express";
import { catalogosPublicosRepo as catalogosRepo } from "@/features/catalogos/publicos";
import { exigirUsuario } from "@/features/auth/sesion";
import { solicitudActiva } from "@/features/express/acciones";

export const metadata: Metadata = { title: "Tutor ahora" };

/** Depende de quién consulta y del reloj: nunca se prerenderiza. */
export const dynamic = "force-dynamic";

export default async function PaginaAhora() {
  const estudianteId = (await exigirUsuario("estudiante")).id;

  const [materias, niveles, activa] = await Promise.all([
    catalogosRepo.materias(),
    catalogosRepo.niveles(),
    solicitudActiva(),
  ]);

  return (
    <div className="mx-auto w-full max-w-xl">
      <EncabezadoPagina
        titulo="Necesito un tutor ahora"
        descripcion="Como pedir un carro: lanzas la solicitud, los tutores conectados la ven y el primero que responda empieza contigo en minutos."
      />

      <BuscadorExpress
        estudianteId={estudianteId}
        materias={materias}
        niveles={niveles}
        solicitudInicial={activa}
      />

    </div>
  );
}

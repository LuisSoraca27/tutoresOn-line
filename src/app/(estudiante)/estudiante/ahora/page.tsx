import type { Metadata } from "next";
import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";
import { BuscadorExpress } from "@/components/express/buscador-express";
import { catalogosRepo } from "@/features/catalogos";
import { estudianteActual } from "@/features/sesion/identidades";

export const metadata: Metadata = { title: "Tutor ahora" };

/** Depende de quién consulta y del reloj: nunca se prerenderiza. */
export const dynamic = "force-dynamic";

export default async function PaginaAhora() {
  const estudianteId = await estudianteActual();

  const [materias, niveles] = await Promise.all([
    catalogosRepo.materias(),
    catalogosRepo.niveles(),
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
      />

      <p className="pt-5 text-xs text-[var(--muted)]">
        El estado se consulta cada pocos segundos. Con FastAPI será un WebSocket: cambia el
        transporte, no esta pantalla.
      </p>
    </div>
  );
}

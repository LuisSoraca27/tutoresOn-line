import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AsistenteRegistroTutor } from "@/components/auth/asistente-registro-tutor";
import { catalogosRepo } from "@/features/catalogos";
import { usuarioActual } from "@/features/auth/sesion";
import { INICIO_POR_ROL } from "@/config/sitio";

export const metadata: Metadata = { title: "Registrarme como tutor" };

export default async function PaginaRegistroTutor() {
  const usuario = await usuarioActual();
  if (usuario) redirect(INICIO_POR_ROL[usuario.rol]);

  const [materias, niveles, ciudades] = await Promise.all([
    catalogosRepo.materias(),
    catalogosRepo.niveles(),
    catalogosRepo.ciudades(),
  ]);

  return (
    <div className="w-full max-w-2xl">
      <AsistenteRegistroTutor materias={materias} niveles={niveles} ciudades={ciudades} />
    </div>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FormularioRegistroEstudiante } from "@/components/auth/formulario-registro-estudiante";
import { catalogosRepo } from "@/features/catalogos";
import { usuarioActual } from "@/features/auth/sesion";
import { INICIO_POR_ROL } from "@/config/sitio";

export const metadata: Metadata = { title: "Crear cuenta de estudiante" };

export default async function PaginaRegistroEstudiante() {
  const usuario = await usuarioActual();
  if (usuario) redirect(INICIO_POR_ROL[usuario.rol]);

  const [niveles, ciudades] = await Promise.all([
    catalogosRepo.niveles(),
    catalogosRepo.ciudades(),
  ]);

  return (
    <div className="w-full max-w-xl">
      <FormularioRegistroEstudiante niveles={niveles} ciudades={ciudades} />
    </div>
  );
}

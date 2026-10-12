import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FormularioLogin } from "@/components/auth/formulario-login";
import { usuarioActual } from "@/features/auth/sesion";
import { INICIO_POR_ROL } from "@/config/sitio";

export const metadata: Metadata = { title: "Entrar" };

export default async function PaginaLogin({
  searchParams,
}: {
  searchParams: Promise<{ siguiente?: string }>;
}) {
  // Con sesión abierta esta pantalla no tiene sentido: al panel.
  const usuario = await usuarioActual();
  if (usuario) redirect(INICIO_POR_ROL[usuario.rol]);

  const { siguiente } = await searchParams;

  // Solo rutas internas: un `siguiente` con host ajeno convertiría el login
  // en un redirector abierto hacia sitios de phishing.
  const destino = siguiente?.startsWith("/") && !siguiente.startsWith("//") ? siguiente : undefined;

  return (
    <div className="w-full max-w-md">
      <FormularioLogin siguiente={destino} />
    </div>
  );
}

import { BarraSuperior } from "@/components/layout/barra-superior";
import { exigirUsuario } from "@/features/auth/sesion";

/**
 * La sala de la sesión la usan el estudiante y el tutor, así que no puede
 * vivir bajo el marco de ninguno de los dos: sin menú lateral, solo la barra
 * superior y la sesión en el centro.
 *
 * Exige sesión sin exigir rol: quién puede entrar a una sala concreta lo
 * decide la propia página comparando los participantes de la reserva.
 */
export default async function DisposicionSesion({ children }: { children: React.ReactNode }) {
  await exigirUsuario();

  return (
    <div className="flex min-h-full flex-col">
      <BarraSuperior />
      <main className="flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

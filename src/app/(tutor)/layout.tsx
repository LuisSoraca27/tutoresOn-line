import { MarcoPanel } from "@/components/layout/marco-panel";
import { exigirUsuario } from "@/features/auth/sesion";

/**
 * Puerta del panel de tutor.
 *
 * El `proxy` ya redirigió a quien no tuviera la cookie, pero esa
 * comprobación se puede saltar y esta no: un componente de servidor corre
 * siempre, y aquí se confirma contra el repositorio que la cuenta existe
 * y que el rol es el correcto (F1.7, F1.8).
 */
export default async function DisposicionPanel({ children }: { children: React.ReactNode }) {
  await exigirUsuario("tutor");

  return <MarcoPanel rol="tutor">{children}</MarcoPanel>;
}

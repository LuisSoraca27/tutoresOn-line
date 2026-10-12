import type { Metadata } from "next";
import { FormularioRecuperacion } from "@/components/auth/formulario-recuperacion";
import { env } from "@/lib/env";
export const metadata: Metadata = { title: "Recuperar cuenta" };
export default function RecuperarCuenta() {
  return (
    <div className="w-full max-w-md">
      <FormularioRecuperacion simulado={env.usarDatosSimulados} />
    </div>
  );
}

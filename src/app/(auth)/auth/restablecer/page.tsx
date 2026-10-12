import type { Metadata } from "next";
import Link from "next/link";
import { FormularioRecuperacion } from "@/components/auth/formulario-recuperacion";
import { env } from "@/lib/env";
export const metadata: Metadata = {
  title: "Restablecer contraseña",
  referrer: "no-referrer",
};
export default async function RestablecerCuenta({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (typeof token !== "string" || !token || token.length > 512)
    return (
      <div>
        <h1 className="titulo text-2xl">Necesitas un enlace válido</h1>
        <Link href="/auth/recuperar" className="mt-4 block underline">
          Solicitar recuperación de cuenta
        </Link>
      </div>
    );
  return (
    <div className="w-full max-w-md">
      <FormularioRecuperacion token={token} simulado={env.usarDatosSimulados} />
    </div>
  );
}

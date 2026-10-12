import Link from "next/link";
import { Button } from "@heroui/react";
import { Logo } from "@/components/ui/logo";

export default function NoEncontrada() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo />
      <div>
        <p className="titulo text-5xl">404</p>
        <h1 className="titulo mt-3 text-xl">Esta página no existe</h1>
        <p className="mt-2 max-w-[46ch] text-sm text-[var(--muted)]">
          Revisa la dirección o vuelve al inicio para encontrar la sección que buscas.
        </p>
      </div>
      <Button variant="primary">
        <Link href="/">Volver al inicio</Link>
      </Button>
    </div>
  );
}

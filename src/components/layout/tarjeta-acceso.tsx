import Link from "next/link";
import { Card } from "@heroui/react";

/** Resumen de una sección disponible y acceso directo a su flujo. */
export function TarjetaAcceso({
  titulo,
  descripcion,
  href,
  accion,
}: {
  titulo: string;
  descripcion: string;
  href: string;
  accion: string;
}) {
  return (
    <Card>
      <Card.Header>
        <Card.Title className="text-base">{titulo}</Card.Title>
        <Card.Description>{descripcion}</Card.Description>
      </Card.Header>
      <Card.Footer>
        <Link
          href={href}
          className="rounded text-sm font-medium text-[var(--accent)] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-[var(--focus)]"
        >
          {accion}
        </Link>
      </Card.Footer>
    </Card>
  );
}

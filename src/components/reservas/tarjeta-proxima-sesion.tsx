import Link from "next/link";
import { Avatar, Button, Card, Separator } from "@heroui/react";
import { ChipEstado } from "@/components/reservas/chip-estado";
import type { Reserva } from "@/features/reservas";
import { fechaLarga, precio } from "@/lib/formato";
import { iniciales } from "@/lib/texto";

/**
 * Próxima sesión del estudiante (parte de F6.1).
 *
 * El acceso a la sala aparece en cuanto el tutor confirma la reserva.
 */
export function TarjetaProximaSesion({
  reserva,
  tutor,
  materia,
}: {
  reserva: Reserva;
  tutor: { id: string; nombre: string; titulo: string };
  materia: string;
}) {
  const fecha = reserva.inicio.slice(0, 10);
  const horaInicio = reserva.inicio.slice(11, 16);
  const horaFin = reserva.fin.slice(11, 16);

  return (
    <Card>
      <Card.Header className="flex flex-row items-start gap-3">
        <Avatar size="md" className="shrink-0">
          <Avatar.Fallback>{iniciales(tutor.nombre)}</Avatar.Fallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <Card.Title className="text-base">
            <Link href={`/tutores/${tutor.id}`} className="rounded hover:underline">
              {tutor.nombre}
            </Link>
          </Card.Title>
          <Card.Description className="truncate">{materia}</Card.Description>
        </div>

        <ChipEstado estado={reserva.estado} />
      </Card.Header>

      <Card.Content>
        <p className="text-lg first-letter:uppercase">{fechaLarga(`${fecha}T00:00`)}</p>
        <p className="text-[var(--muted)] tabular-nums">
          {horaInicio} a {horaFin} ·{" "}
          {reserva.modalidad === "virtual" ? "Virtual, por videollamada" : "Presencial"}
        </p>

        {reserva.lugar ? (
          <p className="pt-1 text-sm text-[var(--muted)]">Punto de encuentro: {reserva.lugar}</p>
        ) : null}

        <Separator className="my-4" />

        <div className="flex items-baseline justify-between gap-3 text-sm">
          <span className="text-[var(--muted)]">Código {reserva.id}</span>
          <span className="font-medium tabular-nums">{precio(reserva.precio)}</span>
        </div>
      </Card.Content>

      <Card.Footer className="flex flex-wrap gap-3 border-t border-[var(--border)] pt-4">
        {reserva.estado === "aceptada" || reserva.estado === "en-curso" ? (
          <Button variant="primary" size="sm">
            <Link href={`/sesion/${reserva.id}`}>Entrar a la sesión</Link>
          </Button>
        ) : null}
        <Button variant="outline" size="sm">
          <Link href={`/estudiante/reservas/${reserva.id}`}>Ver reserva</Link>
        </Button>
      </Card.Footer>
    </Card>
  );
}

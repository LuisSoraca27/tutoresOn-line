"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button } from "@heroui/react";
import { SelectorTurno } from "./selector-turno";
import { reprogramarReserva } from "@/features/reservas/acciones";
import type { Reserva } from "@/features/reservas";
import type { Turno } from "@/features/disponibilidad";
import { fechaLarga } from "@/lib/formato";

export function ReprogramarReserva({ reserva }: { reserva: Reserva }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [turno, setTurno] = useState<Turno | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, iniciar] = useTransition();
  return (
    <section className="pt-6">
      <Button
        variant="outline"
        aria-expanded={abierto}
        onPress={() => setAbierto(!abierto)}
        isDisabled={guardando}
      >
        {abierto ? "Mantener horario actual" : "Reprogramar sesión"}
      </Button>
      {abierto ? (
        <div className="mt-4 flex flex-col gap-4 rounded-xl border border-[var(--border)] p-4 sm:p-6">
          <h2 className="titulo text-xl">Elige el nuevo horario</h2>
          <p className="text-sm text-[var(--muted)]">
            Conservas el código, la duración y el precio. El tutor deberá
            aceptar el nuevo turno; tu horario actual se libera al confirmar.
          </p>
          <SelectorTurno
            tutorId={reserva.tutorId}
            duracionMinutos={reserva.duracionMinutos}
            reservaId={reserva.id}
            turnoElegido={turno}
            onElegir={setTurno}
          />
          {turno ? (
            <p className="text-sm">
              Nuevo horario: {fechaLarga(turno.inicio)} · {turno.horaInicio} a{" "}
              {turno.horaFin}
            </p>
          ) : null}
          {error ? (
            <Alert status="danger">
              <Alert.Content>
                <Alert.Description>{error}</Alert.Description>
              </Alert.Content>
            </Alert>
          ) : null}
          <Button
            variant="primary"
            isDisabled={!turno || turno.inicio === reserva.inicio || guardando}
            onPress={() => {
              if (!turno || guardando) return;
              setError(null);
              iniciar(async () => {
                const resultado = await reprogramarReserva(
                  reserva.id,
                  turno.inicio,
                  turno.fin,
                );
                if (!resultado.ok) {
                  setError(resultado.mensaje);
                  return;
                }
                setAbierto(false);
                setTurno(null);
                router.refresh();
              });
            }}
          >
            {guardando ? "Cambiando horario…" : "Confirmar nuevo horario"}
          </Button>
        </div>
      ) : null}
    </section>
  );
}

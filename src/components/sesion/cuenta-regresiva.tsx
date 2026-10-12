"use client";

import { useEffect, useState } from "react";
import { Alert, Button, Chip } from "@heroui/react";
import type { Reserva } from "@/features/reservas";
import { estadoSala, MINUTOS_ANTES, type EstadoSala } from "@/features/sesion/sala";

/**
 * Sala de espera con cuenta regresiva (F7.1).
 *
 * El botón de entrar se habilita {MINUTOS_ANTES} minutos antes: abrir la sala
 * con horas de antelación no sirve de nada y confunde sobre cuándo es la clase.
 *
 * El primer render tiene que coincidir con el del servidor, así que el reloj
 * arranca en el mismo instante que este calculó y solo empieza a correr
 * después de hidratar.
 */
export function CuentaRegresiva({
  reserva,
  enlace,
  ahoraServidor,
}: {
  reserva: Reserva;
  enlace: string;
  /** Marca de tiempo con la que el servidor pintó la página. */
  ahoraServidor: number;
}) {
  const [ahora, setAhora] = useState(ahoraServidor);

  useEffect(() => {
    const reloj = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(reloj);
  }, []);

  const estado = estadoSala(reserva, new Date(ahora));
  const faltan = new Date(reserva.inicio).getTime() - ahora;

  return (
    <div className="flex flex-col gap-4">
      <EstadoDeLaSala estado={estado} faltan={faltan} />

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" isDisabled={estado === "lejos" || estado === "terminada"}>
          <a href={enlace} target="_blank" rel="noopener noreferrer">
            {estado === "en-curso" ? "Volver a la sesión" : "Entrar a la sesión"}
          </a>
        </Button>

        <CopiarEnlace enlace={enlace} />
      </div>

      {estado === "lejos" ? (
        <p className="text-sm text-[var(--muted)]">
          El botón se habilita {MINUTOS_ANTES} minutos antes de la hora de inicio.
        </p>
      ) : null}
    </div>
  );
}

function EstadoDeLaSala({ estado, faltan }: { estado: EstadoSala; faltan: number }) {
  if (estado === "terminada") {
    return (
      <Alert status="default">
        <Alert.Content>
          <Alert.Title>La sesión ya terminó</Alert.Title>
          <Alert.Description>
            Si la clase se dio, el tutor la cerrará y podrás calificarla.
          </Alert.Description>
        </Alert.Content>
      </Alert>
    );
  }

  if (estado === "en-curso") {
    return (
      <Alert status="success">
        <Alert.Content>
          <Alert.Title>La sesión está en curso</Alert.Title>
          <Alert.Description>Entra a la sala; el otro ya puede estar dentro.</Alert.Description>
        </Alert.Content>
      </Alert>
    );
  }

  if (estado === "abierta") {
    return (
      <Alert status="success">
        <Alert.Content>
          <Alert.Title>La sala ya está abierta</Alert.Title>
          <Alert.Description>Puedes entrar y probar cámara y micrófono.</Alert.Description>
        </Alert.Content>
      </Alert>
    );
  }

  return (
    <div className="flex flex-wrap items-baseline gap-3">
      <span className="text-sm text-[var(--muted)]">Faltan</span>
      <span className="titulo text-3xl tabular-nums">{formatear(faltan)}</span>
      <Chip size="sm" variant="soft">
        para tu sesión
      </Chip>
    </div>
  );
}

function CopiarEnlace({ enlace }: { enlace: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(enlace);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sin permiso de portapapeles queda el enlace a la vista para copiarlo a mano.
      setCopiado(false);
    }
  }

  return (
    <Button variant="outline" onPress={copiar}>
      {copiado ? "Enlace copiado" : "Copiar el enlace"}
    </Button>
  );
}

/** "2 días", "3 h 15 min", "4 min 20 s" según lo que falte. */
function formatear(milisegundos: number): string {
  const segundos = Math.max(0, Math.floor(milisegundos / 1000));
  const dias = Math.floor(segundos / 86400);
  const horas = Math.floor((segundos % 86400) / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const resto = segundos % 60;

  if (dias > 0) return `${dias} ${dias === 1 ? "día" : "días"} y ${horas} h`;
  if (horas > 0) return `${horas} h ${minutos} min`;
  return `${minutos} min ${String(resto).padStart(2, "0")} s`;
}

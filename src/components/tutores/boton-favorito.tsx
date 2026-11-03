"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Button } from "@heroui/react";
import { IconoCorazon } from "@/components/ui/iconos";
import { alternarFavorito } from "@/features/favoritos/acciones";

/**
 * Guardar un tutor (F2.16).
 *
 * El corazón se pinta antes de que responda el servidor: guardar un favorito
 * no tiene consecuencias y esperar medio segundo por una acción tan pequeña
 * hace que la interfaz se sienta pesada. Si el servidor falla, React revierte
 * el estado solo.
 */
export function BotonFavorito({
  estudianteId,
  tutorId,
  nombre,
  guardadoInicial,
}: {
  estudianteId: string;
  tutorId: string;
  nombre: string;
  guardadoInicial: boolean;
}) {
  const [guardado, marcar] = useOptimistic(guardadoInicial);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciar] = useTransition();

  return (
    <><Button
      variant="ghost"
      size="sm"
      isIconOnly
      isDisabled={pendiente}
      aria-label={guardado ? `Quitar a ${nombre} de favoritos` : `Guardar a ${nombre} en favoritos`}
      onPress={() =>
        iniciar(async () => {
          setError(null);
          marcar(!guardado);
          const resultado = await alternarFavorito(estudianteId, tutorId, !guardado);
          if (!resultado.ok) setError(resultado.mensaje);
        })
      }
    >
      <IconoCorazon
        className={guardado ? "text-[var(--danger)]" : "text-[var(--muted)]"}
        fill={guardado ? "currentColor" : "none"}
      />
    </Button>{error ? <span role="alert" className="text-xs text-[var(--danger)]">{error}</span> : null}</>
  );
}

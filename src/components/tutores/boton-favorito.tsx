"use client";

import { useOptimistic, useTransition } from "react";
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
  const [, iniciar] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      isIconOnly
      aria-label={guardado ? `Quitar a ${nombre} de favoritos` : `Guardar a ${nombre} en favoritos`}
      onPress={() =>
        iniciar(async () => {
          marcar(!guardado);
          await alternarFavorito(estudianteId, tutorId);
        })
      }
    >
      <IconoCorazon
        className={guardado ? "text-[var(--danger)]" : "text-[var(--muted)]"}
        fill={guardado ? "currentColor" : "none"}
      />
    </Button>
  );
}

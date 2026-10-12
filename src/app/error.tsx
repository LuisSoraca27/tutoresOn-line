"use client";

import { Alert, Button } from "@heroui/react";

/**
 * Límite de error de la aplicación (F12.6). El mensaje dice qué pasó y qué
 * puede hacer la persona; el detalle técnico queda para la consola.
 */
export default function ErrorAplicacion({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 px-6">
      <Alert status="danger" className="max-w-lg">
        <Alert.Content>
          <Alert.Title>No pudimos cargar esta sección</Alert.Title>
          <Alert.Description>
            Algo falló al traer la información. Inténtalo de nuevo; si vuelve a pasar, revisa que la
            API esté disponible o activa los datos simulados con
            NEXT_PUBLIC_DATOS_SIMULADOS=true.
          </Alert.Description>
        </Alert.Content>
      </Alert>

      <div className="flex gap-2">
        <Button variant="primary" onPress={reset}>
          Reintentar
        </Button>
      </div>

      {error.digest ? (
        <p className="text-xs text-[var(--muted)]">Referencia técnica: {error.digest}</p>
      ) : null}
    </div>
  );
}

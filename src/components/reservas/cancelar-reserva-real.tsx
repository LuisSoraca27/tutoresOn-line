"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button } from "@heroui/react";
import { cancelarReserva } from "@/features/reservas/acciones-reales";

export function CancelarReservaReal({ id }: { id: string }) {
  const router = useRouter();
  const [confirmar, setConfirmar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardando, iniciar] = useTransition();
  return <div className="flex flex-wrap items-center gap-2 pt-3">
    {!confirmar ? <Button size="sm" variant="ghost" onPress={() => setConfirmar(true)}>Cancelar reserva</Button> : <>
      <span>¿Cancelar esta reserva?</span>
      <Button size="sm" variant="danger" isDisabled={guardando} onPress={() => iniciar(async () => {
        const resultado = await cancelarReserva(id);
        if (resultado.ok) { setConfirmar(false); router.refresh(); }
        else setError(resultado.mensaje);
      })}>{guardando ? "Cancelando…" : "Sí, cancelar"}</Button>
      <Button size="sm" variant="ghost" isDisabled={guardando} onPress={() => { setConfirmar(false); setError(null); }}>Volver</Button>
    </>}
    {error ? <Alert status="danger" className="w-full"><Alert.Content><Alert.Description>{error}</Alert.Description></Alert.Content></Alert> : null}
  </div>;
}

"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Card, Input, Label, TextField } from "@heroui/react";
import type { Balance, Retiro } from "@/features/ingresos";
import { cancelarRetiro, solicitarRetiro } from "@/features/ingresos/acciones";
import { fechaLarga, precio } from "@/lib/formato";

export function PanelRetiros({
  balance,
  retiros,
  simulado,
}: {
  balance: Balance;
  retiros: Retiro[];
  simulado: boolean;
}) {
  const router = useRouter();
  const [monto, setMonto] = useState("");
  const [destino, setDestino] = useState("");
  const [resultado, setResultado] = useState<{
    ok: boolean;
    mensaje: string;
  } | null>(null);
  const [guardando, iniciar] = useTransition();
  return (
    <section className="pt-8">
      <Card>
        <Card.Header>
          <Card.Title className="titulo text-xl">Retiros</Card.Title>
          <Card.Description>
            Disponible: {precio(balance.disponible)} · En retiros:{" "}
            {precio(balance.comprometido)}
          </Card.Description>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
          {simulado ? (
            <p className="text-sm text-[var(--muted)]">
              Demostración: las solicitudes se guardan en esta aplicación y no
              transfieren dinero. Usa un destino de prueba.
            </p>
          ) : null}
          <form
            className="flex flex-col gap-4"
            onSubmit={(evento) => {
              evento.preventDefault();
              if (guardando) return;
              setResultado(null);
              iniciar(async () => {
                const respuesta = await solicitarRetiro(Number(monto), destino);
                setResultado(respuesta);
                if (respuesta.ok) {
                  setMonto("");
                  setDestino("");
                  router.refresh();
                }
              });
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                value={monto}
                onChange={setMonto}
                type="number"
                isRequired
              >
                <Label>Monto en COP</Label>
                <Input
                  min={1}
                  max={balance.disponible}
                  step={1}
                  placeholder="50000"
                />
              </TextField>
              <TextField value={destino} onChange={setDestino} isRequired>
                <Label>Destino del retiro</Label>
                <Input
                  maxLength={120}
                  minLength={5}
                  placeholder="Banco de prueba · cuenta terminada en 1234"
                />
              </TextField>
            </div>
            <Button
              className="self-start"
              type="submit"
              variant="primary"
              isDisabled={
                guardando ||
                balance.disponible <= 0 ||
                !monto ||
                !destino.trim()
              }
            >
              {guardando ? "Procesando…" : "Solicitar retiro"}
            </Button>
          </form>
          {balance.disponible <= 0 ? (
            <p className="text-sm text-[var(--muted)]">
              No tienes saldo disponible para otro retiro. Cierra una sesión
              dictada o cancela una solicitud anterior.
            </p>
          ) : null}
          {resultado ? (
            <Alert status={resultado.ok ? "success" : "danger"}>
              <Alert.Content>
                <Alert.Description>{resultado.mensaje}</Alert.Description>
              </Alert.Content>
            </Alert>
          ) : null}
          <h3 className="font-medium">Historial de retiros</h3>
          {retiros.length ? (
            <ul className="divide-y divide-[var(--border)]">
              {retiros.map((retiro) => (
                <li
                  key={retiro.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium">
                      {precio(retiro.monto)} · {retiro.estado}
                    </p>
                    <p className="break-words text-sm text-[var(--muted)]">
                      {retiro.id} · {retiro.destino} ·{" "}
                      {fechaLarga(retiro.solicitadoEn)}
                    </p>
                  </div>
                  {retiro.estado === "solicitado" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      isDisabled={guardando}
                      onPress={() =>
                        iniciar(async () => {
                          setResultado(await cancelarRetiro(retiro.id));
                          router.refresh();
                        })
                      }
                    >
                      Cancelar retiro
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--muted)]">
              Todavía no has solicitado retiros.
            </p>
          )}
        </Card.Content>
      </Card>
    </section>
  );
}

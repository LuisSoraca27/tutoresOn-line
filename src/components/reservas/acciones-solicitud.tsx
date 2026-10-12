"use client";

import { useState, useTransition } from "react";
import {
  Alert,
  Button,
  ButtonGroup,
  Label,
  Modal,
  TextArea,
  TextField,
  useOverlayState,
} from "@heroui/react";
import { aceptarReserva, rechazarReserva } from "@/features/reservas/acciones";

/**
 * Aceptar o rechazar una solicitud (F5.5).
 *
 * Aceptar es un clic porque es el caso frecuente y no necesita explicación.
 * Rechazar pide motivo: el estudiante organizó su semana alrededor de esa
 * hora y merece saber por qué no va.
 */
export function AccionesSolicitud({
  reservaId,
  estudiante,
}: {
  reservaId: string;
  estudiante: string;
}) {
  const modal = useOverlayState();
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [procesando, iniciar] = useTransition();

  function aceptar() {
    setError(null);
    iniciar(async () => {
      const resultado = await aceptarReserva(reservaId);
      if (!resultado.ok) setError(resultado.mensaje);
    });
  }

  function rechazar() {
    setError(null);
    iniciar(async () => {
      const resultado = await rechazarReserva(reservaId, motivo);
      if (resultado.ok) {
        modal.close();
        setMotivo("");
      } else {
        setError(resultado.mensaje);
      }
    });
  }

  return (
    <>
      <ButtonGroup>
        <Button variant="primary" size="sm" isDisabled={procesando} onPress={aceptar}>
          Aceptar
        </Button>
        <Button variant="outline" size="sm" isDisabled={procesando} onPress={modal.open}>
          Rechazar
        </Button>
      </ButtonGroup>

      {error ? (
        <p className="pt-1.5 text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      ) : null}

      <Modal state={modal}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>Rechazar la solicitud de {estudiante}</Modal.Heading>
              </Modal.Header>

            <Modal.Body className="flex flex-col gap-4">
              <TextField value={motivo} onChange={setMotivo} isRequired>
                <Label>Motivo</Label>
                <TextArea
                  rows={3}
                  placeholder="Ese día ya tengo la agenda llena. ¿Te sirve el jueves a la misma hora?"
                />
              </TextField>

              {error ? (
                <Alert status="danger">
                  <Alert.Content>
                    <Alert.Description>{error}</Alert.Description>
                  </Alert.Content>
                </Alert>
              ) : null}
            </Modal.Body>

            <Modal.Footer>
              <Button variant="ghost" isDisabled={procesando} onPress={modal.close}>
                Volver
              </Button>
              <Button
                variant="primary"
                isDisabled={procesando || !motivo.trim()}
                onPress={rechazar}
              >
                {procesando ? "Enviando…" : "Rechazar solicitud"}
              </Button>
            </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}

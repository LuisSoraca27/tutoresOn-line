"use client";

import { useState, useTransition } from "react";
import {
  Alert,
  Button,
  Label,
  Modal,
  TextArea,
  TextField,
  useOverlayState,
} from "@heroui/react";
import { cancelarReserva } from "@/features/reservas/acciones";

/**
 * Cancelación por parte del estudiante (F3.8).
 *
 * Pide confirmación en un diálogo aparte porque cancelar libera el turno y no
 * se puede deshacer: si el tutor no tiene otro hueco esa semana, se perdió.
 */
export function AccionesEstudiante({ reservaId }: { reservaId: string }) {
  const modal = useOverlayState();
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [procesando, iniciar] = useTransition();

  function cancelar() {
    setError(null);
    iniciar(async () => {
      const resultado = await cancelarReserva(reservaId, motivo.trim() || undefined);
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
      <Button variant="outline" size="sm" onPress={modal.open}>
        Cancelar la sesión
      </Button>

      <Modal state={modal}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>¿Cancelar esta sesión?</Modal.Heading>
              </Modal.Header>

              <Modal.Body className="flex flex-col gap-4">
                <p className="text-sm text-[var(--muted)]">
                  El turno se libera para otros estudiantes y no se puede recuperar. Si solo
                  necesitas otra hora, es mejor reprogramar.
                </p>

                <TextField value={motivo} onChange={setMotivo}>
                  <Label>Motivo (opcional)</Label>
                  <TextArea rows={2} placeholder="Me cruzó una clase a esa hora." />
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
                  Mantener la sesión
                </Button>
                <Button variant="primary" isDisabled={procesando} onPress={cancelar}>
                  {procesando ? "Cancelando…" : "Sí, cancelar"}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}

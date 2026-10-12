"use client";

import { useState, useTransition } from "react";
import {
  Alert,
  Button,
  Label,
  ListBox,
  Modal,
  Select,
  useOverlayState,
  type Key,
} from "@heroui/react";
import { reportarResena } from "@/features/resenas/acciones";

/**
 * Denunciar una reseña (F8.7).
 *
 * Motivos cerrados en vez de texto libre: quien modera necesita clasificar
 * rápido, y una lista corta evita que la denuncia se use como segunda reseña.
 */
export function ReportarResena({
  resenaId,
  motivos,
  yaReportada,
}: {
  resenaId: string;
  motivos: readonly string[];
  yaReportada: boolean;
}) {
  const modal = useOverlayState();
  const [motivo, setMotivo] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(yaReportada);
  const [error, setError] = useState<string | null>(null);
  const [enviando, iniciar] = useTransition();

  if (enviado) {
    return (
      <span className="text-xs text-[var(--muted)]">Reportada, en revisión</span>
    );
  }

  function reportar() {
    if (!motivo) return;
    setError(null);

    iniciar(async () => {
      const resultado = await reportarResena(resenaId, motivo);
      if (resultado.ok) {
        modal.close();
        setEnviado(true);
      } else {
        setError(resultado.mensaje);
      }
    });
  }

  return (
    <>
      <Button variant="ghost" size="sm" onPress={modal.open}>
        Reportar
      </Button>

      <Modal state={modal}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>Reportar esta reseña</Modal.Heading>
              </Modal.Header>

              <Modal.Body className="flex flex-col gap-4">
                <p className="text-sm text-[var(--muted)]">
                  El equipo la revisará. Si incumple las normas, se retira.
                </p>

                <Select
                  placeholder="Elige el motivo"
                  value={motivo}
                  onChange={(valor: Key | null) => setMotivo(valor ? String(valor) : null)}
                >
                  <Label>Motivo</Label>
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {motivos.map((opcion) => (
                        <ListBox.Item key={opcion} id={opcion} textValue={opcion}>
                          {opcion}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>

                {error ? (
                  <Alert status="danger">
                    <Alert.Content>
                      <Alert.Description>{error}</Alert.Description>
                    </Alert.Content>
                  </Alert>
                ) : null}
              </Modal.Body>

              <Modal.Footer>
                <Button variant="ghost" isDisabled={enviando} onPress={modal.close}>
                  Cancelar
                </Button>
                <Button variant="primary" isDisabled={enviando || !motivo} onPress={reportar}>
                  {enviando ? "Enviando…" : "Enviar reporte"}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}

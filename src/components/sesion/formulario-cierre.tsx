"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Card,
  Description,
  Label,
  NumberField,
  Switch,
  TextArea,
  TextField,
} from "@heroui/react";
import { cerrarSesionTutoria } from "@/features/reservas/acciones";

/**
 * Cierre de la sesión por parte del tutor (F7.6).
 *
 * Marcar asistencia y duración real no es burocracia: de aquí salen los
 * ingresos del tutor, el historial del estudiante y el permiso para calificar.
 * Una sesión sin cerrar no se puede reseñar.
 */
export function FormularioCierre({
  reservaId,
  estudiante,
  duracionPrevista,
}: {
  reservaId: string;
  estudiante: string;
  duracionPrevista: number;
}) {
  const router = useRouter();

  const [asistio, setAsistio] = useState(true);
  const [duracion, setDuracion] = useState(duracionPrevista);
  const [observaciones, setObservaciones] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, iniciar] = useTransition();

  function cerrar() {
    setError(null);
    iniciar(async () => {
      const resultado = await cerrarSesionTutoria({
        reservaId,
        asistio,
        duracionReal: duracion,
        observaciones: observaciones.trim() || undefined,
      });

      if (resultado.ok) {
        router.push("/tutor/agenda");
      } else {
        setError(resultado.mensaje);
      }
    });
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title className="text-base">Cerrar la sesión con {estudiante}</Card.Title>
        <Card.Description>
          Al cerrarla, el estudiante puede calificarte y la sesión cuenta en tus ingresos.
        </Card.Description>
      </Card.Header>

      <Card.Content className="flex flex-col gap-6">
        <Switch isSelected={asistio} onChange={setAsistio}>
          <Switch.Content>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            El estudiante asistió
          </Switch.Content>
        </Switch>

        {!asistio ? (
          <Alert status="warning">
            <Alert.Content>
              <Alert.Description>
                La sesión quedará finalizada como inasistencia. El estudiante no podrá
                calificarla.
              </Alert.Description>
            </Alert.Content>
          </Alert>
        ) : null}

        <NumberField
          value={duracion}
          onChange={setDuracion}
          minValue={0}
          maxValue={300}
          step={5}
          isDisabled={!asistio}
        >
          <Label>Duración real</Label>
          <NumberField.Group>
            <NumberField.DecrementButton />
            <NumberField.Input />
            <NumberField.IncrementButton />
          </NumberField.Group>
          <Description>
            Minutos que duró de verdad. Estaban previstos {duracionPrevista}.
          </Description>
        </NumberField>

        <TextField value={observaciones} onChange={setObservaciones}>
          <Label>Observaciones (opcional)</Label>
          <TextArea
            rows={3}
            placeholder="Qué se vio, qué quedó pendiente y qué conviene repasar para la próxima."
          />
          <Description>
            Las ve el estudiante en el detalle de la sesión.
          </Description>
        </TextField>

        {error ? (
          <Alert status="danger">
            <Alert.Content>
              <Alert.Description>{error}</Alert.Description>
            </Alert.Content>
          </Alert>
        ) : null}
      </Card.Content>

      <Card.Footer className="flex flex-wrap gap-3 border-t border-[var(--border)] pt-4">
        <Button variant="primary" isDisabled={guardando} onPress={cerrar}>
          {guardando ? "Cerrando…" : "Cerrar la sesión"}
        </Button>
        <Button variant="ghost" isDisabled={guardando} onPress={() => router.back()}>
          Volver
        </Button>
      </Card.Footer>
    </Card>
  );
}

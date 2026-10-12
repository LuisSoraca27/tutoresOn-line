"use client";
import { useState, useTransition } from "react";
import { Alert, Button, Card, Label, TextArea, TextField } from "@heroui/react";
import { guardarApuntes } from "@/features/sesion/acciones-apuntes";
import { descargar } from "@/lib/descargas";

export function ApuntesSesion({
  reservaId,
  inicial,
}: {
  reservaId: string;
  inicial: string;
}) {
  const [texto, setTexto] = useState(inicial);
  const [guardado, setGuardado] = useState(inicial);
  const [resultado, setResultado] = useState<{
    ok: boolean;
    mensaje: string;
  } | null>(null);
  const [guardando, iniciar] = useTransition();
  return (
    <Card>
      <Card.Header>
        <Card.Title className="text-base">Mis apuntes</Card.Title>
        <Card.Description>
          Solo tú puedes verlos. Guárdalos para consultarlos después de la
          clase.
        </Card.Description>
      </Card.Header>
      <Card.Content className="flex flex-col gap-3">
        <TextField
          value={texto}
          onChange={(valor) => {
            setTexto(valor);
            setResultado(null);
          }}
          isDisabled={guardando}
        >
          <Label>Notas de la sesión</Label>
          <TextArea
            rows={8}
            maxLength={10000}
            placeholder="Ideas, ejercicios y temas para repasar…"
          />
        </TextField>
        <p className="text-xs text-[var(--muted)]" role="status">
          {texto !== guardado ? "Cambios sin guardar · " : ""}
          {texto.length.toLocaleString("es-CO")} / 10.000 caracteres
        </p>
        {resultado ? (
          <Alert status={resultado.ok ? "success" : "danger"}>
            <Alert.Content>
              <Alert.Description>{resultado.mensaje}</Alert.Description>
            </Alert.Content>
          </Alert>
        ) : null}
      </Card.Content>
      <Card.Footer className="flex flex-wrap gap-3">
        <Button
          variant="primary"
          isDisabled={guardando || texto === guardado}
          onPress={() =>
            iniciar(async () => {
              const respuesta = await guardarApuntes(reservaId, texto);
              setResultado(respuesta);
              if (respuesta.ok) setGuardado(texto);
            })
          }
        >
          {guardando ? "Guardando…" : "Guardar apuntes"}
        </Button>
        <Button
          variant="outline"
          isDisabled={!texto.trim()}
          onPress={() =>
            descargar(
              `apuntes-${reservaId}.txt`,
              texto,
              "text/plain;charset=utf-8",
            )
          }
        >
          Descargar apuntes
        </Button>
      </Card.Footer>
    </Card>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Alert, Button, Label, TextArea, TextField } from "@heroui/react";
import { responderResena } from "@/features/resenas/acciones";

/**
 * Respuesta pública del tutor a una reseña (F8.6).
 *
 * Se abre solo cuando el tutor decide contestar: un cuadro de texto abierto
 * bajo cada reseña presiona a responderlo todo, y la mayoría no lo necesita.
 */
export function ResponderResena({ resenaId }: { resenaId: string }) {
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, iniciar] = useTransition();

  function responder() {
    setError(null);
    iniciar(async () => {
      const resultado = await responderResena(resenaId, texto);
      if (resultado.ok) {
        setAbierto(false);
        setTexto("");
      } else {
        setError(resultado.mensaje);
      }
    });
  }

  if (!abierto) {
    return (
      <Button variant="ghost" size="sm" onPress={() => setAbierto(true)}>
        Responder públicamente
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <TextField value={texto} onChange={setTexto} autoFocus>
        <Label className="sr-only">Tu respuesta</Label>
        <TextArea
          rows={3}
          placeholder="Gracias por el comentario. La próxima podemos arrancar directo con ejercicios."
        />
      </TextField>

      {error ? (
        <Alert status="danger">
          <Alert.Content>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Content>
        </Alert>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          variant="primary"
          size="sm"
          isDisabled={enviando || texto.trim().length < 5}
          onPress={responder}
        >
          {enviando ? "Publicando…" : "Publicar respuesta"}
        </Button>
        <Button variant="ghost" size="sm" isDisabled={enviando} onPress={() => setAbierto(false)}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}

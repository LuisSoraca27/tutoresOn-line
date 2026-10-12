"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Alert,
  Button,
  Card,
  Description,
  Input,
  Label,
  Tag,
  TagGroup,
  TextArea,
  TextField,
} from "@heroui/react";
import { guardarPresentacion } from "@/features/tutores/acciones";

const MINIMO_BIO = 40;
const SUGERENCIAS = ["Español", "Inglés", "Francés", "Portugués", "Alemán"];

/**
 * Presentación pública del tutor (F5.12).
 *
 * Es el texto que decide si un estudiante hace clic o sigue de largo, así
 * que el formulario muestra cuánto lleva escrito y por qué importa, en vez
 * de dejar un cuadro vacío sin contexto.
 */
export function EditorPresentacion({
  tutorId,
  tituloInicial,
  bioInicial,
  idiomasIniciales,
}: {
  tutorId: string;
  tituloInicial: string;
  bioInicial: string;
  idiomasIniciales: string[];
}) {
  const [titulo, setTitulo] = useState(tituloInicial);
  const [bio, setBio] = useState(bioInicial);
  const [idiomas, setIdiomas] = useState(idiomasIniciales);
  const [aviso, setAviso] = useState<{ ok: boolean; mensaje: string } | null>(null);
  const [guardando, iniciar] = useTransition();

  const cambiado =
    titulo !== tituloInicial ||
    bio !== bioInicial ||
    JSON.stringify(idiomas) !== JSON.stringify(idiomasIniciales);

  const faltan = MINIMO_BIO - bio.trim().length;
  const disponibles = SUGERENCIAS.filter((idioma) => !idiomas.includes(idioma));

  function guardar() {
    iniciar(async () => {
      const resultado = await guardarPresentacion(tutorId, { titulo, bio, idiomas });
      setAviso(
        resultado.ok
          ? { ok: true, mensaje: "Perfil actualizado." }
          : { ok: false, mensaje: resultado.mensaje },
      );
    });
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title className="text-base">Cómo me presento</Card.Title>
        <Card.Description>
          Esto es lo primero que lee un estudiante en tu perfil y en los resultados de búsqueda.
        </Card.Description>
      </Card.Header>

      <Card.Content className="flex flex-col gap-5">
        <TextField value={titulo} onChange={setTitulo} isRequired>
          <Label>Título o profesión</Label>
          <Input placeholder="Matemática, MSc. en Estadística" />
          <Description>Aparece bajo tu nombre en toda la plataforma.</Description>
        </TextField>

        <TextField value={bio} onChange={setBio} isRequired>
          <Label>Presentación</Label>
          <TextArea
            rows={5}
            placeholder="Cuenta a quién acompañas, cómo son tus clases y qué consigue quien estudia contigo."
          />
          <Description>
            {faltan > 0
              ? `Faltan ${faltan} ${faltan === 1 ? "carácter" : "caracteres"}.`
              : `${bio.trim().length} caracteres. Las presentaciones concretas convierten más que las genéricas.`}
          </Description>
        </TextField>

        <div>
          <p className="pb-2 text-sm font-medium">Idiomas en los que dicto</p>

          {idiomas.length > 0 ? (
            <TagGroup
              aria-label="Idiomas"
              onRemove={(claves) =>
                setIdiomas(idiomas.filter((idioma) => !claves.has(idioma)))
              }
            >
              <TagGroup.List items={idiomas.map((id) => ({ id }))} className="flex flex-wrap gap-2">
                {(item: { id: string }) => (
                  <Tag id={item.id} textValue={item.id}>
                    {item.id}
                    <Tag.RemoveButton aria-label={`Quitar ${item.id}`} />
                  </Tag>
                )}
              </TagGroup.List>
            </TagGroup>
          ) : (
            <p className="text-sm text-[var(--muted)]">Indica al menos uno.</p>
          )}

          {disponibles.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-3">
              {disponibles.map((idioma) => (
                <Button
                  key={idioma}
                  variant="outline"
                  size="sm"
                  onPress={() => setIdiomas([...idiomas, idioma])}
                >
                  Agregar {idioma}
                </Button>
              ))}
            </div>
          ) : null}
        </div>
      </Card.Content>

      <Card.Footer className="flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-4">
        <Button variant="primary" isDisabled={!cambiado || guardando} onPress={guardar}>
          {guardando ? "Guardando…" : "Guardar perfil"}
        </Button>

        <Button variant="ghost" size="sm">
          <Link href={`/tutores/${tutorId}`}>Ver mi perfil público</Link>
        </Button>

        {aviso ? (
          <Alert status={aviso.ok ? "success" : "danger"} className="w-full">
            <Alert.Content>
              <Alert.Description>{aviso.mensaje}</Alert.Description>
            </Alert.Content>
          </Alert>
        ) : null}
      </Card.Footer>
    </Card>
  );
}

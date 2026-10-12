"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  CheckboxGroup,
  Description,
  ErrorMessage,
  Input,
  Label,
  ListBox,
  NumberField,
  ProgressBar,
  Radio,
  RadioGroup,
  Select,
  Separator,
  Slider,
  Tag,
  TagGroup,
  TextArea,
  TextField,
  type Key,
} from "@heroui/react";
import { CampoClave, claveValida } from "@/components/auth/campo-clave";
import { AYUDA_CORREO, useEstadoCorreo } from "@/components/auth/usar-estado-correo";
import { registrarTutor } from "@/features/auth/acciones";
import type { Ciudad, Materia, Nivel, NivelId } from "@/features/catalogos";
import { precio } from "@/lib/formato";

type Modalidad = "virtual" | "presencial" | "ambas";
type MateriaDictada = { materiaId: string; nivelIds: NivelId[]; precioHora: number };

const MINIMO_BIO = 40;
const TARIFA_INICIAL = 40000;
const RADIO_POR_DEFECTO = 10;
const IDIOMAS = ["Español", "Inglés", "Francés", "Portugués", "Alemán"];

const PASOS = ["Tu cuenta", "Cómo te presentas", "Qué dictas"];

/**
 * Registro de tutor en tres pasos (F1.3).
 *
 * El orden es el del valor creciente: primero lo que cuesta nada (la cuenta),
 * después lo que exige pensar (la presentación) y al final lo que decide si
 * apareces en la búsqueda (materias, tarifas y cobertura). Quien abandona en
 * el paso tres al menos entendió qué se le estaba pidiendo.
 *
 * Es un único envío al final, no tres: el registro crea la cuenta y el perfil
 * público en la misma operación, así que no puede existir un tutor a medias
 * dentro de la plataforma.
 */
export function AsistenteRegistroTutor({
  materias,
  niveles,
  ciudades,
}: {
  materias: Materia[];
  niveles: Nivel[];
  ciudades: Ciudad[];
}) {
  const router = useRouter();
  const [paso, setPaso] = useState(0);

  // Paso 1 — cuenta
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [telefono, setTelefono] = useState("");

  // Paso 2 — presentación
  const [titulo, setTitulo] = useState("");
  const [bio, setBio] = useState("");
  const [idiomas, setIdiomas] = useState<string[]>(["Español"]);

  // Paso 3 — oferta
  const [dictadas, setDictadas] = useState<MateriaDictada[]>([]);
  const [modalidad, setModalidad] = useState<Modalidad>("virtual");
  const [ciudadId, setCiudadId] = useState<string | null>(null);
  const [radioKm, setRadioKm] = useState(RADIO_POR_DEFECTO);

  const [error, setError] = useState<string | null>(null);
  const [creando, iniciar] = useTransition();

  const estadoCorreo = useEstadoCorreo(correo);

  const presencial = modalidad !== "virtual";
  const usadas = new Set(dictadas.map((materia) => materia.materiaId));
  const disponibles = materias.filter((materia) => !usadas.has(materia.id));
  const idiomasDisponibles = IDIOMAS.filter((idioma) => !idiomas.includes(idioma));

  const pasoCompleto = [
    nombre.trim().length >= 3 &&
      claveValida(clave) &&
      (estadoCorreo === "libre" || estadoCorreo === "revisando"),
    titulo.trim().length >= 5 && bio.trim().length >= MINIMO_BIO && idiomas.length > 0,
    dictadas.length > 0 &&
      dictadas.every((materia) => materia.nivelIds.length > 0) &&
      (!presencial || ciudadId !== null),
  ][paso];

  function actualizarMateria(materiaId: string, parcial: Partial<MateriaDictada>) {
    setDictadas(
      dictadas.map((materia) =>
        materia.materiaId === materiaId ? { ...materia, ...parcial } : materia,
      ),
    );
  }

  function crear() {
    setError(null);

    iniciar(async () => {
      const resultado = await registrarTutor({
        nombre,
        correo,
        clave,
        telefono: telefono.trim() || undefined,
        titulo,
        bio,
        modalidad,
        ciudadId: presencial ? (ciudadId ?? undefined) : undefined,
        radioKm: presencial ? radioKm : undefined,
        materias: dictadas,
        idiomas,
      });

      if (!resultado.ok) {
        setError(resultado.mensaje);
        return;
      }

      // El layout raíz lee la cookie en el servidor: sin `refresh` la barra
      // superior seguiría mostrando "Iniciar sesión" después de entrar.
      router.replace(resultado.destino);
      router.refresh();
    });
  }

  const desde =
    dictadas.length > 0 ? Math.min(...dictadas.map((materia) => materia.precioHora)) : 0;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="flex items-baseline justify-between gap-3 pb-2">
          <p className="text-sm font-medium">{PASOS[paso]}</p>
          <p className="text-sm tabular-nums text-[var(--muted)]">
            Paso {paso + 1} de {PASOS.length}
          </p>
        </div>
        <ProgressBar
          value={paso + 1}
          maxValue={PASOS.length}
          aria-label={`Paso ${paso + 1} de ${PASOS.length}: ${PASOS[paso]}`}
        >
          <ProgressBar.Track>
            <ProgressBar.Fill />
          </ProgressBar.Track>
        </ProgressBar>
      </div>

      <Card>
        <Card.Header>
          <Card.Title className="titulo text-2xl">Registrarme como tutor</Card.Title>
          <Card.Description>
            Al terminar apareces en la búsqueda con tu perfil público. La verificación de
            documentos la hace el equipo después.
          </Card.Description>
        </Card.Header>

        <Card.Content className="py-2">
          {/* ------------------------------------------------- paso 1: cuenta */}
          {paso === 0 ? (
            <div className="flex flex-col gap-5">
              <TextField value={nombre} onChange={setNombre} autoComplete="name" isRequired>
                <Label>Nombre completo</Label>
                <Input placeholder="Mariana Restrepo" autoFocus />
                <Description>Es el nombre que verán los estudiantes.</Description>
              </TextField>

              <TextField
                value={correo}
                onChange={setCorreo}
                type="email"
                autoComplete="email"
                isRequired
                isInvalid={estadoCorreo === "ocupado"}
              >
                <Label>Correo electrónico</Label>
                <Input placeholder="tucorreo@ejemplo.co" />
                {/*
                  HeroUI oculta la descripción cuando el campo es inválido y en
                  su lugar muestra el mensaje de error: el aviso de correo
                  ocupado tiene que ir por ese canal o no se ve.
                */}
                {estadoCorreo === "ocupado" ? (
                  <ErrorMessage>{AYUDA_CORREO.ocupado}</ErrorMessage>
                ) : (
                  <Description>{AYUDA_CORREO[estadoCorreo]}</Description>
                )}
              </TextField>

              <CampoClave valor={clave} onCambio={setClave} />

              <TextField value={telefono} onChange={setTelefono} type="tel" autoComplete="tel">
                <Label>Teléfono (opcional)</Label>
                <Input placeholder="+57 300 123 4567" />
                <Description>
                  Para avisarte de una solicitud urgente. No se muestra en tu perfil.
                </Description>
              </TextField>
            </div>
          ) : null}

          {/* -------------------------------------------- paso 2: presentación */}
          {paso === 1 ? (
            <div className="flex flex-col gap-5">
              <TextField value={titulo} onChange={setTitulo} isRequired>
                <Label>Título o profesión</Label>
                <Input placeholder="Ingeniera de sistemas · Magíster en Matemáticas" autoFocus />
                <Description>Una línea. Aparece bajo tu nombre en los resultados.</Description>
              </TextField>

              <TextField value={bio} onChange={setBio} isRequired>
                <Label>Tu presentación</Label>
                <TextArea
                  rows={5}
                  placeholder="Cómo explicas, con qué tipo de estudiante trabajas mejor, qué resultados has tenido."
                />
                <Description>
                  {bio.trim().length < MINIMO_BIO
                    ? `Faltan ${MINIMO_BIO - bio.trim().length} caracteres. Es lo primero que lee un estudiante.`
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
                    <TagGroup.List
                      items={idiomas.map((id) => ({ id }))}
                      className="flex flex-wrap gap-2"
                    >
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

                {idiomasDisponibles.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-3">
                    {idiomasDisponibles.map((idioma) => (
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
            </div>
          ) : null}

          {/* --------------------------------------------- paso 3: qué dictas */}
          {paso === 2 ? (
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-sm font-medium">Materias, niveles y tarifas</p>
                <p className="pt-1 text-sm text-[var(--muted)]">
                  {dictadas.length === 0
                    ? "Sin materias no apareces en ninguna búsqueda."
                    : `En tu tarjeta de resultados aparecerá “desde ${precio(desde)} / hora”.`}
                </p>
              </div>

              {dictadas.map((materia, indice) => {
                const nombreMateria =
                  materias.find((otra) => otra.id === materia.materiaId)?.nombre ??
                  materia.materiaId;

                return (
                  <div key={materia.materiaId}>
                    {indice > 0 ? <Separator className="mb-5" /> : null}

                    <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="font-medium">{nombreMateria}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Dejar de dictar ${nombreMateria}`}
                          onPress={() =>
                            setDictadas(
                              dictadas.filter((otra) => otra.materiaId !== materia.materiaId),
                            )
                          }
                        >
                          Quitar
                        </Button>
                      </div>

                      <CheckboxGroup
                        value={materia.nivelIds}
                        onChange={(valores) =>
                          actualizarMateria(materia.materiaId, { nivelIds: valores as NivelId[] })
                        }
                      >
                        <Label className="text-sm">Niveles</Label>
                        <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
                          {niveles.map((nivel) => (
                            <Checkbox key={nivel.id} value={nivel.id}>
                              <Checkbox.Content>
                                <Checkbox.Control>
                                  <Checkbox.Indicator />
                                </Checkbox.Control>
                                {nivel.nombre}
                              </Checkbox.Content>
                            </Checkbox>
                          ))}
                        </div>
                      </CheckboxGroup>

                      <NumberField
                        className="max-w-56"
                        value={materia.precioHora}
                        onChange={(valor) =>
                          actualizarMateria(materia.materiaId, { precioHora: valor })
                        }
                        minValue={10000}
                        maxValue={500000}
                        step={5000}
                        formatOptions={{
                          style: "currency",
                          currency: "COP",
                          maximumFractionDigits: 0,
                        }}
                      >
                        <Label className="text-sm">Tarifa por hora</Label>
                        <NumberField.Group>
                          <NumberField.DecrementButton />
                          <NumberField.Input />
                          <NumberField.IncrementButton />
                        </NumberField.Group>
                      </NumberField>
                    </div>
                  </div>
                );
              })}

              {disponibles.length > 0 ? (
                <Select
                  placeholder={
                    dictadas.length === 0 ? "Agrega tu primera materia…" : "Agregar otra materia…"
                  }
                  value={null}
                  onChange={(valor: Key | null) => {
                    if (!valor) return;
                    setDictadas([
                      ...dictadas,
                      { materiaId: String(valor), nivelIds: [], precioHora: TARIFA_INICIAL },
                    ]);
                  }}
                >
                  <Label className="sr-only">Agregar una materia</Label>
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    {/*
                      Colección dinámica con `items`: la lista se encoge cada vez
                      que se agrega una materia, y React Aria no admite que los
                      identificadores de una colección estática cambien en sitio.
                    */}
                    <ListBox items={disponibles}>
                      {(materia: Materia) => (
                        <ListBox.Item id={materia.id} textValue={materia.nombre}>
                          {materia.nombre}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      )}
                    </ListBox>
                  </Select.Popover>
                </Select>
              ) : null}

              <Separator />

              <RadioGroup value={modalidad} onChange={(valor) => setModalidad(valor as Modalidad)}>
                <Label>Cómo atiendo</Label>
                <Radio value="virtual">
                  <Radio.Content>
                    <Radio.Control>
                      <Radio.Indicator />
                    </Radio.Control>
                    Solo virtual
                  </Radio.Content>
                </Radio>
                <Radio value="presencial">
                  <Radio.Content>
                    <Radio.Control>
                      <Radio.Indicator />
                    </Radio.Control>
                    Solo presencial
                  </Radio.Content>
                </Radio>
                <Radio value="ambas">
                  <Radio.Content>
                    <Radio.Control>
                      <Radio.Indicator />
                    </Radio.Control>
                    Las dos, según lo que pida el estudiante
                  </Radio.Content>
                </Radio>
              </RadioGroup>

              {presencial ? (
                <>
                  <Select
                    placeholder="Elige tu ciudad"
                    value={ciudadId}
                    onChange={(valor: Key | null) => setCiudadId(valor ? String(valor) : null)}
                  >
                    <Label>Ciudad base</Label>
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox items={ciudades}>
                        {(ciudad: Ciudad) => (
                          <ListBox.Item id={ciudad.id} textValue={ciudad.nombre}>
                            {ciudad.nombre}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        )}
                      </ListBox>
                    </Select.Popover>
                    <Description>Desde aquí se mide cuánto te desplazas.</Description>
                  </Select>

                  <Slider
                    value={radioKm}
                    onChange={(valor) => setRadioKm(valor as number)}
                    minValue={1}
                    maxValue={40}
                    step={1}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <Label>Hasta dónde me desplazo</Label>
                      <span className="text-sm tabular-nums text-[var(--muted)]">{radioKm} km</span>
                    </div>
                    <Slider.Track>
                      <Slider.Fill />
                      <Slider.Thumb />
                    </Slider.Track>
                  </Slider>
                </>
              ) : (
                <Alert status="default">
                  <Alert.Content>
                    <Alert.Description>
                      Al ser solo virtual desapareces del filtro por ciudad, pero apareces para
                      estudiantes de todo el país.
                    </Alert.Description>
                  </Alert.Content>
                </Alert>
              )}
            </div>
          ) : null}

          {error ? (
            <Alert status="danger" className="mt-5">
              <Alert.Content>
                <Alert.Description>{error}</Alert.Description>
              </Alert.Content>
            </Alert>
          ) : null}
        </Card.Content>

        <Card.Footer className="flex items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
          <Button
            variant="ghost"
            isDisabled={paso === 0 || creando}
            onPress={() => setPaso(paso - 1)}
          >
            Atrás
          </Button>

          {paso < PASOS.length - 1 ? (
            <Button variant="primary" isDisabled={!pasoCompleto} onPress={() => setPaso(paso + 1)}>
              Continuar
            </Button>
          ) : (
            <Button variant="primary" isDisabled={!pasoCompleto || creando} onPress={crear}>
              {creando ? "Creando tu perfil…" : "Crear cuenta y publicar perfil"}
            </Button>
          )}
        </Card.Footer>
      </Card>

      <p className="text-center text-sm text-[var(--muted)]">
        ¿Solo quieres tomar clases?{" "}
        <Link
          href="/auth/registro/estudiante"
          className="text-[var(--accent)] underline underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
        >
          Regístrate como estudiante
        </Link>
      </p>
    </div>
  );
}

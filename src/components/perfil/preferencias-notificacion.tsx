"use client";

import { useState, useTransition } from "react";
import { Alert, Button, Card, Checkbox, Table } from "@heroui/react";
import { guardarPreferencias } from "@/features/preferencias/acciones";
import { CANALES, EVENTOS, type Canal, type Preferencias } from "@/features/preferencias";

/**
 * Preferencias por canal y por evento (F9.4).
 *
 * Una rejilla en vez de una lista de interruptores sueltos: la pregunta real
 * no es "¿quiero SMS?" sino "¿qué quiero por SMS?", y la tabla deja ver las
 * dos dimensiones a la vez.
 */
export function PreferenciasNotificacion({
  usuarioId,
  iniciales,
}: {
  usuarioId: string;
  iniciales: Preferencias["canales"];
}) {
  const [canales, setCanales] = useState(iniciales);
  const [aviso, setAviso] = useState<{ ok: boolean; mensaje: string } | null>(null);
  const [guardado, setGuardado] = useState(iniciales);
  const [guardando, iniciar] = useTransition();

  const cambiado = JSON.stringify(canales) !== JSON.stringify(guardado);

  function alternar(evento: keyof Preferencias["canales"], canal: Canal, activo: boolean) {
    const actuales = canales[evento];
    setCanales({
      ...canales,
      [evento]: activo
        ? [...actuales, canal]
        : actuales.filter((otro) => otro !== canal),
    });
    setAviso(null);
  }

  function guardar() {
    iniciar(async () => {
      const resultado = await guardarPreferencias(usuarioId, canales);
      setAviso(resultado);
      if (resultado.ok) setGuardado(canales);
    });
  }

  const sinNingun = EVENTOS.filter((evento) => canales[evento.id].length === 0);

  return (
    <Card>
      <Card.Header>
        <Card.Title className="text-base">Cómo quiero enterarme</Card.Title>
        <Card.Description>
          Los avisos dentro de la aplicación llegan siempre. Aquí eliges qué se te manda además
          por fuera.
        </Card.Description>
      </Card.Header>

      <Card.Content className="flex flex-col gap-4">
        {/* En un teléfono la rejilla no cabe: la última columna se sale de la
            pantalla y los nombres de los eventos se parten en cuatro líneas.
            Ahí las dos dimensiones se recorren de otra forma —un bloque por
            evento y sus canales dentro— y cada casilla lleva su nombre al
            lado, que es lo que la cabecera de la tabla ya no puede darle. */}
        <ul className="flex flex-col gap-3 md:hidden">
          {EVENTOS.map((evento) => (
            <li
              key={evento.id}
              className="flex flex-col gap-2.5 rounded-[var(--vidrio-radio)] border border-[var(--border)] p-3.5"
            >
              <div>
                <p className="font-medium">{evento.etiqueta}</p>
                <p className="text-sm text-[var(--muted)]">{evento.detalle}</p>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {CANALES.map((canal) => (
                  <Checkbox
                    key={canal.id}
                    isSelected={canales[evento.id].includes(canal.id)}
                    onChange={(activo) => alternar(evento.id, canal.id, activo)}
                  >
                    <Checkbox.Content>
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                      {canal.etiqueta}
                    </Checkbox.Content>
                  </Checkbox>
                ))}
              </div>
            </li>
          ))}
        </ul>

        <Table className="hidden md:block">
          <Table.ScrollContainer>
            <Table.Content aria-label="Preferencias de notificación por canal">
              <Table.Header>
                <Table.Column isRowHeader>Evento</Table.Column>
                {CANALES.map((canal) => (
                  <Table.Column key={canal.id}>{canal.etiqueta}</Table.Column>
                ))}
              </Table.Header>

              <Table.Body>
                {EVENTOS.map((evento) => (
                  <Table.Row key={evento.id} id={evento.id}>
                    <Table.Cell>
                      <span className="block font-medium">{evento.etiqueta}</span>
                      <span className="block text-sm text-[var(--muted)]">{evento.detalle}</span>
                    </Table.Cell>

                    {CANALES.map((canal) => (
                      <Table.Cell key={canal.id}>
                        <Checkbox
                          isSelected={canales[evento.id].includes(canal.id)}
                          onChange={(activo) => alternar(evento.id, canal.id, activo)}
                          aria-label={`${evento.etiqueta} por ${canal.etiqueta}`}
                        >
                          <Checkbox.Content>
                            <Checkbox.Control>
                              <Checkbox.Indicator />
                            </Checkbox.Control>
                          </Checkbox.Content>
                        </Checkbox>
                      </Table.Cell>
                    ))}
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>

        {sinNingun.length > 0 ? (
          <Alert status="warning">
            <Alert.Content>
              <Alert.Description>
                {sinNingun.length === 1
                  ? `“${sinNingun[0].etiqueta}” no llegará por ningún canal externo.`
                  : `${sinNingun.length} eventos no llegarán por ningún canal externo.`}{" "}
                Los seguirás viendo en la campana.
              </Alert.Description>
            </Alert.Content>
          </Alert>
        ) : null}

        {aviso ? (
          <Alert status={aviso.ok ? "success" : "danger"}>
            <Alert.Content>
              <Alert.Description>{aviso.mensaje}</Alert.Description>
            </Alert.Content>
          </Alert>
        ) : null}
      </Card.Content>

      <Card.Footer className="flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-4">
        <Button variant="primary" isDisabled={!cambiado || guardando} onPress={guardar}>
          {guardando ? "Guardando…" : "Guardar preferencias"}
        </Button>

        <p className="text-xs text-[var(--muted)]">
          El envío real por SMS y WhatsApp lo hace el backend; aquí se define qué mandar.
        </p>
      </Card.Footer>
    </Card>
  );
}

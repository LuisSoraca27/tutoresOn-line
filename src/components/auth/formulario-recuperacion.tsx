"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Alert, Button, Card, Input, Label, TextField } from "@heroui/react";
import {
  solicitarRecuperacion,
  restablecerClave,
} from "@/features/auth/acciones";
import { CampoClave } from "./campo-clave";

export function FormularioRecuperacion({
  token,
  simulado,
}: {
  token?: string;
  simulado: boolean;
}) {
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [resultado, setResultado] = useState<{
    ok: boolean;
    mensaje: string;
    tokenDemo?: string;
  } | null>(null);
  const [cargando, iniciar] = useTransition();
  const terminado = Boolean(token && resultado?.ok);
  return (
    <Card>
      <Card.Header>
        <Card.Title className="titulo text-2xl">
          {token ? "Nueva contraseña" : "Recupera tu cuenta"}
        </Card.Title>
        <Card.Description>
          {token
            ? "Elige una contraseña de al menos 8 caracteres, con letras y números."
            : "Escribe el correo con el que te registraste."}
        </Card.Description>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        {!terminado ? (
          <form
            className="flex flex-col gap-4"
            onSubmit={(evento) => {
              evento.preventDefault();
              if (cargando) return;
              if (token && clave !== confirmacion) {
                setResultado({
                  ok: false,
                  mensaje: "Las contraseñas no coinciden.",
                });
                return;
              }
              setResultado(null);
              iniciar(async () =>
                setResultado(
                  token
                    ? await restablecerClave(token, clave)
                    : await solicitarRecuperacion(correo),
                ),
              );
            }}
          >
            {token ? (
              <>
                <CampoClave
                  valor={clave}
                  onCambio={setClave}
                  autoComplete="new-password"
                />
                <TextField
                  value={confirmacion}
                  onChange={setConfirmacion}
                  type="password"
                  autoComplete="new-password"
                  isRequired
                >
                  <Label>Repite la contraseña</Label>
                  <Input minLength={8} />
                </TextField>
              </>
            ) : (
              <TextField
                value={correo}
                onChange={setCorreo}
                type="email"
                autoComplete="email"
                isRequired
              >
                <Label>Correo electrónico</Label>
                <Input placeholder="tucorreo@ejemplo.co" />
              </TextField>
            )}
            <Button type="submit" variant="primary" isDisabled={cargando}>
              {cargando
                ? "Procesando…"
                : token
                  ? "Guardar nueva contraseña"
                  : "Solicitar enlace"}
            </Button>
          </form>
        ) : null}
        {resultado ? (
          <Alert status={resultado.ok ? "success" : "danger"}>
            <Alert.Content>
              <Alert.Description>{resultado.mensaje}</Alert.Description>
            </Alert.Content>
          </Alert>
        ) : null}
        {simulado && !token ? (
          <p className="text-sm text-[var(--muted)]">
            Modo demostración: el correo no se envía. Si usas una cuenta de
            prueba, puedes abrir aquí el enlace de recuperación, válido por 15
            minutos y para un solo uso.
          </p>
        ) : null}
        {simulado && resultado?.tokenDemo ? (
          <Link
            className="rounded font-medium text-[var(--accent)] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-[var(--focus)]"
            href={`/auth/restablecer?token=${encodeURIComponent(resultado.tokenDemo)}`}
          >
            Abrir enlace de demostración
          </Link>
        ) : null}
      </Card.Content>
      <Card.Footer className="flex flex-wrap gap-4">
        <Link
          className="rounded text-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-[var(--focus)]"
          href="/auth/login"
        >
          Volver a iniciar sesión
        </Link>
        {token && !terminado ? (
          <Link
            className="rounded text-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-[var(--focus)]"
            href="/auth/recuperar"
          >
            Solicitar otro enlace
          </Link>
        ) : null}
      </Card.Footer>
    </Card>
  );
}

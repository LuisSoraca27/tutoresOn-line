"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, Button, Card, Input, Label, TextField } from "@heroui/react";
import { CampoClave } from "@/components/auth/campo-clave";
import { iniciarSesion } from "@/features/auth/acciones";

/**
 * Inicio de sesión.
 *
 * `siguiente` viene del proxy: si alguien entró a `/estudiante/reservas` sin
 * sesión, lo devolvemos ahí después de entrar en vez de al panel genérico.
 * Perder el destino obliga a repetir la navegación entera.
 */
export function FormularioLogin({ siguiente }: { siguiente?: string }) {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [entrando, iniciar] = useTransition();

  const completo = correo.trim().length > 0 && clave.length > 0;

  function entrar() {
    if (!completo) return;
    setError(null);

    iniciar(async () => {
      const resultado = await iniciarSesion({ correo, clave }, siguiente);

      if (!resultado.ok) {
        setError(resultado.mensaje);
        return;
      }

      // `refresh` antes de navegar: el layout raíz lee la cookie en el
      // servidor, así que sin esto la barra superior seguiría mostrando
      // "Iniciar sesión" hasta la siguiente recarga completa.
      router.replace(resultado.destino);
      router.refresh();
    });
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title className="titulo text-2xl">Entrar a tu cuenta</Card.Title>
        <Card.Description>
          Con la misma cuenta entras como estudiante o como tutor: el rol lo define tu
          registro.
        </Card.Description>
      </Card.Header>

      <Card.Content>
        <form
          className="flex flex-col gap-5"
          onSubmit={(evento) => {
            evento.preventDefault();
            entrar();
          }}
        >
          <TextField
            value={correo}
            onChange={setCorreo}
            type="email"
            autoComplete="email"
            isRequired
          >
            <Label>Correo electrónico</Label>
            <Input placeholder="tucorreo@ejemplo.co" autoFocus />
          </TextField>

          <CampoClave
            valor={clave}
            onCambio={setClave}
            autoComplete="current-password"
            mostrarRequisitos={false}
          />

          {error ? (
            <Alert status="danger">
              <Alert.Content>
                <Alert.Description>{error}</Alert.Description>
              </Alert.Content>
            </Alert>
          ) : null}

          <Button type="submit" variant="primary" isDisabled={!completo || entrando}>
            {entrando ? "Entrando…" : "Entrar"}
          </Button>
        </form>
      </Card.Content>

      <Card.Footer className="flex flex-col items-start gap-2 border-t border-[var(--border)] pt-4 text-sm">
        <p className="text-[var(--muted)]">
          ¿No tienes cuenta?{" "}
          <Link
            href="/auth/registro"
            className="text-[var(--accent)] underline underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
          >
            Crear una
          </Link>
        </p>
        <Link href="/auth/recuperar" className="rounded text-sm text-[var(--accent)] underline underline-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--focus)]">Olvidé mi contraseña</Link>
      </Card.Footer>
    </Card>
  );
}

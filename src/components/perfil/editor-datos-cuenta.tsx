"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Card, Description, Input, Label, TextField } from "@heroui/react";
import { actualizarPerfil } from "@/features/auth/acciones";

/**
 * Editar los datos de la propia cuenta (F1.9).
 *
 * Nombre, correo y teléfono, que es lo que el `AuthRepo` sabe cambiar. La
 * contraseña no está aquí a propósito: cambiarla exige confirmar la actual y
 * eso lo verifica el backend, no una pantalla.
 */
export function EditorDatosCuenta({
  nombreInicial,
  correoInicial,
  telefonoInicial,
}: {
  nombreInicial: string;
  correoInicial: string;
  telefonoInicial?: string;
}) {
  const router = useRouter();
  const [nombre, setNombre] = useState(nombreInicial);
  const [correo, setCorreo] = useState(correoInicial);
  const [telefono, setTelefono] = useState(telefonoInicial ?? "");
  const [aviso, setAviso] = useState<{ ok: boolean; mensaje: string } | null>(null);
  const [guardando, iniciar] = useTransition();

  const cambiado =
    nombre !== nombreInicial ||
    correo !== correoInicial ||
    telefono !== (telefonoInicial ?? "");

  function guardar() {
    setAviso(null);

    iniciar(async () => {
      const resultado = await actualizarPerfil({ nombre, correo, telefono });

      if (!resultado.ok) {
        setAviso({ ok: false, mensaje: resultado.mensaje });
        return;
      }

      setAviso({ ok: true, mensaje: "Datos guardados." });
      // El nombre también sale en la barra superior, que se pinta con la
      // sesión del servidor: sin refrescar seguiría el anterior.
      router.refresh();
    });
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title className="text-base">Mis datos</Card.Title>
        <Card.Description>
          El nombre es el que ven las personas con las que agendas.
        </Card.Description>
      </Card.Header>

      <Card.Content className="flex flex-col gap-5">
        <TextField value={nombre} onChange={setNombre} autoComplete="name" isRequired>
          <Label>Nombre completo</Label>
          <Input />
        </TextField>

        <TextField
          value={correo}
          onChange={setCorreo}
          type="email"
          autoComplete="email"
          isRequired
        >
          <Label>Correo electrónico</Label>
          <Input />
          <Description>Es también con el que entras a la plataforma.</Description>
        </TextField>

        <TextField value={telefono} onChange={setTelefono} type="tel" autoComplete="tel">
          <Label>Teléfono (opcional)</Label>
          <Input placeholder="+57 300 123 4567" />
        </TextField>
      </Card.Content>

      <Card.Footer className="flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-4">
        <Button variant="primary" isDisabled={!cambiado || guardando} onPress={guardar}>
          {guardando ? "Guardando…" : "Guardar cambios"}
        </Button>

        {cambiado && !guardando ? (
          <Button
            variant="ghost"
            onPress={() => {
              setNombre(nombreInicial);
              setCorreo(correoInicial);
              setTelefono(telefonoInicial ?? "");
              setAviso(null);
            }}
          >
            Descartar
          </Button>
        ) : null}

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

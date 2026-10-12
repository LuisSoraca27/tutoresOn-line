"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Avatar, Button, Chip, Dropdown } from "@heroui/react";
import { ETIQUETA_ROL, INICIO_POR_ROL } from "@/config/sitio";
import { cerrarSesion } from "@/features/auth/acciones";
import { useSesion } from "@/features/sesion/contexto-sesion";
import { iniciales } from "@/lib/texto";

/** A dónde lleva "Mi perfil" según el rol. */
const PERFIL_POR_ROL: Record<string, string> = {
  estudiante: "/estudiante/perfil",
  tutor: "/tutor/perfil",
};

export function MenuUsuario() {
  const { usuario, rol } = useSesion();
  const [saliendo, iniciar] = useTransition();

  if (!usuario) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
          <Link href="/auth/login">Iniciar sesión</Link>
        </Button>
        <Button variant="primary" size="sm">
          <Link href="/auth/registro" className="hidden sm:inline">
            Registrarme
          </Link>
          <Link href="/auth/login" className="sm:hidden">
            Entrar
          </Link>
        </Button>
      </div>
    );
  }

  const perfil = PERFIL_POR_ROL[usuario.rol];

  function accionar(clave: string) {
    // `cerrarSesion` borra la cookie y redirige a la portada desde el
    // servidor: no hay que tocar el router aquí.
    if (clave === "salir") {
      iniciar(() => {
        void cerrarSesion();
      });
    }
  }

  return (
    <Dropdown>
      <Dropdown.Trigger
        aria-label="Abrir menú de la cuenta"
        className="flex items-center gap-2 rounded-full p-0.5 outline-none hover:bg-[var(--default-soft)] focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
      >
        <Avatar size="sm">
          <Avatar.Fallback>{iniciales(usuario.nombre)}</Avatar.Fallback>
        </Avatar>
        <span className="hidden text-sm sm:inline">{usuario.nombre.split(" ")[0]}</span>
      </Dropdown.Trigger>

      <Dropdown.Popover placement="bottom end" className="min-w-64">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <Avatar size="md">
            <Avatar.Fallback>{iniciales(usuario.nombre)}</Avatar.Fallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{usuario.nombre}</p>
            <p className="truncate text-xs text-[var(--muted)]">{usuario.correo}</p>
          </div>
          <Chip size="sm" variant="soft" color="accent">
            {ETIQUETA_ROL[rol]}
          </Chip>
        </div>

        <Dropdown.Menu onAction={(clave) => accionar(String(clave))}>
          <Dropdown.Section>
            <Dropdown.Item id="panel" href={INICIO_POR_ROL[rol]}>
              Ir a mi panel
            </Dropdown.Item>
            {perfil ? (
              <Dropdown.Item id="perfil" href={perfil}>
                Mi perfil
              </Dropdown.Item>
            ) : null}
          </Dropdown.Section>

          <Dropdown.Section>
            <Dropdown.Item id="salir">
              {saliendo ? "Cerrando sesión…" : "Cerrar sesión"}
            </Dropdown.Item>
          </Dropdown.Section>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}

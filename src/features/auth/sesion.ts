import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Rol } from "@/config/sitio";
import { authRepo } from "./index";
import { COOKIE_SESION, deserializarSesion, serializarSesion, type Sesion, type Usuario } from "./auth.types";

/**
 * Sesión del lado del servidor.
 *
 * Marcado `server-only` a propósito: si alguien importa esto desde un
 * componente de cliente, el build falla en vez de filtrar la cookie al
 * navegador.
 *
 * La cookie es `httpOnly`, así que el JavaScript de la página no puede
 * leerla ni robarla. Ese es justo el motivo de que el rol también viaje
 * dentro: el `proxy` corre antes que cualquier componente y necesita
 * saberlo sin poder consultar la base de datos.
 */

const DURACION_DIAS = 7;

export async function guardarSesion(sesion: Sesion): Promise<void> {
  const almacen = await cookies();

  almacen.set(COOKIE_SESION, serializarSesion(sesion), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: DURACION_DIAS * 24 * 60 * 60,
  });
}

export async function borrarSesion(): Promise<void> {
  const almacen = await cookies();
  almacen.delete(COOKIE_SESION);
}

/** El usuario de la petición actual, o `null` si nadie inició sesión. */
export async function usuarioActual(): Promise<Usuario | null> {
  const almacen = await cookies();
  const sesion = deserializarSesion(almacen.get(COOKIE_SESION)?.value);

  if (!sesion) return null;

  // La cookie dice quién es; el repositorio confirma que existe. Una cookie
  // de una cuenta borrada no debe dar acceso a nada.
  return authRepo.porId(sesion.id);
}

/**
 * Exige sesión, y opcionalmente un rol concreto.
 *
 * El `proxy` ya redirige antes de llegar aquí, pero esta comprobación es la
 * que de verdad protege: el proxy solo mira la cookie y se puede saltar; un
 * componente de servidor, no.
 */
export async function exigirUsuario(rol?: Exclude<Rol, "visitante">): Promise<Usuario> {
  const usuario = await usuarioActual();

  if (!usuario) redirect("/auth/login");
  if (rol && usuario.rol !== rol) redirect("/");

  return usuario;
}

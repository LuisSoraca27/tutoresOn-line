import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Rol } from "@/config/sitio";
import { ErrorHttp, pedir } from "@/lib/http";
import { env } from "@/lib/env";
import { COOKIE_SESION, type Usuario } from "./auth.types";

const DURACION_SEGUNDOS = 7 * 24 * 60 * 60;

export async function guardarSesion(token: string): Promise<void> {
  const almacen = await cookies();
  almacen.set(COOKIE_SESION, token, {
    httpOnly: true, sameSite: "lax", path: "/",
    secure: process.env.NODE_ENV === "production", maxAge: DURACION_SEGUNDOS,
  });
}

export async function tokenSesion(): Promise<string | undefined> {
  return (await cookies()).get(COOKIE_SESION)?.value;
}

export async function borrarSesion(): Promise<void> {
  const token = await tokenSesion();
  if (token) {
    try { await pedir<void>("/auth/logout", { method: "POST", headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }); }
    catch (error) { if (!(error instanceof ErrorHttp && error.estado === 401)) console.error("No se pudo revocar la sesión en el servidor."); }
  }
  (await cookies()).delete(COOKIE_SESION);
}

export async function usuarioActual(): Promise<Usuario | null> {
  const token = await tokenSesion();
  if (!token) return null;
  try {
    const usuario = await pedir<Usuario>("/auth/me", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    return usuario.avatarUrl?.startsWith("/api/v1/tutores/")
      ? { ...usuario, avatarUrl: new URL(usuario.avatarUrl, env.apiUrl).toString() }
      : usuario;
  } catch (error) {
    if (error instanceof ErrorHttp && (error.estado === 401 || error.estado === 0)) return null;
    throw error;
  }
}

export async function exigirUsuario(rol?: Exclude<Rol, "visitante">): Promise<Usuario> {
  const usuario = await usuarioActual();
  if (!usuario) redirect("/auth/login");
  if (rol && usuario.rol !== rol) redirect("/");
  return usuario;
}

import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESION, deserializarSesion } from "@/features/auth/auth.types";
import { INICIO_POR_ROL, type Rol } from "@/config/sitio";

/**
 * Guardia de rutas (F1.7, F1.8).
 *
 * En Next.js 16 esto se llama `proxy`; era `middleware` hasta la 15. Corre
 * antes de renderizar nada, así que evita pintar un panel entero para
 * después redirigir.
 *
 * Es una comprobación optimista: solo mira la cookie, no consulta al
 * repositorio. La comprobación que de verdad protege es `exigirUsuario()`
 * en los layouts de cada panel, que sí verifica que la cuenta exista.
 * Si alguien falsifica la cookie pasa de aquí, pero no del layout.
 */
const PROTEGIDAS: { prefijo: string; rol: Exclude<Rol, "visitante"> }[] = [
  { prefijo: "/estudiante", rol: "estudiante" },
  { prefijo: "/tutor", rol: "tutor" },
];

/** Necesitan sesión, pero las usan varios roles. */
const CON_SESION = ["/notificaciones", "/sesion"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sesion = deserializarSesion(request.cookies.get(COOKIE_SESION)?.value);

  const protegida = PROTEGIDAS.find(
    (ruta) => pathname === ruta.prefijo || pathname.startsWith(`${ruta.prefijo}/`),
  );

  const requiereSesion =
    protegida !== undefined ||
    CON_SESION.some((prefijo) => pathname === prefijo || pathname.startsWith(`${prefijo}/`));

  if (!requiereSesion) return NextResponse.next();

  // Sin sesión: al login, guardando a dónde iba para devolverlo después.
  if (!sesion) {
    const destino = new URL("/auth/login", request.url);
    destino.searchParams.set("siguiente", pathname + request.nextUrl.search);
    return NextResponse.redirect(destino);
  }

  // Con sesión del rol equivocado: a su propio panel. Un estudiante que
  // llega a /tutor no necesita un error, necesita salir de ahí.
  if (protegida && sesion.rol !== protegida.rol) {
    return NextResponse.redirect(new URL(INICIO_POR_ROL[sesion.rol], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/estudiante/:path*", "/tutor/:path*", "/notificaciones", "/sesion/:path*"],
};

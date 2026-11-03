import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESION } from "@/features/auth/auth.types";

// Comprobación optimista; los layouts verifican sesión y rol en el backend.
export function proxy(request: NextRequest) {
  if (request.cookies.has(COOKIE_SESION)) return NextResponse.next();
  const destino = new URL("/auth/login", request.url);
  destino.searchParams.set("siguiente", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(destino);
}

export const config = {
  matcher: ["/estudiante/:path*", "/tutor/:path*", "/notificaciones", "/sesion/:path*"],
};

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, Chip } from "@heroui/react";
import { usuarioActual } from "@/features/auth/sesion";
import { INICIO_POR_ROL } from "@/config/sitio";

export const metadata: Metadata = { title: "Crear cuenta" };

const OPCIONES = [
  {
    href: "/auth/registro/estudiante",
    titulo: "Soy estudiante",
    resumen: "Busco quién me explique.",
    detalle:
      "Cuenta en un paso. Después puedes buscar por materia, nivel y ciudad, reservar y calificar.",
    marca: "Toma un minuto",
  },
  {
    href: "/auth/registro/tutor",
    titulo: "Soy tutor",
    resumen: "Quiero dictar clases.",
    detalle:
      "Tres pasos: tus datos, cómo te presentas y qué dictas. Al terminar ya apareces en la búsqueda.",
    marca: "Tres pasos",
  },
];

export default async function PaginaElegirRegistro() {
  const usuario = await usuarioActual();
  if (usuario) redirect(INICIO_POR_ROL[usuario.rol]);

  return (
    <div className="w-full max-w-3xl">
      <div className="pb-7 text-center">
        <h1 className="titulo text-3xl">Crear una cuenta</h1>
        <p className="mx-auto max-w-[52ch] pt-2 text-sm text-[var(--muted)]">
          El rol se define aquí y no se cambia después: un tutor tiene perfil público, tarifas y
          agenda; un estudiante, reservas y favoritos.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {OPCIONES.map((opcion) => (
          <Link
            key={opcion.href}
            href={opcion.href}
            className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
          >
            <Card className="h-full transition-transform hover:-translate-y-0.5">
              <Card.Header>
                <Chip size="sm" variant="soft">
                  {opcion.marca}
                </Chip>
                <Card.Title className="titulo pt-3 text-xl">{opcion.titulo}</Card.Title>
                <Card.Description>{opcion.resumen}</Card.Description>
              </Card.Header>
              <Card.Content>
                <p className="text-sm text-[var(--muted)]">{opcion.detalle}</p>
              </Card.Content>
            </Card>
          </Link>
        ))}
      </div>

      <p className="pt-6 text-center text-sm text-[var(--muted)]">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/auth/login"
          className="text-[var(--accent)] underline underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}

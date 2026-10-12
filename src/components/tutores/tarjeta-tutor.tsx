import Link from "next/link";
import { Avatar, Button, Card, Chip } from "@heroui/react";
import { BotonFavorito } from "@/components/tutores/boton-favorito";
import { Estrellas } from "@/components/ui/estrellas";
import { IconoMapa, IconoVerificado, IconoVideo } from "@/components/ui/iconos";
import type { Tutor } from "@/features/tutores";
import { precioHora } from "@/lib/formato";
import { iniciales } from "@/lib/texto";

const ETIQUETA_MODALIDAD: Record<Tutor["modalidad"], string> = {
  virtual: "Virtual",
  presencial: "Presencial",
  ambas: "Virtual y presencial",
};

/**
 * Tarjeta de resultado de búsqueda (F2.11).
 *
 * Recibe los nombres ya resueltos en lugar de los identificadores: así no
 * necesita conocer el catálogo ni pedir datos por su cuenta (principio S).
 */
export function TarjetaTutor({
  tutor,
  materias,
  ciudad,
  favorito,
}: {
  tutor: Tutor;
  materias: string[];
  ciudad?: string;
  /** Solo cuando hay un estudiante que pueda guardarlo (F2.16). */
  favorito?: { estudianteId: string; guardado: boolean };
}) {
  return (
    // `min-w-0`: dentro de una rejilla, la columna crece hasta el ancho mínimo
    // de su contenido, y aquí ese mínimo lo fija la fila del encabezado —avatar,
    // chip y botón—. Sin esto la tarjeta empuja la columna a 410 px y en un
    // teléfono se sale de la pantalla.
    <Card className="flex h-full min-w-0 flex-col">
      <Card.Header className="flex flex-row items-start gap-3">
        <Avatar size="lg" className="shrink-0">
          {tutor.avatarUrl ? <Avatar.Image src={tutor.avatarUrl} alt={`Foto de ${tutor.nombre}`} /> : null}
          <Avatar.Fallback>{iniciales(tutor.nombre)}</Avatar.Fallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <Card.Title className="flex items-center gap-1.5 text-base">
            <Link
              href={`/tutores/${tutor.id}`}
              className="truncate rounded outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
            >
              {tutor.nombre}
            </Link>
            {tutor.verificado ? (
              <IconoVerificado
                className="size-4 shrink-0 text-[var(--accent)]"
                aria-label="Tutor verificado"
              />
            ) : null}
          </Card.Title>
          <Card.Description className="truncate">{tutor.titulo}</Card.Description>
          <div className="mt-1.5">
            <Estrellas valor={tutor.reputacion.promedio} total={tutor.reputacion.total} />
          </div>
        </div>

        {/* En un teléfono este chip le quitaba al nombre casi cien píxeles y
            "Laura Cifuentes" quedaba en "Laura Cifuent…". Ahí abajo, en la
            línea de modalidad y sesiones, sobra sitio: es el mismo dato en el
            hueco que sí existe. */}
        {tutor.disponibleAhora ? (
          <Chip size="sm" color="success" variant="soft" className="hidden shrink-0 sm:inline-flex">
            En línea
          </Chip>
        ) : null}
        {favorito ? (
          <BotonFavorito
            estudianteId={favorito.estudianteId}
            tutorId={tutor.id}
            nombre={tutor.nombre}
            guardadoInicial={favorito.guardado}
          />
        ) : null}
      </Card.Header>

      <Card.Content className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap gap-1.5">
          {materias.map((materia) => (
            <Chip key={materia} size="sm" variant="soft">
              {materia}
            </Chip>
          ))}
        </div>

        <p className="line-clamp-2 text-sm text-[var(--muted)]">{tutor.bio}</p>

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
          {tutor.disponibleAhora ? (
            <Chip size="sm" color="success" variant="soft" className="sm:hidden">
              En línea
            </Chip>
          ) : null}

          <span className="flex items-center gap-1.5">
            {tutor.modalidad === "presencial" ? (
              <IconoMapa className="size-3.5" />
            ) : (
              <IconoVideo className="size-3.5" />
            )}
            {ETIQUETA_MODALIDAD[tutor.modalidad]}
          </span>
          {ciudad ? <span>{ciudad}</span> : null}
          <span className="tabular-nums">{tutor.sesionesCompletadas} sesiones</span>
        </div>
      </Card.Content>

      <Card.Footer className="flex items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
        <span className="text-sm">
          <span className="text-[var(--muted)]">Desde </span>
          <span className="font-medium tabular-nums">{precioHora(tutor.precioDesde)}</span>
        </span>
        <Button variant="primary" size="sm">
          <Link href={`/estudiante/reservar/${tutor.id}`}>Reservar</Link>
        </Button>
      </Card.Footer>
    </Card>
  );
}

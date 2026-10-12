import Link from "next/link";
import type { Metadata } from "next";
import { Button, EmptyState } from "@heroui/react";
import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";
import { TarjetaTutor } from "@/components/tutores/tarjeta-tutor";
import { IconoCorazon } from "@/components/ui/iconos";
import { catalogosRepo } from "@/features/catalogos";
import { favoritosRepo } from "@/features/favoritos";
import { estudianteActual } from "@/features/sesion/identidades";
import { tutoresRepo, type Tutor } from "@/features/tutores";

export const metadata: Metadata = { title: "Favoritos" };

/** Datos de una persona concreta: no se prerenderizan. */
export const dynamic = "force-dynamic";

export default async function PaginaFavoritos() {
  const estudianteId = await estudianteActual();

  const ids = await favoritosRepo.de(estudianteId);

  const [tutores, materias, ciudades] = await Promise.all([
    Promise.all(ids.map((id) => tutoresRepo.obtener(id))),
    catalogosRepo.materias(),
    catalogosRepo.ciudades(),
  ]);

  const guardados = tutores.filter((tutor): tutor is Tutor => tutor !== null);
  const nombreMateria = new Map(materias.map((m) => [m.id, m.nombre]));
  const nombreCiudad = new Map(ciudades.map((c) => [c.id, c.nombre]));

  return (
    <>
      <EncabezadoPagina
        titulo="Favoritos"
        descripcion="Los tutores que guardaste para volver a mirarlos con calma."
      />

      {guardados.length === 0 ? (
        <EmptyState className="py-16 text-center">
          <IconoCorazon className="mx-auto size-8 text-[var(--muted)]" />
          <h2 className="titulo pt-3 text-lg">Todavía no has guardado a nadie</h2>
          <p className="mx-auto max-w-[46ch] pt-1.5 text-sm text-[var(--muted)]">
            Toca el corazón en la tarjeta de cualquier tutor y aparecerá aquí, para comparar sin
            perder los que te gustaron.
          </p>
          <Button variant="primary" className="mt-5">
            <Link href="/buscar">Buscar tutores</Link>
          </Button>
        </EmptyState>
      ) : (
        <>
          <p className="pb-4 text-sm text-[var(--muted)]">
            <span className="font-medium text-[var(--foreground)] tabular-nums">
              {guardados.length}
            </span>{" "}
            {guardados.length === 1 ? "tutor guardado" : "tutores guardados"}
          </p>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {guardados.map((tutor) => (
              <TarjetaTutor
                key={tutor.id}
                tutor={tutor}
                materias={tutor.materias.map((m) => nombreMateria.get(m.materiaId) ?? m.materiaId)}
                ciudad={tutor.ciudadId ? nombreCiudad.get(tutor.ciudadId) : undefined}
                favorito={{ estudianteId: estudianteId, guardado: true }}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}

import Link from "next/link";
import { Button, Chip, Separator } from "@heroui/react";
import { BuscadorInicio } from "@/components/tutores/buscador-inicio";
import { TarjetaTutor } from "@/components/tutores/tarjeta-tutor";
import { catalogosRepo } from "@/features/catalogos";
import { tutoresRepo } from "@/features/tutores";
import { sitio } from "@/config/sitio";

export default async function Portada() {
  const [destacados, materias, niveles, ciudades] = await Promise.all([
    tutoresRepo.destacados(6),
    catalogosRepo.materias(),
    catalogosRepo.niveles(),
    catalogosRepo.ciudades(),
  ]);

  const nombreMateria = new Map(materias.map((m) => [m.id, m.nombre]));
  const nombreCiudad = new Map(ciudades.map((c) => [c.id, c.nombre]));
  const areas = [...new Set(materias.map((m) => m.area))];

  return (
    <>
      <section className="mx-auto w-full max-w-[1100px] px-4 pt-14 pb-10 sm:px-6 sm:pt-20">
        <Chip color="accent" variant="soft" size="sm">
          Virtual y presencial
        </Chip>

        <h1 className="titulo mt-5 max-w-[18ch] text-4xl leading-[1.05] sm:text-6xl">
          El tutor correcto, a la hora que puedes.
        </h1>

        <p className="mt-5 max-w-[58ch] text-lg text-[var(--muted)]">{sitio.descripcion}</p>

        <div className="mt-9">
          <BuscadorInicio materias={materias} niveles={niveles} />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
          <span>Áreas disponibles:</span>
          {areas.map((area) => (
            <Chip key={area} size="sm" variant="soft">
              {area}
            </Chip>
          ))}
        </div>
      </section>

      <Separator />

      <section className="mx-auto w-full max-w-[1100px] px-4 py-14 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="titulo text-2xl">Tutores mejor calificados</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Ordenados por verificación, calificación y sesiones dictadas.
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Link href="/buscar">Ver todos</Link>
          </Button>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {destacados.map((tutor) => (
            <TarjetaTutor
              key={tutor.id}
              tutor={tutor}
              materias={tutor.materias.map((m) => nombreMateria.get(m.materiaId) ?? m.materiaId)}
              ciudad={tutor.ciudadId ? nombreCiudad.get(tutor.ciudadId) : undefined}
            />
          ))}
        </div>
      </section>
    </>
  );
}

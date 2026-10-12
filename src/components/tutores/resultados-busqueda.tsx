import Link from "next/link";
import { Button, EmptyState } from "@heroui/react";
import { PaginacionResultados } from "@/components/tutores/paginacion-resultados";
import { TarjetaTutor } from "@/components/tutores/tarjeta-tutor";
import { IconoBuscar } from "@/components/ui/iconos";
import { catalogosRepo } from "@/features/catalogos";
import { favoritosRepo } from "@/features/favoritos";
import { usuarioActual } from "@/features/auth/sesion";
import { tutoresRepo, type FiltrosTutor } from "@/features/tutores";

/**
 * Trae y dibuja los resultados. Es un componente de servidor propio para
 * que la página lo pueda envolver en <Suspense> y mostrar el esqueleto
 * mientras llega la respuesta, sin bloquear los filtros.
 */
export async function ResultadosBusqueda({ filtros }: { filtros: FiltrosTutor }) {
  // La búsqueda es pública, así que el corazón solo tiene sentido para un
  // estudiante con sesión: un visitante no tiene dónde guardar y un tutor no
  // guarda tutores.
  const usuario = await usuarioActual();
  const estudianteId = usuario?.rol === "estudiante" ? usuario.id : null;

  const [pagina, materias, ciudades, favoritos] = await Promise.all([
    tutoresRepo.buscar(filtros),
    catalogosRepo.materias(),
    catalogosRepo.ciudades(),
    estudianteId ? favoritosRepo.de(estudianteId) : Promise.resolve([]),
  ]);

  const guardados = new Set(favoritos);

  if (pagina.items.length === 0) {
    return <SinResultados />;
  }

  const nombreMateria = new Map(materias.map((m) => [m.id, m.nombre]));
  const nombreCiudad = new Map(ciudades.map((c) => [c.id, c.nombre]));

  return (
    <>
      <p className="pb-4 text-sm text-[var(--muted)]">
        <span className="font-medium text-[var(--foreground)] tabular-nums">{pagina.total}</span>{" "}
        {pagina.total === 1 ? "tutor encontrado" : "tutores encontrados"}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {pagina.items.map((tutor) => (
          <TarjetaTutor
            key={tutor.id}
            tutor={tutor}
            materias={tutor.materias.map((m) => nombreMateria.get(m.materiaId) ?? m.materiaId)}
            ciudad={tutor.ciudadId ? nombreCiudad.get(tutor.ciudadId) : undefined}
            favorito={
              estudianteId ? { estudianteId, guardado: guardados.has(tutor.id) } : undefined
            }
          />
        ))}
      </div>

      <PaginacionResultados
        filtros={filtros}
        total={pagina.total}
        porPagina={pagina.porPagina}
      />
    </>
  );
}

/** Estado vacío con salida concreta, no solo un aviso (F2.13). */
function SinResultados() {
  return (
    <EmptyState className="py-16 text-center">
      <IconoBuscar className="mx-auto size-8 text-[var(--muted)]" />
      <h2 className="titulo pt-3 text-lg">Ningún tutor coincide con esta búsqueda</h2>
      <p className="mx-auto max-w-[46ch] pt-1.5 text-sm text-[var(--muted)]">
        Prueba a ampliar el rango de precio, quitar el filtro de calificación o cambiar la
        modalidad a virtual: hay más tutores disponibles en línea que en cada ciudad.
      </p>
      <Button variant="outline" className="mt-5">
        <Link href="/buscar">Quitar todos los filtros</Link>
      </Button>
    </EmptyState>
  );
}

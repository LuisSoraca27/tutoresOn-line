import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Avatar, Button, Card, Chip, Separator, Table, Tabs } from "@heroui/react";
import { ListaResenas } from "@/components/resenas/lista-resenas";
import { ResumenReputacion } from "@/components/tutores/resumen-reputacion";
import { Estrellas } from "@/components/ui/estrellas";
import { IconoMapa, IconoVerificado, IconoVideo } from "@/components/ui/iconos";
import { catalogosRepo } from "@/features/catalogos";
import { combinarReputacion, resenasRepo } from "@/features/resenas";
import { motivosDeReporte } from "@/features/resenas/acciones";
import { tutoresRepo, type Tutor } from "@/features/tutores";
import { precioHora } from "@/lib/formato";
import { iniciales } from "@/lib/texto";

const ETIQUETA_MODALIDAD: Record<Tutor["modalidad"], string> = {
  virtual: "Solo virtual",
  presencial: "Solo presencial",
  ambas: "Virtual y presencial",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const tutor = await tutoresRepo.obtener(id);

  if (!tutor) return { title: "Tutor no encontrado" };

  return {
    title: `${tutor.nombre} — ${tutor.titulo}`,
    description: tutor.bio,
  };
}

export default async function PerfilTutor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [tutor, materias, niveles, ciudades, resenas] = await Promise.all([
    tutoresRepo.obtener(id),
    catalogosRepo.materias(),
    catalogosRepo.niveles(),
    catalogosRepo.ciudades(),
    resenasRepo.deTutor(id),
  ]);

  const motivosReporte = await motivosDeReporte();

  if (!tutor) notFound();

  // El agregado histórico más lo que se ha escrito en la plataforma.
  const reputacion = combinarReputacion(tutor.reputacion, resenas);

  const nombreMateria = new Map(materias.map((m) => [m.id, m.nombre]));
  const nombreNivel = new Map(niveles.map((n) => [n.id, n.nombre]));
  const ciudad = tutor.ciudadId ? ciudades.find((c) => c.id === tutor.ciudadId) : undefined;

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-8 sm:px-6">
      {/* ---------------- Encabezado ---------------- */}
      <header className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <Avatar size="lg" className="size-20 shrink-0 text-xl">
          {tutor.avatarUrl ? <Avatar.Image src={tutor.avatarUrl} alt={`Foto de ${tutor.nombre}`} /> : null}
          <Avatar.Fallback>{iniciales(tutor.nombre)}</Avatar.Fallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="titulo text-3xl">{tutor.nombre}</h1>
            {tutor.verificado ? (
              <span className="flex items-center gap-1 text-sm text-[var(--accent)]">
                <IconoVerificado className="size-4" />
                Verificado
              </span>
            ) : null}
          </div>

          <p className="mt-1 text-[var(--muted)]">{tutor.titulo}</p>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            <Estrellas valor={reputacion.promedio} total={reputacion.total} />
            <span className="text-sm text-[var(--muted)] tabular-nums">
              {tutor.sesionesCompletadas} sesiones dictadas
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {tutor.disponibleAhora ? (
              <Chip size="sm" color="success" variant="soft">
                Disponible ahora
              </Chip>
            ) : null}
            {tutor.respondeRapido ? (
              <Chip size="sm" variant="soft">
                Responde rápido
              </Chip>
            ) : null}
            {tutor.idiomas.map((idioma) => (
              <Chip key={idioma} size="sm" variant="soft">
                {idioma}
              </Chip>
            ))}
          </div>
        </div>
      </header>

      <div className="mt-9 flex flex-col gap-8 lg:flex-row">
        {/* ---------------- Contenido ---------------- */}
        <div className="min-w-0 flex-1">
          <Tabs>
            <Tabs.ListContainer>
              <Tabs.List aria-label="Información del tutor">
                <Tabs.Tab id="perfil">
                  Sobre mí
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="materias">
                  Materias y tarifas
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="resenas">
                  Reseñas
                  <Tabs.Indicator />
                </Tabs.Tab>
              </Tabs.List>
            </Tabs.ListContainer>

            <Tabs.Panel id="perfil" className="pt-6">
              <p className="max-w-[65ch] leading-relaxed">{tutor.bio}</p>

              <Separator className="my-6" />

              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs tracking-wide text-[var(--muted)] uppercase">Modalidad</dt>
                  <dd className="mt-1 flex items-center gap-2">
                    {tutor.modalidad === "virtual" ? (
                      <IconoVideo className="size-4 text-[var(--muted)]" />
                    ) : (
                      <IconoMapa className="size-4 text-[var(--muted)]" />
                    )}
                    {ETIQUETA_MODALIDAD[tutor.modalidad]}
                  </dd>
                </div>

                {ciudad ? (
                  <div>
                    <dt className="text-xs tracking-wide text-[var(--muted)] uppercase">
                      Zona de atención
                    </dt>
                    <dd className="mt-1">
                      {ciudad.nombre}, {ciudad.departamento}
                      {tutor.radioKm ? ` · hasta ${tutor.radioKm} km a la redonda` : ""}
                    </dd>
                  </div>
                ) : null}

                <div>
                  <dt className="text-xs tracking-wide text-[var(--muted)] uppercase">Idiomas</dt>
                  <dd className="mt-1">{tutor.idiomas.join(", ")}</dd>
                </div>
              </dl>
            </Tabs.Panel>

            <Tabs.Panel id="materias" className="pt-6">
              <Table>
                <Table.ScrollContainer>
                  <Table.Content aria-label="Materias, niveles y tarifas">
                    <Table.Header>
                      <Table.Column isRowHeader>Materia</Table.Column>
                      <Table.Column>Niveles</Table.Column>
                      <Table.Column>Tarifa</Table.Column>
                    </Table.Header>
                    <Table.Body>
                      {tutor.materias.map((materia) => (
                        <Table.Row key={materia.materiaId} id={materia.materiaId}>
                          <Table.Cell className="font-medium">
                            {nombreMateria.get(materia.materiaId) ?? materia.materiaId}
                          </Table.Cell>
                          <Table.Cell>
                            <span className="flex flex-wrap gap-1.5">
                              {materia.nivelIds.map((nivel) => (
                                <Chip key={nivel} size="sm" variant="soft">
                                  {nombreNivel.get(nivel) ?? nivel}
                                </Chip>
                              ))}
                            </span>
                          </Table.Cell>
                          <Table.Cell className="tabular-nums whitespace-nowrap">
                            {precioHora(materia.precioHora)}
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Content>
                </Table.ScrollContainer>
              </Table>
            </Tabs.Panel>

            <Tabs.Panel id="resenas" className="pt-6">
              <ResumenReputacion reputacion={reputacion} />

              <Separator className="my-7" />

              <ListaResenas resenas={resenas} motivosReporte={motivosReporte} />
            </Tabs.Panel>
          </Tabs>
        </div>

        {/* ---------------- Reserva ---------------- */}
        <aside className="lg:w-80 lg:shrink-0">
          <Card className="lg:sticky lg:top-24">
            <Card.Header>
              <Card.Title className="text-base">Reservar una sesión</Card.Title>
              <Card.Description>
                Desde{" "}
                <span className="font-medium text-[var(--foreground)] tabular-nums">
                  {precioHora(tutor.precioDesde)}
                </span>
              </Card.Description>
            </Card.Header>

            <Card.Content className="flex flex-col gap-3">
              <Button variant="primary">
                <Link href={`/estudiante/reservar/${tutor.id}`}>Elegir horario</Link>
              </Button>
              <p className="text-xs text-[var(--muted)]">
                Eliges materia, duración y turno. La reserva queda pendiente hasta que
                {" "}{tutor.nombre.split(" ")[0]} la acepte.
              </p>
            </Card.Content>
          </Card>
        </aside>
      </div>
    </div>
  );
}

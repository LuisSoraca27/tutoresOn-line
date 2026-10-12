import type { Metadata } from "next";
import { Avatar, Card, Chip } from "@heroui/react";
import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";
import { EditorDatosCuenta } from "@/components/perfil/editor-datos-cuenta";
import { PreferenciasNotificacion } from "@/components/perfil/preferencias-notificacion";
import { catalogosRepo } from "@/features/catalogos";
import { exigirUsuario } from "@/features/auth/sesion";
import { preferenciasRepo } from "@/features/preferencias";
import { iniciales } from "@/lib/texto";

export const metadata: Metadata = { title: "Mi perfil" };

/** Datos de una persona concreta: no se prerenderizan. */
export const dynamic = "force-dynamic";

export default async function PaginaPerfilEstudiante() {
  const yo = await exigirUsuario("estudiante");

  const [preferencias, niveles] = await Promise.all([
    preferenciasRepo.de(yo.id),
    catalogosRepo.niveles(),
  ]);

  const nivel = niveles.find((candidato) => candidato.id === yo.nivelId)?.nombre;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <EncabezadoPagina
        titulo="Mi perfil"
        descripcion="Tus datos y por dónde quieres que te avisemos."
      />

      <div className="flex flex-col gap-5">
        <Card>
          <Card.Header className="flex flex-row items-center gap-3">
            <Avatar size="lg" className="shrink-0">
              <Avatar.Fallback>{iniciales(yo.nombre)}</Avatar.Fallback>
            </Avatar>
            <div className="min-w-0">
              <Card.Title className="text-base">{yo.nombre}</Card.Title>
              <Card.Description>{yo.correo}</Card.Description>
            </div>
            {nivel ? (
              <Chip size="sm" variant="soft" color="accent" className="ml-auto">
                {nivel}
              </Chip>
            ) : null}
          </Card.Header>
        </Card>

        <EditorDatosCuenta
          nombreInicial={yo.nombre}
          correoInicial={yo.correo}
          telefonoInicial={yo.telefono}
        />

        <PreferenciasNotificacion usuarioId={yo.id} iniciales={preferencias.canales} />
      </div>
    </div>
  );
}

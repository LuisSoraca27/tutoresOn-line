import type { Metadata } from "next";
import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";
import { Conversacion } from "@/components/asistente/conversacion";

export const metadata: Metadata = {
  title: "Asistente",
  description: "Describe lo que necesitas en tus palabras y te proponemos tutores.",
};

export default function PaginaAsistente() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <EncabezadoPagina
        titulo="Asistente"
        descripcion="La funcionalidad con IA generativa del proyecto: describe el problema con tus palabras y te propone tutores concretos, explicando qué entendió."
      />

      <Conversacion />
    </div>
  );
}

import { Avatar, Chip, Separator } from "@heroui/react";
import { Estrellas } from "@/components/ui/estrellas";
import { CRITERIOS } from "@/features/resenas";
import type { ResenaPublica } from "@/features/resenas/reales";
import { fechaLarga } from "@/lib/formato";
import { iniciales } from "@/lib/texto";

export function ListaResenasPublicas({ resenas }: { resenas: ResenaPublica[] }) {
  if (!resenas.length) return <p className="py-8 text-center text-sm text-[var(--muted)]">Este tutor todavía no tiene reseñas.</p>;
  return <ul className="flex flex-col">{resenas.map((r, i) => <li key={r.id}>
    {i > 0 ? <Separator className="my-5" /> : null}
    <article className="flex gap-3"><Avatar size="sm" className="shrink-0"><Avatar.Fallback>{iniciales(r.estudianteNombre)}</Avatar.Fallback></Avatar>
      <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-x-3 gap-y-1"><span className="font-medium">{r.estudianteNombre}</span><Estrellas valor={r.puntaje} tamano={14} mostrarValor={false} /><span className="text-sm text-[var(--muted)]">{fechaLarga(r.creadaEn)}</span></div>
        <p className="pt-2 leading-relaxed">{r.comentario}</p>
        {r.criterios ? <div className="flex flex-wrap gap-1.5 pt-3">{CRITERIOS.map((c) => <Chip key={c.id} size="sm" variant="soft">{c.etiqueta}: {r.criterios![c.id]}/5</Chip>)}</div> : null}
        {r.respuestaTutor ? <div className="mt-4 rounded-lg bg-[var(--surface-2)] p-3"><p className="text-xs tracking-wide text-[var(--muted)] uppercase">Respuesta del tutor</p><p className="pt-1.5 text-sm leading-relaxed">{r.respuestaTutor}</p></div> : null}
      </div>
    </article>
  </li>)}</ul>;
}

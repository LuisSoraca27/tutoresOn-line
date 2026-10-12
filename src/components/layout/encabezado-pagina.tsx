export function EncabezadoPagina({
  titulo,
  descripcion,
}: {
  titulo: string;
  descripcion: string;
}) {
  return (
    <header className="flex flex-col gap-2 pb-7">
      <h1 className="titulo text-2xl">{titulo}</h1>
      <p className="max-w-[62ch] text-sm text-[var(--muted)]">{descripcion}</p>
    </header>
  );
}

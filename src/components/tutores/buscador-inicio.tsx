"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Label, ListBox, SearchField, Select, type Key } from "@heroui/react";
import { IconoBuscar } from "@/components/ui/iconos";
import type { Materia, Nivel } from "@/features/catalogos";

/**
 * Buscador principal de la portada (F2.1). No consulta tutores: arma la
 * URL de /buscar, que es la pantalla dueña de los resultados y los filtros.
 */
export function BuscadorInicio({ materias, niveles }: { materias: Materia[]; niveles: Nivel[] }) {
  const router = useRouter();
  const [texto, setTexto] = useState("");
  const [materia, setMateria] = useState<Key | null>(null);
  const [nivel, setNivel] = useState<Key | null>(null);

  function buscar() {
    const parametros = new URLSearchParams();
    if (texto.trim()) parametros.set("q", texto.trim());
    if (materia) parametros.set("materia", String(materia));
    if (nivel) parametros.set("nivel", String(nivel));

    router.push(`/buscar?${parametros.toString()}`);
  }

  return (
    <form
      className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--background-secondary)] p-4 sm:p-5 md:grid-cols-[1.4fr_1fr_1fr_auto]"
      onSubmit={(evento) => {
        evento.preventDefault();
        buscar();
      }}
    >
      <SearchField value={texto} onChange={setTexto}>
        <Label>¿Qué necesitas repasar?</Label>
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input placeholder="Cálculo, inglés, programación…" />
          <SearchField.ClearButton aria-label="Limpiar la búsqueda" />
        </SearchField.Group>
      </SearchField>

      <Select placeholder="Todas" value={materia} onChange={setMateria}>
        <Label>Materia</Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {materias.map((item) => (
              <ListBox.Item key={item.id} id={item.id} textValue={item.nombre}>
                {item.nombre}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>

      <Select placeholder="Todos" value={nivel} onChange={setNivel}>
        <Label>Nivel</Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {niveles.map((item) => (
              <ListBox.Item key={item.id} id={item.id} textValue={item.nombre}>
                {item.nombre}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>

      <div className="flex items-end">
        <Button type="submit" variant="primary" className="w-full md:w-auto">
          <IconoBuscar />
          Buscar tutores
        </Button>
      </div>
    </form>
  );
}

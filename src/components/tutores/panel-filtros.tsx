"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Button,
  Label,
  ListBox,
  Radio,
  RadioGroup,
  SearchField,
  Select,
  Separator,
  Slider,
  Switch,
  type Key,
} from "@heroui/react";
import type { Ciudad, Materia, Nivel } from "@/features/catalogos";
import type { FiltrosTutor, Modalidad } from "@/features/tutores";
import {
  aQuery,
  CALIFICACIONES_MINIMAS,
  ETIQUETA_MODALIDAD,
  filtrosAplicados,
  PASO_PRECIO,
  PRECIO_MAXIMO,
  PRECIO_MINIMO,
} from "@/features/tutores/filtros-url";
import { precio } from "@/lib/formato";

interface Props {
  filtros: FiltrosTutor;
  materias: Materia[];
  niveles: Nivel[];
  ciudades: Ciudad[];
  /** El cajón de móvil lo usa para cerrarse al aplicar un filtro. */
  onAplicar?: () => void;
  /** El cajón ya tiene su propio encabezado, así que oculta este. */
  mostrarTitulo?: boolean;
}

/**
 * Panel de filtros de la búsqueda (F2.2 – F2.9).
 *
 * No guarda estado propio salvo el del deslizador mientras se arrastra:
 * cada cambio se escribe en la URL y la página vuelve a renderizarse en
 * el servidor con los resultados nuevos.
 */
export function PanelFiltros(props: Props) {
  return <ContenidoFiltros key={JSON.stringify(props.filtros)} {...props} />;
}

function ContenidoFiltros({
  filtros,
  materias,
  niveles,
  ciudades,
  onAplicar,
  mostrarTitulo = true,
}: Props) {
  const router = useRouter();
  const ruta = usePathname();
  const [pendiente, iniciar] = useTransition();

  // El deslizador necesita valor local para moverse fluido; la URL solo se
  // escribe al soltarlo (onChangeEnd).
  const [precioMax, setPrecioMax] = useState(filtros.precioMax ?? PRECIO_MAXIMO);

  // Igual con el texto: escribir en la URL en cada tecla dispararía una
  // búsqueda por letra. Se confirma con Enter o al limpiar el campo.
  const [busqueda, setBusqueda] = useState(filtros.q ?? "");

  /** Aplica un cambio y siempre vuelve a la página 1. */
  function cambiar(parcial: Partial<FiltrosTutor>) {
    const nuevos: FiltrosTutor = { ...filtros, ...parcial, pagina: 1 };
    iniciar(() => {
      router.replace(`${ruta}${aQuery(nuevos)}`, { scroll: false });
      onAplicar?.();
    });
  }

  const activos = filtrosAplicados(filtros);

  return (
    <div
      className={`flex flex-col gap-5 transition-opacity ${pendiente ? "opacity-60" : ""}`}
      aria-busy={pendiente}
    >
      <div className="flex items-center justify-between gap-3 empty:hidden">
        {mostrarTitulo ? <h2 className="titulo text-lg">Filtros</h2> : null}
        {activos > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            onPress={() => cambiar({ q: undefined, materiaId: undefined, nivelId: undefined, modalidad: undefined, ciudadId: undefined, precioMax: undefined, calificacionMin: undefined, soloVerificados: undefined })}
          >
            Limpiar todo
          </Button>
        ) : null}
      </div>

      <SearchField
        value={busqueda}
        onChange={(valor) => {
          setBusqueda(valor);
          if (valor === "") cambiar({ q: undefined });
        }}
        onSubmit={(valor) => cambiar({ q: valor.trim() || undefined })}
      >
        <Label>Palabra clave</Label>
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input placeholder="Nombre o tema…" />
          <SearchField.ClearButton aria-label="Limpiar la búsqueda" />
        </SearchField.Group>
        <p className="pt-1 text-xs text-[var(--muted)]">Pulsa Enter para buscar.</p>
      </SearchField>

      <Separator />

      <Select
        placeholder="Todas"
        value={filtros.materiaId ?? null}
        onChange={(valor: Key | null) => cambiar({ materiaId: valor ? String(valor) : undefined })}
      >
        <Label>Materia</Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {materias.map((materia) => (
              <ListBox.Item key={materia.id} id={materia.id} textValue={materia.nombre}>
                {materia.nombre}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>

      <Select
        placeholder="Todos"
        value={filtros.nivelId ?? null}
        onChange={(valor: Key | null) =>
          cambiar({ nivelId: valor ? (String(valor) as FiltrosTutor["nivelId"]) : undefined })
        }
      >
        <Label>Nivel educativo</Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {niveles.map((nivel) => (
              <ListBox.Item key={nivel.id} id={nivel.id} textValue={nivel.nombre}>
                {nivel.nombre}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>

      <Separator />

      <RadioGroup
        value={filtros.modalidad ?? "ambas"}
        onChange={(valor) => cambiar({ modalidad: valor as Modalidad })}
      >
        <Label>Modalidad</Label>
        {(["ambas", "virtual", "presencial"] as const).map((opcion) => (
          <Radio key={opcion} value={opcion}>
            <Radio.Content>
              <Radio.Control>
                <Radio.Indicator />
              </Radio.Control>
              {ETIQUETA_MODALIDAD[opcion]}
            </Radio.Content>
          </Radio>
        ))}
      </RadioGroup>

      {/* La ciudad solo importa cuando el estudiante quiere ver a alguien en persona. */}
      {filtros.modalidad === "presencial" ? (
        <Select
          placeholder="Cualquier ciudad"
          value={filtros.ciudadId ?? null}
          onChange={(valor: Key | null) => cambiar({ ciudadId: valor ? String(valor) : undefined })}
        >
          <Label>Ciudad</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {ciudades.map((ciudad) => (
                <ListBox.Item key={ciudad.id} id={ciudad.id} textValue={ciudad.nombre}>
                  {ciudad.nombre}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      ) : null}

      <Separator />

      <Slider
        value={precioMax}
        minValue={PRECIO_MINIMO}
        maxValue={PRECIO_MAXIMO}
        step={PASO_PRECIO}
        onChange={(valor) => setPrecioMax(valor as number)}
        onChangeEnd={(valor) =>
          cambiar({ precioMax: (valor as number) >= PRECIO_MAXIMO ? undefined : (valor as number) })
        }
      >
        <div className="flex items-baseline justify-between gap-3">
          <Label>Precio por hora</Label>
          <span className="text-sm tabular-nums text-[var(--muted)]">
            {precioMax >= PRECIO_MAXIMO ? "Sin límite" : `Hasta ${precio(precioMax)}`}
          </span>
        </div>
        <Slider.Track>
          <Slider.Fill />
          <Slider.Thumb />
        </Slider.Track>
      </Slider>

      <Separator />

      <RadioGroup
        value={filtros.calificacionMin ? String(filtros.calificacionMin) : "0"}
        onChange={(valor) =>
          cambiar({ calificacionMin: valor === "0" ? undefined : Number(valor) })
        }
      >
        <Label>Calificación mínima</Label>
        <Radio value="0">
          <Radio.Content>
            <Radio.Control>
              <Radio.Indicator />
            </Radio.Control>
            Cualquiera
          </Radio.Content>
        </Radio>
        {CALIFICACIONES_MINIMAS.map((valor) => (
          <Radio key={valor} value={String(valor)}>
            <Radio.Content>
              <Radio.Control>
                <Radio.Indicator />
              </Radio.Control>
              {valor.toLocaleString("es-CO", { minimumFractionDigits: 1 })} o más
            </Radio.Content>
          </Radio>
        ))}
      </RadioGroup>

      <Separator />

      <Switch
        isSelected={filtros.soloVerificados ?? false}
        onChange={(activo) => cambiar({ soloVerificados: activo ? true : undefined })}
      >
        <Switch.Content>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          Solo tutores verificados
        </Switch.Content>
      </Switch>
    </div>
  );
}

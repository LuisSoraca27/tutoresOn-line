/**
 * Filtro de refracción del vidrio líquido (F12.1).
 *
 * Apple dobla el fondo detrás del cristal como una lente real. En la web eso
 * se consigue con `feDisplacementMap`: un mapa de desplazamiento donde el canal
 * rojo codifica el corrimiento horizontal y el verde el vertical, con 128 como
 * "no muevas nada". Aquí el mapa son dos degradados —planos en el centro y con
 * rampa solo en los bordes—, que es justo el perfil de una lente con labio:
 * el contenido del medio se ve nítido y el de las orillas se curva.
 *
 * Se aplica en dos pasadas (una por eje) para que cada mapa deje el otro canal
 * en 128 y no se contaminen entre sí.
 *
 * Solo Chromium admite filtros SVG dentro de `backdrop-filter`; en Safari y
 * Firefox la regla ni siquiera se aplica (ver `@supports` en globals.css) y el
 * vidrio se queda en desenfoque, que es el 90% del efecto.
 */

/** Rampa de 12% en cada borde; el resto del mapa es neutro (128). */
function mapa(eje: "x" | "y") {
  const horizontal = eje === "x";
  const color = (v: number) => (horizontal ? `rgb(${v},128,128)` : `rgb(128,${v},128)`);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" preserveAspectRatio="none">
    <linearGradient id="r" x1="0" y1="0" x2="${horizontal ? 1 : 0}" y2="${horizontal ? 0 : 1}">
      <stop offset="0" stop-color="${color(0)}"/>
      <stop offset="0.12" stop-color="${color(128)}"/>
      <stop offset="0.88" stop-color="${color(128)}"/>
      <stop offset="1" stop-color="${color(255)}"/>
    </linearGradient>
    <rect width="100" height="100" fill="url(#r)"/>
  </svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function FiltroVidrio() {
  return (
    <svg aria-hidden focusable="false" className="pointer-events-none absolute size-0">
      <defs>
        {/* La región del filtro se ajusta a la caja del elemento para que las
            rampas del mapa caigan exactamente sobre sus bordes. */}
        <filter id="vidrio-refraccion" x="0" y="0" width="100%" height="100%">
          <feImage href={mapa("x")} preserveAspectRatio="none" result="mapaX" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="mapaX"
            scale="14"
            xChannelSelector="R"
            yChannelSelector="G"
            result="ejeX"
          />
          <feImage href={mapa("y")} preserveAspectRatio="none" result="mapaY" />
          <feDisplacementMap
            in="ejeX"
            in2="mapaY"
            scale="14"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}

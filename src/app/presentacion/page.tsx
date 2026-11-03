"use client";

import Link from "next/link";
import { SelectorTema } from "@/components/layout/selector-tema";
import { useCallback, useEffect, useState } from "react";
import "./presentacion.css";

const frontend = [["Next.js", "nextdotjs"], ["React", "react"], ["TypeScript", "typescript"], ["Tailwind CSS", "tailwindcss"], ["HeroUI", "heroui"]];
const backend = [["Node.js", "nodedotjs"], ["Express", "express"], ["Prisma", "prisma"], ["PostgreSQL", "postgresql"], ["Zod", "zod"], ["Docker", "docker"]];
const colores = [["Marca", "oklch(0.55 0.1 182)"], ["Pendiente", "oklch(0.72 0.15 78)"], ["Aceptada", "oklch(0.58 0.12 155)"], ["Rechazada", "oklch(0.58 0.19 25)"], ["En curso", "oklch(0.6 0.16 255)"]];

function Logos({ items }: { items: string[][] }) {
  return <div className="slide-logos">{items.map(([nombre, logo]) => <div className="slide-logo" key={nombre}><img src={`https://cdn.simpleicons.org/${logo}`} width="48" height="48" alt="" /><strong>{nombre}</strong></div>)}</div>;
}

export default function Presentacion() {
  const [actual, setActual] = useState(0);
  const total = 7;
  const mover = useCallback((delta: number) => setActual((valor) => Math.max(0, Math.min(total - 1, valor + delta))), []);
  useEffect(() => {
    const teclado = (evento: KeyboardEvent) => {
      if (evento.key === "ArrowRight") mover(1);
      if (evento.key === "ArrowLeft") mover(-1);
    };
    window.addEventListener("keydown", teclado);
    return () => window.removeEventListener("keydown", teclado);
  }, [mover]);

  return <main className="presentacion">
    <header className="slide-header"><Link href="/" className="slide-brand">Tutores<span>On-Line</span><b>.</b></Link><SelectorTema /></header>
    <div className="slide-stage" aria-live="polite">
      {actual === 0 && <section className="slide cover"><div><h1>Tutores<em>On-Line.</em></h1><p className="slide-intro">Tutorías virtuales y presenciales</p></div><div className="slide-cover-art" aria-hidden="true"><div className="slide-ring"/><div className="slide-ring outer"/><div className="slide-mark">T<span>.</span></div><div className="slide-tag student">Estudiante</div><div className="slide-tag tutor">Tutor</div></div></section>}
      {actual === 1 && <section className="slide"><h2><em>Frontend.</em></h2><Logos items={frontend}/></section>}
      {actual === 2 && <section className="slide"><h2><em>Backend.</em></h2><Logos items={backend}/></section>}
      {actual === 3 && <section className="slide"><h2><em>Arquitectura.</em></h2><div className="slide-flow"><div><h3>Frontend</h3><p>Next.js + React</p></div><b>→</b><div><h3>API</h3><p>Node.js + Express</p></div><b>→</b><div><h3>Datos</h3><p>Prisma + PostgreSQL</p></div></div></section>}
      {actual === 4 && <section className="slide"><h2><em>Integraciones.</em></h2><div className="slide-connections"><article><span>TIEMPO REAL</span><h3>WebSocket</h3><p>Actualizaciones de tutoría express</p></article><article><span>ARCHIVOS</span><h3>Cloudflare R2</h3><p>Fotos de perfil · requiere configuración</p></article><article><span>DESARROLLO</span><h3>Docker Compose</h3><p>PostgreSQL en entorno local</p></article></div><p className="slide-note">Algunos módulos aún utilizan datos simulados.</p></section>}
      {actual === 5 && <section className="slide"><h2><em>Sistema de diseño.</em></h2><div className="slide-design"><div><span>TIPOGRAFÍA</span><div className="slide-fraunces">Aa</div><h3>Fraunces</h3><p>Títulos</p></div><div><span>TIPOGRAFÍA</span><div className="slide-jakarta">Aa</div><h3>Plus Jakarta Sans</h3><p>Interfaz y lectura</p></div><div className="slide-design-list"><span>INTERFAZ</span><h3>HeroUI</h3><h3>Vidrio translúcido</h3><h3>Claro / oscuro</h3></div></div></section>}
      {actual === 6 && <section className="slide"><h2><em>Paleta de colores.</em></h2><div className="slide-colors">{colores.map(([nombre, color]) => <div key={nombre}><div style={{background: color}}/><strong>{nombre}</strong></div>)}</div></section>}
    </div>
    <footer className="slide-controls"><div className="slide-progress" aria-label={`Diapositiva ${actual + 1} de ${total}`}><strong>{String(actual + 1).padStart(2, "0")}</strong><span> / {String(total).padStart(2, "0")}</span><div>{Array.from({length: total}, (_, i) => <button key={i} className={i === actual ? "active" : ""} onClick={() => setActual(i)} aria-label={`Ir a diapositiva ${i + 1}`} aria-current={i === actual ? "step" : undefined}/>)}</div></div><div className="slide-buttons"><button onClick={() => mover(-1)} disabled={actual === 0} aria-label="Diapositiva anterior">← <span>Anterior</span></button><button className="next" onClick={() => mover(1)} disabled={actual === total - 1}><span>Siguiente</span> →</button></div></footer>
  </main>;
}

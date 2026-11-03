"use client";
import { useEffect, useRef, useState } from "react";
import { obtenerSocketExpress } from "./acciones";

export function useRealtimeExpress(activo: boolean, esTutor: boolean, alCambiar: () => void) {
  const callback = useRef(alCambiar);
  const [conectado, setConectado] = useState(false);
  useEffect(() => { callback.current = alCambiar; }, [alCambiar]);
  useEffect(() => {
    if (!activo) return;
    let cancelado = false;
    let ws: WebSocket | undefined;
    let reintento: ReturnType<typeof setTimeout> | undefined;
    async function conectar() {
      try {
        const url = await obtenerSocketExpress();
        if (cancelado) return;
        ws = new WebSocket(url);
        ws.onopen = () => { if (cancelado) return; setConectado(true); if (esTutor) ws?.send(JSON.stringify({ tipo: "disponible", valor: true })); callback.current(); };
        ws.onmessage = () => { if (!cancelado) callback.current(); };
        ws.onerror = () => ws?.close();
        ws.onclose = () => { if (!cancelado) { setConectado(false); reintento = setTimeout(conectar, 2500); } };
      } catch { if (!cancelado) { setConectado(false); reintento = setTimeout(conectar, 2500); } }
    }
    void conectar();
    return () => { cancelado = true; if (reintento) clearTimeout(reintento); ws?.close(); setConectado(false); };
  }, [activo, esTutor]);
  return activo && conectado;
}

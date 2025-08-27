import { useEffect, useRef } from "react";

/**
 * Bloquea el scroll cuando `active` es true sin romper el layout:
 * - Congela el body en su posición (position: fixed).
 * - Evita "salto" horizontal ajustando padding-right.
 * - Restaura SIEMPRE la posición previa al liberar (rAF).
 * - Refcount para múltiples modales.
 */
export function useBodyScrollLock(active) {
  const prev = useRef({
    paddingRight: "",
    position: "",
    top: "",
    left: "",
    right: "",
    scrollY: 0,
  });

  useEffect(() => {
    // Evita SSR
    if (typeof window === "undefined") return;
    if (!active) return;

    const html = document.documentElement;
    const body = document.body;

    // Contador de locks en <html> para que sea único global
    const count = Number(html.dataset.pfLockCount || 0) + 1;
    html.dataset.pfLockCount = String(count);

    if (count === 1) {
      // Guardar estilos previos
      prev.current.paddingRight = body.style.paddingRight;
      prev.current.position = body.style.position;
      prev.current.top = body.style.top;
      prev.current.left = body.style.left;
      prev.current.right = body.style.right;

      // Posición actual
      const scrollY = window.scrollY || window.pageYOffset || 0;
      prev.current.scrollY = scrollY;

      // Ancho del scrollbar para evitar "salto"
      const scrollbarW = window.innerWidth - html.clientWidth;
      if (scrollbarW > 0) body.style.paddingRight = `${scrollbarW}px`;

      // Congelar body exactamente donde está
      body.style.position = "fixed";
      body.style.top = `-${scrollY}px`;
      body.style.left = "0";
      body.style.right = "0";
      // (No tocamos overflow para respetar tu diseño)
    }

    // Cleanup SIEMPRE declara antes de usar
    return () => {
      const html2 = document.documentElement;
      const body2 = document.body;
      const next = Number(html2.dataset.pfLockCount || 0) - 1;

      if (next <= 0) {
        delete html2.dataset.pfLockCount;

        // Lee y normaliza la posición previa
        const top = body2.style.top || "0px";
        const y = Math.abs(parseInt(top, 10)) || prev.current.scrollY || 0;

        // Restaura estilos
        body2.style.position = prev.current.position || "";
        body2.style.top = prev.current.top || "";
        body2.style.left = prev.current.left || "";
        body2.style.right = prev.current.right || "";
        body2.style.paddingRight = prev.current.paddingRight || "";

        // Restaura scroll en el siguiente frame (sin tirón)
        requestAnimationFrame(() => {
          window.scrollTo(0, y);
        });
      } else {
        html2.dataset.pfLockCount = String(next);
      }
    };
  }, [active]);
}

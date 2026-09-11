/* ==========================================================================
   Modelo de McCall aplicado a Telegram — datos y renderizado
   ========================================================================== */

const CATEGORIES = {
  operacion: {
    label: "Operación del producto",
    code: "OP",
    color: "var(--op)",
    colorHex: "#2AABEE",
    question: "¿Funciona como se espera, cuando se espera?",
  },
  revision: {
    label: "Revisión del producto",
    code: "REV",
    color: "var(--rev)",
    colorHex: "#5FE3B0",
    question: "¿Es viable corregirla, adaptarla y probarla?",
  },
  transicion: {
    label: "Transición del producto",
    code: "TRA",
    color: "var(--tra)",
    colorHex: "#F2A93B",
    question: "¿Sobrevive al cambiar de entorno o de escala?",
  },
};

const FACTORS = [
  {
    id: "correccion",
    code: "COR",
    name: "Corrección",
    category: "operacion",
    score: 9.0,
    criteria: ["completitud", "trazabilidad", "consistencia"],
    desc: "Telegram entrega lo que promete: los mensajes llegan, se sincronizan entre dispositivos y el orden de la conversación se mantiene consistente incluso con conexiones intermitentes. Las funciones publicadas (chats, canales, bots, pagos) operan según su especificación documentada en la API pública.",
  },
  {
    id: "confiabilidad",
    code: "CONF",
    name: "Confiabilidad",
    category: "operacion",
    score: 8.5,
    criteria: ["tolerancia a fallos", "exactitud", "consistencia"],
    desc: "La infraestructura distribuida en múltiples centros de datos sostiene el servicio durante picos de uso masivo. Se han registrado caídas puntuales y regionales, pero la recuperación es rápida y no se han reportado pérdidas de mensajes en chats en la nube.",
  },
  {
    id: "eficiencia",
    code: "EFIC",
    name: "Eficiencia",
    category: "operacion",
    score: 9.2,
    criteria: ["eficiencia de ejecución", "eficiencia de almacenamiento"],
    desc: "El protocolo MTProto reduce el tamaño de los paquetes y permite que la app funcione en redes lentas o inestables. El cliente es liviano frente a alternativas equivalentes y el consumo de datos por mensaje o llamada se mantiene bajo.",
  },
  {
    id: "integridad",
    code: "INTG",
    name: "Integridad",
    category: "operacion",
    score: 7.0,
    criteria: ["control de acceso", "auditoría de acceso"],
    desc: "El cifrado de extremo a extremo solo se activa en 'chats secretos', no en los chats en la nube por defecto. La verificación en dos pasos y el cierre remoto de sesiones fortalecen el control de acceso, pero el modelo de cifrado por defecto queda por debajo de competidores que lo aplican de forma universal.",
  },
  {
    id: "usabilidad",
    code: "USAB",
    name: "Usabilidad",
    category: "operacion",
    score: 9.3,
    criteria: ["operabilidad", "capacidad de aprendizaje", "comunicabilidad"],
    desc: "La curva de aprendizaje es mínima: la navegación es predecible entre plataformas, los estados del sistema (enviando, entregado, leído) son siempre visibles y la app permite personalización profunda sin exponer configuración innecesaria al usuario nuevo.",
  },
  {
    id: "mantenibilidad",
    code: "MANT",
    name: "Facilidad de mantenimiento",
    category: "revision",
    score: 8.0,
    criteria: ["consistencia", "simplicidad", "concisión"],
    desc: "El ritmo de actualizaciones —con changelogs públicos y funciones nuevas cada pocas semanas— evidencia una base de código que se puede intervenir sin frenar el desarrollo. No hay visibilidad del código del servidor, así que esta puntuación se apoya en evidencia indirecta del comportamiento observable.",
  },
  {
    id: "flexibilidad",
    code: "FLEX",
    name: "Flexibilidad",
    category: "revision",
    score: 9.0,
    criteria: ["modularidad", "generalidad", "capacidad de expansión"],
    desc: "La plataforma de bots, la API para desarrolladores y las Mini Apps convierten a Telegram en una base extensible más que en una app cerrada. Canales, grupos, temas personalizados y stickers conviven como módulos independientes sobre el mismo núcleo de mensajería.",
  },
  {
    id: "pruebas",
    code: "PRUE",
    name: "Facilidad de prueba",
    category: "revision",
    score: 7.2,
    criteria: ["simplicidad", "instrumentación", "modularidad"],
    desc: "Existen canales beta públicos donde nuevas versiones se validan antes del lanzamiento general, lo que sugiere un proceso de pruebas escalonado. Al no ser software libre, no es posible verificar cobertura de pruebas ni instrumentación interna desde fuera.",
  },
  {
    id: "portabilidad",
    code: "PORT",
    name: "Portabilidad",
    category: "transicion",
    score: 9.8,
    criteria: ["independencia de máquina", "autodescripción"],
    desc: "Un mismo estado de cuenta persiste sin fricción en iOS, Android, Windows, macOS, Linux y la web, con sincronización inmediata de mensajes, chats y multimedia entre dispositivos. Es uno de los puntos más fuertes del producto frente a casi cualquier competidor.",
  },
  {
    id: "reusabilidad",
    code: "REUS",
    name: "Reusabilidad",
    category: "transicion",
    score: 8.4,
    criteria: ["generalidad", "modularidad", "independencia de sistema"],
    desc: "La API de bots y el protocolo documentado son reutilizados por miles de desarrolladores externos para construir asistentes, tiendas y automatizaciones sin reescribir la lógica de mensajería desde cero, lo que confirma un diseño pensado para ser reaprovechado.",
  },
  {
    id: "interoperabilidad",
    code: "INTER",
    name: "Interoperabilidad",
    category: "transicion",
    score: 6.8,
    criteria: ["comunalidad de comunicaciones", "comunalidad de datos"],
    desc: "Permite exportar el historial completo de chats y conectarse con otros servicios a través de bots, pero no interopera de forma nativa con protocolos abiertos como XMPP o Matrix. El ecosistema, aunque abierto a desarrolladores, sigue siendo propio y cerrado en el transporte de mensajes.",
  },
];

const overallScore = (
  FACTORS.reduce((sum, f) => sum + f.score, 0) / FACTORS.length
).toFixed(1);

function categoryAverage(catId) {
  const items = FACTORS.filter((f) => f.category === catId);
  return (items.reduce((s, f) => s + f.score, 0) / items.length).toFixed(1);
}

/* ---------------------------- Radar chart (SVG) ---------------------------- */

function buildRadar() {
  const el = document.getElementById("radar-chart");
  if (!el) return;

  const size = 380;
  const center = size / 2;
  const maxR = 108;
  const rings = 4;
  const n = FACTORS.length;
  const angleStep = (Math.PI * 2) / n;

  const pointFor = (i, valueRatio) => {
    const angle = -Math.PI / 2 + i * angleStep;
    const r = maxR * valueRatio;
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)];
  };

  let svg = `<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Gráfico radial con la puntuación de los 11 factores del modelo de McCall aplicados a Telegram">`;

  // grid rings
  for (let ring = 1; ring <= rings; ring++) {
    const ratio = ring / rings;
    const pts = FACTORS.map((_, i) => pointFor(i, ratio).join(",")).join(" ");
    svg += `<polygon class="grid" points="${pts}" />`;
  }
  // axes
  FACTORS.forEach((_, i) => {
    const [x, y] = pointFor(i, 1);
    svg += `<line class="grid" x1="${center}" y1="${center}" x2="${x}" y2="${y}" />`;
  });

  // data polygon (animated draw-in via stroke-dasharray handled in CSS/JS)
  const dataPts = FACTORS.map((f, i) => pointFor(i, f.score / 10).join(",")).join(" ");
  svg += `<polygon class="fill" id="radar-poly" points="${dataPts}" />`;

  // dots + labels
  FACTORS.forEach((f, i) => {
    const [dx, dy] = pointFor(i, f.score / 10);
    svg += `<circle class="axis-dot" cx="${dx}" cy="${dy}" r="2.6" />`;
    const [lx, ly] = pointFor(i, 1.2);
    const anchor = Math.abs(lx - center) < 6 ? "middle" : lx > center ? "start" : "end";
    svg += `<text class="axis-label" x="${lx}" y="${ly + 3}" text-anchor="${anchor}">${f.code}</text>`;
  });

  svg += `</svg>`;
  el.innerHTML = svg;

  // one deliberate load animation: the data polygon draws itself in
  requestAnimationFrame(() => {
    const poly = document.getElementById("radar-poly");
    if (!poly || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    poly.style.opacity = "0";
    poly.style.transform = "scale(0.82)";
    poly.style.transformOrigin = `${center}px ${center}px`;
    poly.style.transition = "opacity .9s ease, transform .9s cubic-bezier(.16,.8,.3,1)";
    requestAnimationFrame(() => {
      poly.style.opacity = "1";
      poly.style.transform = "scale(1)";
    });
  });
}

/* ---------------------------- Hero stat + meta ---------------------------- */

function fillHero() {
  document.getElementById("overall-score").textContent = overallScore;
  document.getElementById("factor-count").textContent = FACTORS.length;
  document.getElementById("category-count").textContent = Object.keys(CATEGORIES).length;
}

/* ---------------------------- Metodología: conteo por categoría ---------------------------- */

function fillMethodCounts() {
  Object.entries(CATEGORIES).forEach(([catId]) => {
    const el = document.querySelector(`[data-cat-avg="${catId}"]`);
    if (el) el.textContent = categoryAverage(catId);
  });
}

/* ---------------------------- Filas de factores ---------------------------- */

function buildFactorRows() {
  Object.entries(CATEGORIES).forEach(([catId, cat]) => {
    const container = document.querySelector(`[data-factor-list="${catId}"]`);
    if (!container) return;

    const items = FACTORS.filter((f) => f.category === catId);
    container.innerHTML = items
      .map(
        (f) => `
      <article class="factor-row" data-score="${f.score}" style="--factor-color:${cat.colorHex}">
        <div class="factor-code">${f.code}</div>
        <div class="factor-main">
          <h4>${f.name}</h4>
          <div class="score-bar-track">
            <div class="score-bar-fill" style="background:${cat.colorHex}"></div>
          </div>
          <div class="score-value">${f.score.toFixed(1)} / 10</div>
          <div class="criteria-chips">
            ${f.criteria.map((c) => `<span>${c}</span>`).join("")}
          </div>
        </div>
        <div class="factor-desc"><p>${f.desc}</p></div>
      </article>`
      )
      .join("");
  });
}

/* ---------------------------- Resumen comparativo ---------------------------- */

function buildCompareList() {
  const container = document.getElementById("compare-list");
  if (!container) return;

  const sorted = [...FACTORS].sort((a, b) => b.score - a.score);
  container.innerHTML = sorted
    .map((f) => {
      const cat = CATEGORIES[f.category];
      return `
      <div class="compare-item" data-score="${f.score}">
        <div class="compare-name">${f.name}</div>
        <div class="compare-track">
          <div class="compare-fill" style="background:${cat.colorHex}"></div>
        </div>
        <div class="compare-score">${f.score.toFixed(1)}</div>
      </div>`;
    })
    .join("");

  const legend = document.getElementById("legend");
  if (legend) {
    legend.innerHTML = Object.entries(CATEGORIES)
      .map(
        ([id, cat]) => `
      <div class="legend-row">
        <span class="swatch" style="background:${cat.colorHex}"></span>
        <span>${cat.label}</span>
        <span class="legend-avg">${categoryAverage(id)}</span>
      </div>`
      )
      .join("");
  }
}

/* ---------------------------- Reveal de barras al hacer scroll ---------------------------- */

function observeBars() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const bars = document.querySelectorAll(".factor-row, .compare-item");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    bars.forEach((el) => {
      const fill = el.querySelector(".score-bar-fill, .compare-fill");
      if (fill) fill.style.width = `${(parseFloat(el.dataset.score) / 10) * 100}%`;
    });
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const fill = el.querySelector(".score-bar-fill, .compare-fill");
        if (fill) fill.style.width = `${(parseFloat(el.dataset.score) / 10) * 100}%`;
        io.unobserve(el);
      });
    },
    { threshold: 0.35 }
  );

  bars.forEach((el) => io.observe(el));
}

/* ---------------------------- Nav móvil ---------------------------- */

function setupNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );
}

/* ---------------------------- Init ---------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  fillHero();
  buildRadar();
  fillMethodCounts();
  buildFactorRows();
  buildCompareList();
  observeBars();
  setupNav();
  document.getElementById("year").textContent = new Date().getFullYear();
});

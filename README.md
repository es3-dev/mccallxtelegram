# Modelo de McCall aplicado a Telegram

Landing page que documenta la aplicación del **modelo de calidad de McCall** (1977) a la app **Telegram**: 11 factores, agrupados en 3 categorías (Operación, Revisión y Transición del producto), con puntuación justificada para cada uno y un promedio general.

## Estructura del proyecto

```
├── index.html      # Estructura y contenido de la landing
├── style.css       # Sistema de diseño (paleta, tipografía, layout)
├── script.js       # Datos del modelo, renderizado dinámico y radar chart en SVG
└── README.md
```

No hay dependencias ni proceso de build: es HTML/CSS/JS puro. Las únicas fuentes externas son Google Fonts (Space Grotesk, IBM Plex Sans, IBM Plex Mono), cargadas por CDN en `index.html`.

## Editar el contenido

Todo el contenido evaluativo (nombre del factor, categoría, puntuación, criterios y justificación) vive en un solo arreglo `FACTORS` dentro de `script.js`. Cambiar una puntuación o un texto ahí actualiza automáticamente:

- el radar chart del hero,
- la puntuación general promedio,
- las filas de cada categoría,
- el resumen comparativo ordenado de mayor a menor,
- los promedios por categoría.

## Desplegar en GitHub Pages

1. Crea un repositorio nuevo en GitHub y sube estos archivos a la rama `main`:
   ```bash
   git init
   git add .
   git commit -m "Landing: modelo de McCall aplicado a Telegram"
   git branch -M main
   git remote add origin https://github.com/<tu-usuario>/<tu-repo>.git
   git push -u origin main
   ```
2. En GitHub, entra a **Settings → Pages**.
3. En **Source**, selecciona la rama `main` y la carpeta `/ (root)`.
4. Guarda. GitHub publicará el sitio en `https://<tu-usuario>.github.io/<tu-repo>/` en un par de minutos.

No se requiere configuración adicional: `index.html` está en la raíz del proyecto, que es lo que GitHub Pages espera por defecto.

## Notas

- El sitio es completamente responsive (desktop, tablet y móvil) y respeta `prefers-reduced-motion`.
- Las puntuaciones reflejan un análisis cualitativo basado en comportamiento observable de Telegram, su API pública y su protocolo (MTProto), no en acceso al código fuente del servidor.

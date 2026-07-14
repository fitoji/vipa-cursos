# TODO — vipa-base

## In Progress / Pending

- [x] Skeleton actualizar en dashboard
- [ ] Agregar fotos a cursos (link en base de datos, y imagenes en el servidor)
- [ ] Revisar mobile responsive

## Future Features

### Tier 1 — Alto impacto, alta factibilidad

- [ ] **Gráficos en el Dashboard** (recharts) — Timeline de cursos (scatter: fecha vs días, color por modo), barras por año, pie sit/serve. `recharts` ya instalado.
- [ ] **Heatmap de rachas** (estilo GitHub) — Grid de contribución mostrando días activos/omitidos. `date-fns` ya instalado.
- [x] **Detalle de curso** (modal o página) — Click en fila de la tabla para ver todos los campos, contexto temporal, y eventualmente fotos.
- [ ] **Export CSV/Excel** — Export directo de la tabla filtrada. El prompt de ChatGPT en el empty state es un workaround.

### Tier 2 — Alto impacto, factibilidad media

- [ ] **Command Palette (cmd+k)** — `cmdk` ya instalado. Buscar cursos por lugar, profesor, país desde cualquier parte del app.
- [ ] **Auto-detectar rachas desde cursos** — Al crear una racha, sugerir rangos basados en cursos contiguos. Elimina doble carga.
- [ ] **PWA + notificaciones push** — Manifest + service worker con serwist. Push notifications para recordatorios diarios de racha.
- [ ] **Fotos de cursos** — Campo de imagen opcional + upload a Vercel Blob. Thumbnails en tabla, full en detalle.

### Tier 3 — Impacto medio, factibilidad media

- [ ] **Metas/objetivos** — Tabla `meditation_goals`: objetivo de días por mes, cursos por año. Progress bars con `@radix-ui/react-progress`.
- [ ] **Perfiles de profesores** — Agregar cursos por profesor: cuántos, dónde, cuándo. Insight para practicantes dedicados.
- [ ] **Recordatorios por email** — Integrar `email.ts` con Resend/Postmark. Email diario/semanal para extender la racha.
- [ ] **Mapa de centros** — Leaflet/Mapbox mostrando centros en mapa. La tabla `locations` ya tiene los datos.

### Tier 4 — Horizonte más largo

- [ ] **Vista compartida/social** — Perfil público de solo lectura para compartir historial de cursos.
- [ ] **Responsive mobile-first** — Sidebar → bottom nav/drawer en mobile. Tablas con scroll horizontal. `vaul` ya instalado.
- [ ] **Diario de cursos** — Expandir `obs` a entrada de rich-text por curso. Markdown + editor liviano.

### Almacenamiento

- [ ] **localStorage Cache (React Query Persist)** — Instalar `@tanstack/query-persist-client-core`, configurar `createSyncStoragePersister`, persistir cache de cursos y dashboard. Carga instantánea al abrir la app.
  - Tradeoff: no sync entre dispositivos (Neon lo da gratis).
  - Referencia: https://tanstack.com/query/latest/docs/framework/react/plugins/persistQueryClient

### Infra / Auth

- [ ] **Email real** — `sendEmail` es un console.log placeholder. Integrar con Resend o Postmark para password reset.
- [ ] **Skeleton loading consistente** — Actualizar skeleton del dashboard y otras vistas.

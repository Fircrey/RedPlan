# RedPlan - Planificacion de Redes Electricas

Herramienta de planificacion geoespacial para redes de distribucion electrica. Permite a supervisores trazar rutas sobre el mapa, distribuir postes automaticamente, asignar simbologias de linea, gestionar presupuestos y avanzar proyectos a traves de un flujo de aprobacion multi-rol.

## Tech Stack

- **Framework**: Next.js 16 (App Router) con React 19 y TypeScript strict
- **Estilos**: Tailwind CSS 4 con CSS custom properties (`--color-*`) para theming (dark/light)
- **Base de datos y auth**: Supabase (client via `@supabase/ssr`)
- **Mapas**: Google Maps (`@vis.gl/react-google-maps`) + OSRM para routing
- **Tests**: Vitest
- **Font**: Geist (via `next/font/google`)

## Comandos

```bash
npm run dev       # Servidor de desarrollo
npm run build     # Build de produccion
npm run lint      # ESLint
npm test          # Vitest (run once)
npm run test:watch # Vitest (watch mode)
```

## Estructura del proyecto

```
src/
├── app/
│   ├── (auth)/           # Login y registro (rutas publicas)
│   ├── (app)/            # Rutas protegidas
│   │   ├── dashboard/    # Lista de proyectos con filtros, busqueda, ordenamiento
│   │   └── project/[id]/ # Workspace: mapa + sidebar (workspace-client.tsx)
│   ├── api/              # Route handlers (REST)
│   │   ├── route/calculate/  # Calculo de rutas y postes
│   │   ├── projects/         # CRUD proyectos + status/budget/comments/audit/routes
│   │   ├── profile/          # Perfil del usuario
│   │   └── zones/            # Zonas geograficas
│   └── layout.tsx        # Root layout con SupabaseProvider + ToastProvider
├── components/
│   ├── map/              # MapView, PoleMarker, RoutePolyline, MapLegend, MapControls, InfoWindow
│   ├── sidebar/          # Sidebar, RouteInputForm, ResultsPanel, BudgetPanel, SegmentSelector, ExportButton
│   ├── dashboard/        # ProjectCard, CreateProjectDialog, StatusFilterTabs
│   ├── project/          # WorkflowActions, CommentsPanel, AuditPanel, RejectDialog, ConciliationDialog
│   ├── auth/             # LoginForm, RegisterForm, LogoutButton
│   ├── providers/        # SupabaseProvider, MapProvider
│   └── ui/               # Button, Input, Card, Dialog, Toast, Spinner, StatusBadge, RoleBadge
├── hooks/                # Custom hooks (use-projects, use-profile, use-calculate-route, etc.)
├── lib/
│   ├── geo/              # Haversine, interpolation, straight-line, polyline-distribute
│   ├── routing/          # OSRM + Google Directions + route-provider
│   ├── supabase/         # Client, server, middleware helpers
│   ├── export/           # CSV export
│   ├── constants.ts      # Colores, labels, transiciones de estado, config de simbologias
│   └── utils.ts          # Utilidades generales (cn/clsx)
├── types/
│   ├── index.ts          # Tipos de dominio (Pole, Route, Project, etc.)
│   └── database.ts       # Tipos de Supabase (tablas tipadas)
└── middleware.ts         # Proteccion de rutas via Supabase session
```

## Variables de entorno

```
NEXT_PUBLIC_SUPABASE_URL        # URL del proyecto Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY   # Clave publica (anon) de Supabase
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY # API key de Google Maps (cliente)
GOOGLE_DIRECTIONS_API_KEY       # API key de Google Directions (server-side, opcional)
```

## Base de datos (Supabase)

Tablas principales: `projects`, `routes`, `poles`, `route_segments`, `profiles`, `zones`, `budget_items`, `project_comments`, `audit_log`

### Enums importantes

- **user_role**: `supervisor`, `coordinador`, `gestor`, `administrador`
- **project_status**: `borrador` -> `pendiente_coordinador` -> `pendiente_gestor` -> `contratado` -> `en_ejecucion` -> `pendiente_conciliacion` -> `finalizado` (con ramas: `rechazado`, `en_correccion`)
- **pole_status**: `nuevo`, `existente`, `en_retiro`, `cambiar`
- **line_symbology**: `single` (-x-), `double` (-xx-), `triple` (-xxx-)

## Flujo de trabajo (workflow)

El proyecto sigue un flujo de aprobacion multi-rol definido en `STATUS_TRANSITIONS` (src/lib/constants.ts):

1. **Supervisor** crea proyecto (borrador) y lo envia a coordinador
2. **Coordinador** aprueba (-> pendiente_gestor) o rechaza
3. **Gestor** contrata, ejecuta, concilia y finaliza

Cada transicion genera una entrada en `audit_log` y puede incluir comentarios.

## Convenios de codigo

- Path alias: `@/*` mapea a `./src/*`
- Theming via CSS variables: `--color-primary`, `--color-surface`, `--color-text`, `--color-border`, etc.
- Componentes UI propios en `src/components/ui/` (no se usa shadcn ni libreria de componentes externa)
- Hooks custom en `src/hooks/` siguen patron `use-{nombre}.ts`
- API routes en `src/app/api/` usan Route Handlers de Next.js
- DB tipada: `Database` type en `src/types/database.ts`, tipos de dominio en `src/types/index.ts`
- Idioma de la UI: espanol. Codigo y nombres de variables: ingles

## Mapa y geodesia

- Centro por defecto: Bogota (4.711, -74.0721)
- Modos de ruta: `straight_line` (calculo local), `road_osrm` (OSRM publico), `road_google` (Google Directions)
- Postes se distribuyen equidistantemente sobre la polyline usando interpolacion geodesica
- Funciones geo en `src/lib/geo/` con tests unitarios

## Notas para agentes

- No existe un "context-manager" agent. Los agentes deben explorar el codigo directamente.
- La UI usa CSS custom properties para theming, no clases de Tailwind para colores de tema.
- El proyecto ya tiene auto-save de rutas implementado (`use-auto-save-route`).
- Mobile usa un drawer inferior (`MobileDrawer`) en vez de sidebar lateral.

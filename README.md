# PixelFlix (frontend)

SPA de reseñas y streaming: React 18 + TypeScript + Tailwind 4 + Vite 7 + React Router 7.
Consume la API de `Pelixflix--backend` (`/api/v1`).

## Puesta en marcha
```bash
cp .env.example .env     # VITE_API_URL=http://localhost:3000
npm install
npm run dev              # http://localhost:5173
```
El backend debe permitir el origen del frontend en su `FRONTEND_URL` (CORS).

## Scripts
| | |
|---|---|
| `npm run dev` | servidor de desarrollo |
| `npm run typecheck` | `tsc --noEmit` (modo estricto) |
| `npm test` | vitest (mapper, cliente HTTP, sesión) |
| `npm run build` | typecheck + bundle de producción |

## Estructura (`src/`)
```
app/        config, providers (Auth, Shelf) y router
entities/   tipos y mappers del dominio (titles, users, reviews, categories)
features/   auth, Admin, Clients/{home,categories,favorites,list,profile}
layouts/    ClientLayout y header
shared/     api/ (cliente HTTP + un módulo por recurso), hooks/, components/, lib/
```

## Convenciones
- **Un solo cliente HTTP** (`shared/api/client.ts`): añade el Bearer, normaliza errores en `ApiError` y, ante un 401 con sesión activa, emite `pf:session-expired` para cerrar sesión.
- **Sesión**: `AuthProvider` valida el token una sola vez al arrancar (`GET /auth/verify`). `PrivateRoute` solo mira el estado.
- **Favoritos y Mi Lista** viven en el backend (`/favorites`); `ShelfProvider` los mantiene con actualización optimista.
- Las pantallas usan `TitleEntity` (ver `entities/titles`), construido desde la respuesta de la API con `mapTitle`.
- El reproductor usa `embedUrl` de cada título; lo gestiona un admin desde el panel.

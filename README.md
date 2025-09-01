# 📖 Descripción del Proyecto
PelixFlix Frontend es la interfaz de usuario de la plataforma de reseñas de películas y series. Desarrollada con React y Vite, ofrece una experiencia moderna y responsive para que los usuarios puedan descubrir, calificar y discutir sobre contenido audiovisual.

Repositorio Backend: https://github.com/sebasBetancourt/streaming 

# 🚀 Características Principales
## ✨ Interfaz de Usuario
- Diseño Moderno: Interfaz limpia y atractiva inspirada en Netflix

- Completamente Responsive: Optimizado para desktop, tablet y móvil

- Modo Oscuro: Tema oscuro por defecto para mejor experiencia visual

- Animaciones Suaves: Transiciones y efectos visuales cuidadosamente diseñados

# 🎯 Funcionalidades de Usuario
- Sistema de Autenticación: Login y registro integrado con backend

- Navegación Intuitiva: Browse, búsqueda y descubrimiento de contenido

- Gestión de Perfil: Edición de perfil y preferencias

- Listas Personalizadas: Creación y gestión de listas de favoritos

- Sistema de Reseñas: Creación y visualización de reseñas con rating

# 🎬 Experiencia de Contenido
- Catálogo Dinámico: Visualización de películas y series organizadas

- Búsqueda Avanzada: Filtros por categoría, rating y popularidad

- Detalles de Contenido: Modal con información completa de cada título

- Reproducción de Audio: Efectos de sonido y temas musicales

# 🛠️ Stack Tecnológico
- Frontend Framework
- React 18 - Biblioteca de JavaScript para interfaces

- Vite - Herramienta de build y desarrollo rápido

- JSX - Sintaxis para componentes React

# Estilos y UI
- Tailwind CSS - Framework de CSS utility-first

- CSS Modules - Estilos componentizados

- Custom CSS - Estilos personalizados y variables CSS

- Estado y Gestión de Datos
- React Context - Gestión de estado global (Auth, Movies)

- Custom Hooks - Hooks personalizados para lógica reutilizable

- Fetch API - Comunicación con backend REST API

## Utilidades
- ESLint - Linting y calidad de código

- Prettier - Formateo de código

- Git Hooks - Automatización de procesos de desarrollo

📦 Estructura del Proyecto
```
text
pelixflix-frontend/
│
├── 📁 public/              # Archivos públicos
│   ├── sounds/            # Efectos de sonido y música
│   ├── logo.jpg          # Logo de la aplicación
│   └── vite.svg          # Icono de Vite
│
├── 📁 src/               # Código fuente
│   │
│   ├── 📁 api/          # Servicios de API
│   │   ├── auth.js      # Autenticación
│   │   ├── titles.js    # Películas y series
│   │   ├── categories.js # Categorías
│   │   └── reviews.js   # Reseñas
│   │
│   ├── 📁 assets/       # Recursos estáticos
│   │   └── react.svg    # Iconos y assets
│   │
│   ├── 📁 components/   # Componentes React
│   │   ├── 📁 ui/      # Componentes de UI reutilizables
│   │   ├── Header.jsx  # Header de la aplicación
│   │   ├── Footer.jsx  # Footer
│   │   ├── HeroSection.jsx # Sección hero
│   │   ├── ContentRow.jsx  # Filas de contenido
│   │   ├── ContentCard.jsx # Tarjetas de contenido
│   │   └── ItemDialog.jsx  # Modal de detalles
│   │
│   ├── 📁 context/      # Contextos de React
│   │   ├── AuthContext.jsx # Estado de autenticación
│   │   └── MovieContext.jsx # Estado de películas
│   │
│   ├── 📁 hooks/        # Custom Hooks
│   │   ├── useAuth.js   # Hook de autenticación
│   │   ├── useFetch.js  # Hook para fetch de datos
│   │   ├── useLocalShelf.js # Hook para almacenamiento local
│   │   └── useRanking.js # Hook para cálculos de ranking
│   │
│   ├── 📁 pages/        # Componentes de página
│   │   ├── Home.jsx     # Página principal
│   │   ├── Login.jsx    # Página de login
│   │   ├── Profile.jsx  # Página de perfil
│   │   ├── Admin.jsx    # Panel de administración
│   │   ├── Categories.jsx # Página de categorías
│   │   ├── Favorites.jsx # Página de favoritos
│   │   └── List.jsx     # Página de listas
│   │
│   ├── 📁 routes/       # Enrutamiento
│   │   └── AppRouter.jsx # Router principal
│   │
│   ├── 📁 styles/       # Estilos globales
│   │   ├── global.css   # Estilos globales
│   │   ├── variable.css # Variables CSS
│   │   └── App.css      # Estilos principales
│   │
│   ├── 📁 utils/        # Utilidades
│   │   ├── storage.js   # Manejo de localStorage
│   │   ├── formatDate.js # Formateo de fechas
│   │   └── calculateRanking.js # Cálculos de ranking
│   │
│   ├── App.jsx          # Componente principal
│   ├── main.jsx         # Punto de entrada
│   └── index.css        # Estilos de entrada
│
├── .gitignore          # Archivos ignorados por git
├── .prettierrc         # Configuración de Prettier
├── eslint.config.js    # Configuración de ESLint
├── tailwind.config.js  # Configuración de Tailwind
├── vite.config.js      # Configuración de Vite
├── package.json        # Dependencias y scripts
├── index.html          # HTML principal
└── README.md          # Este archivo

```
# 🚀 Instalación y Configuración
## Prerrequisitos
- Node.js v18 o superior

- npm o yarn como gestor de paquetes

- Backend funcionando en puerto 3000

## 1. Clonar el Repositorio
```bash
git clone <url-del-repositorio-frontend>
cd pelixflix-frontend
```
## 2. Instalar Dependencias
```bash
npm install
```
## 3. Configurar Variables de Entorno
Crear archivo .env en la raíz del proyecto:
```bash
env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_API_TIMEOUT=10000

# Application
VITE_APP_NAME=PelixFlix
VITE_APP_VERSION=1.0.0

# Features
VITE_ENABLE_SOUNDS=true
VITE_ENABLE_ANIMATIONS=true
4. Ejecutar la Aplicación
bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview de producción
npm run preview

# Linting
npm run lint

# Formateo de código
npm run format

```
# 🎨 Componentes Principales
## 🔐 AuthContext
Maneja el estado de autenticación global de la aplicación:

- Estado de login/logout

- Información del usuario

- Tokens JWT

- Permisos y roles

# 🎬 MovieContext
Gestiona el estado de las películas y series:

- Catálogo completo

- Categorías

- Favoritos del usuario

- Búsquedas y filtros

# 🎪 Componentes de UI
- Header: Navegación principal y búsqueda

- HeroSection: Banner principal con contenido destacado

- ContentRow: Filas de contenido organizadas por categoría

- ContentCard: Tarjetas individuales de películas/series

- ItemDialog: Modal con detalles completos del contenido

- GenreChips: Chips de categorías interactivos

# 📡 Integración con API
Servicios de API
```javascript
// Ejemplo de uso de API
import { authAPI, titlesAPI, reviewsAPI } from './api';

// Login
const user = await authAPI.login(email, password);

// Obtener títulos populares
const popularTitles = await titlesAPI.getPopular();

// Crear reseña
const review = await reviewsAPI.create(movieId, rating, comment);
Endpoints Consumidos
GET /titles - Listado de títulos

GET /titles/search - Búsqueda de contenido

GET /titles/:id - Detalles de título

POST /auth/login - Autenticación

POST /reviews - Crear reseñas

GET /categories - Listado de categorías
```

# 🎭 Hooks Personalizados
## useAuth
Maneja la autenticación y estado del usuario:

```javascript
const { user, login, logout, isAuthenticated } = useAuth();
useFetch
Hook para peticiones HTTP con estado de loading y error:

javascript
const { data, loading, error } = useFetch('/titles/popular');
useLocalShelf
Gestión de favoritos en localStorage:

javascript
const { favorites, addToFavorites, removeFromFavorites } = useLocalShelf();
useRanking
Cálculos de rankings y puntuaciones:

javascript
const { calculateWeightedRating, formatRating } = useRanking();
```

# 🎨 Sistema de Diseño

```Tailwind CSS
Configuración personalizada en tailwind.config.js:

javascript
theme: {
  extend: {
    colors: {
      primary: '#E50914',
      secondary: '#221F1F',
      accent: '#00A8E8'
    }
  }
}
```
## Variables CSS
Archivo src/styles/variable.css con variables personalizadas:

```css
:root {
  --color-primary: #E50914;
  --color-secondary: #221F1F;
  --color-accent: #00A8E8;
  --color-background: #141414;
  --color-text: #FFFFFF;
}
```
# 📱 Responsive Design
## Breakpoints
- Mobile: < 768px

- Tablet: 768px - 1024px

- Desktop: > 1024px

## Estrategia Mobile-First
```css
/* Mobile first */
.component {
  padding: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .component {
    padding: 2rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .component {
    padding: 3rem;
  }
}
```
# 🧪 Testing
Ejecutar Tests
```bash
# Tests unitarios
npm run test

# Tests con coverage
npm run test:coverage

# Tests en watch mode
npm run test:watch
Estructura de Testing
text
__tests__/
├── components/
├── hooks/
├── utils/
└── pages/
```
# 🚀 Despliegue
## Build de Producción
```bash
npm run build
Variables de Producción
env
VITE_API_BASE_URL=https://api.pelixflix.com/api/v1
VITE_APP_NAME=PelixFlix Production
```
## Plataformas de Despliegue
- Vercel: Despliegue automático con Git

- Netlify: Continuous Deployment


## Comandos Útiles
```
bash
# Limpiar cache
npm run clean

# Verificar dependencias
npm audit

# Actualizar dependencias
npm update
```

# 🔗 Enlaces Importantes
Backend API: http://localhost:3000/api-docs

Documentación de Componentes: [Storybook URL]

Design System: [Figma URL]

Production URL: https://pelixflix.com

#👥 Equipo de Desarrollo
- Sebastian Betancourt
- Victor Pabon



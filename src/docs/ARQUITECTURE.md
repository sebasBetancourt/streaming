# 📁 Arquitectura del Proyecto – Plataforma de Streaming

***Arquitectura: React + Clean Architecture + Feature-Sliced Design (FSD)***

Este documento describe la organización interna del proyecto, su flujo de información y la responsabilidad de cada capa. El objetivo es asegurar una base modular, escalable y mantenible, separando de forma estricta el dominio, las funcionalidades y la infraestructura.

## 🧱 1. Visión General de la Arquitectura

La arquitectura del proyecto sigue tres principios:

### ✔ Clean Architecture

Separación estricta entre dominio, aplicación, infraestructura y UI.
Cada capa depende solo de la inmediatamente superior.

### ✔ Feature-Sliced Design (FSD)

El proyecto se organiza por características funcionales, no por archivos sueltos.
Cada feature es independiente y puede crecer sin afectar a otras.

### ✔ React escalable

Separación clara entre componentes compartidos, páginas, lógica de dominio, servicios, slices, hooks, etc.

## 🗂 2. Estructura Global del Proyecto
```

.
├── app
│   ├── apiClient.js
│   ├── config
│   ├── index.js
│   ├── providers
│   │   ├── AuthContext.jsx
│   │   └── MovieContext.jsx
│   ├── router
│   │   └── AppRouter.jsx
│   └── store
├── App.jsx
├── assets
│   └── react.svg
├── docs
│   └── ARQUITECTURE.md
├── entities
│   ├── categories
│   │   ├── index.js
│   │   ├── mapper.js
│   │   └── types.js
│   ├── movies
│   │   ├── index.js
│   │   ├── mapper.js
│   │   └── types.js
│   ├── reviews
│   │   ├── index.js
│   │   ├── mapper.js
│   │   └── types.js
│   └── users
│       ├── index.js
│       ├── mapper.js
│       └── types.js
├── features
│   ├── Admin
│   │   ├── adminSlice.jsx
│   │   ├── components
│   │   ├── hooks
│   │   ├── pages
│   │   │   └── Admin.jsx
│   │   └── services
│   ├── auth
│   │   ├── authSlice.jsx
│   │   ├── components
│   │   ├── hooks
│   │   ├── pages
│   │   │   └── Login.jsx
│   │   └── services
│   └── Clients
│       ├── categories
│       │   ├── categoriesSlice.jsx
│       │   ├── components
│       │   ├── hooks
│       │   ├── pages
│       │   │   └── Categories.jsx
│       │   └── services
│       ├── clientSlice.jsx
│       ├── components
│       ├── favorites
│       │   ├── components
│       │   ├── favoriteSlice.jsx
│       │   ├── hooks
│       │   ├── pages
│       │   │   └── Favorites.jsx
│       │   └── services
│       ├── hooks
│       ├── list
│       │   ├── components
│       │   ├── hooks
│       │   ├── listSlice.jsx
│       │   ├── pages
│       │   │   └── List.jsx
│       │   └── services
│       ├── pages
│       │   └── Home.jsx
│       ├── profile
│       │   ├── components
│       │   ├── hooks
│       │   ├── pages
│       │   │   └── Profile.jsx
│       │   ├── profileSlice.jsx
│       │   └── services
│       └── services
├── index.css
├── main.jsx
├── shared
│   ├── api
│   │   ├── auth.js
│   │   ├── categories.js
│   │   ├── reviews.js
│   │   └── titles.js
│   ├── components
│   │   ├── CategorySection.jsx
│   │   ├── ContentCard.jsx
│   │   ├── ContentRow.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── Footer.jsx
│   │   ├── Header.jsx
│   │   ├── HeroSection.jsx
│   │   ├── ItemDialog.jsx
│   │   ├── Logout.jsx
│   │   ├── Row.jsx
│   │   ├── Search.jsx
│   │   └── ui
│   │       ├── ArrowButton.jsx
│   │       ├── button.jsx
│   │       ├── GenreChips.jsx
│   │       ├── scroll-area.jsx
│   │       └── utils.js
│   ├── hooks
│   │   ├── useAuth.js
│   │   ├── useFetch.js
│   │   ├── useLocalShelf.js
│   │   ├── useRanking.js
│   │   └── useScrollLock.js
│   ├── styles
│   │   ├── global.css
│   │   └── variables.css
│   └── utils
│       ├── calculateRanking.js
│       ├── formatDate.js
│       └── storage.js
└── styles
    └── App.css


```


A continuación se explica el propósito de cada capa.

## 🧩 3. Capas de la Arquitectura
### 🏛 3.1 app/ — Capa de Aplicación

Contiene todo lo relacionado con la configuración general del proyecto:
```
app/
│── apiClient.js         → Cliente HTTP global (axios configurado)
│── store/               → Estado global (Redux Toolkit)
│── providers/           → Providers globales (AuthContext, MovieContext)
│── router/              → Enrutador principal de la aplicación
│── config/              → Variables y configuraciones globales
│── index.js             → Punto central para inicializar la aplicación
```

**Responsabilidad:**

Actúa como el root-layer que conecta UI con dominio y servicios.

### 🧠 3.2 entities/ — Capa de Dominio

Aquí vive el modelo de negocio, totalmente independiente del UI.

Ejemplo de entidades:
```
entities/
├── movies/
├── users/
├── categories/
└── reviews/

```
Cada entidad incluye:
```
index.js          → Exportaciones centralizadas
types.js          → Tipos / shape de la entidad
mapper.js         → Transformación entre API y dominio

```
**Responsabilidad:**

Definir la estructura de los datos y asegurar consistencia en todo el sistema.

### 🚀 3.3 features/ — Funcionalidades del Sistema

La capa más grande y donde vive toda la funcionalidad real.

Cada feature contiene:
```
features/<featureName>/
│── components/
│── hooks/
│── pages/
│── services/
│── <feature>Slice.jsx
```

**Features principales:**
```
features/
├── auth/         → Login, logout, recuperación
├── Admin/        → Panel administrativo
└── Clients/
      ├── categories/ → Listado de categorías
      ├── favorites/  → Sistema de favoritos
      ├── list/       → Listas personalizadas
      └── profile/    → Perfil del usuario

```
**Responsabilidad:**

Cada feature tiene su propio estado, servicios, UI y lógica.
Se mantiene aislada del resto del sistema.

### 🧰 3.4 shared/ — Recursos Reutilizables

Todo lo que NO pertenece a una feature específica:
```
shared/
├── api/          → Endpoints crudos hacia el backend
├── components/   → Componentes reutilizables
├── hooks/        → Custom hooks generales
├── utils/        → Funciones auxiliares
└── styles/       → Estilos globales

```
**Responsabilidad:**

Reducir duplicación y servir como toolbox global.

## 🔄 4. Flujo de Datos en la Aplicación

El flujo sigue el enfoque Clean Architecture:
```
UI (features/pages/components)
        ↓
feature services (lógica local del feature)
        ↓
shared/api (llamadas al backend)
        ↓
entities/mapper (normaliza los datos)
        ↓
app/store (estado global si se requiere)

```
***Ejemplo del flujo al cargar películas:***

1️⃣ El usuario abre /home

2️⃣ El componente de la feature Clients invoca su servicio interno

3️⃣ El servicio consulta a shared/api/titles.js

4️⃣ El mapper convierte la data cruda en un modelo Movie

5️⃣ El state slice almacena el resultado

6️⃣ La UI renderiza los datos normalizados

## 🧭 5. Navegación y Rutas

Las rutas viven en:
```
app/router/AppRouter.jsx

```
Estructura conceptual:
```
/login
/home
/categories
/favorites
/list
/profile
/admin     (protegida)

```
Cada ruta apunta a una página dentro de su feature correspondiente.

## 🔐 6. Autenticación & Contextos

En `app/providers/`:

- `AuthContext.jsx`

- `MovieContext.jsx`

Manejan:

✔ Datos del usuario

✔ Permisos

✔ Sesión

✔ Estado de películas en contexto global

## 🧱 7. Principios de la Arquitectura
**✔ Feature Isolation**

Cada feature es independiente y autónoma.

**✔ Domain-Centric**

El dominio (entities/) es la base del proyecto.

**✔ Persistencia aislada**

Todas las llamadas HTTP pasan por shared/api.

**✔ UI limpia**

Sin lógica de negocio en componentes.

**✔ Escalabilidad real**

Agregar nuevas películas, features, admin modules o nuevas vistas es simple y sin romper la estructura.

## 📝 8. Beneficios de esta Arquitectura

- Código modular y fácil de mantener

- Features independientes

- Reutilización masiva de UI y lógica

- Aislamiento entre dominio, infra y UI

- Escalable para miles de películas

- Perfecto para migrar a apps móviles o microfrontends en el futuro
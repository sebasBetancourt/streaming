# Objetivo


El objetivo de este proyecto es desarrollar una aplicación full-stack usando Node.js + Express para el backend y HTML + CSS puro para el frontend, que permita a los usuarios registrar, calificar y rankear películas, animes y series geek. Esta herramienta debe incluir funcionalidades para gestionar usuarios, reseñas, categorías y rankings, diferenciando permisos de usuario y administrador. Además, debe contar con autenticación segura, validaciones robustas y un frontend que consuma la API desarrollada.



# La aplicación debe:


- Estar desarrollada completamente en Node.js con Express para el backend.
- Implementar autenticación con JWT usando passport-jwt, jsonwebtoken y bcrypt.
- Usar dotenv para la configuración de variables de entorno.
- Integrar express-rate-limit para limitar peticiones y evitar abusos.
- Implementar validaciones en endpoints usando express-validator.
- Persistir los datos en MongoDB, usando el driver oficial (no mongoose).
- Documentar todos los endpoints usando swagger-ui-express.
- Versionar el API siguiendo semver.
- Manejar transacciones reales en MongoDB para operaciones críticas (ej. creación de reseñas con rating inicial, gestión de likes/dislikes).
- Contar con una arquitectura coherente (ejemplo: /models, /controllers, /routes, /middlewares, /services, /config, /utils).
- Tener un frontend independiente en otro repositorio, desarrollado en HTML + CSS + JS puro.


# Funcionalidades requeridas
1. ***Gestión de usuarios***

    Registro, inicio de sesión y autenticación mediante JWT.
    Roles: usuario y administrador.
    Los administradores pueden gestionar categorías y aprobar películas.


2. ***Gestión de películas y series***

    CRUD de películas/series (solo administradores aprueban nuevas entradas).
    Validación para evitar títulos repetidos.
    Atributos mínimos: título, descripción, categoría, año, imagen opcional.

3. ***Gestión de reseñas y ratings***

    Los usuarios pueden crear, editar y eliminar reseñas.
    Cada reseña incluye: título, comentario, calificación numérica (1-10).
    Los usuarios pueden dar like/dislike a reseñas de otros (no a las propias).
    El sistema debe calcular un ranking ponderado de películas basado en calificaciones, likes/dislikes y fecha de reseña.
4. ***Categorías***

    CRUD de categorías (ejemplo: Anime, Ciencia Ficción, Superhéroes, Fantasía).
    Solo administradores pueden gestionarlas.
    Ranking y listados
    Listado de películas con ordenamiento por popularidad y ranking.
    Filtrado por categoría.
    Vista de detalle con información y reseñas asociadas.


# Especificaciones técnicas obligatorias
1. ### ***Backend (Node.js + Express)***
    - Uso obligatorio de dotenv, express, express-rate-limit, express-validator, mongodb, semver, swagger-ui-express, passport-jwt, jsonwebtoken, bcrypt.
    - MongoDB con operaciones transaccionales para garantizar consistencia.
    - Arquitectura modular y escalable.
    - Manejo de errores centralizado y códigos HTTP correctos.
    - Debe estar desarrollado en Node.js con Express.
    - Uso de variables de entorno para credenciales y configuración (archivo .env).
    - Modularización del código (separar rutas, controladores, modelos y configuración).
    - Validaciones en las rutas usando express-validator.
    - Manejo adecuado de errores y envío de respuestas con los códigos HTTP correctos.
    - Configuración de CORS para permitir la conexión desde el frontend.
- Documentación en el README con:
    - Explicación del proyecto.
    - Requerimientos de instalación.
    - Variables de entorno necesarias.
    - Ejemplos de endpoints y cómo probarlos.
    - Link al repositorio del frontend.


2. ### ***Frontend***

- HTML, CSS y JavaScript puro.
- Pantallas mínimas: Inicio, Registro/Login, Listado de películas, Detalle de película, Panel admin.
- Debe consumir los endpoints del backend.
- Interfaz amigable y responsive para realizar todas las operaciones (crear, leer, actualizar, eliminar).
- Mostrar mensajes de validación o error provenientes del backend.
- Repositorio separado del backend.
- Documentación (README del backend)
- Descripción del proyecto y temática elegida.
- Tecnologías usadas.
- Pasos para instalar y ejecutar.
- Ejemplos de endpoints y cómo consumirlos.
- Link al repositorio del frontend.
- Video de entrega
- Duración máxima: 10 minutos.
- Deben aparecer todos los integrantes en cámara.
- Mostrar brevemente el código del backend.
- Mostrar el funcionamiento completo del frontend.


# Planeación del proyecto
1. El desarrollo se debe realizar bajo SCRUM.
2. Roles definidos: Scrum Master, Product Owner, Developers.
3. Definir al menos 2 sprints.
4. Historias de usuario documentadas.
5. Herramienta de seguimiento: GitHub Projects, Trello, ClickUp o similar.
6. Documento de planeación en PDF adjunto al repositorio backend, siguiendo plantilla entregada.



# Resultado esperado

La entrega se debe hacer en equipo, subiendo el proyecto a un repositorio GitHub privado y agregando al trainer como colaborador. El backend debe contener toda la lógica y documentación. El frontend debe estar en un repositorio separado, vinculado desde el README del backend.



### El repositorio backend debe incluir:

1. ***README.md con:***
- Descripción del proyecto.
- Instrucciones de instalación y uso.
- Estructura del proyecto.
- Principios aplicados.
- Consideraciones técnicas.
- Créditos.
- Link al repo del frontend.
2. ***Documento SCRUM en PDF con:***
- Roles asignados.
- Definición de sprints.
- Historias de usuario.
- Herramienta de seguimiento.
- Evidencias.
3. ***Video*** enlazado en el README mostrando:
- Explicación técnica.
- Ejemplos de código.
- Demo funcional de la aplicación completa.

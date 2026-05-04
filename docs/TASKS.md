# Plan de Tareas: InvitaMagic

Este documento detalla las tareas atómicas necesarias para el desarrollo del MVP de InvitaMagic, basadas en el PRD y el RFC técnico. Las tareas están diseñadas para que un subagente de IA pueda programarlas de forma independiente en una sola sesión.

## Sprint 1: Infraestructura, Autenticación y Dashboard Base

- [x] **TASK-01: Inicializar Proyecto Frontend y Estilos**
  - **Descripción:** Crear la base del proyecto frontend con React y TypeScript, y configurar el framework de estilos para desarrollo ágil y mobile-first.
  - **Archivos a modificar:** `package.json`, `tailwind.config.js`, `postcss.config.js`, `src/index.css`
  - **Librerías:** `react`, `react-dom`, `vite`, `tailwindcss`, `postcss`, `autoprefixer`, `typescript`
  
- [x] **TASK-02: Configurar Cliente Supabase**
  - **Descripción:** Inicializar la conexión central con el Backend as a Service utilizando variables de entorno de forma segura.
  - **Archivos a modificar:** `src/lib/supabase.ts`, `.env.local`, `.env.example`
  - **Librerías:** `@supabase/supabase-js`

- [x] **TASK-03: Crear Esquemas de Base de Datos en Supabase**
  - **Descripción:** Escribir el script de migración SQL que crea las tablas `events` y `guests`, e implementa las políticas de seguridad RLS según el RFC.
  - **Archivos a modificar:** `supabase/schema.sql`
  - **Librerías:** N/A (Script SQL puro)

- [x] **TASK-04: Configurar Zustand para Estado Global**
  - **Descripción:** Implementar el almacén de estado para gestionar la sesión del usuario (Auth) y los datos globales de eventos cacheados en el dashboard.
  - **Archivos a modificar:** `src/store/authStore.ts`, `src/store/eventStore.ts`
  - **Librerías:** `zustand`

- [x] **TASK-05: Implementar Autenticación y Enrutamiento Base**
  - **Descripción:** Desarrollar vistas de Login/Registro, configurar `react-router-dom` protegiendo las rutas del panel de control e implementar un layout base con barra lateral.
  - **Archivos a modificar:** `src/features/auth/Login.tsx`, `src/components/layout/DashboardLayout.tsx`, `src/App.tsx`
  - **Librerías:** `react-router-dom`, `@supabase/supabase-js`

- [x] **TASK-06: Implementar Dashboard (Lista de Eventos)**
  - **Descripción:** Consumir la tabla `events` filtrando por el usuario logueado. Mostrar tarjetas resumen por evento preparadas para recibir estadísticas.
  - **Archivos a modificar:** `src/features/dashboard/EventList.tsx`, `src/features/dashboard/Dashboard.tsx`
  - **Librerías:** `@supabase/supabase-js`, `lucide-react` (iconos)

- [x] **TASK-07: Implementar Formulario CRUD de Eventos (Sin IA)**
  - **Descripción:** Crear el formulario interactivo para dar de alta o editar un evento (título, descripción, temática, fecha, ubicación) guardando en Supabase.
  - **Archivos a modificar:** `src/features/editor/EventForm.tsx`
  - **Librerías:** `react-hook-form` (sugerido), `@supabase/supabase-js`


## Sprint 2: Integración IA, Vista Pública y Reloj Regresivo

- [x] **TASK-08: Crear Edge Function para Groq API**
  - **Descripción:** Desarrollar el backend serverless en Supabase (Deno) que envíe de forma segura un prompt de sistema sobre la temática del evento a la API de Groq y retorne texto.
  - **Archivos a modificar:** `supabase/functions/generate-invitation-text/index.ts`
  - **Librerías:** Deno Standard Library

- [x] **TASK-09: Integrar Generación de Texto IA en Formulario**
  - **Descripción:** Añadir un botón "Generar con IA" en `EventForm`. Al pulsarlo, debe invocar la Edge Function, obtener el texto y rellenar el campo de descripción para previsualizarlo.
  - **Archivos a modificar:** `src/features/editor/EventForm.tsx`
  - **Librerías:** `@supabase/supabase-js`

- [x] **TASK-10: Implementar Ruta Dinámica de Vista Pública**
  - **Descripción:** Crear la vista `/invitacion/:id` accesible sin autenticación, leyendo datos del evento vía Supabase y mostrando la información básica (título, descripción, temática).
  - **Archivos a modificar:** `src/features/public/InvitationView.tsx`, `src/App.tsx`
  - **Librerías:** `react-router-dom`, `@supabase/supabase-js`

- [x] **TASK-11: Desarrollar Componente de Reloj Regresivo**
  - **Descripción:** Crear un hook y componente visual que reciba la fecha del evento, calcule la diferencia cada segundo y muestre Días, Horas, Minutos, Segundos con un diseño atractivo.
  - **Archivos a modificar:** `src/hooks/useCountdown.ts`, `src/components/ui/CountdownClock.tsx`, `src/features/public/InvitationView.tsx`
  - **Librerías:** `date-fns`

- [x] **TASK-12: Implementar Formulario de RSVP**
  - **Descripción:** Incorporar el formulario en la vista pública para que los invitados inserten su asistencia (Nombre, asiste o no, acompañantes). Realizar un `INSERT` en la tabla `guests`.
  - **Archivos a modificar:** `src/features/public/RSVPForm.tsx`, `src/features/public/InvitationView.tsx`
  - **Librerías:** `react-hook-form`, `@supabase/supabase-js`

- [x] **TASK-13: Reflejar Métricas RSVP en Dashboard**
  - **Descripción:** Modificar el Dashboard del organizador para consultar la tabla `guests` y mostrar en tiempo real la cantidad de confirmados, rechazados y acompañantes por cada evento.
  - **Archivos a modificar:** `src/features/dashboard/EventStats.tsx`, `src/features/dashboard/EventList.tsx`
  - **Librerías:** `@supabase/supabase-js`


## Sprint 3: Refinamiento UX, SEO y Despliegue

- [x] **TASK-14: Optimizar UI/UX y Añadir Animaciones**
  - **Descripción:** Mejorar la experiencia puliendo el diseño general, agregando micro-interacciones en botones y transiciones suaves en componentes del flujo público y dashboard.
  - **Archivos a modificar:** Componentes varios de UI (`src/components/ui/*`)
  - **Librerías:** `framer-motion` (sugerido)

- [x] **TASK-15: Configurar Meta Etiquetas Dinámicas (SEO y Open Graph)**
  - **Descripción:** Asegurar que al compartir la URL en WhatsApp/redes se muestre una previsualización atractiva inyectando dinámicamente etiquetas `<title>`, `og:title`, `og:description`.
  - **Archivos a modificar:** `src/features/public/InvitationView.tsx`, `index.html`
  - **Librerías:** `react-helmet-async`

- [x] **TASK-16: Preparar y Ejecutar Despliegue en Producción**
  - **Descripción:** Configurar reglas de rescritura (rewrites) para SPA (en caso de usar Vercel/Netlify), limpiar logs de desarrollo y preparar el `README.md` con instrucciones finales.
  - **Archivos a modificar:** `vercel.json` (o similar), `README.md`
  - **Librerías:** N/A

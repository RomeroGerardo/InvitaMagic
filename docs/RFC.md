# Request for Comments (RFC): InvitaMagic

## 1. Stack Tecnológico

El proyecto se construirá utilizando las siguientes tecnologías modernas y optimizadas para un desarrollo ágil y escalable:

*   **Frontend Framework:** React 18
*   **Build Tool:** Vite (para un entorno de desarrollo rápido y empaquetado optimizado)
*   **Estilos:** Tailwind CSS (para diseño responsivo y mobile-first)
*   **Gestión de Estado:** Zustand (ligero, ideal para manejar el estado de la sesión y datos de eventos en el dashboard)
*   **Manejo de Fechas:** `date-fns` (para el cálculo preciso del reloj de cuenta regresiva y formateo de fechas)
*   **Backend as a Service (BaaS):** Supabase (Autenticación de usuarios y Base de Datos PostgreSQL)
*   **Generación de Textos (IA):** Groq API (integrado a través de Supabase Edge Functions para latencia ultra baja)

## 2. Arquitectura y Flujo de Datos

La arquitectura sigue un modelo Serverless con un frontend robusto (SPA) interactuando directamente con los servicios de Supabase.

**Flujo de Datos Principal:**

1.  **Autenticación:** El organizador se autentica utilizando Supabase Auth en la aplicación React.
2.  **Gestión de Eventos (Dashboard):** El cliente React realiza peticiones CRUD directamente a la base de datos PostgreSQL de Supabase a través de su cliente REST (PostgREST), protegido por Row Level Security (RLS).
3.  **Generación con IA:** Al crear un evento, si el usuario solicita un texto generado por IA, el cliente llama a una Supabase Edge Function. Esta función invoca de forma segura la API de Groq, genera el texto y lo devuelve al cliente para ser previsualizado y guardado.
4.  **Vista Pública y RSVP:**
    *   Un invitado accede a la URL única (ej. `/invitacion/:event_id`).
    *   El frontend hace un `fetch` (con permisos de lectura pública) a Supabase para obtener los detalles del evento (fecha, título, texto IA).
    *   El componente de **Reloj** utiliza `date-fns` en un `useEffect` para calcular localmente la diferencia entre la fecha actual y la `event_date` cada segundo.
    *   Al confirmar asistencia, el frontend realiza un `INSERT` directo en la tabla `guests` de Supabase.
5.  **Dashboard de Resultados:** El organizador consulta la tabla `guests` filtrada por sus eventos para ver estadísticas ("Confirmados", "Pendientes") casi en tiempo real.

## 3. Estructura de Carpetas Modular

El proyecto frontend adoptará una arquitectura basada en características (Feature-Sliced Design simplificado) para mantener el código organizado y escalable:

```text
/src
 ├── assets/            # Imágenes, iconos, CSS global (index.css)
 ├── components/        # Componentes UI reutilizables
 │   ├── ui/            # Botones, Inputs, Modales genéricos
 │   └── layout/        # Navbar, Footer, Contenedores
 ├── features/          # Módulos específicos por funcionalidad
 │   ├── auth/          # Componentes y lógica de login/registro
 │   ├── dashboard/     # Vistas y componentes del panel de control
 │   ├── editor/        # Formulario de creación de eventos e integración IA
 │   └── public/        # Vista pública de la invitación (Reloj, RSVP)
 ├── hooks/             # Custom Hooks genéricos (ej. useCountdown)
 ├── lib/               # Clientes de terceros (supabase.ts, groq.ts)
 ├── store/             # Stores de Zustand (authStore.ts, eventStore.ts)
 ├── types/             # Definiciones de TypeScript (interfaces)
 ├── utils/             # Funciones utilitarias genéricas
 ├── App.tsx            # Configuración de Rutas (React Router)
 └── main.tsx           # Entry point
/supabase
 ├── functions/         # Supabase Edge Functions (ej. generate-invitation-text)
 └── migrations/        # Archivos SQL para esquema de base de datos
```

## 4. Esquema SQL (Supabase)

El siguiente es el esquema exacto para las tablas principales, incluyendo las políticas de Row Level Security (RLS) para garantizar la privacidad y seguridad.

```sql
-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- TABLA: events
-- ==========================================
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  theme VARCHAR(100),
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) para events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Organizadores pueden gestionar sus propios eventos
CREATE POLICY "Users can view their own events" ON events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own events" ON events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own events" ON events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own events" ON events FOR DELETE USING (auth.uid() = user_id);

-- Acceso de lectura público para invitados (necesario para ver la invitación)
CREATE POLICY "Anyone can view event by ID" ON events FOR SELECT USING (true);


-- ==========================================
-- TABLA: guests
-- ==========================================
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) CHECK (status IN ('attending', 'declined', 'pending')) DEFAULT 'pending',
  companions INTEGER DEFAULT 0,
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) para guests
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

-- Organizadores pueden ver los invitados de SUS eventos
CREATE POLICY "Organizers can view guests of their events" ON guests FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM events 
    WHERE events.id = guests.event_id 
    AND events.user_id = auth.uid()
  )
);

-- Invitados públicos pueden insertar su confirmación (RSVP)
CREATE POLICY "Anyone can insert guest RSVP" ON guests FOR INSERT WITH CHECK (true);
```

## 5. Plan de Implementación por Fases

El desarrollo se dividirá en 5 fases incrementales:

### Fase 1: Infraestructura y Setup (Sprint 1)
*   Inicializar repositorio con React, Vite, Tailwind CSS y TypeScript.
*   Configurar proyecto en Supabase.
*   Ejecutar el script SQL de esquemas (tablas y RLS).
*   Configurar `supabase-js` en el frontend (`src/lib/supabase.ts`).

### Fase 2: Autenticación y Dashboard (Sprint 1)
*   Implementar flujos de Login/Registro usando Supabase Auth.
*   Crear la estructura del Dashboard (Sidebar, Header).
*   Desarrollar vistas para listar, crear, editar y eliminar eventos.
*   Integrar estado global con Zustand para el usuario logueado.

### Fase 3: Integración de IA con Groq (Sprint 2)
*   Desarrollar una Edge Function en Supabase (`generate-invitation-text`) que se comunique con la API de Groq de forma segura.
*   Integrar la llamada a la IA en el formulario de creación de eventos del Dashboard.
*   Permitir al usuario previsualizar y modificar el texto generado antes de guardarlo en PostgreSQL.

### Fase 4: Vista Pública, Reloj Regresivo y RSVP (Sprint 2)
*   Implementar ruta dinámica (e.g. `/invitacion/:id`).
*   Desarrollar el componente `CountdownClock` usando `date-fns` que consuma `event_date`.
*   Diseñar el formulario interactivo de RSVP (Nombre, Asistirá sí/no, Acompañantes).
*   Conectar el envío del RSVP con un `INSERT` a la tabla `guests` en Supabase.
*   Actualizar el Dashboard para mostrar las métricas de asistencia.

### Fase 5: Refinamiento UX y Despliegue (Sprint 3)
*   Optimizar animaciones (framer-motion sugerido) e interfaz general mobile-first.
*   Añadir etiquetas meta (SEO/Open Graph) para permitir previsualizaciones ricas al compartir el enlace en WhatsApp.
*   Despliegue de la aplicación web en una plataforma como Vercel o Netlify.
*   Pruebas finales E2E de los casos de uso principales.

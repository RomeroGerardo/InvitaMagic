PRD - Requerimientos del Producto: InvitaMagic (Tarjetas de Cumpleaños Inteligentes)
Estado: Aprobado (MVP) Metodología: Spec-Driven Development (SDD)
1. El Problema
Las invitaciones de cumpleaños tradicionales en papel son costosas, poco ecológicas y difíciles de distribuir. Por otro lado, las invitaciones enviadas como una simple imagen por WhatsApp no permiten a los organizadores llevar un control real y automatizado de la asistencia, ni generan anticipación interactiva en los invitados.
2. Objetivos
Desarrollar un MVP de una plataforma web donde los usuarios puedan crear tarjetas de invitación digitales, interactivas y personalizables. El sistema debe permitir compartir un enlace único, recoger las confirmaciones de asistencia (RSVP) en tiempo real, usar IA para redactar textos temáticos, y mostrar una cuenta regresiva animada para generar expectativa.
3. Alcance (Scope)
Entra en esta iteración: Panel de control para el creador (Dashboard), generador de textos con IA (Groq API), vista pública interactiva con formulario RSVP, reloj de cuenta regresiva en tiempo real, y base de datos (Supabase).
Fuera de esta iteración: Pasarela de pagos, diseños arrastrables complejos, envío automático masivo por WhatsApp.
4. Casos de Uso (User Stories)
Creación con IA: El organizador introduce la temática "Dinosaurios" y la IA genera un texto creativo para la invitación.
Expectativa (Cuenta Regresiva): El invitado abre el enlace en su celular y lo primero que ve, debajo del título, es un reloj animado que le indica exactamente cuántos días, horas, minutos y segundos faltan para que comience la fiesta.
Control de Invitados: El invitado confirma asistencia y el organizador ve en su dashboard: "20 Confirmados, 5 Pendientes".
5. Requerimientos Funcionales
Backend / DB: Uso de Supabase para la gestión de usuarios (Auth) y base de datos (tablas events y guests).
Generación IA: Integración con Groq API mediante Supabase Edge Functions para generar descripciones.
Frontend (Vista Pública): Ruta dinámica (ej. /invitacion/:id) mobile-first, que contenga el formulario RSVP y un componente de reloj regresivo que calcule la diferencia entre la fecha actual y la fecha del evento.
6. Requerimientos No Funcionales
SEO y Open Graph: Etiquetas meta dinámicas para vista previa en WhatsApp.
Diseño y Animación: Interfaz festiva. El reloj de cuenta regresiva debe actualizarse cada segundo de forma fluida sin causar problemas de rendimiento en el dispositivo.
Librerías sugeridas: date-fns para el manejo seguro de fechas y zonas horarias de la cuenta regresiva.
7. Criterios de Aceptación
El reloj debe mostrar los días, horas, minutos y segundos restantes, y llegar a "00:00:00" en el momento exacto del evento.
Un invitado debe poder rellenar el formulario RSVP y reflejarse instantáneamente en el dashboard del organizador.
La IA debe ser capaz de generar textos coherentes basados en la temática introducida.

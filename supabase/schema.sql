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

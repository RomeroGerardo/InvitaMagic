import { create } from 'zustand';

export interface AppEvent {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  theme: string | null;
  event_date: string;
  location: string | null;
  background_image_url: string | null;
  created_at: string;
  updated_at: string;
}

interface EventState {
  events: AppEvent[];
  selectedEvent: AppEvent | null;
  isLoading: boolean;
  error: string | null;
  setEvents: (events: AppEvent[]) => void;
  addEvent: (event: AppEvent) => void;
  updateEvent: (updatedEvent: AppEvent) => void;
  removeEvent: (id: string) => void;
  setSelectedEvent: (event: AppEvent | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useEventStore = create<EventState>((set) => ({
  events: [],
  selectedEvent: null,
  isLoading: false,
  error: null,
  setEvents: (events) => set({ events }),
  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
  updateEvent: (updatedEvent) =>
    set((state) => ({
      events: state.events.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)),
    })),
  removeEvent: (id) =>
    set((state) => ({
      events: state.events.filter((e) => e.id !== id),
    })),
  setSelectedEvent: (selectedEvent) => set({ selectedEvent }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

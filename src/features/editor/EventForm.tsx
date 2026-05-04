import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { Calendar, MapPin, Tag, Type, AlignLeft, Save, ArrowLeft, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';

interface EventFormData {
  title: string;
  description: string;
  theme: string;
  event_date: string;
  location: string;
  background_image_url?: string;
}

const EventForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isEditing = Boolean(id);

  const { register, handleSubmit, getValues, setValue, watch, formState: { errors, isSubmitting }, reset } = useForm<EventFormData>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const backgroundImageUrl = watch('background_image_url');

  const isVideo = (url: string | undefined) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|ogg)$/i) || url.includes('video');
  };

  const handleGenerateAI = async () => {
    const title = getValues('title');
    const theme = getValues('theme');

    if (!title || !theme) {
      alert('Por favor, ingresa un Título y una Temática antes de generar con IA.');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-invitation-text', {
        body: { title, theme }
      });

      if (error) throw error;
      if (data && data.generatedText) {
        setValue('description', data.generatedText, { shouldDirty: true, shouldValidate: true });
      }
    } catch (error) {
      console.error('Error generating text with AI:', error);
      alert('Hubo un error al generar el texto. Por favor intenta nuevamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (20MB max)
    if (file.size > 20 * 1024 * 1024) {
      alert('El archivo es muy pesado. El tamaño máximo es 20MB.');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('event-media')
        .getPublicUrl(filePath);

      setValue('background_image_url', publicUrl, { shouldDirty: true, shouldValidate: true });
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Hubo un error al subir el archivo. Intenta nuevamente.');
    } finally {
      setIsUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  useEffect(() => {
    if (isEditing && id) {
      const fetchEvent = async () => {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single();
        
        if (data && !error) {
          // Format date for datetime-local input
          const formattedDate = new Date(data.event_date).toISOString().slice(0, 16);
          reset({
            title: data.title,
            description: data.description || '',
            theme: data.theme || '',
            event_date: formattedDate,
            location: data.location || '',
            background_image_url: data.background_image_url || '',
          });
        }
      };
      fetchEvent();
    }
  }, [id, isEditing, reset]);

  const onSubmit = async (data: EventFormData) => {
    if (!user) return;
    
    // Ensure date is valid format for postgres TIMESTAMP WITH TIME ZONE
    const eventDate = new Date(data.event_date).toISOString();

    const payload = {
      user_id: user.id,
      title: data.title,
      description: data.description,
      theme: data.theme,
      event_date: eventDate,
      location: data.location,
      background_image_url: data.background_image_url,
      updated_at: new Date().toISOString(),
    };

    if (isEditing && id) {
      const { error } = await supabase
        .from('events')
        .update(payload)
        .eq('id', id);
        
      if (!error) {
        navigate('/dashboard');
      } else {
        console.error('Error updating event:', error);
      }
    } else {
      const { error } = await supabase
        .from('events')
        .insert([{ ...payload, created_at: new Date().toISOString() }]);
        
      if (!error) {
        navigate('/dashboard');
      } else {
        console.error('Error creating event:', error);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          type="button"
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver
        </button>
        <h1 className="text-2xl font-bold text-slate-800">
          {isEditing ? 'Editar Evento' : 'Crear Nuevo Evento'}
        </h1>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Título */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-slate-700">
              <Type className="w-4 h-4 mr-2 text-indigo-500" />
              Título del Evento
            </label>
            <input 
              {...register('title', { required: 'El título es requerido' })}
              className={`w-full px-4 py-3 rounded-xl border ${errors.title ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-200'} focus:ring-4 transition-all outline-none bg-slate-50`}
              placeholder="Ej. Cumpleaños de Sofía"
            />
            {errors.title && <p className="text-red-500 text-xs">{errors.title?.message}</p>}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm font-semibold text-slate-700">
                <AlignLeft className="w-4 h-4 mr-2 text-indigo-500" />
                Descripción
              </label>
              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="flex items-center text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3 mr-1.5" />
                )}
                {isGenerating ? 'Generando...' : 'Generar con IA'}
              </button>
            </div>
            <textarea 
              {...register('description')}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 transition-all outline-none bg-slate-50 resize-none"
              placeholder="Escribe los detalles de tu evento..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Temática */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-slate-700">
                <Tag className="w-4 h-4 mr-2 text-indigo-500" />
                Temática
              </label>
              <input 
                {...register('theme')}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 transition-all outline-none bg-slate-50"
                placeholder="Ej. Fiesta Neón, Boda Mágica"
              />
              <p className="text-xs text-slate-500 mt-1">
                Tip: Incluye detalles como la edad, código de vestimenta u horarios extra. La IA los usará para el texto.
              </p>
            </div>

            {/* Fecha */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-slate-700">
                <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                Fecha y Hora
              </label>
              <input 
                type="datetime-local"
                {...register('event_date', { required: 'La fecha es requerida' })}
                className={`w-full px-4 py-3 rounded-xl border ${errors.event_date ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-200'} focus:ring-4 transition-all outline-none bg-slate-50`}
              />
              {errors.event_date && <p className="text-red-500 text-xs">{errors.event_date?.message}</p>}
            </div>
          </div>

          {/* Ubicación */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-slate-700">
              <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
              Ubicación
            </label>
            <input 
              {...register('location')}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 transition-all outline-none bg-slate-50"
              placeholder="Dirección del evento o URL si es virtual"
            />
          </div>

          {/* Fondo Multimedia */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm font-semibold text-slate-700">
                <ImageIcon className="w-4 h-4 mr-2 text-indigo-500" />
                Fondo de la Invitación (Imagen o Video)
              </label>
            </div>
            
            <div className="flex flex-col gap-3">
              {/* Opcional: Pegar URL */}
              <input 
                type="url"
                {...register('background_image_url')}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 transition-all outline-none bg-slate-50 text-sm"
                placeholder="Pega la URL de una imagen/video o usa el botón de abajo para subir un archivo"
              />

              {/* Botón de subida de archivo */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <div className={`w-full flex items-center justify-center px-4 py-3 rounded-xl border-2 border-dashed transition-all ${isUploading ? 'border-indigo-300 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 bg-slate-50 hover:bg-slate-100'}`}>
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 text-indigo-500 animate-spin" />
                      <span className="text-sm font-medium text-indigo-600">Subiendo archivo...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-medium text-slate-600">Haz clic aquí para subir una imagen o video (Máx 20MB)</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Preview Area */}
            <div className="relative w-full h-48 rounded-xl border-2 border-dashed border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center">
              {backgroundImageUrl ? (
                <>
                  {isVideo(backgroundImageUrl) ? (
                    <video 
                      src={backgroundImageUrl} 
                      autoPlay 
                      loop 
                      muted 
                      playsInline 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img 
                      src={backgroundImageUrl} 
                      alt="Fondo de la invitación" 
                      className="w-full h-full object-cover"
                    />
                  )}
                  
                  {!isUploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-20">
                      <button
                        type="button"
                        onClick={() => setValue('background_image_url', '', { shouldDirty: true })}
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-lg text-sm font-medium transition-colors border border-white/30 shadow-lg"
                      >
                        Quitar Fondo
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center p-6">
                  <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">
                    Sube una imagen o video para ver la previsualización.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all focus:ring-4 focus:ring-indigo-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              {isEditing ? 'Guardar Cambios' : 'Crear Evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient.js';
import { Button } from '@/components/ui/button.jsx';
import { Loader2, Clock } from 'lucide-react';

const Step3_TimeSelection = ({ selectedDate, selectedTime, setSelectedTime, selectedType }) => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedDate && selectedType) {
      fetchAvailability();
    }
  }, [selectedDate, selectedType]);

  // 1. CONFIGURACIÓN DE DURACIONES (Ajusta los minutos según tu servicio)
  const getDurationMinutes = (tipo) => {
    if (tipo === 'Presencial') return 120; // 2 horas
    if (tipo === 'Online') return 60;      // 1 hora
    if (tipo === 'Control/Seguimiento') return 30; // 30 minutos
    return 60; // Por defecto
  };

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      // Ajuste de zona horaria para Chile
      const fechaLocal = new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000));
      const dateStr = fechaLocal.toISOString().split('T')[0];

      // Traer las reservas de ese día (que no estén rechazadas)
      const { data: reservas, error } = await supabase
        .from('reservas')
        .select('hora, tipo_consulta')
        .eq('fecha', dateStr)
        .neq('estado', 'rechazado');

      if (error) throw error;

      const durationNeeded = getDurationMinutes(selectedType);
      
      // Convertir las citas existentes a rangos de minutos ocupados
      const occupiedRanges = (reservas || []).map(res => {
        const [h, m] = res.hora.split(':').map(Number);
        const startMin = h * 60 + m;
        const resDuration = getDurationMinutes(res.tipo_consulta);
        return { start: startMin, end: startMin + resDuration };
      });

      const slots = [];
      const startHour = 9;  // Hora de apertura (09:00 AM)
      const endHour = 19;   // Hora de cierre (07:00 PM)
      
      // Variables del horario de colación
      const lunchStart = 14 * 60; // 14:00 convertido a 840 minutos
      const lunchEnd = 15 * 60;   // 15:00 convertido a 900 minutos

      // Bucle en intervalos de 30 minutos
      for (let h = startHour; h < endHour; h++) {
        for (let m = 0; m < 60; m += 30) {
          const currentStart = h * 60 + m;
          const currentEnd = currentStart + durationNeeded;

          // REGLA A: No agendar si la cita termina después de tu hora de cierre
          if (currentEnd > endHour * 60) continue;

          // REGLA B: Protección estricta del almuerzo (14:00 a 15:00)
          // La cita es inválida si EMPIEZA ANTES de las 15:00 Y TERMINA DESPUÉS de las 14:00
          const overlapsLunch = currentStart < lunchEnd && currentEnd > lunchStart;
          if (overlapsLunch) continue;

          // REGLA C: Verificar que no choque con citas ya agendadas
          const overlapsExisting = occupiedRanges.some(range => {
            return currentStart < range.end && currentEnd > range.start;
          });
          if (overlapsExisting) continue;

          // Si pasó todas las reglas, agregamos la hora a la lista
          const hourStr = h.toString().padStart(2, '0');
          const minStr = m.toString().padStart(2, '0');
          slots.push(`${hourStr}:${minStr}`);
        }
      }

      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error cargando disponibilidad:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Selecciona tu horario</h2>
        <p className="text-gray-500 mt-2">Horarios disponibles para {selectedDate?.toLocaleDateString()}</p>
      </div>

      {availableSlots.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <Clock className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No hay horarios disponibles para este día.</p>
          <p className="text-sm text-gray-500">Intenta seleccionando otra fecha en el paso anterior.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {availableSlots.map((time) => (
            <Button
              key={time}
              type="button"
              variant={selectedTime === time ? 'default' : 'outline'}
              onClick={() => setSelectedTime(time)}
              className={`py-6 rounded-xl text-lg transition-all ${
                selectedTime === time 
                  ? 'bg-primary text-white shadow-md border-primary' 
                  : 'border-gray-200 text-gray-700 hover:border-primary hover:text-primary'
              }`}
            >
              {time}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Step3_TimeSelection;
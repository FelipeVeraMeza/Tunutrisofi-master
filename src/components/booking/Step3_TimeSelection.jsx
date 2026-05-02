import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient.js';
import { Button } from '@/components/ui/button.jsx';
import { Loader2, Clock, CalendarDays } from 'lucide-react';

const Step3_TimeSelection = ({ selectedDate, selectedTime, setSelectedTime, selectedType }) => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 1. DURACIONES EXACTAS SEGÚN TU TABLA ---
  const getDuration = (tipo) => {
    const t = tipo?.toLowerCase() || '';
    if (t.includes('presencial')) return 120; // 2 horas
    if (t.includes('online')) return 60;      // 1 hora
    if (t.includes('control')) return 30;     // 30 minutos
    return 60;
  };

  // --- 2. CONFIGURACIÓN DE LA JORNADA ---
  const SETTINGS = {
    startMin: 9 * 60,     // 09:00 AM
    endLimit: 18 * 60,    // 18:00 PM (Última hora para empezar una cita)
    dayFinish: 20 * 60,   // 20:00 PM (Hora máxima para que termine la última cita)
    lunchStart: 14 * 60,  // 14:00 PM
    lunchEnd: 15 * 60     // 15:00 PM
  };

  useEffect(() => {
    if (selectedDate && selectedType) fetchAvailability();
  }, [selectedDate, selectedType]);

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const fechaLocal = new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000));
      const dateStr = fechaLocal.toISOString().split('T')[0];

      // BUSCAR RESERVAS (Asegúrate de haber ejecutado el SQL de permisos en Supabase)
      const { data: reservas, error } = await supabase
        .from('reservas')
        .select('hora, tipo_consulta')
        .eq('fecha', dateStr)
        .neq('estado', 'rechazado');

      if (error) throw error;

      // Definir bloques ya ocupados (Sin buffers, solo tiempo real)
      const busyRanges = (reservas || []).map(res => {
        const [h, m] = res.hora.split(':').map(Number);
        const start = h * 60 + m;
        const duration = getDuration(res.tipo_consulta);
        return { start, end: start + duration };
      });

      // Bloque de almuerzo (14:00 - 15:00)
      busyRanges.push({ start: SETTINGS.lunchStart, end: SETTINGS.lunchEnd });

      const slots = [];
      const durationNeeded = getDuration(selectedType);
      const now = new Date();
      const isToday = selectedDate.toDateString() === now.toDateString();
      const currentMinNow = now.getHours() * 60 + now.getMinutes();

      // GENERAR OPCIONES (Desde las 09:00 hasta las 18:00 máximo)
      for (let min = SETTINGS.startMin; min <= SETTINGS.endLimit; min += 30) {
        const slotStart = min;
        const slotEnd = min + durationNeeded;

        // Regla A: No horas pasadas (si es hoy)
        if (isToday && slotStart <= currentMinNow + 10) continue;

        // Regla B: La cita no puede terminar después de las 20:00
        if (slotEnd > SETTINGS.dayFinish) continue;

        // Regla C: Cálculo de traslape matemático (Profesional)
        // Solo mostramos la hora si el bloque COMPLETO está libre
        const isOverlap = busyRanges.some(range => {
          return slotStart < range.end && slotEnd > range.start;
        });

        if (isOverlap) continue;

        // Si el hueco es perfecto, agregamos el botón
        const hh = Math.floor(min / 60).toString().padStart(2, '0');
        const mm = (min % 60).toString().padStart(2, '0');
        slots.push(`${hh}:${mm}`);
      }

      setAvailableSlots(slots);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center p-6 bg-primary/5 rounded-3xl border border-primary/10">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
          <CalendarDays className="text-primary h-6 w-6" />
          Selecciona tu horario
        </h2>
        <p className="text-gray-500 mt-2 font-medium">
          Cupos para <span className="text-primary font-bold">{selectedType}</span> el {selectedDate?.toLocaleDateString()}
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-gray-400 font-medium">Consultando agenda...</p>
        </div>
      ) : availableSlots.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Clock className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No hay cupos disponibles hoy.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {availableSlots.map((time) => (
            <Button
              key={time}
              type="button"
              variant={selectedTime === time ? 'default' : 'outline'}
              onClick={() => setSelectedTime(time)}
              className={`py-8 rounded-2xl text-xl font-bold transition-all duration-300 ${
                selectedTime === time 
                  ? 'bg-primary text-white shadow-lg scale-105 ring-2 ring-primary ring-offset-2' 
                  : 'border-gray-200 text-gray-700 hover:border-primary hover:text-primary hover:bg-white shadow-sm'
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
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar } from '@/components/ui/calendar.jsx';
import { es } from 'date-fns/locale';

const Step2_DateSelection = ({ selectedDate, setSelectedDate }) => {
  const disabledDays = (date) => {
    // 1. Obtenemos la fecha y hora exacta de ESTE momento
    const now = new Date();
    const currentHour = now.getHours(); // Nos da la hora del 0 al 23
    
    // 2. Creamos una variable que represente el inicio del día de hoy (00:00:00)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // REGLA A: Bloquear fines de semana (0 = Domingo, 6 = Sábado)
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    // REGLA B: Bloquear días del pasado (ayer, la semana pasada, etc)
    const isPast = date < today;

    // REGLA C: Regla de las 18:00 hrs
    // Comprobamos si el cuadro del calendario que se está pintando es el día de HOY
    const isToday = date.getTime() === today.getTime();
    // Si es HOY y ya son las 18:00 (o más tarde), lo bloqueamos
    const blockToday = isToday && currentHour >= 18;

    /* NOTA: Si en Nutrisofi NO atiendes urgencias y quieres obligar a que te 
      agenden con 24 horas de aviso mínimo (ej. si son las 18:00, bloquear HOY y MAÑANA),
      solo debes descomentar las siguientes líneas:
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const isTomorrow = date.getTime() === tomorrow.getTime();
      const blockTomorrow = isTomorrow && currentHour >= 18;
      
      Y cambiar el return de abajo por: return isWeekend || isPast || blockToday || blockTomorrow;
    */

    // Finalmente, el calendario desactivará el día si cumple cualquiera de estas reglas
    return isWeekend || isPast || blockToday;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        2. Selecciona la fecha
      </h2>
      <p className="text-gray-600 mb-6 text-center">Atención de Lunes a Viernes</p>
      
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm inline-block">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          disabled={disabledDays}
          locale={es}
          className="rounded-md"
        />
      </div>
    </motion.div>
  );
};

export default Step2_DateSelection;
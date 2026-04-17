import React from 'react';
import { motion } from 'framer-motion';
import { Calendar } from '@/components/ui/calendar.jsx';
import { es } from 'date-fns/locale';

const Step2_DateSelection = ({ selectedDate, setSelectedDate }) => {
  const disabledDays = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Disable weekends (0 = Sunday, 6 = Saturday) and past dates
    return date.getDay() === 0 || date.getDay() === 6 || date < today;
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
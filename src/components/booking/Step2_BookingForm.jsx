import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar } from '@/components/ui/calendar.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Loader2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';

const Step2_BookingForm = ({ 
  selectedDate, 
  setSelectedDate, 
  selectedTime, 
  setSelectedTime, 
  formData, 
  setFormData 
}) => {
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loadingTimes, setLoadingTimes] = useState(false);

  const allTimeSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableTimes(selectedDate);
      setSelectedTime(''); // Reset time when date changes
    }
  }, [selectedDate]);

  const fetchAvailableTimes = async (date) => {
    setLoadingTimes(true);
    try {
      const dateStr = date.toISOString().split('T')[0];
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = nextDay.toISOString().split('T')[0];

      const reservations = await pb.collection('reservas').getFullList({
        filter: `fecha >= "${dateStr}" && fecha < "${nextDayStr}"`,
        $autoCancel: false
      });

      const bookedTimes = reservations.map(r => r.hora);
      
      // If today, filter out past times
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      const available = allTimeSlots.filter(time => {
        if (bookedTimes.includes(time)) return false;
        if (isToday) {
          const [hour, minute] = time.split(':').map(Number);
          if (hour < currentHour || (hour === currentHour && minute <= currentMinute)) {
            return false;
          }
        }
        return true;
      });
      
      setAvailableTimes(available);
    } catch (error) {
      console.error('Error fetching available times:', error);
    } finally {
      setLoadingTimes(false);
    }
  };

  const disabledDays = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date.getDay() === 0 || date.getDay() === 6 || date < today;
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar & Time Selection */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">1. Selecciona la fecha</h3>
            <div className="bg-white p-4 rounded-xl border shadow-sm inline-block">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={disabledDays}
                className="rounded-md"
              />
            </div>
          </div>

          {selectedDate && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">2. Selecciona la hora</h3>
              {loadingTimes ? (
                <div className="flex items-center gap-2 text-gray-500 py-4">
                  <Loader2 className="h-5 w-5 animate-spin" /> Cargando horarios...
                </div>
              ) : availableTimes.length === 0 ? (
                <p className="text-red-500 bg-red-50 p-3 rounded-lg text-sm">
                  No hay horarios disponibles para esta fecha.
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        selectedTime === time
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-gray-50 text-gray-700 hover:bg-primary/10 hover:text-primary border border-gray-200'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Details Form */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">3. Confirma tus datos</h3>
          <div className="bg-gray-50 p-6 rounded-xl space-y-4 border border-gray-100">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className="bg-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rut">RUT</Label>
              <Input
                id="rut"
                name="rut"
                value={formData.rut}
                onChange={handleInputChange}
                className="bg-white"
                disabled // Usually RUT shouldn't change for the logged in user
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="bg-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                className="bg-white"
                required
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Step2_BookingForm;
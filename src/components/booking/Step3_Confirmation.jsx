import React from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, Clock, CreditCard, Mail, Phone, CheckCircle2 } from 'lucide-react';

const Step3_Confirmation = ({ selectedType, selectedDate, selectedTime, formData }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Resumen de tu reserva</h2>
        <p className="text-gray-600 mt-2">Por favor revisa que todos los datos sean correctos antes de confirmar.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-900">Detalles de la Cita</h3>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Fecha</p>
              <p className="font-medium text-gray-900 capitalize">
                {selectedDate?.toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Hora</p>
              <p className="font-medium text-gray-900">{selectedTime} hrs</p>
            </div>
          </div>
          <div className="flex items-start gap-3 sm:col-span-2">
            <User className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Tipo de Consulta</p>
              <p className="font-medium text-gray-900">{selectedType}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-y border-gray-200">
          <h3 className="font-bold text-gray-900">Tus Datos</h3>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Nombre</p>
              <p className="font-medium text-gray-900">{formData.nombre}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">RUT</p>
              <p className="font-medium text-gray-900">{formData.rut}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{formData.email}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Teléfono</p>
              <p className="font-medium text-gray-900">{formData.telefono}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Step3_Confirmation;
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, Video } from 'lucide-react';

const Step1_ConsultationType = ({ selectedType, onSelect }) => {
  const consultationTypes = [
    {
      type: 'Presencial',
      title: 'Presencial',
      duration: '2 horas',
      price: '$35.000',
      description: 'Evaluación completa con bioimpedancia corporal para un análisis detallado de tu composición.',
      icon: Users
    },
    {
      type: 'Control/Seguimiento',
      title: 'Control/Seguimiento',
      duration: '30 minutos',
      price: '$25.000',
      description: 'Sesión de seguimiento presencial u online para monitorear tu progreso.',
      icon: Clock
    },
    {
      type: 'Online',
      title: 'Online',
      duration: '1 hora',
      price: '$20.000',
      description: 'Evaluación nutricional completa vía videollamada desde la comodidad de tu hogar.',
      icon: Video
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        1. Selecciona el tipo de consulta
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {consultationTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.title;
          
          return (
            <button
              key={type.title}
              onClick={() => onSelect(type.title)}
              className={`p-6 rounded-2xl border-2 transition-all text-left flex flex-col h-full ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-md scale-[1.02]'
                  : 'border-gray-100 hover:border-primary/30 hover:shadow-md bg-white'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-2">
                {type.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <Clock className="h-4 w-4" />
                <span>{type.duration}</span>
              </div>
              <p className="text-2xl font-bold text-primary mb-3">{type.price}</p>
              <p className="text-sm text-gray-600 flex-grow">{type.description}</p>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Step1_ConsultationType;
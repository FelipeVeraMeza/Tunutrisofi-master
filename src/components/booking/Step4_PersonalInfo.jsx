import React from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { User, Mail, Phone } from 'lucide-react';

const Step4_PersonalInfo = ({ formData, setFormData }) => {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-xl mx-auto"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        4. Tus Datos Personales
      </h2>
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre completo</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="pl-10 text-gray-900"
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="pl-10 text-gray-900"
              placeholder="tu@email.com"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefono">Teléfono</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="pl-10 text-gray-900"
              placeholder="+56 9 1234 5678"
              required
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Step4_PersonalInfo;
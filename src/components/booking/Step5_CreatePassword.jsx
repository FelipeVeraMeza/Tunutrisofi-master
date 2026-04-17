import React from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Lock } from 'lucide-react';

const Step5_CreatePassword = ({ formData, setFormData }) => {
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
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
        5. Crea tu cuenta
      </h2>
      <p className="text-gray-600 text-center mb-8">
        Para gestionar tus reservas y ver tus documentos, necesitamos que crees una contraseña.
      </p>
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="pl-10 text-gray-900"
              placeholder="Mínimo 8 caracteres"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="passwordConfirm">Confirmar Contraseña</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              value={formData.passwordConfirm}
              onChange={handleChange}
              className="pl-10 text-gray-900"
              placeholder="Repite tu contraseña"
              required
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Step5_CreatePassword;
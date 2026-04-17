import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { useToast } from '@/hooks/use-toast.js';
import { Loader2, Mail, Lock, User, Phone, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    rut: '',
    email: '',
    telefono: '',
    password: '',
    passwordConfirm: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.passwordConfirm) {
      toast({ title: 'Error', description: 'Las contraseñas no coinciden', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      await signup({
        email: formData.email,
        password: formData.password,
        nombre: formData.nombre,
        rut: formData.rut,
        telefono: formData.telefono
      });

      toast({ title: '¡Bienvenido/a!', description: 'Cuenta creada con éxito.' });
      
      // Redirige directamente a la página principal
      navigate('/');
      
    } catch (error) {
      toast({ 
        title: 'Error al registrarse', 
        description: error.message || 'Verifica los datos e intenta nuevamente.', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-gray-50">
      <Helmet><title>Registro - Tu Nutri Sofi</title></Helmet>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-rose-100">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Crea tu cuenta</h2>
          <p className="mt-2 text-sm text-gray-600">O <Link to="/login" className="text-primary hover:underline">inicia sesión</Link></p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label>Nombre completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400"/>
                <Input name="nombre" required value={formData.nombre} onChange={handleChange} className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>RUT</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400"/>
                <Input name="rut" required value={formData.rut} onChange={handleChange} className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400"/>
                <Input name="telefono" type="tel" required value={formData.telefono} onChange={handleChange} className="pl-10" />
              </div>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400"/>
                <Input name="email" type="email" required value={formData.email} onChange={handleChange} className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400"/>
                <Input name="password" type="password" required value={formData.password} onChange={handleChange} className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Confirmar</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400"/>
                <Input name="passwordConfirm" type="password" required value={formData.passwordConfirm} onChange={handleChange} className="pl-10" />
              </div>
            </div>
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white py-6 rounded-xl" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin mr-2" /> : 'Registrarse'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default SignupPage;
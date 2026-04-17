import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button.jsx';
import { useToast } from '@/hooks/use-toast.js';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient.js'; // Conexión a Supabase
import { AnimatePresence } from 'framer-motion';

import Step1_ConsultationType from '@/components/booking/Step1_ConsultationType.jsx';
import Step2_DateSelection from '@/components/booking/Step2_DateSelection.jsx';
import Step3_TimeSelection from '@/components/booking/Step3_TimeSelection.jsx';
import Step4_PersonalInfo from '@/components/booking/Step4_PersonalInfo.jsx';
import Step5_CreatePassword from '@/components/booking/Step5_CreatePassword.jsx';
import Step6_Confirmation from '@/components/booking/Step6_Confirmation.jsx';

const BookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, signup } = useAuth();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState(location.state?.selectedType || '');
  const [selectedDate, setSelectedDate] = useState();
  const [selectedTime, setSelectedTime] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    rut: '',
    email: '',
    telefono: '',
    password: '',
    passwordConfirm: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        nombre: currentUser.nombre || '',
        rut: currentUser.rut || '',
        email: currentUser.email || '',
        telefono: currentUser.telefono || ''
      }));
    }
  }, [currentUser]);

  const handleNext = () => {
    if (currentStep === 1 && !selectedType) {
      toast({ title: 'Atención', description: 'Selecciona un tipo de consulta', variant: 'destructive' });
      return;
    }
    if (currentStep === 2 && !selectedDate) {
      toast({ title: 'Atención', description: 'Selecciona una fecha', variant: 'destructive' });
      return;
    }
    if (currentStep === 3 && !selectedTime) {
      toast({ title: 'Atención', description: 'Selecciona un horario', variant: 'destructive' });
      return;
    }
    if (currentStep === 4) {
      if (!formData.nombre || !formData.email || !formData.telefono || !formData.rut) {
        toast({ title: 'Atención', description: 'Completa tus datos de contacto y RUT', variant: 'destructive' });
        return;
      }
      if (currentUser) {
        setCurrentStep(6);
        return;
      }
    }
    if (currentStep === 5 && !currentUser) {
      if (formData.password.length < 6) {
        toast({ title: 'Atención', description: 'La contraseña debe tener al menos 6 caracteres', variant: 'destructive' });
        return;
      }
      if (formData.password !== formData.passwordConfirm) {
        toast({ title: 'Atención', description: 'Las contraseñas no coinciden', variant: 'destructive' });
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep === 6 && currentUser) {
      setCurrentStep(4);
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let userId = currentUser?.id;

      // 1. Registro de usuario si no está logueado
      if (!currentUser) {
        try {
          const newUser = await signup({
            nombre: formData.nombre,
            email: formData.email,
            telefono: formData.telefono,
            rut: formData.rut,
            password: formData.password
          });
          userId = newUser.user.id;
        } catch (err) {
          toast({ title: 'Error al crear cuenta', description: err.message || 'El correo o RUT ya podrían estar registrados.', variant: 'destructive' });
          setLoading(false);
          return;
        }
      }

      // 2. Preparar fecha para Supabase (YYYY-MM-DD)
      const fechaLocal = new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000));
      const dateStr = fechaLocal.toISOString().split('T')[0];
      
      // 3. Verificar disponibilidad en tiempo real
      const { data: existing, error: checkError } = await supabase
        .from('reservas')
        .select('id')
        .eq('fecha', dateStr)
        .eq('hora', selectedTime)
        .neq('estado', 'rechazado');

      if (checkError) throw checkError;

      if (existing && existing.length > 0) {
        toast({ title: 'Horario no disponible', description: 'Este horario acaba de ser reservado.', variant: 'destructive' });
        setCurrentStep(3);
        setLoading(false);
        return;
      }

      // 4. Crear la reserva según el esquema de tu base de datos
      const { data: record, error: createError } = await supabase
        .from('reservas')
        .insert([{
          usuario_id: userId,
          tipo_consulta: selectedType,
          fecha: dateStr,
          hora: selectedTime,
          estado: 'pendiente' // Coincide con el CHECK constraint de tu SQL
        }])
        .select()
        .single();

      if (createError) throw createError;
      
      toast({ title: '¡Reserva agendada!', description: 'Por favor sube tu comprobante para confirmar.' });
      navigate(`/payment-upload/${record.id}`);
      
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast({ title: 'Error', description: 'No se pudo procesar la reserva.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Agendar Cita - Tu Nutri Sofi</title>
      </Helmet>

      <div className="min-h-screen bg-pink-50/30 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Agenda tu Consulta
            </h1>
            <p className="text-gray-600">Sigue los pasos para reservar tu cita</p>
          </div>

          <div className="mb-8 bg-gray-200 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-500 ease-in-out"
              style={{ width: `${(currentStep / 6) * 100}%` }}
            ></div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 border border-pink-100">
            <AnimatePresence mode="wait">
              {currentStep === 1 && <Step1_ConsultationType key="step1" selectedType={selectedType} onSelect={setSelectedType} />}
              {currentStep === 2 && <Step2_DateSelection key="step2" selectedDate={selectedDate} setSelectedDate={setSelectedDate} />}
              {currentStep === 3 && <Step3_TimeSelection key="step3" selectedDate={selectedDate} selectedTime={selectedTime} setSelectedTime={setSelectedTime} selectedType={selectedType} />}
              {currentStep === 4 && <Step4_PersonalInfo key="step4" formData={formData} setFormData={setFormData} />}
              {currentStep === 5 && !currentUser && <Step5_CreatePassword key="step5" formData={formData} setFormData={setFormData} />}
              {currentStep === 6 && <Step6_Confirmation key="step6" selectedType={selectedType} selectedDate={selectedDate} selectedTime={selectedTime} formData={formData} />}
            </AnimatePresence>

            <div className="flex justify-between mt-10 pt-6 border-t border-gray-100">
              <Button
                onClick={handleBack}
                disabled={currentStep === 1 || loading}
                variant="outline"
                className="px-6 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Atrás
              </Button>

              {currentStep < 6 ? (
                <Button onClick={handleNext} className="px-8 bg-primary hover:bg-primary/90 text-white rounded-xl">
                  Siguiente <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading} className="px-8 bg-primary hover:bg-primary/90 text-white rounded-xl text-lg shadow-md">
                  {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Procesando...</> : <><CheckCircle2 className="mr-2 h-5 w-5" /> Confirmar y Agendar</>}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingPage;
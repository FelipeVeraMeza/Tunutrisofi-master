import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { useToast } from '@/hooks/use-toast.js';
import { Loader2, Send, MapPin, Phone, Mail, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import pb from '@/lib/pocketbaseClient.js';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion.jsx";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    mensaje: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.email || !formData.mensaje) {
      toast({
        title: 'Campos incompletos',
        description: 'Por favor completa todos los campos del formulario.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      await pb.collection('contactos').create(formData, { $autoCancel: false });
      toast({
        title: '¡Mensaje enviado!',
        description: 'Nos pondremos en contacto contigo a la brevedad.',
      });
      setFormData({ nombre: '', email: '', mensaje: '' });
    } catch (error) {
      console.error('Error sending contact form:', error);
      toast({
        title: 'Error al enviar',
        description: 'Hubo un problema al enviar tu mensaje. Intenta nuevamente.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const faqs = [
    {
      q: '¿Dónde está ubicada la consulta presencial?',
      a: 'La consulta presencial se encuentra en Providencia, a pasos del metro. La dirección exacta se envía al confirmar la reserva.'
    },
    {
      q: '¿Cuáles son los medios de pago?',
      a: 'Aceptamos transferencia bancaria. Al agendar tu cita, recibirás los datos para realizar el pago.'
    },
    {
      q: '¿Puedo reagendar mi cita?',
      a: 'Sí, puedes reagendar con al menos 24 horas de anticipación contactándome por WhatsApp o correo.'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Contacto - Tu Nutri Sofi</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 py-16 md:py-24 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Contáctame</h1>
              <p className="text-lg text-gray-600">¿Tienes dudas? Escríbeme y te responderé lo antes posible.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
              {/* Contact Info */}
              <div className="bg-primary p-10 text-white rounded-3xl shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-6">Información de Contacto</h3>
                  <p className="text-primary-foreground/90 mb-10">
                    Llena el formulario o contáctame directamente por estos medios.
                  </p>
                  
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Phone className="h-6 w-6 text-white/90" />
                      <span className="text-lg">+56 9 1234 5678</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Mail className="h-6 w-6 text-white/90" />
                      <span className="text-lg">contacto@tunutrisofi.cl</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <MapPin className="h-6 w-6 text-white/90" />
                      <span className="text-lg">Providencia, Santiago</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2 bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="nombre" className="text-gray-700">Nombre completo</Label>
                      <Input
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Tu nombre"
                        className="bg-gray-50 border-gray-200 focus:bg-white text-gray-900 rounded-xl"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700">Correo electrónico</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="tu@email.com"
                        className="bg-gray-50 border-gray-200 focus:bg-white text-gray-900 rounded-xl"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mensaje" className="text-gray-700">Mensaje</Label>
                    <Textarea
                      id="mensaje"
                      name="mensaje"
                      value={formData.mensaje}
                      onChange={handleChange}
                      placeholder="¿En qué te puedo ayudar?"
                      rows={6}
                      className="bg-gray-50 border-gray-200 focus:bg-white resize-none text-gray-900 rounded-xl"
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full md:w-auto px-8 py-6 bg-primary hover:bg-primary/90 text-white rounded-xl text-lg shadow-md"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        Enviar Mensaje
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="max-w-3xl mx-auto bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Preguntas Frecuentes</h2>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left text-lg font-medium text-gray-900 hover:text-primary">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 text-base leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>

        {/* Floating WhatsApp Button */}
        <a
          href="https://wa.me/56912345678?text=Hola,%20me%20gustaría%20agendar%20una%20consulta"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-8 right-8 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-50 flex items-center justify-center"
          aria-label="Contactar por WhatsApp"
        >
          <MessageCircle className="h-8 w-8" />
        </a>
      </div>
    </>
  );
};

export default ContactPage;
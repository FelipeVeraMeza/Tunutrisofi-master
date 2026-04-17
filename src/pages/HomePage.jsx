import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock, Video, Users, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button.jsx';
import ServicesSection from '@/components/ServicesSection.jsx';

const HomePage = () => {
  const pricing = [
    {
      title: 'Presencial',
      duration: '2 horas',
      price: '$35.000',
      description: 'Evaluación completa con bioimpedancia corporal para un análisis detallado de tu composición.',
      icon: Users,
    },
    {
      title: 'Control/Seguimiento',
      duration: '30 minutos',
      price: '$25.000',
      description: 'Sesión de seguimiento presencial u online para monitorear tu progreso y ajustar el plan.',
      icon: Clock,
    },
    {
      title: 'Online',
      duration: '1 hora',
      price: '$20.000',
      description: 'Evaluación nutricional completa vía videollamada desde la comodidad de tu hogar.',
      icon: Video,
    }
  ];

  const testimonials = [
    {
      name: 'María José',
      text: 'Sofi me enseñó a comer sin culpa. Logré mis objetivos sin dietas restrictivas y ahora disfruto de la comida.',
      rating: 5
    },
    {
      name: 'Carlos R.',
      text: 'Excelente profesional. La evaluación con bioimpedancia fue clave para entender mi cuerpo y mejorar mi rendimiento deportivo.',
      rating: 5
    },
    {
      name: 'Valentina S.',
      text: 'El acompañamiento es increíble. Siempre está disponible para resolver dudas y motivarte en el proceso.',
      rating: 5
    }
  ];

  return (
    <>
      <Helmet>
        <title>Tu Nutri Sofi - Nutrición Personalizada</title>
        <meta name="description" content="Tu bienestar comienza cuando haces de la comida tu aliada. Consultas nutricionales presenciales y online." />
      </Helmet>

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-24 md:py-32 overflow-hidden bg-pink-50/50">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1675270714610-11a5cadcc7b3" 
              alt="Healthy food background" 
              className="w-full h-full object-cover opacity-10"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6">
                  Nutrición Clínica y Deportiva
                </span>
                <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight">
                  Tu Nutri <span className="text-primary">Sofi</span>
                </h1>
                <p className="text-2xl md:text-3xl text-gray-700 mb-10 font-light leading-relaxed">
                  Tu bienestar comienza cuando haces de la comida tu aliada 🍎
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                    <Link to="/booking">
                      Agendar Consulta <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="rounded-xl px-8 py-6 text-lg border-2 border-primary text-primary hover:bg-primary/5">
                    <a href="#servicios">Ver Servicios</a>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <ServicesSection />

        {/* About Section */}
        <section id="sobre-mi" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-12 max-w-6xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex-1"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-3xl transform translate-x-4 translate-y-4"></div>
                  <img 
                    src="https://images.unsplash.com/photo-1675270714610-11a5cadcc7b3" 
                    alt="Sofía Cordero - Nutricionista" 
                    className="relative z-10 rounded-3xl shadow-xl w-full object-cover aspect-[4/5]"
                  />
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex-1"
              >
                <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Sobre Mí</h2>
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Sofía Cordero</h3>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Soy Nutricionista Dietista apasionada por enseñar a las personas a relacionarse mejor con la comida. Mi enfoque no se basa en prohibir alimentos, sino en educar y entregar las herramientas necesarias para que logres tus objetivos de forma sostenible en el tiempo.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                    <span className="text-gray-700 font-medium">Diplomado en Nutrición Deportiva</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                    <span className="text-gray-700 font-medium">Especialización en Diabetes</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                    <span className="text-gray-700 font-medium">Formación en Conducta Alimentaria</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="precios" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Planes y Precios</h2>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900">Elige tu modalidad</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {pricing.map((plan, index) => {
                const Icon = plan.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 flex flex-col"
                  >
                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">{plan.title}</h4>
                    <div className="flex items-center gap-2 text-gray-500 mb-4">
                      <Clock className="h-4 w-4" />
                      <span>{plan.duration}</span>
                    </div>
                    <p className="text-3xl font-bold text-primary mb-6">{plan.price}</p>
                    <p className="text-gray-600 mb-8 flex-grow">{plan.description}</p>
                    <Button asChild className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-6 text-lg">
                      <Link to="/booking" state={{ selectedType: plan.title }}>
                        Agendar
                      </Link>
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Lo que dicen mis pacientes</h2>
              <p className="text-gray-600">Historias reales de transformación y bienestar</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-pink-50/50 p-8 rounded-2xl border border-pink-100"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-gray-700 italic mb-6">"{testimonial.text}"</p>
                  <p className="font-bold text-gray-900">{testimonial.name}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-20 bg-primary text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1675270714610-11a5cadcc7b3')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
          <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">¿Lista para comenzar tu transformación?</h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Da el primer paso hacia tus objetivos de salud. Agenda tu consulta hoy mismo o escríbeme si tienes dudas.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100 rounded-xl px-10 py-6 text-lg shadow-xl hover:scale-105 transition-all">
                <Link to="/booking">Reservar Ahora</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10 rounded-xl px-10 py-6 text-lg">
                <Link to="/contact">Contáctame</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;
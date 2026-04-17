import React from 'react';
import { motion } from 'framer-motion';
import { Scale, Utensils, Heart, BookOpen, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';

const ServicesSection = () => {
  const { isAuthenticated } = useAuth();

  const services = [
    {
      title: 'Evaluación nutricional',
      description: 'Con bioimpedancia para conocer tu composición corporal y tu estado nutricional actual.',
      icon: Scale,
    },
    {
      title: 'Plan nutricional personalizado',
      description: 'Adaptado a tus objetivos, patologías o necesidades específicas de salud y bienestar.',
      icon: Utensils,
    },
    {
      title: 'Apoyo y seguimiento',
      description: 'Control periódico para evaluar tus avances y mantener la motivación durante el proceso.',
      icon: Heart,
    },
    {
      title: 'Educación nutricional',
      description: 'Aprende hábitos saludables y sostenibles con acompañamiento y educación alimentaria.',
      icon: BookOpen,
    }
  ];

  return (
    <section id="servicios" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-primary mb-4">
            Mis Servicios
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Conoce los servicios diseñados para acompañarte en tu camino hacia una vida más saludable 💕
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 p-8 border border-gray-100 flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <Icon className="h-8 w-8 text-primary group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-xl px-10 py-6 text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105">
            <Link to={isAuthenticated ? "/booking" : "/login"}>
              Agendar tu cita <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
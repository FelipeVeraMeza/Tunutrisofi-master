import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Facebook, MessageCircle } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <img
                src="https://horizons-cdn.hostinger.com/bbea93ca-5857-44cc-b442-c78491fc8a6f/4a4d80a2439fdbe609e0be3e73e0a3ce.png"
                alt="Tu Nutri Sofi logo"
                className="h-12 w-auto"
              />
              <span className="text-xl font-bold text-gray-900">
                Tu Nutri <span className="text-primary">Sofi</span>
              </span>
            </Link>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Acompañándote en tu camino hacia una vida más saludable con planes nutricionales personalizados y basados en ciencia.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://wa.me/56912345678" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6">Enlaces Rápidos</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-600 hover:text-primary transition-colors">Inicio</Link></li>
              <li><a href="/#servicios" className="text-gray-600 hover:text-primary transition-colors">Servicios</a></li>
              <li><Link to="/contact" className="text-gray-600 hover:text-primary transition-colors">Contacto</Link></li>
              <li><Link to="/booking" className="text-gray-600 hover:text-primary transition-colors">Agendar Cita</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6">Contacto</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-600">
                <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>+56 9 1234 5678</span>
              </li>
              <li className="flex items-start gap-3 text-gray-600">
                <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>contacto@tunutrisofi.cl</span>
              </li>
              <li className="flex items-start gap-3 text-gray-600">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>Providencia, Santiago<br/>Chile</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6">Horario</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex justify-between">
                <span>Lunes - Viernes:</span>
                <span className="font-medium text-gray-900">09:00 - 18:00</span>
              </li>
              <li className="flex justify-between">
                <span>Sábado:</span>
                <span className="font-medium text-gray-900">Cerrado</span>
              </li>
              <li className="flex justify-between">
                <span>Domingo:</span>
                <span className="font-medium text-gray-900">Cerrado</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm text-center md:text-left">
            &copy; {currentYear} Tu Nutri Sofi. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-primary transition-colors">Términos y Condiciones</a>
            <a href="#" className="hover:text-primary transition-colors">Política de Privacidad</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
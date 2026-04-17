import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext.jsx';

// Importa tus componentes fijos
import Header from '@/components/Header.jsx';
import { Toaster } from '@/components/ui/toaster.jsx';

// Importa tus páginas
import HomePage from '@/pages/HomePage.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import SignupPage from '@/pages/SignupPage.jsx';
import ProfilePage from '@/pages/ProfilePage.jsx';
import BookingPage from '@/pages/BookingPage.jsx';
import PaymentUploadPage from '@/pages/PaymentUploadPage.jsx';
import AdminPage from '@/pages/AdminPage.jsx'; // <--- Tu nueva página Admin

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          
          {/* El Header FUERA de las rutas para que NUNCA desaparezca */}
          <Header /> 

          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/payment-upload/:reservaId" element={<PaymentUploadPage />} />
              
              {/* Ruta del Panel de Administración */}
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </main>
          
        </div>
        <Toaster />
      </AuthProvider>
    </Router>
  );
};

export default App;
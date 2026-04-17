import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { supabase } from '@/lib/supabaseClient.js';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { useToast } from '@/hooks/use-toast.js';
import { Loader2, Mail, Lock, ArrowRight, KeyRound, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LoginPage = () => {
  const [view, setView] = useState('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast({ title: 'Error', description: 'Completa los campos', variant: 'destructive' });

    setIsLoading(true);
    try {
      await login(email, password);
      toast({ title: '¡Bienvenido/a!', description: 'Has iniciado sesión correctamente.' });
      navigate(from, { replace: true });
    } catch (error) {
      toast({ title: 'Error', description: 'Correo o contraseña incorrectos.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestPasswordReset = async (e) => {
    e.preventDefault();
    if (!email) return toast({ title: 'Error', description: 'Ingresa tu correo primero.', variant: 'destructive' });

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      
      toast({ title: 'Código enviado', description: 'Revisa tu correo (y la carpeta de SPAM).' });
      setView('verify');
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    // CAMBIO: Ahora valida que al menos tenga 6, pero permite 8
    if (!otpCode || otpCode.length < 6) return toast({ title: 'Error', description: 'Ingresa el código completo.', variant: 'destructive' });

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: otpCode, type: 'recovery' });
      if (error) throw error;
      
      toast({ title: '¡Código correcto!', description: 'Ahora puedes crear tu nueva contraseña.' });
      setView('reset');
    } catch (error) {
      toast({ title: 'Código inválido', description: 'El código es incorrecto o ya expiró.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNewPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast({ title: 'Error', description: 'Mínimo 6 caracteres.', variant: 'destructive' });
    if (newPassword !== newPasswordConfirm) return toast({ title: 'Error', description: 'Las contraseñas no coinciden.', variant: 'destructive' });

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      toast({ title: '¡Éxito!', description: 'Contraseña actualizada. Ya puedes iniciar sesión.' });
      setView('login');
      setPassword(''); 
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo cambiar la contraseña.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Acceso | Tu Nutri Sofi</title></Helmet>
      <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 bg-gradient-to-br from-rose-50 to-white">
        <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-rose-100 overflow-hidden relative">
          
          <AnimatePresence mode="wait">
            
            {view === 'login' && (
              <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-extrabold text-gray-900">Bienvenido/a</h2>
                  <p className="mt-2 text-sm text-gray-600">Ingresa para gestionar tus citas</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Correo electrónico</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 bg-gray-50 focus:bg-white rounded-xl" placeholder="tu@email.com" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Contraseña</Label>
                        <button type="button" onClick={() => setView('forgot')} className="text-xs font-bold text-primary hover:underline">
                          ¿Olvidaste tu contraseña?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 bg-gray-50 focus:bg-white rounded-xl" placeholder="••••••••" />
                      </div>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white py-6 rounded-xl shadow-md" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <span className="flex items-center gap-2">Entrar <ArrowRight className="h-5 w-5" /></span>}
                  </Button>
                </form>
                <div className="text-center pt-6 text-sm text-gray-600">
                  ¿No tienes cuenta? <Link to="/signup" className="font-bold text-primary hover:underline">Regístrate aquí</Link>
                </div>
              </motion.div>
            )}

            {view === 'forgot' && (
              <motion.div key="forgot" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-extrabold text-gray-900">Recuperar Acceso</h2>
                  <p className="mt-2 text-sm text-gray-600">Te enviaremos un código de seguridad a tu correo.</p>
                </div>
                <form onSubmit={handleRequestPasswordReset} className="space-y-6">
                  <div className="space-y-2">
                    <Label>Correo registrado</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 bg-gray-50 focus:bg-white rounded-xl" placeholder="tu@email.com" />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white py-6 rounded-xl shadow-md" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Enviar Código'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setView('login')} className="w-full text-gray-500">Volver al Login</Button>
                </form>
              </motion.div>
            )}

            {view === 'verify' && (
              <motion.div key="verify" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-extrabold text-gray-900">Revisa tu correo</h2>
                  <p className="mt-2 text-sm text-gray-600">Ingresa el código de seguridad que enviamos a <b>{email}</b></p>
                </div>
                <form onSubmit={handleVerifyCode} className="space-y-6">
                  <div className="space-y-2">
                    <Label>Código de Seguridad</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      {/* CAMBIO IMPORTANTES: maxLength={8} y tracking-[0.2em] para que entren bien los números */}
                      <Input 
                        type="text" 
                        required 
                        maxLength={8} 
                        value={otpCode} 
                        onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))} 
                        className="pl-10 text-center tracking-[0.2em] text-lg font-bold bg-gray-50 focus:bg-white rounded-xl" 
                        placeholder="12345678" 
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white py-6 rounded-xl shadow-md" disabled={isLoading || otpCode.length < 6}>
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verificar Código'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setView('forgot')} className="w-full text-gray-500">Volver atrás</Button>
                </form>
              </motion.div>
            )}

            {view === 'reset' && (
              <motion.div key="reset" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-extrabold text-gray-900">Crea tu nueva clave</h2>
                  <p className="mt-2 text-sm text-gray-600">Asegúrate de no olvidarla esta vez 😉</p>
                </div>
                <form onSubmit={handleSaveNewPassword} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nueva Contraseña</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input type="password" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="pl-10 bg-gray-50 focus:bg-white rounded-xl" placeholder="••••••••" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Confirmar Contraseña</Label>
                      <div className="relative">
                        <CheckCircle2 className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input type="password" required minLength={6} value={newPasswordConfirm} onChange={(e) => setNewPasswordConfirm(e.target.value)} className="pl-10 bg-gray-50 focus:bg-white rounded-xl" placeholder="••••••••" />
                      </div>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white py-6 rounded-xl shadow-md" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Guardar y Entrar'}
                  </Button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
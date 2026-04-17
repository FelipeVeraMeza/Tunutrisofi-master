import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) fetchProfile(session.user.id);
      else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (data) setCurrentUser(data);
    setLoading(false);
  };

  const signup = async (userData) => {
    // 1. Crear usuario en Auth (Bóveda de seguridad)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (authError) throw authError;

    // 2. Insertar en tu tabla 'usuarios' (Perfil público)
    if (authData.user) {
      const { error: dbError } = await supabase.from('usuarios').insert([{
        id: authData.user.id,
        email: userData.email,
        nombre: userData.nombre,
        rut: userData.rut,
        telefono: userData.telefono,
        rol: 'user'
      }]);
      
      if (dbError) {
        // Si falla la tabla, borramos el auth para evitar "usuarios fantasma"
        await supabase.auth.signOut(); 
        throw new Error("El RUT o correo ya está en uso en el directorio de clientes.");
      }
    }
    return authData;
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const logout = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider value={{ currentUser, signup, login, logout, isAuthenticated: !!currentUser, isAdmin: currentUser?.rol === 'admin', loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
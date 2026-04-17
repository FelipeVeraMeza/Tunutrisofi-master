import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { supabase } from '@/lib/supabaseClient.js';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { useToast } from '@/hooks/use-toast.js';
import { User, Mail, Phone, Calendar, Clock, Loader2, Download, CreditCard, Save, X, Edit2, FileText } from 'lucide-react';

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    nombre: currentUser?.nombre || '',
    telefono: currentUser?.telefono || '',
    rut: currentUser?.rut || '',
    email: currentUser?.email || '',
    password: '',
    passwordConfirm: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (currentUser?.id) {
      fetchUserData();
      setEditData({
        nombre: currentUser.nombre || '',
        telefono: currentUser.telefono || '',
        rut: currentUser.rut || '',
        email: currentUser.email || '',
        password: '',
        passwordConfirm: ''
      });
    }
  }, [currentUser]);

  const fetchUserData = async () => {
    try {
      const { data: resData, error: resError } = await supabase
        .from('reservas')
        .select('*')
        .eq('usuario_id', currentUser.id)
        .order('fecha', { ascending: false });

      if (resError) throw resError;
      setReservations(resData || []);

      const { data: docsData, error: docsError } = await supabase
        .from('documentos_pacientes')
        .select('*')
        .eq('usuario_id', currentUser.id)
        .order('created_at', { ascending: false });
        
      if (docsError) throw docsError;
      setDocumentos(docsData || []);

    } catch (error) {
      console.error('Error cargando datos:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (editData.password && editData.password !== editData.passwordConfirm) {
      toast({ title: 'Error', description: 'Las contraseñas no coinciden', variant: 'destructive' });
      return;
    }
    if (editData.password && editData.password.length < 6) {
      toast({ title: 'Error', description: 'La contraseña debe tener al menos 6 caracteres', variant: 'destructive' });
      return;
    }

    setSavingProfile(true);
    try {
      let authUpdates = {};
      if (editData.email !== currentUser.email) authUpdates.email = editData.email;
      if (editData.password) authUpdates.password = editData.password;

      if (Object.keys(authUpdates).length > 0) {
        const { error: authError } = await supabase.auth.updateUser(authUpdates);
        if (authError) throw authError;
      }

      const { error: dbError } = await supabase
        .from('usuarios')
        .update({
          nombre: editData.nombre,
          telefono: editData.telefono,
          rut: editData.rut,
          email: editData.email
        })
        .eq('id', currentUser.id);

      if (dbError) throw dbError;

      toast({ title: '¡Perfil actualizado!', description: 'Tus datos se guardaron correctamente.' });
      setIsEditing(false);
      setEditData(prev => ({ ...prev, password: '', passwordConfirm: '' }));
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo actualizar el perfil.', variant: 'destructive' });
    } finally {
      setSavingProfile(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pagado': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completado': return 'bg-green-100 text-green-800 border-green-200';
      case 'rechazado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

const formatStatus = (status) => {
    if (status === 'pagado') return 'EN REVISIÓN DE PAGO';
    return status?.replace('_', ' ').toUpperCase() || 'DESCONOCIDO';
  };
  
  return (
    <>
      <Helmet><title>Mi Perfil - Tu Nutri Sofi</title></Helmet>
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi Perfil</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* COLUMNA IZQUIERDA: Solo Datos Personales */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sticky top-24">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Mis Datos</h2>
                  {!isEditing ? (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="text-primary hover:text-primary/80 hover:bg-primary/10">
                      <Edit2 className="h-4 w-4 mr-2" /> Editar
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                      <X className="h-4 w-4" /> Cancelar
                    </Button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nombre Completo</Label>
                      <Input value={editData.nombre} onChange={(e) => setEditData({...editData, nombre: e.target.value})} className="bg-gray-50" />
                    </div>
                    <div className="space-y-2">
                      <Label>RUT</Label>
                      <Input value={editData.rut} onChange={(e) => setEditData({...editData, rut: e.target.value})} className="bg-gray-50" />
                    </div>
                    <div className="space-y-2">
                      <Label>Teléfono</Label>
                      <Input value={editData.telefono} onChange={(e) => setEditData({...editData, telefono: e.target.value})} className="bg-gray-50" />
                    </div>
                    
                    <div className="border-t border-gray-100 pt-4 mt-4">
                      <p className="text-xs text-gray-500 mb-4">Datos de acceso. Déjalo en blanco si no cambias clave.</p>
                      <div className="space-y-2 mb-4">
                        <Label>Correo Electrónico</Label>
                        <Input type="email" value={editData.email} onChange={(e) => setEditData({...editData, email: e.target.value})} className="bg-gray-50" />
                      </div>
                      <div className="space-y-2 mb-2">
                        <Label>Nueva Contraseña</Label>
                        <Input type="password" placeholder="••••••••" value={editData.password} onChange={(e) => setEditData({...editData, password: e.target.value})} className="bg-gray-50" />
                      </div>
                      <div className="space-y-2">
                        <Label>Confirmar Contraseña</Label>
                        <Input type="password" placeholder="••••••••" value={editData.passwordConfirm} onChange={(e) => setEditData({...editData, passwordConfirm: e.target.value})} className="bg-gray-50" />
                      </div>
                    </div>
                    <Button className="w-full mt-6 bg-primary hover:bg-primary/90 text-white rounded-xl py-6" onClick={handleSaveProfile} disabled={savingProfile}>
                      {savingProfile ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                      Guardar Cambios
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <User className="h-12 w-12 text-primary" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-bold text-xl text-gray-900">{currentUser?.nombre}</h3>
                      <p className="text-sm text-gray-500">{currentUser?.rol === 'admin' ? 'Administrador' : 'Paciente'}</p>
                    </div>
                    <div className="space-y-4 pt-6 border-t border-gray-100">
                      <div className="flex items-center gap-3 text-gray-600">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">{currentUser?.rut || 'Sin RUT'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600">
                        <Mail className="h-5 w-5 text-primary" />
                        <span className="text-sm break-all">{currentUser?.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600">
                        <Phone className="h-5 w-5 text-primary" />
                        <span className="text-sm">{currentUser?.telefono || 'No registrado'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* COLUMNA DERECHA: Reservas y Minutas */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* BLOQUE 1: MIS RESERVAS */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-primary" />
                  Mis Reservas
                </h2>

                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : reservations.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <Calendar className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">¡Hola, {currentUser?.nombre?.split(' ')[0]}!</h3>
                    <p className="text-gray-500 mb-6 max-w-xs mx-auto text-sm">
                      Aún no tienes citas agendadas. ¿Comenzamos con tu plan nutricional hoy?
                    </p>
                    <Button asChild className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md">
                      <Link to="/booking">Agendar mi primera cita</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 text-sm text-gray-500">
                          <th className="pb-4 font-medium">Servicio</th>
                          <th className="pb-4 font-medium">Fecha y Hora</th>
                          <th className="pb-4 font-medium">Estado</th>
                          <th className="pb-4 font-medium">Comprobante</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {reservations.map((res) => (
                          <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-5">
                              <p className="font-medium text-gray-900">{res.tipo_consulta}</p>
                            </td>
                            <td className="py-5">
                              <div className="flex flex-col text-sm text-gray-600 gap-1">
                                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-primary"/> {res.fecha}</span>
                                <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary"/> {res.hora} hrs</span>
                              </div>
                            </td>
                            <td className="py-5">
                              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(res.estado)}`}>
                                {formatStatus(res.estado)}
                              </span>
                              {res.estado === 'pendiente' && (
                                <Button asChild variant="link" size="sm" className="text-primary p-0 h-auto mt-2 block text-xs hover:text-primary/80">
                                  <Link to={`/payment-upload/${res.id}`}>Subir comprobante</Link>
                                </Button>
                              )}
                            </td>
                            <td className="py-5">
                              <div className="flex flex-col gap-2">
                                {res.comprobante_pago ? (
                                  <a href={res.comprobante_pago} target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1.5 text-blue-600 hover:underline">
                                    <Download className="h-3.5 w-3.5" /> Ver PDF/Foto
                                  </a>
                                ) : (
                                  <span className="text-xs text-gray-400">Sin archivo</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* BLOQUE 2: MIS MINUTAS Y PAUTAS (AHORA MUCHO MÁS GRANDE) */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary" /> Mis Minutas y Pautas
                  </h2>
                  <span className="bg-rose-50 text-primary text-xs font-bold px-3 py-1 rounded-full border border-rose-100">
                    {documentos.length} Documentos
                  </span>
                </div>
                
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : documentos.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">Aún no hay documentos disponibles.</p>
                    <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                      Tu nutri subirá aquí tus pautas, dietas o exámenes una vez que termines tu consulta.
                    </p>
                  </div>
                ) : (
                  // NUEVO DISEÑO: Tarjetas en formato de cuadrícula (Grid)
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documentos.map(doc => (
                      <a 
                        key={doc.id}
                        href={doc.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="group flex flex-col justify-between p-5 rounded-2xl border border-gray-100 bg-white hover:border-primary/40 hover:shadow-md hover:bg-rose-50/30 transition-all duration-300"
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <div className="bg-rose-100 p-3 rounded-xl shrink-0 group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                            <FileText className="h-6 w-6" />
                          </div>
                          <div className="overflow-hidden">
                            <h3 className="text-base font-bold text-gray-900 truncate group-hover:text-primary transition-colors" title={doc.nombre_archivo}>
                              {doc.nombre_archivo}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Subido el {new Date(doc.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm font-semibold text-primary mt-auto pt-4 border-t border-gray-100 group-hover:border-primary/20">
                          <Download className="h-4 w-4 mr-1.5" />
                          Descargar Documento
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
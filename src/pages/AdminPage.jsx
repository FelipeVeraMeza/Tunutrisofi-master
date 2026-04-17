import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { supabase } from '@/lib/supabaseClient.js';
import { Button } from '@/components/ui/button.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Input } from '@/components/ui/input.jsx';
import { useToast } from '@/hooks/use-toast.js';
import { 
  Users, Calendar, Banknote, Loader2, CheckCircle2, 
  XCircle, ExternalLink, Clock, ShieldCheck,
  FileUp, X, Search, CalendarDays, Mail
} from 'lucide-react';

const AdminPage = () => {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('pagos');
  const [loading, setLoading] = useState(true);
  
  const [reservas, setReservas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // ----- ESTADOS PARA SUBIDA MÚLTIPLE -----
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [docFiles, setDocFiles] = useState([]); // Ahora es un ARRAY de archivos
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedFilesNames, setUploadedFilesNames] = useState([]); // Para el correo

  useEffect(() => {
    if (!currentUser || !isAdmin) {
      navigate('/');
      return;
    }
    fetchAdminData();
  }, [currentUser, isAdmin, navigate]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const { data: reservasData } = await supabase
        .from('reservas')
        .select(`*, usuarios (nombre, rut, telefono, email)`)
        .order('fecha', { ascending: false })
        .order('hora', { ascending: true });
      setReservas(reservasData || []);

      const { data: pacientesData } = await supabase
        .from('usuarios')
        .select('*')
        .order('created_at', { ascending: false });
      setPacientes(pacientesData || []);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudieron cargar los datos.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, nuevoEstado) => {
    try {
      const { error } = await supabase.from('reservas').update({ estado: nuevoEstado }).eq('id', id);
      if (error) throw error;
      setReservas(prev => prev.map(res => res.id === id ? { ...res, estado: nuevoEstado } : res));
      toast({ title: nuevoEstado === 'completado' ? '¡Aprobado!' : 'Rechazado', description: `Reserva marcada como ${nuevoEstado}.` });
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo actualizar.', variant: 'destructive' });
    }
  };

  // ----- LÓGICA PARA SUBIR MÚLTIPLES DOCUMENTOS -----
  const openUploadModal = (paciente) => {
    setSelectedPatient(paciente);
    setDocFiles([]);
    setUploadSuccess(false);
    setUploadedFilesNames([]);
    setIsModalOpen(true);
  };

  const closeUploadModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedPatient(null);
      setDocFiles([]);
      setUploadedFilesNames([]);
      setUploadSuccess(false);
    }, 200);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      // Convertimos la lista de archivos a un Array real de JavaScript
      const filesArray = Array.from(e.target.files);
      setDocFiles(filesArray);
    }
  };

const handleDocSubmit = async (e) => {
    e.preventDefault();
    if (docFiles.length === 0 || !selectedPatient) return;
    
    setUploadingDoc(true);
    try {
      for (const file of docFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${selectedPatient.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        // 1. Subir al Storage
        const { error: uploadError } = await supabase.storage.from('documentos').upload(fileName, file);
        if (uploadError) throw uploadError;

        // 2. Obtener URL
        const { data: publicUrlData } = supabase.storage.from('documentos').getPublicUrl(fileName);
        
        // 3. Insertar en la tabla (ESTO DISPARA EL CORREO AUTOMÁTICO EN EL BACKEND)
        const { error: dbError } = await supabase.from('documentos_pacientes').insert({
          usuario_id: selectedPatient.id,
          nombre_archivo: file.name,
          url: publicUrlData.publicUrl
        });
        if (dbError) throw dbError;
      }

      toast({ 
        title: '¡Todo listo!', 
        description: `Se subieron ${docFiles.length} archivos. El servidor está enviando el correo de aviso ahora mismo.` 
      });
      
      closeUploadModal(); // Se cierra solo, sin preguntar nada más
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo completar la subida.', variant: 'destructive' });
    } finally {
      setUploadingDoc(false);
    }
  };

  // ----- GENERADOR DE CORREO AUTOMÁTICO -----
  const getMailtoLink = () => {
    if (!selectedPatient) return '#';
    
    const subject = encodeURIComponent('Nuevos documentos en tu perfil - Tu Nutri Sofi');
    
    // Convertimos el array de nombres en una lista con viñetas para el correo
    const listaArchivos = uploadedFilesNames.map(name => `• ${name}`).join('\n');
    
    const body = encodeURIComponent(
      `¡Hola ${selectedPatient.nombre.split(' ')[0]}!\n\n` +
      `Ya he subido a tu perfil privado los documentos correspondientes a nuestra consulta. Los archivos que ya están disponibles son:\n\n` +
      `${listaArchivos}\n\n` +
      `Puedes ingresar a la plataforma (www.tunutrisofi.cl) con tu cuenta para verlos y descargarlos de forma segura.\n\n` +
      `Un abrazo,\nSofía Cordero\nTu Nutri Sofi`
    );

    return `mailto:${selectedPatient.email}?subject=${subject}&body=${body}`;
  };

  const pagosPendientes = reservas.filter(r => r.estado === 'pagado' || r.estado === 'pendiente');
  const agendaRaw = reservas.filter(r => r.estado === 'completado');

  const pacientesFiltrados = pacientes.filter(p => 
    p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.rut?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const agruparAgendaPorSemana = (citas) => {
    const gruposMap = new Map();
    citas.forEach(cita => {
      let labelSemana = "Fecha desconocida";
      let nombreDia = "";
      if (cita.fecha && cita.fecha.includes('-')) {
        const [year, month, day] = cita.fecha.split('-');
        const dateObj = new Date(year, month - 1, day);
        const diaStr = dateObj.toLocaleDateString('es-ES', { weekday: 'long' });
        nombreDia = diaStr.charAt(0).toUpperCase() + diaStr.slice(1);
        const dayOfWeek = dateObj.getDay(); 
        const diffToMonday = dateObj.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const monday = new Date(year, month - 1, diffToMonday);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        const options = { day: 'numeric', month: 'short' };
        labelSemana = `Semana del ${monday.toLocaleDateString('es-ES', options)} al ${sunday.toLocaleDateString('es-ES', options)} de ${sunday.getFullYear()}`;
      }
      if (!gruposMap.has(labelSemana)) gruposMap.set(labelSemana, []);
      gruposMap.get(labelSemana).push({ ...cita, nombreDia });
    });
    const gruposArray = [];
    gruposMap.forEach((listaCitas, semanaStr) => gruposArray.push({ semana: semanaStr, citas: listaCitas }));
    return gruposArray;
  };

  const agendaAgrupada = agruparAgendaPorSemana(agendaRaw);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;

  return (
    <>
      <Helmet><title>Panel Admin | Tu Nutri Sofi</title></Helmet>
      
      <div className="min-h-screen bg-gray-50 py-8 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-4 rounded-2xl">
                <ShieldCheck className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
                <p className="text-gray-500">Bienvenido/a, controla tu consulta desde aquí.</p>
              </div>
            </div>
            
            <div className="flex flex-col lg:flex-row items-center gap-4 w-full md:w-auto">
              <div className="flex bg-gray-100 p-1.5 rounded-xl w-full md:w-auto overflow-x-auto">
                <button onClick={() => setActiveTab('pagos')} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === 'pagos' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
                  <Banknote className="h-4 w-4" /> Pagos ({pagosPendientes.length})
                </button>
                <button onClick={() => setActiveTab('agenda')} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === 'agenda' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
                  <Calendar className="h-4 w-4" /> Agenda
                </button>
                <button onClick={() => setActiveTab('pacientes')} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === 'pacientes' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
                  <Users className="h-4 w-4" /> Pacientes
                </button>
              </div>
            </div>
          </div>

          {/* ... PESTAÑAS PAGOS Y AGENDA (Se mantienen igual) ... */}
          {activeTab === 'pagos' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
               <h2 className="text-xl font-bold text-gray-900 mb-4">Revisiones Pendientes</h2>
              {pagosPendientes.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                  <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900">¡Todo al día!</h3>
                  <p className="text-gray-500">No tienes pagos pendientes por revisar.</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {pagosPendientes.map(reserva => (
                    <div key={reserva.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between gap-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Cita</p>
                          <p className="font-bold text-gray-900">{reserva.tipo_consulta}</p>
                          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1"><Calendar className="h-3.5 w-3.5"/> {reserva.fecha}</p>
                          <p className="text-sm text-gray-600 flex items-center gap-1"><Clock className="h-3.5 w-3.5"/> {reserva.hora} hrs</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Paciente</p>
                          <p className="font-bold text-gray-900">{reserva.usuarios?.nombre || 'Usuario eliminado'}</p>
                          <p className="text-sm text-gray-600">{reserva.usuarios?.rut}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Comprobante</p>
                          {reserva.comprobante_pago ? (
                            <a href={reserva.comprobante_pago} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-medium mt-1">
                              <ExternalLink className="h-4 w-4" /> Ver Archivo
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-yellow-100 text-yellow-800 mt-1">Esperando subida...</span>
                          )}
                        </div>
                      </div>
                      <div className="flex md:flex-col gap-3 justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                        <Button onClick={() => handleUpdateStatus(reserva.id, 'completado')} disabled={!reserva.comprobante_pago} className="bg-green-600 hover:bg-green-700 text-white flex-1"><CheckCircle2 className="h-4 w-4 mr-2" /> Aprobar</Button>
                        <Button onClick={() => handleUpdateStatus(reserva.id, 'rechazado')} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 flex-1"><XCircle className="h-4 w-4 mr-2" /> Rechazar</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
             </div>
          )}

          {activeTab === 'agenda' && (
             <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 pb-4">
               <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Agenda Semanal</h2>
              </div>
              {agendaAgrupada.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No hay citas confirmadas en el sistema.</div>
              ) : (
                <div className="space-y-2">
                  {agendaAgrupada.map((grupo, index) => (
                    <div key={index} className="mb-8">
                      <div className="bg-rose-50/80 px-6 py-3.5 border-y border-rose-100 flex items-center gap-3 shadow-sm">
                        <CalendarDays className="h-5 w-5 text-primary" />
                        <h3 className="font-bold text-primary text-lg">{grupo.semana}</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="text-gray-400 text-xs uppercase tracking-wider">
                            <tr>
                              <th className="px-6 py-3 font-semibold">Día y Hora</th>
                              <th className="px-6 py-3 font-semibold">Paciente</th>
                              <th className="px-6 py-3 font-semibold">Servicio</th>
                              <th className="px-6 py-3 font-semibold">Contacto</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {grupo.citas.map(cita => (
                              <tr key={cita.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="font-bold text-gray-900">{cita.nombreDia}, <span className="text-gray-500 text-sm font-medium">{cita.fecha}</span></div>
                                  <div className="text-primary text-sm font-bold flex items-center gap-1.5 mt-1"><Clock className="h-3.5 w-3.5" /> {cita.hora} hrs</div>
                                </td>
                                <td className="px-6 py-4 font-bold text-gray-900">{cita.usuarios?.nombre}</td>
                                <td className="px-6 py-4 text-gray-600">{cita.tipo_consulta}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                  <div className="font-medium text-gray-700">{cita.usuarios?.telefono}</div>
                                  <div>{cita.usuarios?.email}</div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
             </div>
          )}

          {/* Tab: PACIENTES */}
          {activeTab === 'pacientes' && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
              <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-gray-900">Directorio de Pacientes</h2>
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">Total: {pacientesFiltrados.length}</span>
                </div>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Buscar por nombre o email..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white border-gray-200 rounded-xl"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Nombre Completo</th>
                      <th className="px-6 py-4 font-semibold">Datos</th>
                      <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pacientesFiltrados.map(paciente => (
                      <tr key={paciente.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                            {paciente.nombre?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-bold">{paciente.nombre}</p>
                            <p className="text-xs text-gray-500 uppercase flex items-center gap-1 mt-0.5">
                              {paciente.rol === 'admin' && <ShieldCheck className="h-3 w-3 text-purple-600"/>}
                              {paciente.rol}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-800">{paciente.email}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="outline" size="sm" onClick={() => openUploadModal(paciente)} className="border-primary/30 text-primary hover:bg-rose-50">
                            <FileUp className="h-4 w-4 mr-2" /> Subir Archivos
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* MODAL PARA SUBIDA MÚLTIPLE DE DOCUMENTOS */}
      {isModalOpen && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative">
            
            <button onClick={closeUploadModal} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 bg-gray-100 rounded-full p-1.5 transition-colors">
              <XCircle className="h-5 w-5" />
            </button>
            
            {!uploadSuccess ? (
              <>
                <div className="bg-rose-50 p-6 text-center border-b border-rose-100">
                  <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-primary">
                    <FileUp className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Archivos para el Paciente</h3>
                  <p className="text-sm text-gray-600">Para: <span className="font-bold text-primary">{selectedPatient.nombre}</span></p>
                </div>

                <form onSubmit={handleDocSubmit} className="p-6 space-y-6">
                  
                  <div className="space-y-3">
                    <Label className="font-bold text-gray-900">Seleccionar Pautas e Informes</Label>
                    {/* ¡EL SECRETO ESTÁ AQUÍ! El atributo "multiple" permite elegir varios */}
                    <input 
                      type="file" 
                      accept=".pdf,image/*" 
                      multiple 
                      onChange={handleFileChange} 
                      className="hidden" 
                      ref={fileInputRef} 
                    />
                    
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${docFiles.length > 0 ? 'border-primary bg-rose-50' : 'border-gray-300 hover:border-primary hover:bg-rose-50/30'}`}
                    >
                      {docFiles.length > 0 ? (
                        <div className="text-primary font-bold">
                          ¡{docFiles.length} archivos seleccionados!
                          <div className="mt-2 text-sm text-gray-600 font-normal space-y-1">
                            {docFiles.map((f, i) => (
                              <div key={i} className="truncate px-2 flex items-center justify-center gap-1">
                                <CheckCircle2 className="h-3 w-3 text-green-500" /> {f.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-500">
                          Haz clic para seleccionar uno o varios archivos (Plan, Minuta, Informe...)
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 text-center">Asegúrate de ponerles un buen nombre antes de subirlos (Ej: "Plan_Juan.pdf")</p>
                  </div>

                  <Button type="submit" disabled={docFiles.length === 0 || uploadingDoc} className="w-full h-12 text-base rounded-xl bg-primary hover:bg-primary/90 text-white shadow-md">
                    {uploadingDoc ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Guardando archivos...</> : `Subir ${docFiles.length > 0 ? docFiles.length : ''} Archivo(s)`}
                  </Button>
                </form>
              </>
            ) : (
              // PANTALLA DE ÉXITO Y NOTIFICACIÓN POR CORREO
              <div className="p-8 text-center animate-in zoom-in-95 duration-300">
                <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Archivos Guardados!</h3>
                <p className="text-gray-600 mb-8">
                  Los {uploadedFilesNames.length} documentos ya están disponibles en la plataforma.
                </p>

                {/* BOTÓN MÁGICO DE CORREO */}
                <Button 
                  asChild
                  className="w-full h-14 text-lg rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 mb-3"
                >
                  <a href={getMailtoLink()}>
                    <Mail className="h-5 w-5 mr-2" /> Notificar por Correo
                  </a>
                </Button>

                <Button variant="ghost" onClick={closeUploadModal} className="w-full text-gray-500 hover:bg-gray-100 rounded-xl">
                  Cerrar y volver
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AdminPage;
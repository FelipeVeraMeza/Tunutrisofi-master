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

// Importamos la configuración centralizada
import { API_BASE_URL } from '@/config.js'; 

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [docFiles, setDocFiles] = useState([]); 
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedFilesNames, setUploadedFilesNames] = useState([]); 

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
      const { data: resData } = await supabase.from('reservas').select(`*, usuarios (*)`).order('fecha', { ascending: false });
      setReservas(resData || []);
      const { data: pacData } = await supabase.from('usuarios').select('*').order('created_at', { ascending: false });
      setPacientes(pacData || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Carga fallida.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, nuevoEstado) => {
    try {
      const { error } = await supabase.from('reservas').update({ estado: nuevoEstado }).eq('id', id);
      if (error) throw error;
      fetchAdminData();
      toast({ title: '¡Actualizado!', description: `Reserva marcada como ${nuevoEstado}.` });
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo actualizar.', variant: 'destructive' });
    }
  };

  const openUploadModal = (paciente) => {
    setSelectedPatient(paciente);
    setDocFiles([]);
    setUploadSuccess(false);
    setIsModalOpen(true);
  };

  const closeUploadModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedPatient(null), 200);
  };

  const handleFileChange = (e) => {
    if (e.target.files) setDocFiles(Array.from(e.target.files));
  };

  const handleDocSubmit = async (e) => {
    e.preventDefault();
    if (docFiles.length === 0 || !selectedPatient) return;
    
    setUploadingDoc(true);
    try {
      for (const file of docFiles) {
        const fileName = `${selectedPatient.id}-${Date.now()}-${file.name}`;
        
        // 1. Subir a Supabase Storage
        const { error: upErr } = await supabase.storage.from('documentos').upload(fileName, file);
        if (upErr) throw upErr;

        // 2. Registrar en DB
        const { data: urlData } = supabase.storage.from('documentos').getPublicUrl(fileName);
        await supabase.from('documentos_pacientes').insert({
          usuario_id: selectedPatient.id,
          nombre_archivo: file.name,
          url: urlData.publicUrl
        });

        // 3. Mandar al Cartero (Railway)
        const formData = new FormData();
        formData.append('file', file);
        formData.append('email', selectedPatient.email);
        formData.append('nombrePaciente', selectedPatient.nombre);
        formData.append('nombreArchivo', file.name);

        await fetch(`${API_BASE_URL}/notificar-documento`, {
          method: 'POST',
          body: formData,
        });
      }

      setUploadedFilesNames(docFiles.map(f => f.name));
      setUploadSuccess(true);
      toast({ title: '¡Perfecto!', description: 'Archivos subidos y notificados por correo.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Algo falló en el proceso.', variant: 'destructive' });
    } finally {
      setUploadingDoc(false);
    }
  };

  const getMailtoLink = () => {
    if (!selectedPatient) return '#';
    const subject = encodeURIComponent('Nuevos documentos - Nutrisofi');
    const body = encodeURIComponent(`Hola ${selectedPatient.nombre},\n\nHe subido nuevos documentos a tu perfil en www.tunutrisofi.cl.\n\nUn abrazo!`);
    return `mailto:${selectedPatient.email}?subject=${subject}&body=${body}`;
  };

  const pagosPendientes = reservas.filter(r => r.estado === 'pagado' || r.estado === 'pendiente');
  const pacientesFiltrados = pacientes.filter(p => p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 font-sans">
      <Helmet><title>Panel Admin | Nutrisofi</title></Helmet>
      <div className="container mx-auto max-w-6xl">
        
        {/* Header con estilo Nutrisofi */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-rose-50 p-4 rounded-2xl text-primary"><ShieldCheck size={32} /></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel de Control</h1>
              <p className="text-gray-500">Gestiona tus pacientes y citas.</p>
            </div>
          </div>
          <div className="flex bg-gray-100 p-1.5 rounded-2xl">
            {['pagos', 'agenda', 'pacientes'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} className={`px-6 py-2.5 rounded-xl font-bold transition-all capitalize ${activeTab === t ? 'bg-white text-primary shadow-sm' : 'text-gray-400'}`}>{t}</button>
            ))}
          </div>
        </div>

        {activeTab === 'pacientes' && (
          <div className="bg-white rounded-[2rem] shadow-sm border overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="p-6 border-b flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/30">
              <h2 className="text-xl font-bold">Directorio de Pacientes</h2>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 h-4 w-4" />
                <Input placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 rounded-xl border-gray-200" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <tbody className="divide-y divide-gray-50">
                  {pacientesFiltrados.map(p => (
                    <tr key={p.id} className="hover:bg-rose-50/20 transition-colors">
                      <td className="p-6">
                        <div className="font-bold text-gray-900">{p.nombre}</div>
                        <div className="text-sm text-gray-400">{p.email}</div>
                      </td>
                      <td className="p-6 text-right">
                        <Button variant="outline" onClick={() => openUploadModal(p)} className="border-primary text-primary hover:bg-primary hover:text-white rounded-xl">
                          <FileUp className="h-4 w-4 mr-2" /> Enviar Pauta
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ... (Aquí irían Pagos y Agenda) ... */}
      </div>

      {/* Modal Estilizado */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl relative overflow-hidden">
            <button onClick={closeUploadModal} className="absolute top-6 right-6 text-gray-300 hover:text-red-500 transition-colors"><XCircle size={28} /></button>
            
            {!uploadSuccess ? (
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="bg-rose-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 text-primary shadow-inner"><FileUp size={36} /></div>
                  <h3 className="text-2xl font-bold text-gray-800">Cargar Documentos</h3>
                  <p className="text-gray-400">Paciente: {selectedPatient?.nombre}</p>
                </div>
                <form onSubmit={handleDocSubmit} className="space-y-6">
                  <input type="file" multiple onChange={handleFileChange} className="hidden" ref={fileInputRef} accept=".pdf,image/*" />
                  <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-rose-100 rounded-[2rem] p-10 text-center cursor-pointer hover:bg-rose-50/50 hover:border-primary/30 transition-all group">
                    {docFiles.length > 0 ? (
                       <span className="font-bold text-primary animate-pulse">¡{docFiles.length} archivos seleccionados!</span>
                    ) : (
                       <span className="text-gray-300 group-hover:text-gray-400">Toca para elegir PDF o Fotos</span>
                    )}
                  </div>
                  <Button type="submit" disabled={uploadingDoc || docFiles.length === 0} className="w-full h-14 bg-primary text-white text-lg rounded-2xl shadow-xl shadow-rose-100 hover:scale-[1.02] transition-transform">
                    {uploadingDoc ? <Loader2 className="animate-spin" /> : 'Subir y Avisar por Mail'}
                  </Button>
                </form>
              </div>
            ) : (
              <div className="p-10 text-center animate-in zoom-in-95">
                <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 shadow-inner"><CheckCircle2 size={48} /></div>
                <h3 className="text-2xl font-bold mb-2">¡Todo listo!</h3>
                <p className="text-gray-400 mb-8">El paciente ya tiene los archivos en su correo y en su perfil web.</p>
                <div className="space-y-3">
                   <Button asChild className="w-full h-12 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100"><a href={getMailtoLink()}><Mail className="mr-2 h-4 w-4"/> Re-avisar Manualmente</a></Button>
                   <Button onClick={closeUploadModal} variant="ghost" className="w-full text-gray-400">Cerrar</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
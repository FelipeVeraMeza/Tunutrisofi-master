import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/supabaseClient.js';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { useToast } from '@/hooks/use-toast.js';
import { FileUp, Search, CheckCircle2, Loader2, XCircle, ShieldCheck, Mail } from 'lucide-react';
import { API_BASE_URL } from "@/config.js";

const AdminPage = () => {
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('pacientes');
  const [pacientes, setPacientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Estados Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [docFiles, setDocFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => { fetchPacientes(); }, []);

  const fetchPacientes = async () => {
    const { data } = await supabase.from('usuarios').select('*').order('nombre');
    setPacientes(data || []);
    setLoading(false);
  };

  const handleDocSubmit = async (e) => {
    e.preventDefault();
    if (!docFiles.length || !selectedPatient) return;
    setUploading(true);

    try {
      for (const file of docFiles) {
        const fileName = `${selectedPatient.id}-${Date.now()}-${file.name}`;
        
        // 1. Supabase Storage
        await supabase.storage.from('documentos').upload(fileName, file);

        // 2. DB Paciente
        const { data: urlData } = supabase.storage.from('documentos').getPublicUrl(fileName);
        await supabase.from('documentos_pacientes').insert({
          usuario_id: selectedPatient.id,
          nombre_archivo: file.name,
          url: urlData.publicUrl
        });

        // 3. Notificar al Cartero (Railway)
        const fd = new FormData();
        formData.append('file', file);
        formData.append('email', selectedPatient.email);
        formData.append('nombrePaciente', selectedPatient.nombre);
        formData.append('nombreArchivo', file.name);

        await fetch(`${API_BASE_URL}/notificar-documento`, { method: 'POST', body: fd });
      }
      setSuccess(true);
      toast({ title: "¡Enviado!" });
    } catch (err) {
      toast({ title: "Error", variant: "destructive" });
    } finally { setUploading(false); }
  };

  const pacientesFiltrados = pacientes.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <div className="h-screen flex items-center justify-center text-primary"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Helmet><title>Admin | Nutrisofi</title></Helmet>
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-3xl p-6 shadow-sm border mb-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="bg-rose-50 p-3 rounded-2xl text-primary"><ShieldCheck /></div>
             <h1 className="text-xl font-bold">Panel Nutrisofi</h1>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {['pacientes', 'pagos'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} className={`px-6 py-2 rounded-lg font-bold capitalize ${activeTab === t ? 'bg-white text-primary shadow-sm' : 'text-gray-400'}`}>{t}</button>
            ))}
          </div>
        </div>

        {activeTab === 'pacientes' && (
          <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
            <div className="p-6 border-b flex justify-between bg-gray-50/50">
              <h2 className="font-bold">Mis Pacientes</h2>
              <Input placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-48" />
            </div>
            <table className="w-full">
              <tbody className="divide-y">
                {pacientesFiltrados.map(p => (
                  <tr key={p.id} className="hover:bg-rose-50/20">
                    <td className="p-4"><b>{p.nombre}</b><br/><span className="text-xs text-gray-400">{p.email}</span></td>
                    <td className="p-4 text-right">
                      <Button variant="outline" onClick={() => { setSelectedPatient(p); setIsModalOpen(true); setSuccess(false); }} className="border-primary text-primary hover:bg-primary hover:text-white">Subir Pauta</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-300"><XCircle /></button>
            {!success ? (
              <>
                <div className="text-center mb-6">
                  <div className="bg-rose-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary"><FileUp /></div>
                  <h3 className="text-xl font-bold">Enviar a {selectedPatient.nombre}</h3>
                </div>
                <form onSubmit={handleDocSubmit} className="space-y-4">
                  <input type="file" multiple onChange={e => setDocFiles(Array.from(e.target.files))} className="w-full border-2 border-dashed p-6 rounded-2xl" />
                  <Button type="submit" disabled={uploading || !docFiles.length} className="w-full bg-primary h-12">
                    {uploading ? <Loader2 className="animate-spin" /> : 'Subir y Notificar'}
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <CheckCircle2 className="text-green-500 w-16 h-16 mx-auto mb-4" />
                <h3 className="text-xl font-bold">¡Todo enviado!</h3>
                <Button onClick={() => setIsModalOpen(false)} className="mt-6 w-full">Cerrar</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
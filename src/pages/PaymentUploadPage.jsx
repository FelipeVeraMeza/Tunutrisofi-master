import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { supabase } from '@/lib/supabaseClient.js';
import { Button } from '@/components/ui/button.jsx';
import { Label } from '@/components/ui/label.jsx';
import { useToast } from '@/hooks/use-toast.js';
import { Upload, CheckCircle2, Loader2, FileText, ArrowLeft, Image as ImageIcon } from 'lucide-react';

const PaymentUploadPage = () => {
  const { reservaId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const fileInputRef = useRef(null);
  
  const [reserva, setReserva] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchReserva = async () => {
      if (!currentUser) return;
      try {
        const { data, error } = await supabase
          .from('reservas')
          .select('*')
          .eq('id', reservaId)
          .single();

        if (error) throw error;
        
        if (data.usuario_id !== currentUser.id && currentUser.rol !== 'admin') {
          navigate('/profile');
          return;
        }
        setReserva(data);
      } catch (error) {
        toast({ title: 'Error', description: 'No se encontró la reserva.', variant: 'destructive' });
        navigate('/profile');
      } finally {
        setLoading(false);
      }
    };
    fetchReserva();
  }, [reservaId, currentUser, navigate, toast]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast({ title: 'Atención', description: 'Por favor selecciona un archivo.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${reservaId}-${Date.now()}.${fileExt}`;
      const filePath = `${currentUser.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('comprobantes')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('comprobantes')
        .getPublicUrl(filePath);
        
      const publicURL = publicUrlData.publicUrl;

      const { error: updateError } = await supabase
        .from('reservas')
        .update({ comprobante_pago: publicURL, estado: 'pagado' })
        .eq('id', reservaId);

      if (updateError) throw updateError;
      
      toast({ title: '¡Comprobante subido!', description: 'Tu pago será revisado y confirmaremos tu cita pronto.' });
      navigate('/profile');
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo subir el comprobante. Inténtalo de nuevo.', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const formatMonto = (tipo) => {
    if (tipo === 'Presencial') return '$35.000';
    if (tipo === 'Online') return '$20.000';
    return '$25.000';
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <>
      <Helmet><title>Subir Pago - Tu Nutri Sofi</title></Helmet>
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          
          <div className="mb-6">
            <Button asChild variant="ghost" className="text-gray-600 hover:text-primary rounded-xl">
              <Link to="/profile"><ArrowLeft className="h-4 w-4 mr-2" /> Volver a mi perfil</Link>
            </Button>
          </div>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-rose-100">
            <div className="bg-primary p-8 text-white text-center">
              <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <ImageIcon className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold mb-2">Confirmar Pago</h1>
              <p className="text-rose-50/90 text-sm md:text-base">Cita agendada para el {reserva?.fecha}</p>
            </div>

            <div className="p-6 md:p-10">
              <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100 mb-8">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" /> Datos de Transferencia
                </h3>
                <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-700">
                  <p><span className="font-semibold text-gray-900">Banco:</span> Banco Estado</p>
                  <p><span className="font-semibold text-gray-900">Tipo:</span> Cuenta RUT</p>
                  <p><span className="font-semibold text-gray-900">Número:</span> 12345678</p>
                  <p><span className="font-semibold text-gray-900">Nombre:</span> Sofía Cordero</p>
                  <p><span className="font-semibold text-gray-900">RUT:</span> 12.345.678-9</p>
                  <p><span className="font-semibold text-gray-900">Email:</span> pagos@tunutrisofi.cl</p>
                </div>
                <div className="mt-6 pt-4 border-t border-rose-200 text-center">
                  <p className="font-medium text-gray-500 mb-1">Total a transferir</p>
                  <p className="font-black text-3xl text-primary">{formatMonto(reserva?.tipo_consulta)}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <Label className="text-base md:text-lg font-bold text-gray-900">
                    Sube tu comprobante (PDF, JPG, PNG)
                  </Label>
                  
                  <input 
                    type="file" 
                    accept=".pdf,image/*" 
                    onChange={handleFileChange} 
                    className="hidden" 
                    ref={fileInputRef} 
                  />

                  <div 
                    onClick={handleBoxClick}
                    className={`border-2 border-dashed rounded-3xl p-8 md:p-12 text-center transition-all cursor-pointer hover:bg-rose-50/50 group ${
                      file ? 'border-green-400 bg-green-50/30' : 'border-gray-300 bg-white'
                    }`}
                  >
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110 ${
                      file ? 'bg-green-100' : 'bg-rose-100'
                    }`}>
                      <Upload className={`h-8 w-8 ${file ? 'text-green-600' : 'text-primary'}`} />
                    </div>

                    <p className="text-xl font-bold text-gray-900 mb-2">
                      {file ? '¡Archivo listo!' : 'Haz clic para subir comprobante'}
                    </p>
                    
                    {file ? (
                      <div className="mt-4 inline-flex items-center gap-2 bg-white border border-green-200 px-4 py-2 rounded-full shadow-sm text-green-700 text-sm font-medium">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="truncate max-w-[200px]">{file.name}</span>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        Busca la foto o el PDF en tu dispositivo.
                      </p>
                    )}
                  </div>
                </div>

                {/* BOTÓN CORREGIDO AQUÍ */}
                <Button 
                  type="submit" 
                  className={`w-full flex items-center justify-center gap-2 h-16 text-lg font-bold rounded-2xl transition-all duration-300 ${
                    file 
                      ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-rose-200' 
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-100 hover:bg-gray-200'
                  }`}
                  disabled={uploading || !file}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin" /> 
                      Procesando pago...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-6 w-6" /> 
                      Confirmar Pago
                    </>
                  )}
                </Button>

              </form>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentUploadPage;
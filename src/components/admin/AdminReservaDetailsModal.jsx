import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { Label } from "@/components/ui/label.jsx";
import { useToast } from "@/hooks/use-toast.js";
import pb from '@/lib/pocketbaseClient.js';
import { Download, CheckCircle, XCircle, FileText, Loader2 } from 'lucide-react';

const AdminReservaDetailsModal = ({ reserva, isOpen, onClose, onUpdate }) => {
  const [notes, setNotes] = useState(reserva?.notas_admin || '');
  const [loading, setLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const { toast } = useToast();

  if (!reserva) return null;

  const handleUpdateStatus = async (newStatus) => {
    setLoading(true);
    try {
      const data = { estado: newStatus, notas_admin: notes };
      if (newStatus === 'rechazado') {
        data.notas_admin = `Motivo rechazo: ${rejectReason}\n\n${notes}`;
      }
      
      const updated = await pb.collection('reservas').update(reserva.id, data, { $autoCancel: false });
      
      // In a real app, here we would trigger an email via a PocketBase hook or external service
      toast({ title: 'Reserva actualizada', description: `Estado cambiado a ${newStatus}` });
      onUpdate(updated);
      if (newStatus !== 'rechazado') onClose();
    } catch (error) {
      console.error('Error updating reserva:', error);
      toast({ title: 'Error', description: 'No se pudo actualizar la reserva', variant: 'destructive' });
    } finally {
      setLoading(false);
      setShowRejectForm(false);
    }
  };

  const handleSaveNotes = async () => {
    setLoading(true);
    try {
      const updated = await pb.collection('reservas').update(reserva.id, { notas_admin: notes }, { $autoCancel: false });
      toast({ title: 'Notas guardadas' });
      onUpdate(updated);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudieron guardar las notas', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Detalles de Reserva</DialogTitle>
          <DialogDescription>ID: {reserva.id}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Info Column */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-xl">
              <h4 className="font-bold text-gray-900 mb-3">Datos del Cliente</h4>
              <p className="text-sm"><span className="font-medium">Nombre:</span> {reserva.nombre}</p>
              <p className="text-sm"><span className="font-medium">Email:</span> {reserva.email}</p>
              <p className="text-sm"><span className="font-medium">Teléfono:</span> {reserva.telefono}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <h4 className="font-bold text-gray-900 mb-3">Detalles de Cita</h4>
              <p className="text-sm"><span className="font-medium">Tipo:</span> {reserva.tipo_consulta}</p>
              <p className="text-sm"><span className="font-medium">Fecha:</span> {reserva.fecha}</p>
              <p className="text-sm"><span className="font-medium">Hora:</span> {reserva.hora}</p>
              <p className="text-sm mt-2">
                <span className="font-medium">Estado:</span> 
                <span className="ml-2 px-2 py-1 bg-gray-200 rounded-full text-xs font-bold uppercase">{reserva.estado}</span>
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <h4 className="font-bold text-gray-900 mb-3">Documentos</h4>
              {reserva.comprobante_pago ? (
                <a 
                  href={pb.files.getUrl(reserva, reserva.comprobante_pago)} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:underline text-sm mb-2"
                >
                  <Download className="h-4 w-4" /> Ver Comprobante de Pago
                </a>
              ) : (
                <p className="text-sm text-gray-500 mb-2">Sin comprobante de pago</p>
              )}
              
              {reserva.documentos_adjuntos && reserva.documentos_adjuntos.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium mb-1">Adjuntos:</p>
                  {reserva.documentos_adjuntos.map((doc, i) => (
                    <a 
                      key={i}
                      href={pb.files.getUrl(reserva, doc)} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-2 text-gray-600 hover:text-primary hover:underline text-sm"
                    >
                      <FileText className="h-4 w-4" /> Documento {i+1}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions Column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Notas Internas (Admin)</Label>
              <Textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Escribe notas sobre el paciente o la reserva..."
                rows={4}
              />
              <Button variant="outline" size="sm" onClick={handleSaveNotes} disabled={loading}>
                Guardar Notas
              </Button>
            </div>

            <div className="border-t pt-6 space-y-4">
              <h4 className="font-bold text-gray-900">Acciones</h4>
              
              {!showRejectForm ? (
                <div className="flex flex-col gap-3">
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700" 
                    onClick={() => handleUpdateStatus('confirmado')}
                    disabled={loading || reserva.estado === 'confirmado'}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" /> Confirmar Reserva
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={() => setShowRejectForm(true)}
                    disabled={loading || reserva.estado === 'rechazado'}
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Rechazar Reserva
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleUpdateStatus('completado')}
                    disabled={loading || reserva.estado === 'completado'}
                  >
                    Marcar como Completada
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 bg-red-50 p-4 rounded-xl border border-red-100">
                  <Label className="text-red-800">Motivo del rechazo (se enviará al cliente)</Label>
                  <Textarea 
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Ej: Comprobante inválido, horario no disponible..."
                    className="bg-white"
                  />
                  <div className="flex gap-2">
                    <Button variant="destructive" size="sm" onClick={() => handleUpdateStatus('rechazado')} disabled={!rejectReason || loading}>
                      Confirmar Rechazo
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowRejectForm(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminReservaDetailsModal;
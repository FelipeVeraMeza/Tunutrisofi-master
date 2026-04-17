import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.jsx";
import { Button } from "@/components/ui/button.jsx";
import { useToast } from "@/hooks/use-toast.js";
import { Users, Calendar, DollarSign, Loader2, Eye } from 'lucide-react';
import AdminReservaDetailsModal from '@/components/admin/AdminReservaDetailsModal.jsx';

const AdminDashboard = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, reservasRes] = await Promise.all([
        pb.collection('usuarios').getFullList({ sort: '-created', $autoCancel: false }),
        pb.collection('reservas').getFullList({ sort: '-fecha,-hora', $autoCancel: false })
      ]);
      setUsuarios(usersRes);
      setReservas(reservasRes);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({ title: 'Error', description: 'No se pudieron cargar los datos.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleReservaUpdate = (updatedReserva) => {
    setReservas(reservas.map(r => r.id === updatedReserva.id ? updatedReserva : r));
  };

  const openReservaModal = (reserva) => {
    setSelectedReserva(reserva);
    setIsModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente_pago': return 'bg-yellow-100 text-yellow-800';
      case 'pagado': return 'bg-blue-100 text-blue-800';
      case 'confirmado': return 'bg-green-100 text-green-800';
      case 'rechazado': return 'bg-red-100 text-red-800';
      case 'completado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  const pendingPayments = reservas.filter(r => r.estado === 'pagado').length;

  return (
    <>
      <Helmet>
        <title>Panel de Administración - Tu Nutri Sofi</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Panel de Administración</h1>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Clientes</p>
                <p className="text-2xl font-bold text-gray-900">{usuarios.length}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Reservas</p>
                <p className="text-2xl font-bold text-gray-900">{reservas.length}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Pagos por Revisar</p>
                <p className="text-2xl font-bold text-gray-900">{pendingPayments}</p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="reservas" className="w-full">
            <TabsList className="mb-8 bg-white border border-gray-200 p-1 rounded-xl">
              <TabsTrigger value="reservas" className="rounded-lg px-6 data-[state=active]:bg-primary data-[state=active]:text-white">Reservas</TabsTrigger>
              <TabsTrigger value="clientes" className="rounded-lg px-6 data-[state=active]:bg-primary data-[state=active]:text-white">Clientes</TabsTrigger>
              <TabsTrigger value="pagos" className="rounded-lg px-6 data-[state=active]:bg-primary data-[state=active]:text-white">Pagos Pendientes</TabsTrigger>
            </TabsList>

            <TabsContent value="reservas" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold mb-6">Todas las Reservas</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="p-4 rounded-tl-lg">Cliente</th>
                      <th className="p-4">Servicio</th>
                      <th className="p-4">Fecha/Hora</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 rounded-tr-lg">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reservas.map(res => (
                      <tr key={res.id} className="hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-900">{res.nombre}</td>
                        <td className="p-4 text-gray-600">{res.tipo_consulta}</td>
                        <td className="p-4 text-gray-600">{res.fecha} {res.hora}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(res.estado)}`}>
                            {res.estado.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4">
                          <Button variant="ghost" size="sm" onClick={() => openReservaModal(res)} className="text-primary hover:text-primary/80 hover:bg-primary/10">
                            <Eye className="h-4 w-4 mr-2" /> Ver
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="clientes" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold mb-6">Directorio de Clientes</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="p-4 rounded-tl-lg">Nombre</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Teléfono</th>
                      <th className="p-4">Rol</th>
                      <th className="p-4 rounded-tr-lg">Registro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {usuarios.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-900">{user.nombre || 'Sin nombre'}</td>
                        <td className="p-4 text-gray-600">{user.email}</td>
                        <td className="p-4 text-gray-600">{user.telefono || '-'}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${user.rol === 'admin' ? 'bg-primary/20 text-primary' : 'bg-gray-100 text-gray-800'}`}>
                            {user.rol}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600">{new Date(user.created).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="pagos" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold mb-6">Pagos por Revisar</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="p-4 rounded-tl-lg">Cliente</th>
                      <th className="p-4">Servicio</th>
                      <th className="p-4">Fecha Cita</th>
                      <th className="p-4">Comprobante</th>
                      <th className="p-4 rounded-tr-lg">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reservas.filter(r => r.estado === 'pagado').map(res => (
                      <tr key={res.id} className="hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-900">{res.nombre}</td>
                        <td className="p-4 text-gray-600">{res.tipo_consulta}</td>
                        <td className="p-4 text-gray-600">{res.fecha}</td>
                        <td className="p-4">
                          {res.comprobante_pago ? (
                            <a href={pb.files.getUrl(res, res.comprobante_pago)} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                              <DollarSign className="h-4 w-4" /> Ver Pago
                            </a>
                          ) : 'Sin archivo'}
                        </td>
                        <td className="p-4">
                          <Button size="sm" onClick={() => openReservaModal(res)} className="bg-primary hover:bg-primary/90 text-white">
                            Revisar
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {reservas.filter(r => r.estado === 'pagado').length === 0 && (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-gray-500">No hay pagos pendientes de revisión.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AdminReservaDetailsModal 
        reserva={selectedReserva} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onUpdate={handleReservaUpdate}
      />
    </>
  );
};

export default AdminDashboard;
import { useState } from 'react';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import GroupChat from './GroupChat';
import CreateOrderModal from './CreateOrderModal';
import { motion, AnimatePresence } from 'motion/react';

interface Order {
  id: string;
  productName: string;
  totalQuantity: number;
  groupId: string;
  groupName: string;
  creator: string;
  participants: { company: string; quantity: number }[];
  createdAt: string;
}

export default function Dashboard() {
  const [activeView, setActiveView] = useState<'home' | 'chat' | 'orders' | 'receipts'>('home');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  const groups = [
    { id: '1', name: 'Supermercados Zona Sul' },
    { id: '2', name: 'Padarias Centro' },
    { id: '3', name: 'Mercearias Atacado' },
  ];

  const handleGroupClick = (groupName: string) => {
    setSelectedGroup(groupName);
    setActiveView('chat');
  };

  const handleCreateOrder = (orderData: { productName: string; quantity: number; groupId: string }) => {
    const group = groups.find(g => g.id === orderData.groupId);
    const newOrder: Order = {
      id: Date.now().toString(),
      productName: orderData.productName,
      totalQuantity: orderData.quantity,
      groupId: orderData.groupId,
      groupName: group?.name || '',
      creator: 'Minha Empresa',
      participants: [{ company: 'Minha Empresa', quantity: orderData.quantity }],
      createdAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    setOrders([...orders, newOrder]);
  };

  const handleJoinOrder = (orderId: string, quantity: number) => {
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        const existingParticipant = order.participants.find(p => p.company === 'Minha Empresa');
        if (existingParticipant) {
          return order;
        }
        return {
          ...order,
          totalQuantity: order.totalQuantity + quantity,
          participants: [...order.participants, { company: 'Minha Empresa', quantity }],
        };
      }
      return order;
    }));
  };

  return (
    <div className="size-full flex bg-gray-50">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        onGroupClick={handleGroupClick}
        onCreateOrder={() => setIsCreateOrderOpen(true)}
      />

      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          {activeView === 'chat' && selectedGroup ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <GroupChat
                groupName={selectedGroup}
                onBack={() => setActiveView('home')}
                orders={orders.filter(o => o.groupName === selectedGroup)}
                onJoinOrder={handleJoinOrder}
              />
            </motion.div>
          ) : activeView === 'orders' ? (
            <motion.div
              key="orders"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Histórico de Pedidos</h2>
              <div className="bg-white rounded-xl shadow-sm p-6">
                {orders.length === 0 ? (
                  <p className="text-gray-500">Seus pedidos aparecerão aqui</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900">{order.productName}</h3>
                        <p className="text-sm text-gray-500 mt-1">Grupo: {order.groupName}</p>
                        <p className="text-lg font-bold text-blue-600 mt-2">
                          Quantidade Total: {order.totalQuantity} unidades
                        </p>
                        <p className="text-xs text-gray-400 mt-2">{order.participants.length} empresas participando</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ) : activeView === 'receipts' ? (
            <motion.div
              key="receipts"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Recibos</h2>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <p className="text-gray-500">Seus recibos aparecerão aqui</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <MainContent />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <CreateOrderModal
        isOpen={isCreateOrderOpen}
        onClose={() => setIsCreateOrderOpen(false)}
        onCreateOrder={handleCreateOrder}
      />
    </div>
  );
}

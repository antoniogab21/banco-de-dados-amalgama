import { useState } from 'react';
import { motion } from 'motion/react';
import { Send, Paperclip, Plus, Users, Package, ShoppingCart } from 'lucide-react';
import SidebarNew from './SidebarNew';
import CreateOrderModalNew from './CreateOrderModalNew';
import { useApp } from '../contexts/AppContext';

interface ChatPageNewProps {
  userType: 'mercado' | 'fornecedor';
  groupId?: string;
}

export default function ChatPageNew({ userType, groupId = '1' }: ChatPageNewProps) {
  const { getOrdersByGroup, getMessagesByGroup, createOrder, joinOrder, sendMessage: sendMessageToContext } = useApp();
  const [message, setMessage] = useState('');
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [joiningOrderId, setJoiningOrderId] = useState<string | null>(null);
  const [joinQuantity, setJoinQuantity] = useState('');

  const orders = getOrdersByGroup(groupId);
  const messages = getMessagesByGroup(groupId);

  const groups = [
    { id: '1', name: 'Supermercados Zona Sul', members: 12 },
    { id: '2', name: 'Padarias Centro', members: 8 },
    { id: '3', name: 'Mercearias Atacado', members: 15 },
  ];

  const currentGroup = groups.find(g => g.id === groupId) || groups[0];

  const handleCreateOrder = (orderData: { productName: string; supplier: string; quantity: number }) => {
    createOrder({
      productName: orderData.productName,
      supplier: orderData.supplier,
      quantity: orderData.quantity,
      groupId: groupId,
      groupName: currentGroup.name,
      creator: 'Minha Empresa',
    });
    setIsCreateOrderOpen(false);
  };

  const handleJoinOrder = (orderId: string) => {
    const quantity = parseInt(joinQuantity);
    if (quantity > 0) {
      joinOrder(orderId, quantity, 'Minha Empresa');
      setJoiningOrderId(null);
      setJoinQuantity('');
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessageToContext(groupId, message);
      setMessage('');
    }
  };

  return (
    <>
      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{currentGroup.name}</h1>
              <p className="text-gray-500">{currentGroup.members} membros ativos</p>
            </div>
            {userType === 'mercado' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCreateOrderOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Criar Pedido
              </motion.button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-sm border-2 border-yellow-200 overflow-hidden"
            >
              {/* Order Header */}
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-4">
                <div className="flex items-center gap-3 text-white">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">Pedido Coletivo</p>
                    <p className="text-sm opacity-90">Criado por {order.creator} • {order.createdAt}</p>
                  </div>
                </div>
              </div>

              {/* Order Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{order.productName}</h3>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Package className="w-4 h-4" />
                      <span className="text-sm">Fornecedor</span>
                    </div>
                    <p className="font-bold text-gray-900">{order.supplier}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-yellow-700 mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">Quantidade Total</span>
                    </div>
                    <p className="font-bold text-yellow-700 text-xl">{order.totalQuantity} un.</p>
                  </div>
                </div>

                {/* Participants */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-3">
                    Participantes ({order.participants.length})
                  </p>
                  <div className="space-y-2">
                    {order.participants.map((participant, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-gray-700">{participant.company}</span>
                        <span className="font-bold text-yellow-600">{participant.quantity} un.</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Join Button */}
                {userType === 'mercado' && !order.participants.find((p) => p.company === 'Minha Empresa') && (
                  joiningOrderId === order.id ? (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        value={joinQuantity}
                        onChange={(e) => setJoinQuantity(e.target.value)}
                        placeholder="Quantidade"
                        className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 outline-none"
                      />
                      <button
                        onClick={() => handleJoinOrder(order.id)}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => setJoiningOrderId(null)}
                        className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setJoiningOrderId(order.id)}
                      className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-bold py-3 rounded-xl shadow-lg"
                    >
                      Participar do Pedido
                    </motion.button>
                  )
                )}
                {userType === 'mercado' && order.participants.find((p) => p.company === 'Minha Empresa') && (
                  <div className="w-full bg-green-100 text-green-700 font-bold py-3 rounded-xl text-center">
                    ✓ Você está participando
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Regular Messages */}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-lg">
                {!msg.isOwn && (
                  <div className="mb-1">
                    <span className="text-sm font-semibold text-gray-900">{msg.user}</span>
                    <span className="text-xs text-gray-500 ml-2">{msg.company}</span>
                  </div>
                )}
                <div className={`${
                  msg.isOwn
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-tr-sm'
                    : 'bg-white text-gray-900 rounded-tl-sm'
                } rounded-2xl px-4 py-3 shadow-sm`}>
                  <p>{msg.message}</p>
                </div>
                <span className="text-xs text-gray-400 mt-1 block">{msg.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <button className="p-3 hover:bg-gray-100 rounded-xl transition">
              <Paperclip className="w-5 h-5 text-gray-500" />
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
              placeholder="Digite sua mensagem..."
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 outline-none"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              className="p-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white rounded-xl shadow-lg"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      <CreateOrderModalNew
        isOpen={isCreateOrderOpen}
        onClose={() => setIsCreateOrderOpen(false)}
        onCreateOrder={handleCreateOrder}
      />
    </>
  );
}

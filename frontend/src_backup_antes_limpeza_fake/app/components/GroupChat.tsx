import { useState } from 'react';
import { ArrowLeft, Send, Paperclip, Smile, ShoppingCart, Users, Plus, Package } from 'lucide-react';
import { motion } from 'motion/react';

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

interface GroupChatProps {
  groupName: string;
  onBack: () => void;
  orders: Order[];
  onJoinOrder: (orderId: string, quantity: number) => void;
}

export default function GroupChat({ groupName, onBack, orders, onJoinOrder }: GroupChatProps) {
  const [message, setMessage] = useState('');
  const [joiningOrderId, setJoiningOrderId] = useState<string | null>(null);
  const [joinQuantity, setJoinQuantity] = useState('');

  const handleJoinOrder = (orderId: string) => {
    const quantity = parseInt(joinQuantity);
    if (quantity > 0) {
      onJoinOrder(orderId, quantity);
      setJoiningOrderId(null);
      setJoinQuantity('');
    }
  };

  const messages = [
    {
      id: 1,
      user: 'João Silva',
      company: 'Mercado Central',
      message: 'Pessoal, alguém está precisando de arroz? Podemos fazer um pedido conjunto!',
      time: '10:30',
      isOwn: false,
    },
    {
      id: 2,
      user: 'Maria Santos',
      company: 'Empório São José',
      message: 'Eu preciso! Quanto fica o saco de 5kg?',
      time: '10:32',
      isOwn: false,
    },
    {
      id: 3,
      user: 'Você',
      company: 'Minha Empresa',
      message: 'Também tenho interesse. Vamos fechar um pedido de 100 sacos?',
      time: '10:35',
      isOwn: true,
    },
  ];

  const handleSend = () => {
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h2 className="font-semibold text-gray-900">{groupName}</h2>
            <p className="text-sm text-gray-500">12 membros ativos</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-6 space-y-4">
        {orders.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-5"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">Pedido Coletivo</span>
                  <span className="text-xs text-gray-500">• {order.createdAt}</span>
                </div>
                <p className="text-sm text-gray-600">Criado por {order.creator}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 mb-4">
              <h3 className="font-bold text-gray-900 text-lg mb-2">{order.productName}</h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-600">
                    {order.participants.length} {order.participants.length === 1 ? 'empresa' : 'empresas'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-purple-600" />
                  <span className="font-semibold text-gray-900">{order.totalQuantity} unidades</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 mb-3">
              <p className="text-xs font-semibold text-gray-500 mb-2">PARTICIPANTES:</p>
              <div className="space-y-1">
                {order.participants.map((participant, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{participant.company}</span>
                    <span className="font-semibold text-blue-600">{participant.quantity} un.</span>
                  </div>
                ))}
              </div>
            </div>

            {!order.participants.find(p => p.company === 'Minha Empresa') && (
              <div>
                {joiningOrderId === order.id ? (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      value={joinQuantity}
                      onChange={(e) => setJoinQuantity(e.target.value)}
                      placeholder="Quantidade"
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                      onClick={() => handleJoinOrder(order.id)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => setJoiningOrderId(null)}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setJoiningOrderId(order.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Participar do Pedido
                  </button>
                )}
              </div>
            )}
          </motion.div>
        ))}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-lg ${msg.isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
              {!msg.isOwn && (
                <div className="mb-1">
                  <span className="text-sm font-medium text-gray-900">{msg.user}</span>
                  <span className="text-xs text-gray-500 ml-2">{msg.company}</span>
                </div>
              )}
              <div
                className={`rounded-2xl px-4 py-2.5 ${
                  msg.isOwn
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{msg.message}</p>
              </div>
              <span className="text-xs text-gray-400 mt-1">{msg.time}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <Paperclip className="w-5 h-5 text-gray-500" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <Smile className="w-5 h-5 text-gray-500" />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Digite sua mensagem..."
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <button
            onClick={handleSend}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

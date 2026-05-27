import { motion } from 'motion/react';
import { ShoppingCart, Users, Package, Clock, CheckCircle } from 'lucide-react';
import SidebarNew from './SidebarNew';

interface OrdersPageProps {
  userType: 'mercado' | 'fornecedor';
}

export default function OrdersPage({ userType }: OrdersPageProps) {
  const orders = [
    {
      id: 1,
      product: 'Arroz Tipo 1 - 5kg',
      supplier: 'Distribuidora São Paulo',
      totalQuantity: 150,
      participants: 3,
      status: 'active',
      createdAt: '23/04/2026',
    },
    {
      id: 2,
      product: 'Feijão Preto - 1kg',
      supplier: 'Atacado Premium',
      totalQuantity: 200,
      participants: 5,
      status: 'active',
      createdAt: '22/04/2026',
    },
    {
      id: 3,
      product: 'Óleo de Soja - 900ml',
      supplier: 'Distribuição Nacional',
      totalQuantity: 80,
      participants: 2,
      status: 'completed',
      createdAt: '20/04/2026',
    },
  ];

  return (
    <>
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Pedidos</h1>
            <p className="text-gray-600">Gerencie todos os seus pedidos</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-bold shadow-lg">
              Todos
            </button>
            <button className="px-6 py-3 rounded-xl bg-white text-gray-700 font-semibold hover:bg-gray-50 transition">
              Ativos
            </button>
            <button className="px-6 py-3 rounded-xl bg-white text-gray-700 font-semibold hover:bg-gray-50 transition">
              Concluídos
            </button>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      order.status === 'active'
                        ? 'bg-gradient-to-br from-yellow-400 to-yellow-500'
                        : 'bg-gradient-to-br from-green-400 to-green-500'
                    }`}>
                      <ShoppingCart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{order.product}</h3>
                      <p className="text-gray-600">{order.supplier}</p>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full font-semibold ${
                    order.status === 'active'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {order.status === 'active' ? (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Ativo
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Concluído
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Package className="w-4 h-4" />
                      <span className="text-sm">Quantidade Total</span>
                    </div>
                    <p className="font-bold text-gray-900 text-lg">{order.totalQuantity} un.</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">Participantes</span>
                    </div>
                    <p className="font-bold text-gray-900 text-lg">{order.participants} empresas</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Data de Criação</span>
                    </div>
                    <p className="font-bold text-gray-900 text-lg">{order.createdAt}</p>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-bold py-3 rounded-xl shadow-lg"
                  >
                    Ver Detalhes
                  </motion.button>
                  {order.status === 'active' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl"
                    >
                      Cancelar
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

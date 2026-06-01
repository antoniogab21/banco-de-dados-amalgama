import { useState } from 'react';
import { motion } from 'motion/react';
import {
  ShoppingCart,
  Users,
  Package,
  Clock,
  CheckCircle,
} from 'lucide-react';

interface OrdersPageProps {
  userType: 'mercado' | 'fornecedor';
}

export default function OrdersPage({
  userType,
}: OrdersPageProps) {

  const [openOrder, setOpenOrder] = useState<number | null>(null);

  const [activeTab, setActiveTab] = useState<
    'todos' | 'ativos' | 'concluidos'
  >('todos');

  const [orders, setOrders] = useState([
    {
      id: 1,
      product: 'Arroz Tipo 1 - 5kg',
      supplier: 'Distribuidora São Paulo',
      totalQuantity: 150,
      participants: [
        'Mercado Central',
        'Supermercado União',
        'Atacado Popular',
      ],
      status: 'active',
      createdAt: '23/04/2026',
    },
    {
      id: 2,
      product: 'Feijão Preto - 1kg',
      supplier: 'Atacado Premium',
      totalQuantity: 200,
      participants: [
        'Mercado Econômico',
        'Rede União',
        'Mercadinho Bom Preço',
        'Atacadão Brasil',
        'Mix Central',
      ],
      status: 'active',
      createdAt: '22/04/2026',
    },
    {
      id: 3,
      product: 'Óleo de Soja - 900ml',
      supplier: 'Distribuição Nacional',
      totalQuantity: 80,
      participants: [
        'Mercado Popular',
        'Central Mix',
      ],
      status: 'completed',
      createdAt: '20/04/2026',
    },
  ]);

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'ativos') {
      return order.status === 'active';
    }

    if (activeTab === 'concluidos') {
      return order.status === 'completed';
    }

    return true;
  });

  function handleCancelOrder(id: number) {
    const confirmCancel = confirm(
      'Deseja cancelar este pedido?'
    );

    if (!confirmCancel) return;

    setOrders((prev) =>
      prev.filter((order) => order.id !== id)
    );

    if (openOrder === id) {
      setOpenOrder(null);
    }
  }

  return (
    <>
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8">

          {/* HEADER */}
          <div className="mb-8">

            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Gerenciar Pedidos
            </h1>

            <p className="text-gray-600">
              Controle todos os pedidos ativos e concluídos
            </p>

          </div>

          {/* TABS */}
          <div className="flex gap-4 mb-6">

            <button
              type="button"
              onClick={() => setActiveTab('todos')}
              className={`px-5 py-2 rounded-xl font-bold transition ${
                activeTab === 'todos'
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Todos
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ativos')}
              className={`px-5 py-2 rounded-xl font-bold transition ${
                activeTab === 'ativos'
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Ativos
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('concluidos')}
              className={`px-5 py-2 rounded-xl font-bold transition ${
                activeTab === 'concluidos'
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Concluídos
            </button>

          </div>

          {/* LISTA */}
          <div className="space-y-4">

            {filteredOrders.map((order, index) => (

              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition p-4"
              >

                {/* TOPO */}
                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-4">

                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                        order.status === 'active'
                          ? 'bg-gradient-to-br from-yellow-400 to-yellow-500'
                          : 'bg-gradient-to-br from-green-400 to-green-500'
                      }`}
                    >
                      <ShoppingCart className="w-5 h-5 text-white" />
                    </div>

                    <div>

                      <h3 className="text-lg font-bold text-gray-900">
                        {order.product}
                      </h3>

                      <p className="text-sm text-gray-600">
                        {order.supplier}
                      </p>

                    </div>

                  </div>

                  <div
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      order.status === 'active'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {order.status === 'active' ? (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Ativo
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Concluído
                      </div>
                    )}
                  </div>

                </div>

                {/* BOTÕES */}
                <div className="mt-4 flex gap-3">

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      setOpenOrder(
                        openOrder === order.id
                          ? null
                          : order.id
                      )
                    }
                    className="px-5 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-bold py-2 rounded-xl shadow-lg"
                  >
                    {openOrder === order.id
                      ? 'Fechar'
                      : 'Ver Detalhes'}
                  </motion.button>

                  {order.status === 'active' && (
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        handleCancelOrder(order.id)
                      }
                      className="px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 rounded-xl"
                    >
                      Cancelar
                    </motion.button>
                  )}

                </div>

                {/* DETALHES */}
                {openOrder === order.id && (

                  <div className="mt-4 bg-gray-50 rounded-2xl p-4 space-y-4">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      <div className="bg-white rounded-xl p-4">

                        <div className="flex items-center gap-2 text-gray-600 mb-2">

                          <Package className="w-4 h-4" />

                          <span className="text-sm">
                            Quantidade Total
                          </span>

                        </div>

                        <p className="font-bold text-gray-900 text-lg">
                          {order.totalQuantity} un.
                        </p>

                      </div>

                      <div className="bg-white rounded-xl p-4">

                        <div className="flex items-center gap-2 text-gray-600 mb-2">

                          <Clock className="w-4 h-4" />

                          <span className="text-sm">
                            Data de Criação
                          </span>

                        </div>

                        <p className="font-bold text-gray-900 text-lg">
                          {order.createdAt}
                        </p>

                      </div>

                    </div>

                    {/* PARTICIPANTES */}
                    <div>

                      <div className="flex items-center gap-2 text-gray-600 mb-3">

                        <Users className="w-4 h-4" />

                        <span className="text-sm font-semibold">
                          Empresas Participantes
                        </span>

                      </div>

                      <div className="space-y-2">

                        {order.participants.map(
                          (participant, index) => (

                            <div
                              key={index}
                              className="bg-white rounded-xl px-4 py-3 font-semibold text-gray-800"
                            >
                              {participant}
                            </div>
                          )
                        )}

                      </div>

                    </div>

                  </div>
                )}

              </motion.div>
            ))}

          </div>
        </div>
      </div>
    </>
  );
}
import { useState } from 'react';
import { motion } from 'motion/react';
import {
  ShoppingCart,
  Users,
  CheckCircle,
  Clock,
} from 'lucide-react';

// IMPORT DO SIDEBAR
import SidebarNew from './SidebarNew';

interface DashboardNewProps {
  userType: 'mercado' | 'fornecedor';
}

export default function DashboardNew({
  userType,
}: DashboardNewProps) {

  const [activeCard, setActiveCard] = useState('');

  const stats = [
    {
      title: 'Pedidos Ativos',
      value: '8',
      icon: Clock,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },

    {
      title: 'Participando',
      value: '12',
      icon: Users,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },

    {
      title: 'Concluídos',
      value: '45',
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },

    {
      title: 'Total de Pedidos',
      value: '65',
      icon: ShoppingCart,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">

      {/* SIDEBAR */}
      <SidebarNew
        userType={userType}
        activePage="dashboard"
      />

      {/* CONTEÚDO */}
      <div className="flex-1 overflow-auto">

        <div className="p-8">

          {/* HEADER */}
          <div className="mb-8">

            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Dashboard
            </h1>

            <p className="text-gray-600">
              Visão geral da sua conta
            </p>

          </div>

          {/* CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

            {stats.map((stat, index) => (

              <motion.button
                key={stat.title}
                type="button"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveCard(stat.title)}
                className={`
                  bg-white rounded-2xl p-6 shadow-sm
                  hover:shadow-lg transition-all text-left border-2
                  cursor-pointer
                  ${
                    activeCard === stat.title
                      ? 'border-yellow-500'
                      : 'border-transparent'
                  }
                `}
              >

                <div className="flex items-center justify-between mb-4">

                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon
                      className={`w-6 h-6 ${stat.textColor}`}
                    />
                  </div>

                </div>

                <h3 className="text-gray-600 text-sm mb-1">
                  {stat.title}
                </h3>

                <p className="text-3xl font-bold text-gray-900">
                  {stat.value}
                </p>

              </motion.button>

            ))}
          </div>

          {/* PAINEL */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >

            {/* TELA INICIAL */}
            {activeCard === '' && (

              <div className="text-center py-12">

                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />

                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Dashboard Interativo
                </h2>

                <p className="text-gray-500">
                  Clique em um card acima para visualizar os detalhes.
                </p>

              </div>
            )}

            {/* PEDIDOS ATIVOS */}
            {activeCard === 'Pedidos Ativos' && (

              <div>

                <div className="flex items-center gap-4 mb-6">

                  <div className="w-14 h-14 rounded-2xl bg-yellow-100 flex items-center justify-center">
                    <Clock className="w-7 h-7 text-yellow-600" />
                  </div>

                  <div>

                    <h2 className="text-2xl font-bold text-gray-900">
                      Pedidos Ativos
                    </h2>

                    <p className="text-gray-500">
                      Pedidos em andamento
                    </p>

                  </div>

                </div>

                <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-6">

                  <p className="text-gray-700">
                    Aqui aparecerão os pedidos ativos reais do sistema.
                  </p>

                </div>

              </div>
            )}

            {/* PARTICIPANDO */}
            {activeCard === 'Participando' && (

              <div>

                <div className="flex items-center gap-4 mb-6">

                  <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                    <Users className="w-7 h-7 text-blue-600" />
                  </div>

                  <div>

                    <h2 className="text-2xl font-bold text-gray-900">
                      Participando
                    </h2>

                    <p className="text-gray-500">
                      Pedidos participando
                    </p>

                  </div>

                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">

                  <p className="text-gray-700">
                    Aqui aparecerão os grupos e pedidos em participação.
                  </p>

                </div>

              </div>
            )}

            {/* CONCLUÍDOS */}
            {activeCard === 'Concluídos' && (

              <div>

                <div className="flex items-center gap-4 mb-6">

                  <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-7 h-7 text-green-600" />
                  </div>

                  <div>

                    <h2 className="text-2xl font-bold text-gray-900">
                      Pedidos Concluídos
                    </h2>

                    <p className="text-gray-500">
                      Histórico de pedidos
                    </p>

                  </div>

                </div>

                <div className="bg-green-50 border border-green-100 rounded-2xl p-6">

                  <p className="text-gray-700">
                    Aqui ficará o histórico completo dos pedidos concluídos.
                  </p>

                </div>

              </div>
            )}

            {/* TOTAL */}
            {activeCard === 'Total de Pedidos' && (

              <div>

                <div className="flex items-center gap-4 mb-6">

                  <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center">
                    <ShoppingCart className="w-7 h-7 text-purple-600" />
                  </div>

                  <div>

                    <h2 className="text-2xl font-bold text-gray-900">
                      Total de Pedidos
                    </h2>

                    <p className="text-gray-500">
                      Todos os pedidos do sistema
                    </p>

                  </div>

                </div>

                <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6">

                  <p className="text-gray-700">
                    Aqui aparecerão todos os pedidos cadastrados.
                  </p>

                </div>

              </div>
            )}

          </motion.div>

        </div>
      </div>
    </div>
  );
}
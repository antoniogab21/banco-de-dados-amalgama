import { motion } from 'motion/react';
import { ShoppingCart, Clock, CheckCircle, Package, TrendingUp, DollarSign } from 'lucide-react';
import SidebarNew from './SidebarNew';

interface SupplierDashboardProps {
  userType: 'mercado' | 'fornecedor';
}

export default function SupplierDashboard({ userType }: SupplierDashboardProps) {
  const stats = [
    {
      title: 'Pedidos Pendentes',
      value: '8',
      icon: Clock,
      color: 'from-yellow-400 to-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      change: '+3 hoje',
    },
    {
      title: 'Pedidos Confirmados',
      value: '12',
      icon: CheckCircle,
      color: 'from-green-400 to-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      change: '+5 esta semana',
    },
    {
      title: 'Total de Itens',
      value: '430',
      icon: Package,
      color: 'from-blue-400 to-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      change: 'Em processamento',
    },
    {
      title: 'Receita do Mês',
      value: 'R$ 45.2k',
      icon: DollarSign,
      color: 'from-purple-400 to-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      change: '+23% vs mês anterior',
    },
  ];

  const recentOrders = [
    {
      id: 1,
      product: 'Arroz Tipo 1 - 5kg',
      quantity: 150,
      value: 3435.00,
      companies: 2,
      status: 'pending',
      time: 'Há 2 horas',
    },
    {
      id: 2,
      product: 'Feijão Preto - 1kg',
      quantity: 200,
      value: 1380.00,
      companies: 3,
      status: 'pending',
      time: 'Há 3 horas',
    },
    {
      id: 3,
      product: 'Óleo de Soja - 900ml',
      quantity: 80,
      value: 472.00,
      companies: 2,
      status: 'confirmed',
      time: 'Há 1 dia',
    },
  ];

  return (
    <>
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Painel do Fornecedor</h1>
            <p className="text-gray-600">Visão geral dos pedidos recebidos</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.change}</p>
              </motion.div>
            ))}
          </div>

          {/* Recent Orders */}
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Pedidos Recentes</h2>
                <button className="text-yellow-600 hover:text-yellow-700 font-semibold text-sm">
                  Ver todos
                </button>
              </div>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="p-4 rounded-xl hover:bg-gray-50 transition border border-gray-100">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{order.product}</p>
                        <p className="text-sm text-gray-500">{order.companies} empresas • {order.time}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {order.status === 'pending' ? 'Pendente' : 'Confirmado'}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm text-gray-600">{order.quantity} unidades</span>
                      <span className="font-bold text-yellow-600">R$ {order.value.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Performance Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Produtos Mais Vendidos</h2>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="space-y-4">
                {[
                  { name: 'Arroz Tipo 1 - 5kg', quantity: 450, percentage: 85 },
                  { name: 'Feijão Preto - 1kg', quantity: 380, percentage: 72 },
                  { name: 'Óleo de Soja - 900ml', quantity: 290, percentage: 55 },
                  { name: 'Açúcar Cristal - 1kg', quantity: 210, percentage: 40 },
                ].map((product, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{product.name}</span>
                      <span className="text-sm text-gray-600">{product.quantity} un.</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full"
                        style={{ width: `${product.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Ações Rápidas</h3>
                <p className="opacity-90">Gerencie seus produtos e pedidos</p>
              </div>
              <div className="flex gap-3">
                <button className="bg-white text-yellow-600 px-6 py-3 rounded-xl font-semibold hover:bg-yellow-50 transition">
                  Adicionar Produto
                </button>
                <button className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition">
                  Ver Estoque
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

import { motion } from 'motion/react';
import { CreditCard, QrCode, History, CheckCircle, Clock } from 'lucide-react';
import SidebarNew from './SidebarNew';

interface PaymentsPageProps {
  userType: 'mercado' | 'fornecedor';
}

export default function PaymentsPage({ userType }: PaymentsPageProps) {
  const paymentHistory = [
    { id: 1, description: 'Pedido #1234 - Arroz Tipo 1', amount: 1145.00, status: 'completed', date: '20/04/2026' },
    { id: 2, description: 'Pedido #1235 - Feijão Preto', amount: 690.00, status: 'completed', date: '19/04/2026' },
    { id: 3, description: 'Pedido #1236 - Óleo de Soja', amount: 472.00, status: 'pending', date: '18/04/2026' },
  ];

  return (
    <>
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Pagamentos</h1>
            <p className="text-gray-600">Gerencie seus métodos de pagamento e histórico</p>
          </div>

          {/* Payment Methods */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-yellow-50">
                  <QrCode className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">PIX</h3>
                  <p className="text-sm text-gray-500">Método principal</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-2">Chave PIX</p>
                <p className="font-mono font-semibold text-gray-900">contato@minhaempresa.com</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-blue-50">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Cartão de Crédito</h3>
                  <p className="text-sm text-gray-500">Alternativo</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-2">Cartão cadastrado</p>
                <p className="font-mono font-semibold text-gray-900">**** **** **** 4242</p>
              </div>
            </motion.div>
          </div>

          {/* Payment History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-purple-50">
                <History className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-xl">Histórico de Pagamentos</h3>
                <p className="text-sm text-gray-500">Últimas transações</p>
              </div>
            </div>

            <div className="space-y-3">
              {paymentHistory.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      payment.status === 'completed' ? 'bg-green-50' : 'bg-yellow-50'
                    }`}>
                      {payment.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{payment.description}</p>
                      <p className="text-sm text-gray-500">{payment.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-lg">
                      R$ {payment.amount.toFixed(2)}
                    </p>
                    <p className={`text-sm font-semibold ${
                      payment.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {payment.status === 'completed' ? 'Pago' : 'Pendente'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

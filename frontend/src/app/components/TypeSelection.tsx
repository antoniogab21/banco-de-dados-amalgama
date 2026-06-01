import { motion } from 'motion/react';
import { Store, Truck } from 'lucide-react';

interface TypeSelectionProps {
  onSelectType: (type: 'mercado' | 'fornecedor') => void;
}

export default function TypeSelection({ onSelectType }: TypeSelectionProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Bem-vindo!</h1>
          <p className="text-xl text-gray-600">Selecione o tipo da sua conta</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.button
            whileHover={{ scale: 1.03, y: -8 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectType('mercado')}
            className="bg-white rounded-3xl p-10 shadow-lg hover:shadow-2xl transition text-center group"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-3xl mb-6 group-hover:scale-110 transition">
              <Store className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Mercado</h2>
            <p className="text-gray-600 text-lg">
              Participe de pedidos coletivos e economize nas compras
            </p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03, y: -8 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectType('fornecedor')}
     className="bg-white rounded-3xl p-10 shadow-lg hover:shadow-2xl transition text-center group"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-700 to-gray-800 rounded-3xl mb-6 group-hover:scale-110 transition">
              <Truck className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Fornecedor</h2>
            <p className="text-gray-600 text-lg">
              Receba pedidos consolidados de múltiplos mercados
            </p>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

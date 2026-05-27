import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Package, ShoppingCart, FileText } from 'lucide-react';

interface CreateOrderModalNewProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateOrder: (data: { productName: string; supplier: string; quantity: number }) => void;
}

export default function CreateOrderModalNew({ isOpen, onClose, onCreateOrder }: CreateOrderModalNewProps) {
  const [productName, setProductName] = useState('');
  const [supplier, setSupplier] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  const suppliers = [
    'Distribuidora São Paulo',
    'Atacado Premium',
    'Distribuição Nacional',
    'Fornecedor Regional',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (productName && supplier && quantity) {
      onCreateOrder({
        productName,
        supplier,
        quantity: parseInt(quantity),
      });
      setProductName('');
      setSupplier('');
      setQuantity('');
      setNotes('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-50 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Criar Pedido</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Produto
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Package className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 outline-none transition"
                    placeholder="Ex: Arroz Tipo 1 - 5kg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fornecedor
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <ShoppingCart className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 outline-none transition bg-white"
                    required
                  >
                    <option value="">Selecione um fornecedor</option>
                    {suppliers.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantidade
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 outline-none transition"
                  placeholder="Ex: 50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Observações (opcional)
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-0 pl-4 pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 outline-none transition resize-none"
                    placeholder="Adicione informações adicionais..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="bg-yellow-50 rounded-xl p-4">
                <p className="text-sm text-yellow-800">
                  Este pedido será compartilhado no chat. Outras empresas poderão participar e aumentar a quantidade.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-bold py-4 rounded-xl shadow-lg"
              >
                Criar Pedido
              </motion.button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

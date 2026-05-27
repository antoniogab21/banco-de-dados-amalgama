import { motion } from 'motion/react';
import { Package, Star, Plus } from 'lucide-react';
import SidebarNew from './SidebarNew';

interface ProductsPageProps {
  userType: 'mercado' | 'fornecedor';
}

export default function ProductsPage({ userType }: ProductsPageProps) {
  const products = [
    {
      id: 1,
      name: 'Arroz Tipo 1 - 5kg',
      description: 'Arroz branco tipo 1, pacote de 5kg',
      price: 22.90,
      supplier: 'Distribuidora São Paulo',
      image: '🌾',
    },
    {
      id: 2,
      name: 'Feijão Preto - 1kg',
      description: 'Feijão preto premium',
      price: 6.90,
      supplier: 'Atacado Premium',
      image: '🫘',
    },
    {
      id: 3,
      name: 'Óleo de Soja - 900ml',
      description: 'Óleo de soja refinado',
      price: 5.90,
      supplier: 'Distribuição Nacional',
      image: '🧴',
    },
    {
      id: 4,
      name: 'Açúcar Cristal - 1kg',
      description: 'Açúcar cristal puro',
      price: 3.30,
      supplier: 'Fornecedor Regional',
      image: '🍬',
    },
    {
      id: 5,
      name: 'Café Torrado - 500g',
      description: 'Café torrado e moído',
      price: 14.90,
      supplier: 'Distribuidora Elite',
      image: '☕',
    },
    {
      id: 6,
      name: 'Macarrão Espaguete - 500g',
      description: 'Macarrão espaguete',
      price: 3.60,
      supplier: 'Atacado Central',
      image: '🍝',
    },
  ];

  return (
    <>
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Produtos</h1>
              <p className="text-gray-600">Catálogo de produtos disponíveis</p>
            </div>
            {userType === 'fornecedor' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Adicionar Produto
              </motion.button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-5xl">{product.image}</div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-900 text-lg mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{product.description}</p>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Package className="w-4 h-4" />
                    <span>{product.supplier}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Preço</p>
                      <p className="text-2xl font-bold text-gray-900">
                        R$ {product.price.toFixed(2)}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg"
                    >
                      Ver Detalhes
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

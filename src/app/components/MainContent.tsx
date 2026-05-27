import { TrendingDown, Package, Star } from 'lucide-react';

export default function MainContent() {
  const promotions = [
    {
      id: 1,
      supplier: 'Distribuidora São Paulo',
      product: 'Arroz Tipo 1 - 5kg',
      originalPrice: 28.50,
      promoPrice: 22.90,
      discount: 20,
      minQuantity: 50,
      image: '🌾',
    },
    {
      id: 2,
      supplier: 'Atacado Premium',
      product: 'Feijão Preto - 1kg',
      originalPrice: 8.90,
      promoPrice: 6.90,
      discount: 22,
      minQuantity: 100,
      image: '🫘',
    },
    {
      id: 3,
      supplier: 'Distribuição Nacional',
      product: 'Óleo de Soja - 900ml',
      originalPrice: 7.50,
      promoPrice: 5.90,
      discount: 21,
      minQuantity: 80,
      image: '🧴',
    },
    {
      id: 4,
      supplier: 'Fornecedor Regional',
      product: 'Açúcar Cristal - 1kg',
      originalPrice: 4.20,
      promoPrice: 3.30,
      discount: 21,
      minQuantity: 120,
      image: '🍬',
    },
    {
      id: 5,
      supplier: 'Distribuidora Elite',
      product: 'Café Torrado - 500g',
      originalPrice: 18.90,
      promoPrice: 14.90,
      discount: 21,
      minQuantity: 60,
      image: '☕',
    },
    {
      id: 6,
      supplier: 'Atacado Central',
      product: 'Macarrão Espaguete - 500g',
      originalPrice: 4.50,
      promoPrice: 3.60,
      discount: 20,
      minQuantity: 150,
      image: '🍝',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ofertas do Dia</h1>
        <p className="text-gray-600">
          Aproveite as melhores promoções de nossos fornecedores parceiros
        </p>
      </div>

      {/* Featured Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-6 h-6" />
              <span className="font-semibold">Destaque da Semana</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Até 30% de desconto em grãos</h2>
            <p className="text-blue-100">Compre em grupo e economize ainda mais</p>
          </div>
          <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">
            Ver Ofertas
          </button>
        </div>
      </div>

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promotions.map((promo) => (
          <div
            key={promo.id}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 overflow-hidden group"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="text-5xl">{promo.image}</div>
                <div className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  -{promo.discount}%
                </div>
              </div>

              <div className="mb-3">
                <div className="flex items-center gap-1 text-yellow-500 mb-2">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{promo.product}</h3>
                <p className="text-sm text-gray-500">{promo.supplier}</p>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl font-bold text-blue-600">
                  R$ {promo.promoPrice.toFixed(2)}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  R$ {promo.originalPrice.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Package className="w-4 h-4" />
                <span>Mínimo: {promo.minQuantity} unidades</span>
              </div>

              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition">
                Adicionar ao Pedido
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

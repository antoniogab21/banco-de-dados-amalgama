import { useEffect, useState } from 'react';
import { TrendingDown, Package, Star } from 'lucide-react';

export default function MainContent() {

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    setDarkMode(savedTheme === 'true');
  }, []);

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
    <div
      className={`p-8 min-h-screen ${
        darkMode
          ? 'bg-black'
          : 'bg-gray-50'
      }`}
    >
      <div className="mb-8">

        <h1
          className={`text-3xl font-bold mb-2 ${
            darkMode
              ? 'text-white'
              : 'text-gray-900'
          }`}
        >
          Ofertas do Dia
        </h1>

        <p
          className={
            darkMode
              ? 'text-gray-400'
              : 'text-gray-600'
          }
        >
          Aproveite as melhores promoções de nossos fornecedores parceiros
        </p>

      </div>

      {/* Banner */}

      <div
        className={`rounded-2xl p-8 mb-8 text-white ${
          darkMode
            ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
            : 'bg-gradient-to-r from-blue-600 to-purple-600'
        }`}
      >

        <div className="flex items-center justify-between">

          <div>

            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-6 h-6" />
              <span className="font-semibold">
                Destaque da Semana
              </span>
            </div>

            <h2 className="text-2xl font-bold mb-2">
              Até 30% de desconto em grãos
            </h2>

            <p
              className={
                darkMode
                  ? 'text-yellow-100'
                  : 'text-blue-100'
              }
            >
              Compre em grupo e economize ainda mais
            </p>

          </div>

          <button
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              darkMode
                ? 'bg-black text-yellow-400 hover:bg-gray-900'
                : 'bg-white text-blue-600 hover:bg-blue-50'
            }`}
          >
            Ver Ofertas
          </button>

        </div>

      </div>

      {/* Produtos */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {promotions.map((promo) => (

          <div
            key={promo.id}
            className={`
              rounded-xl shadow-sm hover:shadow-md transition
              overflow-hidden group border
              ${
                darkMode
                  ? 'bg-gray-950 border-gray-800'
                  : 'bg-white border-gray-100'
              }
            `}
          >

            <div className="p-6">

              <div className="flex items-start justify-between mb-4">

                <div className="text-5xl">
                  {promo.image}
                </div>

                <div className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  -{promo.discount}%
                </div>

              </div>

              <div className="mb-3">

                <div
                  className={`flex items-center gap-1 mb-2 ${
                    darkMode
                      ? 'text-yellow-400'
                      : 'text-yellow-500'
                  }`}
                >
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>

                <h3
                  className={`font-semibold mb-1 ${
                    darkMode
                      ? 'text-white'
                      : 'text-gray-900'
                  }`}
                >
                  {promo.product}
                </h3>

                <p
                  className={
                    darkMode
                      ? 'text-sm text-gray-400'
                      : 'text-sm text-gray-500'
                  }
                >
                  {promo.supplier}
                </p>

              </div>

              <div className="flex items-center gap-2 mb-4">

                <span
                  className={`text-2xl font-bold ${
                    darkMode
                      ? 'text-yellow-400'
                      : 'text-blue-600'
                  }`}
                >
                  R$ {promo.promoPrice.toFixed(2)}
                </span>

                <span
                  className={
                    darkMode
                      ? 'text-sm text-gray-500 line-through'
                      : 'text-sm text-gray-400 line-through'
                  }
                >
                  R$ {promo.originalPrice.toFixed(2)}
                </span>

              </div>

              <div
                className={`flex items-center gap-2 text-sm mb-4 ${
                  darkMode
                    ? 'text-gray-400'
                    : 'text-gray-600'
                }`}
              >

                <Package className="w-4 h-4" />

                <span>
                  Mínimo: {promo.minQuantity} unidades
                </span>

              </div>

              <button
                className={`w-full text-white font-semibold py-3 rounded-lg transition ${
                  darkMode
                    ? 'bg-yellow-500 hover:bg-yellow-600'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Adicionar ao Pedido
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}
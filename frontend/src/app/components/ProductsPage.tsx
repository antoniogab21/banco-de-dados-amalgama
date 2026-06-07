import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Package,
  Star,
  ShoppingCart,
  X,
  CheckCircle,
  Edit2,
  ExternalLink,
} from 'lucide-react';

interface ProductsPageProps {
  userType: 'mercado' | 'fornecedor';
  onNavigate?: (page: string, groupId?: string) => void;
}

interface Product {
  id: number;
  fornecedor_id: number;
  fornecedor_nome?: string;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  imagem: string;
  ativo: boolean;
}

interface PedidoItem {
  id: number;
  produto_id: number;
  produto_nome?: string | null;
  produto_imagem?: string | null;
  quantidade: number;
  preco_unitario: number;
}

interface MinhaParticipacao {
  id: number;
  quantidade: number;
}

interface Pedido {
  id: number;
  status: string;
  is_lider?: boolean;
  minha_participacao?: MinhaParticipacao | null;
  itens: PedidoItem[];
}

export default function ProductsPage({
  userType,
  onNavigate,
}: ProductsPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Pedido[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [selectedPedido, setSelectedPedido] =
    useState<Pedido | null>(null);

  const [quantity, setQuantity] = useState('1');

  const [creatingOrder, setCreatingOrder] =
    useState(false);

  async function loadProductsAndOrders() {
    try {
      setLoading(true);
      setError('');

      const [productsResponse, ordersResponse] =
        await Promise.all([
          fetch('/api/produtos', {
            method: 'GET',
            credentials: 'include',
          }),
          fetch('/api/pedidos', {
            method: 'GET',
            credentials: 'include',
          }),
        ]);

      const productsData = await productsResponse.json();
      const ordersData = await ordersResponse.json();

      if (!productsResponse.ok) {
        setError(
          productsData.error ||
            'Erro ao carregar produtos'
        );
        return;
      }

      if (!ordersResponse.ok) {
        setError(
          ordersData.error ||
            'Erro ao carregar pedidos'
        );
        return;
      }

      setProducts(productsData);
      setOrders(ordersData);
    } catch (err) {
      setError(
        'Não foi possível carregar os produtos.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProductsAndOrders();
  }, []);

  function getActiveOrderForProduct(productId: number) {
    return orders.find((order) => {
      if (order.status !== 'ativo') {
        return false;
      }

      const hasProduct = order.itens?.some(
        (item) => item.produto_id === productId
      );

      const hasMyParticipation = Boolean(
        order.minha_participacao
      );

      return hasProduct && hasMyParticipation;
    });
  }

  function openCreateOrEditOrder(
    product: Product,
    pedido?: Pedido
  ) {
    if (product.estoque <= 0 && !pedido) {
      alert('Este produto está sem estoque disponível.');
      return;
    }

    setSelectedProduct(product);
    setSelectedPedido(pedido || null);

    if (pedido?.minha_participacao?.quantidade) {
      setQuantity(String(pedido.minha_participacao.quantidade));
    } else {
      setQuantity('1');
    }
  }

  function closeCreateOrder() {
    setSelectedProduct(null);
    setSelectedPedido(null);
    setQuantity('1');
    setCreatingOrder(false);
  }

  async function handleCreateOrEditOrder() {
    if (!selectedProduct) return;

    const quantidade = Number(quantity);

    if (!quantidade || quantidade <= 0) {
      alert('Digite uma quantidade válida.');
      return;
    }

    if (!selectedPedido && quantidade > selectedProduct.estoque) {
      alert(
        `Quantidade maior que o estoque disponível. Estoque atual: ${selectedProduct.estoque} un.`
      );
      return;
    }

    try {
      setCreatingOrder(true);

      const url = selectedPedido
        ? `/api/pedidos/${selectedPedido.id}/participar`
        : '/api/pedidos';

      const body = selectedPedido
        ? {
            quantidade,
          }
        : {
            produto_id: selectedProduct.id,
            quantidade,
            grupo_id: 1,
            titulo: selectedProduct.nome,
          };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            data.details ||
            'Erro ao salvar pedido'
        );
        return;
      }

      alert(
        selectedPedido
          ? 'Quantidade atualizada com sucesso!'
          : data.message || 'Pedido criado com sucesso!'
      );

      closeCreateOrder();
      await loadProductsAndOrders();
    } catch (err) {
      alert(
        'Não foi possível conectar ao backend.'
      );
    } finally {
      setCreatingOrder(false);
    }
  }

  function goToManageOrders() {
  onNavigate?.('feed');
}

  return (
    <>
      <div className="flex-1 overflow-auto min-h-screen bg-gray-50 dark:bg-black transition-colors">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Produtos
              </h1>

              <p className="text-gray-600 dark:text-gray-400">
                Catálogo de produtos disponíveis
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 p-4 text-sm font-semibold text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {loading && (
            <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center text-gray-600 dark:text-gray-400">
              Carregando produtos...
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />

              <p className="font-bold text-gray-900 dark:text-white">
                Nenhum produto disponível
              </p>

              <p className="text-gray-500 dark:text-gray-400">
                Assim que fornecedores cadastrarem produtos, eles aparecerão aqui.
              </p>
            </div>
          )}

          {!loading && products.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, index) => {
                const activeOrder =
                  getActiveOrderForProduct(product.id);

                const outOfStock = product.estoque <= 0;
                const isLider = Boolean(activeOrder?.is_lider);
                const hasParticipation = Boolean(
                  activeOrder?.minha_participacao
                );

                return (
                  <motion.div
                    key={product.id}
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: index * 0.05,
                    }}
                    className="
                      bg-white dark:bg-gray-950
                      border border-gray-100 dark:border-gray-800
                      rounded-2xl shadow-sm hover:shadow-md
                      transition overflow-hidden group
                    "
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-5xl">
                          {product.imagem || '📦'}
                        </div>

                        <div className="flex items-center gap-1 text-yellow-500 dark:text-yellow-400">
                          <Star className="w-4 h-4 fill-current" />
                          <Star className="w-4 h-4 fill-current" />
                          <Star className="w-4 h-4 fill-current" />
                          <Star className="w-4 h-4 fill-current" />
                          <Star className="w-4 h-4 fill-current" />
                        </div>
                      </div>

                      <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">
                        {product.nome}
                      </h3>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {product.descricao || 'Sem descrição'}
                      </p>

                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <Package className="w-4 h-4" />

                        <span>
                          {product.fornecedor_nome ||
                            `Fornecedor #${product.fornecedor_id}`}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Preço
                          </p>

                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            R$ {Number(product.preco).toFixed(2)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Estoque
                          </p>

                          <p
                            className={`font-bold ${
                              outOfStock
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            {product.estoque} un.
                          </p>
                        </div>
                      </div>

                      {activeOrder && (
                        <div
                          className={`
                            mb-4 rounded-xl border p-3 text-sm font-semibold
                            ${
                              isLider
                                ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300'
                                : 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900 text-green-700 dark:text-green-300'
                            }
                          `}
                        >
                          {isLider
                            ? `Você já criou um pedido ativo deste produto com ${activeOrder.minha_participacao?.quantidade || 0} un.`
                            : `Você já participa de um pedido ativo deste produto com ${activeOrder.minha_participacao?.quantidade || 0} un.`}
                        </div>
                      )}

                      {activeOrder && hasParticipation ? (
                        <div className="space-y-3">
                          <motion.button
                            whileHover={{
                              scale: 1.02,
                            }}
                            whileTap={{
                              scale: 0.98,
                            }}
                            type="button"
                            onClick={() =>
                              openCreateOrEditOrder(
                                product,
                                activeOrder
                              )
                            }
                            className="
                              w-full
                              flex items-center justify-center gap-2
                              bg-gradient-to-r from-yellow-400 to-yellow-500
                              dark:from-blue-800 dark:to-blue-950
                              hover:from-yellow-500 hover:to-yellow-600
                              dark:hover:from-blue-700 dark:hover:to-blue-900
                              text-white font-bold py-3 rounded-xl shadow-lg
                              transition
                            "
                          >
                            <Edit2 className="w-5 h-5" />
                            {isLider
                              ? 'Editar quantidade'
                              : 'Editar participação'}
                          </motion.button>

                          <button
                            type="button"
                            onClick={goToManageOrders}
                            className="
                              w-full
                              flex items-center justify-center gap-2
                              bg-gray-100 dark:bg-gray-900
                              text-gray-700 dark:text-gray-300
                              font-bold py-3 rounded-xl
                              border border-gray-200 dark:border-gray-800
                              hover:bg-gray-200 dark:hover:bg-gray-800
                              transition
                            "
                          >
                            <ExternalLink className="w-5 h-5" />
                            Ver em Gerenciar Pedidos
                          </button>
                        </div>
                      ) : outOfStock ? (
                        <div
                          className="
                            w-full
                            flex items-center justify-center gap-2
                            bg-red-100 dark:bg-red-950/40
                            text-red-700 dark:text-red-300
                            font-bold py-3 rounded-xl
                            border border-red-200 dark:border-red-900
                          "
                        >
                          Sem estoque
                        </div>
                      ) : (
                        <motion.button
                          whileHover={{
                            scale: 1.02,
                          }}
                          whileTap={{
                            scale: 0.98,
                          }}
                          type="button"
                          onClick={() =>
                            openCreateOrEditOrder(product)
                          }
                          className="
                            w-full
                            flex items-center justify-center gap-2
                            bg-gradient-to-r from-yellow-400 to-yellow-500
                            dark:from-blue-800 dark:to-blue-950
                            hover:from-yellow-500 hover:to-yellow-600
                            dark:hover:from-blue-700 dark:hover:to-blue-900
                            text-white font-bold py-3 rounded-xl shadow-lg
                            transition
                          "
                        >
                          <ShoppingCart className="w-5 h-5" />
                          Criar Pedido
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div
            className="
              bg-white dark:bg-gray-950
              border border-gray-200 dark:border-gray-800
              rounded-3xl p-8 w-full max-w-lg
              text-gray-900 dark:text-white
              shadow-2xl transition-colors duration-300
            "
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedPedido
                  ? 'Editar Quantidade'
                  : 'Criar Pedido'}
              </h2>

              <button
                onClick={closeCreateOrder}
                type="button"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl transition"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="mb-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5">
              <div className="flex items-center gap-4">
                <div className="text-5xl">
                  {selectedProduct.imagem || '📦'}
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {selectedProduct.nome}
                  </h3>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedProduct.fornecedor_nome ||
                      `Fornecedor #${selectedProduct.fornecedor_id}`}
                  </p>

                  <p className="mt-1 font-bold text-yellow-600 dark:text-blue-300">
                    R$ {Number(selectedProduct.preco).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Quantidade
                </label>

                <input
                  type="number"
                  min="1"
                  max={selectedProduct.estoque}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(e.target.value)
                  }
                  className="
                    w-full border border-gray-300 dark:border-gray-700
                    bg-white dark:bg-gray-900
                    text-gray-900 dark:text-white
                    rounded-xl px-4 py-3 outline-none
                    focus:border-yellow-500 dark:focus:border-blue-700
                    focus:ring-4 focus:ring-yellow-100 dark:focus:ring-blue-950
                    transition
                  "
                  placeholder="Digite a quantidade"
                />

                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Estoque disponível: {selectedProduct.estoque} un.
                </p>
              </div>

              <div className="rounded-xl bg-yellow-50 dark:bg-blue-950 border border-yellow-100 dark:border-blue-900 p-4">
                <p className="text-sm text-yellow-800 dark:text-blue-300">
                  {selectedPedido
                    ? 'Essa alteração atualizará a quantidade da sua participação neste pedido.'
                    : 'Este pedido será criado como pedido coletivo e poderá aparecer na área de Gerenciar Pedidos.'}
                </p>
              </div>

              <button
                type="button"
                disabled={creatingOrder}
                onClick={handleCreateOrEditOrder}
                className="
                  w-full
                  bg-gradient-to-r from-yellow-400 to-yellow-500
                  dark:from-blue-800 dark:to-blue-950
                  hover:from-yellow-500 hover:to-yellow-600
                  dark:hover:from-blue-700 dark:hover:to-blue-900
                  text-white font-bold py-3 rounded-xl
                  transition shadow-lg
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
              >
                {creatingOrder
                  ? 'Salvando...'
                  : selectedPedido
                    ? 'Salvar Alteração'
                    : 'Confirmar Pedido'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
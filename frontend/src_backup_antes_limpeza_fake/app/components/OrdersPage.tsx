import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  ShoppingCart,
  Users,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';

interface OrdersPageProps {
  userType: 'mercado' | 'fornecedor';
}

interface OrderItem {
  id: number;
  produto_id: number;
  produto_nome?: string;
  produto_imagem?: string;
  quantidade: number;
  preco_unitario: number;
}

interface OrderParticipant {
  id: number;
  empresa_id: number;
  empresa_nome?: string;
  quantidade: number;
}

interface Order {
  id: number;
  grupo_id: number;
  grupo_nome?: string;
  fornecedor_id: number;
  fornecedor_nome?: string;
  empresa_criadora_id: number;
  empresa_criadora_nome?: string;
  titulo: string;
  status: 'ativo' | 'cancelado' | 'finalizado';
  criado_em?: string;
  total_quantidade: number;
  itens: OrderItem[];
  participantes: OrderParticipant[];
}

export default function OrdersPage({
  userType,
}: OrdersPageProps) {
  const [openOrder, setOpenOrder] =
    useState<number | null>(null);

  const [activeTab, setActiveTab] = useState<
    'todos' | 'ativos' | 'concluidos' | 'cancelados'
  >('todos');

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadOrders() {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/pedidos', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            data.details ||
            'Erro ao carregar pedidos'
        );
        return;
      }

      setOrders(data);
    } catch (err) {
      setError(
        'Não foi possível carregar os pedidos.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'ativos') {
      return order.status === 'ativo';
    }

    if (activeTab === 'concluidos') {
      return order.status === 'finalizado';
    }

    if (activeTab === 'cancelados') {
      return order.status === 'cancelado';
    }

    return true;
  });

  async function handleCancelOrder(id: number) {
    const confirmCancel = confirm(
      'Deseja cancelar este pedido?'
    );

    if (!confirmCancel) return;

    try {
      const response = await fetch(
        `/api/pedidos/${id}/cancelar`,
        {
          method: 'POST',
          credentials: 'include',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            data.details ||
            'Erro ao cancelar pedido'
        );
        return;
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id === id
            ? data.pedido
            : order
        )
      );
    } catch (err) {
      alert(
        'Não foi possível conectar ao backend.'
      );
    }
  }

  function formatDate(value?: string) {
    if (!value) return 'Data não informada';

    try {
      return new Date(value).toLocaleDateString(
        'pt-BR',
        {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }
      );
    } catch {
      return value;
    }
  }

  function getStatusLabel(status: Order['status']) {
    if (status === 'ativo') return 'Ativo';
    if (status === 'finalizado') return 'Concluído';
    return 'Cancelado';
  }

  function getStatusIcon(status: Order['status']) {
    if (status === 'ativo') {
      return <Clock className="w-4 h-4" />;
    }

    if (status === 'finalizado') {
      return <CheckCircle className="w-4 h-4" />;
    }

    return <XCircle className="w-4 h-4" />;
  }

  function getStatusClass(status: Order['status']) {
    if (status === 'ativo') {
      return 'bg-yellow-100 text-yellow-700 dark:bg-blue-950 dark:text-blue-300';
    }

    if (status === 'finalizado') {
      return 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300';
    }

    return 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300';
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-black min-h-screen transition-colors duration-300">
      <div className="p-8">
        {/* HEADER */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Gerenciar Pedidos
            </h1>

            <p className="text-gray-600 dark:text-gray-400">
              Controle todos os pedidos ativos e concluídos
            </p>
          </div>

          <button
            type="button"
            onClick={loadOrders}
            className="
              flex items-center gap-2
              px-5 py-3 rounded-xl
              bg-white dark:bg-gray-950
              border border-gray-200 dark:border-gray-800
              text-gray-700 dark:text-gray-300
              hover:bg-gray-100 dark:hover:bg-gray-900
              font-semibold transition
            "
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </button>
        </div>

        {/* TABS */}
        <div className="flex flex-wrap gap-4 mb-6">
          {[
            {
              id: 'todos',
              label: 'Todos',
            },
            {
              id: 'ativos',
              label: 'Ativos',
            },
            {
              id: 'concluidos',
              label: 'Concluídos',
            },
            {
              id: 'cancelados',
              label: 'Cancelados',
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                setActiveTab(tab.id as typeof activeTab)
              }
              className={`px-5 py-2 rounded-xl font-bold transition ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 dark:from-blue-800 dark:to-blue-950 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ERRO */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 p-4 text-sm font-semibold text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center text-gray-600 dark:text-gray-400">
            Carregando pedidos...
          </div>
        )}

        {/* VAZIO */}
        {!loading && filteredOrders.length === 0 && (
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center">
            <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-400" />

            <p className="font-bold text-gray-900 dark:text-white">
              Nenhum pedido encontrado
            </p>

            <p className="text-gray-500 dark:text-gray-400">
              Os pedidos criados em Produtos aparecerão aqui.
            </p>
          </div>
        )}

        {/* LISTA */}
        {!loading && filteredOrders.length > 0 && (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => {
              const firstItem = order.itens?.[0];

              return (
                <motion.div
                  key={order.id}
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
                    border border-gray-200 dark:border-gray-800
                    rounded-2xl shadow-sm hover:shadow-md
                    transition p-4
                  "
                >
                  {/* TOPO */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                          order.status === 'ativo'
                            ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 dark:from-blue-800 dark:to-blue-950'
                            : order.status === 'finalizado'
                              ? 'bg-gradient-to-br from-green-400 to-green-500'
                              : 'bg-gradient-to-br from-red-400 to-red-500'
                        }`}
                      >
                        <ShoppingCart className="w-5 h-5 text-white" />
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {order.titulo ||
                            firstItem?.produto_nome ||
                            `Pedido #${order.id}`}
                        </h3>

                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {order.fornecedor_nome ||
                            `Fornecedor #${order.fornecedor_id}`}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusClass(order.status)}`}
                    >
                      <div className="flex items-center gap-1">
                        {getStatusIcon(order.status)}
                        {getStatusLabel(order.status)}
                      </div>
                    </div>
                  </div>

                  {/* RESUMO */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Quantidade Total
                      </p>

                      <p className="font-bold text-gray-900 dark:text-white">
                        {order.total_quantidade || 0} un.
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Grupo
                      </p>

                      <p className="font-bold text-gray-900 dark:text-white">
                        {order.grupo_nome ||
                          `Grupo #${order.grupo_id}`}
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Criado em
                      </p>

                      <p className="font-bold text-gray-900 dark:text-white">
                        {formatDate(order.criado_em)}
                      </p>
                    </div>
                  </div>

                  {/* BOTÕES */}
                  <div className="mt-4 flex flex-wrap gap-3">
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
                      className="
                        px-5
                        bg-gradient-to-r from-yellow-400 to-yellow-500
                        dark:from-blue-800 dark:to-blue-950
                        hover:from-yellow-500 hover:to-yellow-600
                        dark:hover:from-blue-700 dark:hover:to-blue-900
                        text-white font-bold py-2 rounded-xl shadow-lg
                      "
                    >
                      {openOrder === order.id
                        ? 'Fechar'
                        : 'Ver Detalhes'}
                    </motion.button>

                    {order.status === 'ativo' &&
                      userType === 'mercado' && (
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            handleCancelOrder(order.id)
                          }
                          className="
                            px-5
                            bg-gray-100 dark:bg-gray-900
                            hover:bg-gray-200 dark:hover:bg-gray-800
                            text-gray-700 dark:text-gray-300
                            font-semibold py-2 rounded-xl
                            border border-gray-200 dark:border-gray-800
                          "
                        >
                          Cancelar
                        </motion.button>
                      )}
                  </div>

                  {/* DETALHES */}
                  {openOrder === order.id && (
                    <div className="mt-4 bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 space-y-4">
                      {/* ITENS */}
                      <div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-3">
                          <Package className="w-4 h-4" />

                          <span className="text-sm font-semibold">
                            Itens do Pedido
                          </span>
                        </div>

                        <div className="space-y-2">
                          {order.itens && order.itens.length > 0 ? (
                            order.itens.map((item) => (
                              <div
                                key={item.id}
                                className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3 flex items-center justify-between gap-4"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-3xl">
                                    {item.produto_imagem || '📦'}
                                  </span>

                                  <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                      {item.produto_nome ||
                                        `Produto #${item.produto_id}`}
                                    </p>

                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      R$ {Number(item.preco_unitario).toFixed(2)} cada
                                    </p>
                                  </div>
                                </div>

                                <span className="font-bold text-yellow-600 dark:text-blue-300">
                                  {item.quantidade} un.
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3 text-gray-500 dark:text-gray-400">
                              Nenhum item informado.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* PARTICIPANTES */}
                      <div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-3">
                          <Users className="w-4 h-4" />

                          <span className="text-sm font-semibold">
                            Empresas Participantes
                          </span>
                        </div>

                        <div className="space-y-2">
                          {order.participantes &&
                          order.participantes.length > 0 ? (
                            order.participantes.map((participant) => (
                              <div
                                key={participant.id}
                                className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3 flex items-center justify-between"
                              >
                                <span className="font-semibold text-gray-800 dark:text-white">
                                  {participant.empresa_nome ||
                                    `Empresa #${participant.empresa_id}`}
                                </span>

                                <span className="font-bold text-yellow-600 dark:text-blue-300">
                                  {participant.quantidade} un.
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3 text-gray-500 dark:text-gray-400">
                              Nenhum participante informado.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
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
  Edit2,
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

interface MinhaParticipacao {
  id: number;
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
  status: 'ativo' | 'cancelado' | 'finalizado' | 'fechado' | 'saiu_para_entrega';
  criado_em?: string;
  total_quantidade: number;
  itens: OrderItem[];
  participantes: OrderParticipant[];
  is_lider?: boolean;
  minha_participacao?: MinhaParticipacao | null;
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

  const [editingParticipationId, setEditingParticipationId] =
    useState<number | null>(null);

  const [editQuantity, setEditQuantity] = useState('');
  const [savingParticipation, setSavingParticipation] =
    useState(false);

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
      return order.status === 'ativo' || order.status === 'fechado' || order.status === 'saiu_para_entrega';
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
      'Deseja cancelar este pedido inteiro?'
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

      await loadOrders();
    } catch (err) {
      alert(
        'Não foi possível conectar ao backend.'
      );
    }
  }

  function openEditParticipation(order: Order) {
    setEditingParticipationId(order.id);
    setEditQuantity(
      order.minha_participacao?.quantidade
        ? String(order.minha_participacao.quantidade)
        : ''
    );
  }

  function closeEditParticipation() {
    setEditingParticipationId(null);
    setEditQuantity('');
    setSavingParticipation(false);
  }

  async function handleSaveParticipation(orderId: number) {
    const quantidade = Number(editQuantity);

    if (!quantidade || quantidade <= 0) {
      alert('Digite uma quantidade válida.');
      return;
    }

    try {
      setSavingParticipation(true);

      const response = await fetch(
        `/api/pedidos/${orderId}/participar`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            quantidade,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            data.details ||
            'Erro ao editar participação'
        );
        return;
      }

      closeEditParticipation();
      await loadOrders();
    } catch (err) {
      alert('Não foi possível conectar ao backend.');
    } finally {
      setSavingParticipation(false);
    }
  }

  async function handleLeaveOrder(orderId: number) {
    const confirmLeave = confirm(
      'Deseja cancelar sua participação neste pedido?'
    );

    if (!confirmLeave) return;

    try {
      const response = await fetch(
        `/api/pedidos/${orderId}/sair`,
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
            'Erro ao cancelar participação'
        );
        return;
      }

      await loadOrders();
    } catch (err) {
      alert('Não foi possível conectar ao backend.');
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
    if (status === 'fechado') return 'Fechado';
    if (status === 'saiu_para_entrega') return 'Saiu para entrega';
    if (status === 'finalizado') return 'Concluído';
    return 'Cancelado';
  }

  function getStatusIcon(status: Order['status']) {
    if (status === 'ativo' || status === 'fechado' || status === 'saiu_para_entrega') {
      return <Clock className="w-4 h-4" />;
    }

    if (status === 'finalizado') {
      return <CheckCircle className="w-4 h-4" />;
    }

    return <XCircle className="w-4 h-4" />;
  }

  function getStatusClass(status: Order['status']) {
    if (status === 'ativo' || status === 'fechado' || status === 'saiu_para_entrega') {
      return 'bg-yellow-100 text-yellow-700 dark:bg-blue-950 dark:text-blue-300';
    }

    if (status === 'finalizado') {
      return 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300';
    }

    return 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300';
  }

  function getRoleLabel(order: Order) {
    if (userType !== 'mercado') return 'Fornecedor';

    if (order.is_lider) {
      return 'Líder do pedido';
    }

    if (order.minha_participacao) {
      return 'Participante';
    }

    return 'Relacionado';
  }

  function canShowActions(order: Order) {
    return (
      userType === 'mercado' &&
      order.status !== 'finalizado' &&
      order.status !== 'cancelado'
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-black min-h-screen transition-colors duration-300">
      <div className="p-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Pedidos
            </h1>

            <p className="text-gray-600 dark:text-gray-400">
              Controle seus pedidos criados e suas participações
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

        <div className="flex flex-wrap gap-4 mb-6">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'ativos', label: 'Em andamento' },
            { id: 'concluidos', label: 'Concluídos' },
            { id: 'cancelados', label: 'Cancelados' },
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

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 p-4 text-sm font-semibold text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {loading && (
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center text-gray-600 dark:text-gray-400">
            Carregando pedidos...
          </div>
        )}

        {!loading && filteredOrders.length === 0 && (
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center">
            <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-400" />

            <p className="font-bold text-gray-900 dark:text-white">
              Nenhum pedido encontrado
            </p>

            <p className="text-gray-500 dark:text-gray-400">
              Seus pedidos criados e participações aparecerão aqui.
            </p>
          </div>
        )}

        {!loading && filteredOrders.length > 0 && (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => {
              const firstItem = order.itens?.[0];
              const isEditing = editingParticipationId === order.id;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="
                    bg-white dark:bg-gray-950
                    border border-gray-200 dark:border-gray-800
                    rounded-2xl shadow-sm hover:shadow-md
                    transition p-4
                  "
                >
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

                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {getRoleLabel(order)}
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
                        Minha quantidade
                      </p>

                      <p className="font-bold text-gray-900 dark:text-white">
                        {order.minha_participacao?.quantidade || 0} un.
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

                  <div className="mt-4 flex flex-wrap gap-3">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        setOpenOrder(
                          openOrder === order.id ? null : order.id
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
                      {openOrder === order.id ? 'Fechar' : 'Ver Detalhes'}
                    </motion.button>

                    {canShowActions(order) && order.is_lider && (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          handleCancelOrder(order.id)
                        }
                        className="
                          px-5
                          bg-red-50 dark:bg-red-950/30
                          hover:bg-red-100 dark:hover:bg-red-950/50
                          text-red-700 dark:text-red-300
                          font-semibold py-2 rounded-xl
                          border border-red-200 dark:border-red-900
                        "
                      >
                        Cancelar Pedido
                      </motion.button>
                    )}

                    {canShowActions(order) &&
                      !order.is_lider &&
                      order.minha_participacao && (
                        <>
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => openEditParticipation(order)}
                            className="
                              px-5
                              bg-gray-100 dark:bg-gray-900
                              hover:bg-gray-200 dark:hover:bg-gray-800
                              text-gray-700 dark:text-gray-300
                              font-semibold py-2 rounded-xl
                              border border-gray-200 dark:border-gray-800
                              flex items-center gap-2
                            "
                          >
                            <Edit2 className="w-4 h-4" />
                            Editar Participação
                          </motion.button>

                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() =>
                              handleLeaveOrder(order.id)
                            }
                            className="
                              px-5
                              bg-red-50 dark:bg-red-950/30
                              hover:bg-red-100 dark:hover:bg-red-950/50
                              text-red-700 dark:text-red-300
                              font-semibold py-2 rounded-xl
                              border border-red-200 dark:border-red-900
                            "
                          >
                            Cancelar Participação
                          </motion.button>
                        </>
                      )}
                  </div>

                  {isEditing && (
                    <div className="mt-4 bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Nova quantidade da sua participação
                      </label>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="number"
                          min="1"
                          value={editQuantity}
                          onChange={(e) => setEditQuantity(e.target.value)}
                          className="
                            flex-1 border border-gray-300 dark:border-gray-700
                            bg-white dark:bg-gray-950
                            text-gray-900 dark:text-white
                            rounded-xl px-4 py-3 outline-none
                            focus:border-yellow-500 dark:focus:border-blue-700
                            focus:ring-4 focus:ring-yellow-100 dark:focus:ring-blue-950
                            transition
                          "
                          placeholder="Digite a nova quantidade"
                        />

                        <button
                          type="button"
                          disabled={savingParticipation}
                          onClick={() => handleSaveParticipation(order.id)}
                          className="
                            bg-green-600 hover:bg-green-700
                            text-white font-bold px-6 py-3 rounded-xl
                            transition disabled:opacity-60 disabled:cursor-not-allowed
                          "
                        >
                          {savingParticipation ? 'Salvando...' : 'Salvar'}
                        </button>

                        <button
                          type="button"
                          onClick={closeEditParticipation}
                          className="
                            bg-gray-100 dark:bg-gray-800
                            text-gray-700 dark:text-gray-300
                            font-bold px-6 py-3 rounded-xl
                            transition
                          "
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {openOrder === order.id && (
                    <div className="mt-4 bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 space-y-4">
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
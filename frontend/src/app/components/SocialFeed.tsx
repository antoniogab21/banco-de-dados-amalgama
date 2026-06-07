import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  MessageSquare,
  Users,
  Package,
  ShoppingCart,
  RefreshCw,
  Edit2,
  XCircle,
} from 'lucide-react';

interface SocialFeedProps {
  userType: 'mercado' | 'fornecedor';
  onNavigate?: (page: string, groupId?: string) => void;
}

interface PedidoItem {
  id: number;
  produto_id: number;
  produto_nome?: string | null;
  produto_imagem?: string | null;
  quantidade: number;
  preco_unitario: number;
}

interface Participante {
  id: number;
  empresa_id: number;
  empresa_nome?: string | null;
  quantidade: number;
}

interface MinhaParticipacao {
  id: number;
  quantidade: number;
}

interface Pedido {
  id: number;
  grupo_id: number;
  grupo_nome?: string | null;
  fornecedor_id: number;
  fornecedor_nome?: string | null;
  empresa_criadora_id: number;
  empresa_criadora_nome?: string | null;
  titulo: string;
  status: string;
  criado_em?: string | null;
  atualizado_em?: string | null;
  total_quantidade: number;
  itens: PedidoItem[];
  participantes: Participante[];
  is_lider?: boolean;
  minha_participacao?: MinhaParticipacao | null;
}

type FeedFilter = 'disponiveis' | 'criados' | 'participando';

export default function SocialFeed({
  userType,
  onNavigate,
}: SocialFeedProps) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] =
    useState<FeedFilter>('disponiveis');

  const [joiningOrderId, setJoiningOrderId] =
    useState<number | null>(null);

  const [joinQuantity, setJoinQuantity] =
    useState('');

  const [sendingJoin, setSendingJoin] =
    useState(false);

  const [leavingOrderId, setLeavingOrderId] =
    useState<number | null>(null);

  async function loadPedidosDisponiveis() {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/pedidos/disponiveis', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            data.details ||
            'Erro ao carregar pedidos disponíveis'
        );
        return;
      }

      setPedidos(data);
    } catch (err) {
      setError('Não foi possível conectar ao backend.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPedidosDisponiveis();
  }, []);

  const filteredPedidos = pedidos.filter((pedido) => {
    const isLider = Boolean(pedido.is_lider);
    const jaParticipo = Boolean(pedido.minha_participacao);

    if (activeFilter === 'criados') {
      return isLider;
    }

    if (activeFilter === 'participando') {
      return !isLider && jaParticipo;
    }

    return !isLider;
  });

  function formatCurrency(value: number) {
    return Number(value || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  function formatDate(value?: string | null) {
    if (!value) return '';

    try {
      return new Date(value).toLocaleDateString('pt-BR');
    } catch {
      return value;
    }
  }

  function getFirstItem(pedido: Pedido) {
    return pedido.itens?.[0] || null;
  }

  function getPrecoUnitario(pedido: Pedido) {
    const item = getFirstItem(pedido);
    return Number(item?.preco_unitario || 0);
  }

  function getValorTotal(pedido: Pedido) {
    return getPrecoUnitario(pedido) * Number(pedido.total_quantidade || 0);
  }

  function openJoin(
    pedidoId: number,
    quantidadeAtual?: number
  ) {
    setJoiningOrderId(pedidoId);
    setJoinQuantity(
      quantidadeAtual ? String(quantidadeAtual) : ''
    );
  }

  function closeJoin() {
    setJoiningOrderId(null);
    setJoinQuantity('');
    setSendingJoin(false);
  }

  async function handleJoinOrder(pedidoId: number) {
    const quantidade = Number(joinQuantity);

    if (!quantidade || quantidade <= 0) {
      alert('Digite uma quantidade válida.');
      return;
    }

    try {
      setSendingJoin(true);

      const response = await fetch(
        `/api/pedidos/${pedidoId}/participar`,
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
            'Erro ao participar do pedido'
        );
        return;
      }

      alert('Participação atualizada com sucesso!');
      closeJoin();
      await loadPedidosDisponiveis();
    } catch (err) {
      alert('Não foi possível conectar ao backend.');
    } finally {
      setSendingJoin(false);
    }
  }

  async function handleLeaveOrder(pedidoId: number) {
    const confirmar = confirm(
      'Deseja cancelar sua participação neste pedido?'
    );

    if (!confirmar) return;

    try {
      setLeavingOrderId(pedidoId);

      const response = await fetch(
        `/api/pedidos/${pedidoId}/sair`,
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

      alert('Participação cancelada com sucesso!');
      await loadPedidosDisponiveis();
    } catch (err) {
      alert('Não foi possível conectar ao backend.');
    } finally {
      setLeavingOrderId(null);
    }
  }

  function getEmptyText() {
    if (activeFilter === 'criados') {
      return 'Nenhum pedido criado por você encontrado.';
    }

    if (activeFilter === 'participando') {
      return 'Você ainda não está participando de nenhum pedido.';
    }

    return 'Nenhum pedido coletivo disponível no momento.';
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Gerenciar Pedidos
            </h1>

            <p className="text-gray-600 dark:text-gray-400">
              Acompanhe seus pedidos coletivos, participe e acesse o chat dos pedidos
            </p>
          </div>

          <button
            type="button"
            onClick={loadPedidosDisponiveis}
            className="
              flex items-center gap-2
              bg-white dark:bg-gray-950
              border border-gray-200 dark:border-gray-800
              text-gray-700 dark:text-gray-200
              font-bold px-5 py-3 rounded-xl shadow-sm
              hover:bg-gray-50 dark:hover:bg-gray-900
              transition
            "
          >
            <RefreshCw className="w-5 h-5" />
            Atualizar
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          {[
            { id: 'disponiveis', label: 'Disponíveis' },
            { id: 'criados', label: 'Criados por mim' },
            { id: 'participando', label: 'Participando' },
          ].map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() =>
                setActiveFilter(filter.id as FeedFilter)
              }
              className={`px-5 py-2 rounded-xl font-bold transition ${
                activeFilter === filter.id
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 dark:from-blue-800 dark:to-blue-950 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 p-4 text-sm font-semibold text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {userType !== 'mercado' && (
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />

            <p className="font-bold text-gray-900 dark:text-white">
              Área disponível para mercados
            </p>

            <p className="text-gray-500 dark:text-gray-400">
              Fornecedores acompanham seus pedidos pela dashboard e pela área de pedidos.
            </p>
          </div>
        )}

        {userType === 'mercado' && loading && (
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center text-gray-600 dark:text-gray-400">
            Carregando pedidos...
          </div>
        )}

        {userType === 'mercado' &&
          !loading &&
          filteredPedidos.length === 0 && (
            <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-400" />

              <p className="font-bold text-gray-900 dark:text-white">
                Nenhum pedido encontrado
              </p>

              <p className="text-gray-500 dark:text-gray-400">
                {getEmptyText()}
              </p>
            </div>
          )}

        {userType === 'mercado' &&
          !loading &&
          filteredPedidos.length > 0 && (
            <div className="space-y-6">
              {filteredPedidos.map((pedido, index) => {
                const item = getFirstItem(pedido);
                const precoUnitario = getPrecoUnitario(pedido);
                const valorTotal = getValorTotal(pedido);
                const isJoining = joiningOrderId === pedido.id;
                const jaParticipo = Boolean(pedido.minha_participacao);
                const isLider = Boolean(pedido.is_lider);
                const podeAbrirChat = isLider || jaParticipo;

                const podeEditarQuantidade =
                  pedido.status === 'ativo' &&
                  Boolean(pedido.minha_participacao);

                const podeCancelarParticipacao =
                  pedido.status === 'ativo' &&
                  !isLider &&
                  jaParticipo;

                const podeParticipar =
                  pedido.status === 'ativo' &&
                  !isLider &&
                  !jaParticipo;

                return (
                  <motion.div
                    key={pedido.id}
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
                      rounded-2xl shadow-sm overflow-hidden
                      transition-colors duration-300
                    "
                  >
                    <div
                      className="
                        bg-gradient-to-r from-yellow-400 to-yellow-500
                        dark:from-blue-800 dark:to-blue-950
                        p-6 transition-colors duration-300
                      "
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 text-white">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                            <Users className="w-8 h-8" />
                          </div>

                          <div>
                            <h2 className="text-2xl font-bold">
                              {pedido.grupo_nome || 'Pedido Coletivo'}
                            </h2>

                            <div className="flex flex-wrap items-center gap-3 text-sm opacity-90 mt-1">
                              <span>
                                Criado por {pedido.empresa_criadora_nome || 'Mercado'}
                              </span>

                              <span>•</span>

                              <span>
                                {pedido.participantes.length} participante(s)
                              </span>

                              <span>•</span>

                              <span className="capitalize">
                                {pedido.status}
                              </span>
                            </div>
                          </div>
                        </div>

                        {podeAbrirChat ? (
                          <button
                            type="button"
                            onClick={() =>
                              onNavigate?.(
                                'chat',
                                String(pedido.grupo_id || 1)
                              )
                            }
                            className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold px-6 py-3 rounded-xl transition"
                          >
                            <MessageSquare className="w-5 h-5" />
                            Chat
                          </button>
                        ) : (
                          <div className="flex items-center justify-center gap-2 bg-white/10 text-white/80 font-semibold px-6 py-3 rounded-xl">
                            <MessageSquare className="w-5 h-5" />
                            Participe para acessar o chat
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-6 space-y-5">
                      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-3xl">
                            {item?.produto_imagem || '📦'}
                          </div>

                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-xl">
                              {item?.produto_nome || pedido.titulo}
                            </h3>

                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Fornecedor: {pedido.fornecedor_nome || 'Fornecedor'}
                            </p>

                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Criado em: {formatDate(pedido.criado_em)}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Quantidade atual
                            </p>

                            <p className="font-bold text-gray-900 dark:text-white">
                              {pedido.total_quantidade} un.
                            </p>
                          </div>

                          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Preço un.
                            </p>

                            <p className="font-bold text-gray-900 dark:text-white">
                              {formatCurrency(precoUnitario)}
                            </p>
                          </div>

                          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Valor total
                            </p>

                            <p className="font-bold text-gray-900 dark:text-white">
                              {formatCurrency(valorTotal)}
                            </p>
                          </div>

                          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Grupo
                            </p>

                            <p className="font-bold text-gray-900 dark:text-white">
                              #{pedido.grupo_id || 1}
                            </p>
                          </div>
                        </div>
                      </div>

                      {isLider && (
                        <div className="rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 p-4 text-sm font-semibold text-blue-700 dark:text-blue-300">
                          Você é o líder deste pedido. Você pode editar sua quantidade e acompanhar os participantes pelo chat.
                        </div>
                      )}

                      {jaParticipo && !isLider && (
                        <div className="rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-4 text-sm font-semibold text-green-700 dark:text-green-300">
                          Você já está participando deste pedido com{' '}
                          {pedido.minha_participacao?.quantidade} un.
                        </div>
                      )}

                      {pedido.participantes.length > 0 && (
                        <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                          <p className="font-semibold text-gray-900 dark:text-white mb-3">
                            Participantes
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {pedido.participantes.map((participante) => (
                              <span
                                key={participante.id}
                                className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300"
                              >
                                {participante.empresa_nome || 'Empresa'} • {participante.quantidade} un.
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {isJoining ? (
                        <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            {podeEditarQuantidade
                              ? 'Editar quantidade da sua participação'
                              : 'Quantidade para participar'}
                          </label>

                          <div className="flex flex-col sm:flex-row gap-3">
                            <input
                              type="number"
                              min="1"
                              value={joinQuantity}
                              onChange={(e) =>
                                setJoinQuantity(e.target.value)
                              }
                              className="
                                flex-1 border border-gray-300 dark:border-gray-700
                                bg-white dark:bg-gray-900
                                text-gray-900 dark:text-white
                                rounded-xl px-4 py-3 outline-none
                                focus:border-yellow-500 dark:focus:border-blue-700
                                focus:ring-4 focus:ring-yellow-100 dark:focus:ring-blue-950
                                transition
                              "
                              placeholder="Digite a quantidade"
                            />

                            <button
                              type="button"
                              disabled={sendingJoin}
                              onClick={() => handleJoinOrder(pedido.id)}
                              className="
                                bg-green-600 hover:bg-green-700
                                text-white font-bold px-6 py-3 rounded-xl
                                transition disabled:opacity-60 disabled:cursor-not-allowed
                              "
                            >
                              {sendingJoin
                                ? 'Salvando...'
                                : podeEditarQuantidade
                                  ? 'Salvar alteração'
                                  : 'Confirmar'}
                            </button>

                            <button
                              type="button"
                              onClick={closeJoin}
                              className="
                                bg-gray-100 dark:bg-gray-900
                                text-gray-700 dark:text-gray-300
                                font-bold px-6 py-3 rounded-xl
                                transition
                              "
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 dark:border-gray-800 pt-4">
                          {podeCancelarParticipacao && (
                            <button
                              type="button"
                              disabled={leavingOrderId === pedido.id}
                              onClick={() => handleLeaveOrder(pedido.id)}
                              className="
                                flex items-center gap-2
                                bg-red-50 dark:bg-red-950/30
                                hover:bg-red-100 dark:hover:bg-red-950/50
                                text-red-700 dark:text-red-300
                                font-bold px-6 py-3 rounded-xl
                                border border-red-200 dark:border-red-900
                                transition disabled:opacity-60 disabled:cursor-not-allowed
                              "
                            >
                              <XCircle className="w-5 h-5" />
                              {leavingOrderId === pedido.id
                                ? 'Cancelando...'
                                : 'Cancelar participação'}
                            </button>
                          )}

                          {(podeEditarQuantidade || podeParticipar) && (
                            <button
                              type="button"
                              onClick={() =>
                                openJoin(
                                  pedido.id,
                                  pedido.minha_participacao?.quantidade
                                )
                              }
                              className="
                                flex items-center gap-2
                                bg-gradient-to-r from-yellow-400 to-yellow-500
                                dark:from-blue-800 dark:to-blue-950
                                hover:from-yellow-500 hover:to-yellow-600
                                dark:hover:from-blue-700 dark:hover:to-blue-900
                                text-white font-bold px-6 py-3 rounded-xl shadow-lg
                                transition
                              "
                            >
                              {podeEditarQuantidade && (
                                <Edit2 className="w-5 h-5" />
                              )}

                              {podeEditarQuantidade
                                ? isLider
                                  ? 'Editar quantidade'
                                  : 'Editar meu pedido'
                                : 'Participar do Pedido'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
      </div>
    </div>
  );
}
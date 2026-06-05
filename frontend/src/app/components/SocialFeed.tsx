import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  MessageSquare,
  Users,
  Package,
  ShoppingCart,
  RefreshCw,
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
}

export default function SocialFeed({
  userType,
  onNavigate,
}: SocialFeedProps) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [joiningOrderId, setJoiningOrderId] =
    useState<number | null>(null);

  const [joinQuantity, setJoinQuantity] =
    useState('');

  const [sendingJoin, setSendingJoin] =
    useState(false);

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

  function openJoin(pedidoId: number) {
    setJoiningOrderId(pedidoId);
    setJoinQuantity('');
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

      alert('Participação registrada com sucesso!');
      closeJoin();
      await loadPedidosDisponiveis();
    } catch (err) {
      alert('Não foi possível conectar ao backend.');
    } finally {
      setSendingJoin(false);
    }
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
              Encontre pedidos coletivos disponíveis e participe com sua empresa
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
            Carregando pedidos disponíveis...
          </div>
        )}

        {userType === 'mercado' && !loading && pedidos.length === 0 && (
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center">
            <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-400" />

            <p className="font-bold text-gray-900 dark:text-white">
              Nenhum pedido coletivo disponível
            </p>

            <p className="text-gray-500 dark:text-gray-400">
              Quando outros mercados criarem pedidos coletivos, eles aparecerão aqui.
            </p>
          </div>
        )}

        {userType === 'mercado' && !loading && pedidos.length > 0 && (
          <div className="space-y-6">
            {pedidos.map((pedido, index) => {
              const item = getFirstItem(pedido);
              const precoUnitario = getPrecoUnitario(pedido);
              const valorTotal = getValorTotal(pedido);
              const isJoining = joiningOrderId === pedido.id;

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
                          Quantidade para participar
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
                              ? 'Participando...'
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
                      <div className="flex justify-end border-t border-gray-100 dark:border-gray-800 pt-4">
                        <button
                          type="button"
                          onClick={() => openJoin(pedido.id)}
                          className="
                            bg-gradient-to-r from-yellow-400 to-yellow-500
                            dark:from-blue-800 dark:to-blue-950
                            hover:from-yellow-500 hover:to-yellow-600
                            dark:hover:from-blue-700 dark:hover:to-blue-900
                            text-white font-bold px-6 py-3 rounded-xl shadow-lg
                            transition
                          "
                        >
                          Participar do Pedido
                        </button>
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
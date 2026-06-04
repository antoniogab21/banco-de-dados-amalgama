import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  ShoppingCart,
  Users,
  CheckCircle,
  Clock,
  DollarSign,
  Package,
} from 'lucide-react';

interface DashboardNewProps {
  userType: 'mercado' | 'fornecedor';
}

interface DashboardData {
  pedidos_criados_por_mim?: number;
  pedidos_ativos: number;
  participando: number;
  concluidos: number;
  total_pedidos: number;
  gasto_total: number;
  gastos?: {
    criados_por_mim: number;
    participando: number;
    concluidos: number;
    total: number;
  };
  atividade_recente: Array<{
    id: number;
    titulo: string;
    fornecedor_nome?: string | null;
    produto_nome?: string | null;
    quantidade: number;
    valor: number;
    status: string;
    criado_em?: string | null;
    foi_criado_por_mim?: boolean;
    estou_participando?: boolean;
    esta_concluido?: boolean;
    tipo_dashboard?: 'criado' | 'participando' | 'concluido' | 'outro';
  }>;
  fornecedores_mais_usados: Array<{
    nome: string;
    valor: number;
  }>;
}

export default function DashboardNew({
  userType,
}: DashboardNewProps) {
  const [activeCard, setActiveCard] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [gastoFiltros, setGastoFiltros] = useState({
    criados: true,
    participando: true,
    concluidos: true,
  });

  const [data, setData] = useState<DashboardData>({
    pedidos_criados_por_mim: 0,
    pedidos_ativos: 0,
    participando: 0,
    concluidos: 0,
    total_pedidos: 0,
    gasto_total: 0,
    gastos: {
      criados_por_mim: 0,
      participando: 0,
      concluidos: 0,
      total: 0,
    },
    atividade_recente: [],
    fornecedores_mais_usados: [],
  });

  async function loadDashboard() {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/dashboard/mercado', {
        method: 'GET',
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error ||
            result.details ||
            'Erro ao carregar dashboard'
        );
        return;
      }

      setData(result);
    } catch (err) {
      setError('Não foi possível conectar ao backend.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
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

  function toggleGastoFiltro(
    filtro: 'criados' | 'participando' | 'concluidos'
  ) {
    setGastoFiltros((prev) => ({
      ...prev,
      [filtro]: !prev[filtro],
    }));
  }

  function getGastoFiltrado() {
    let total = 0;

    if (gastoFiltros.criados) {
      total += data.gastos?.criados_por_mim || 0;
    }

    if (gastoFiltros.participando) {
      total += data.gastos?.participando || 0;
    }

    if (gastoFiltros.concluidos) {
      total += data.gastos?.concluidos || 0;
    }

    return total;
  }

  const pedidosCriadosPorMim = data.atividade_recente.filter(
    (item) =>
      item.foi_criado_por_mim &&
      item.status === 'ativo'
  );

  const pedidosParticipando = data.atividade_recente.filter(
    (item) =>
      item.estou_participando &&
      item.status === 'ativo'
  );

  const pedidosConcluidos = data.atividade_recente.filter(
    (item) => item.status === 'finalizado'
  );

  const stats = [
    {
      title: 'Criados por Mim',
      value:
        data.pedidos_criados_por_mim ??
        data.pedidos_ativos,
      icon: Clock,
      bgColor: 'bg-yellow-50 dark:bg-blue-950',
      textColor: 'text-yellow-600 dark:text-blue-300',
    },
    {
      title: 'Participando',
      value: data.participando,
      icon: Users,
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      textColor: 'text-blue-600 dark:text-blue-300',
    },
    {
      title: 'Concluídos',
      value: data.concluidos,
      icon: CheckCircle,
      bgColor: 'bg-green-50 dark:bg-green-950/40',
      textColor: 'text-green-600 dark:text-green-300',
    },
    {
      title: 'Total de Pedidos',
      value: data.total_pedidos,
      icon: ShoppingCart,
      bgColor: 'bg-purple-50 dark:bg-purple-950/40',
      textColor: 'text-purple-600 dark:text-purple-300',
    },
    {
      title: 'Gasto Total',
      value: formatCurrency(data.gasto_total),
      icon: DollarSign,
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      textColor: 'text-emerald-600 dark:text-emerald-300',
    },
  ];

  function renderPedidosList(
    items: DashboardData['atividade_recente'],
    emptyText: string
  ) {
    if (items.length === 0) {
      return (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          {emptyText}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 transition"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 dark:from-blue-800 dark:to-blue-950 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>

            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">
                {item.produto_nome || item.titulo}
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                {item.fornecedor_nome || 'Fornecedor'} • {formatDate(item.criado_em)}
              </p>
            </div>

            <div className="text-right">
              <p className="font-semibold text-gray-900 dark:text-white">
                {item.quantidade} un.
              </p>

              <p className="text-sm text-green-600 dark:text-green-300">
                {formatCurrency(item.valor)}
              </p>

              <p className="text-xs text-gray-400 capitalize">
                {item.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  function renderGastoPanel() {
    return (
      <div>
        <PanelHeader
          icon={DollarSign}
          title="Gasto Total"
          subtitle="Filtre os gastos por tipo de pedido"
          iconClass="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300"
        />

        <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20 p-6">
          <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-2">
            Total filtrado
          </p>

          <p className="text-4xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(getGastoFiltrado())}
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              type="button"
              onClick={() => toggleGastoFiltro('criados')}
              className={`px-4 py-2 rounded-xl font-semibold text-sm border transition ${
                gastoFiltros.criados
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800'
              }`}
            >
              Criados por mim
            </button>

            <button
              type="button"
              onClick={() => toggleGastoFiltro('participando')}
              className={`px-4 py-2 rounded-xl font-semibold text-sm border transition ${
                gastoFiltros.participando
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800'
              }`}
            >
              Participando
            </button>

            <button
              type="button"
              onClick={() => toggleGastoFiltro('concluidos')}
              className={`px-4 py-2 rounded-xl font-semibold text-sm border transition ${
                gastoFiltros.concluidos
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800'
              }`}
            >
              Concluídos
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white dark:bg-gray-950 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Criados por mim
              </p>
              <p className="font-bold text-gray-900 dark:text-white">
                {formatCurrency(data.gastos?.criados_por_mim || 0)}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-950 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Participando
              </p>
              <p className="font-bold text-gray-900 dark:text-white">
                {formatCurrency(data.gastos?.participando || 0)}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-950 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Concluídos
              </p>
              <p className="font-bold text-gray-900 dark:text-white">
                {formatCurrency(data.gastos?.concluidos || 0)}
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Pedidos cancelados não entram no cálculo.
          </p>
        </div>
      </div>
    );
  }

  function renderPanel() {
    if (activeCard === '') {
      return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Atividade Recente
            </h2>

            {renderPedidosList(
              data.atividade_recente,
              'Nenhum pedido encontrado ainda.'
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Fornecedores Mais Usados
            </h2>

            {data.fornecedores_mais_usados.length === 0 ? (
              <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                Nenhum fornecedor encontrado.
              </div>
            ) : (
              <div className="space-y-4">
                {data.fornecedores_mais_usados.map((item, index) => (
                  <div
                    key={item.nome}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-700 dark:text-gray-200">
                      {index + 1}
                    </div>

                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {item.nome}
                      </p>

                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(item.valor)}
                      </p>
                    </div>

                    <Package className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeCard === 'Criados por Mim') {
      return (
        <div>
          <PanelHeader
            icon={Clock}
            title="Pedidos Criados por Mim"
            subtitle="Pedidos em que sua empresa é a líder"
            iconClass="bg-yellow-100 dark:bg-blue-950 text-yellow-600 dark:text-blue-300"
          />

          {renderPedidosList(
            pedidosCriadosPorMim,
            'Nenhum pedido criado por você está ativo.'
          )}
        </div>
      );
    }

    if (activeCard === 'Participando') {
      return (
        <div>
          <PanelHeader
            icon={Users}
            title="Participando"
            subtitle="Pedidos criados por outras empresas onde você entrou"
            iconClass="bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300"
          />

          {renderPedidosList(
            pedidosParticipando,
            'Você ainda não está participando de pedidos de outras empresas.'
          )}
        </div>
      );
    }

    if (activeCard === 'Concluídos') {
      return (
        <div>
          <PanelHeader
            icon={CheckCircle}
            title="Pedidos Concluídos"
            subtitle="Pedidos finalizados criados por você ou participados por você"
            iconClass="bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-300"
          />

          {renderPedidosList(
            pedidosConcluidos,
            'Nenhum pedido concluído encontrado.'
          )}
        </div>
      );
    }

    if (activeCard === 'Total de Pedidos') {
      return (
        <div>
          <PanelHeader
            icon={ShoppingCart}
            title="Total de Pedidos"
            subtitle="Todos os seus pedidos, sem cancelados"
            iconClass="bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300"
          />

          {renderPedidosList(
            data.atividade_recente,
            'Nenhum pedido encontrado.'
          )}
        </div>
      );
    }

    if (activeCard === 'Gasto Total') {
      return renderGastoPanel();
    }

    return null;
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-black transition-colors duration-300">
      <div className="p-8 min-h-screen">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard
          </h1>

          <p className="text-gray-600 dark:text-gray-400">
            Visão geral das suas compras e pedidos
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 p-4 text-sm font-semibold text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center text-gray-600 dark:text-gray-400">
            Carregando dashboard...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
              {stats.map((stat, index) => (
                <motion.button
                  key={stat.title}
                  type="button"
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.08,
                  }}
                  whileHover={{
                    scale: 1.02,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  onClick={() =>
                    setActiveCard(
                      activeCard === stat.title ? '' : stat.title
                    )
                  }
                  className={`
                    bg-white dark:bg-gray-950 rounded-2xl p-6 shadow-sm
                    hover:shadow-lg transition-all text-left border-2
                    cursor-pointer
                    ${
                      activeCard === stat.title
                        ? 'border-yellow-500 dark:border-blue-700'
                        : 'border-gray-100 dark:border-gray-800'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`p-3 rounded-xl ${stat.bgColor}`}
                    >
                      <stat.icon
                        className={`w-6 h-6 ${stat.textColor}`}
                      />
                    </div>
                  </div>

                  <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                    {stat.title}
                  </h3>

                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </motion.button>
              ))}
            </div>

            <motion.div
              key={activeCard || 'home'}
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="bg-white dark:bg-gray-950 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-800"
            >
              {renderPanel()}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

function PanelHeader({
  icon: Icon,
  title,
  subtitle,
  iconClass,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  iconClass: string;
}) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center ${iconClass}`}
      >
        <Icon className="w-7 h-7" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>

        <p className="text-gray-500 dark:text-gray-400">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
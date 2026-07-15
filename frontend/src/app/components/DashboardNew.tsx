import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle,
  Clock,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
} from 'lucide-react';

const API_URL = 'http://localhost:5001';

interface DashboardNewProps {
  userType: 'mercado' | 'fornecedor';
}

interface PedidoResumo {
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
}

interface DashboardData {
  pedidos_criados_por_mim: number;
  pedidos_ativos: number;
  participando: number;
  concluidos: number;
  total_pedidos: number;
  gasto_total: number;
  gastos: {
    criados_por_mim: number;
    participando: number;
    concluidos: number;
    total: number;
  };
  atividade_recente: PedidoResumo[];
  fornecedores_mais_usados: Array<{
    nome: string;
    valor: number;
  }>;
}

const emptyDashboard: DashboardData = {
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
};

export default function DashboardNew({ userType }: DashboardNewProps) {
  const [activeCard, setActiveCard] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<DashboardData>(emptyDashboard);

  const [gastoFiltros, setGastoFiltros] = useState({
    criados: true,
    participando: true,
    concluidos: true,
  });

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(`${API_URL}/api/dashboard/mercado`, {
          method: 'GET',
          credentials: 'include',
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          setError(
            result.error ||
              'Não foi possível carregar os dados do dashboard.'
          );
          return;
        }

        setData({
          ...emptyDashboard,
          ...result,
          gastos: {
            ...emptyDashboard.gastos,
            ...result.gastos,
          },
          atividade_recente: result.atividade_recente || [],
          fornecedores_mais_usados: result.fornecedores_mais_usados || [],
        });
      } catch {
        setError(
          'Não foi possível conectar ao backend. Verifique se o Flask está rodando.'
        );
      } finally {
        setLoading(false);
      }
    }

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

    return new Date(value).toLocaleDateString('pt-BR');
  }

  function toggleGastoFiltro(
    filtro: 'criados' | 'participando' | 'concluidos'
  ) {
    setGastoFiltros((previous) => ({
      ...previous,
      [filtro]: !previous[filtro],
    }));
  }

  function gastoFiltrado() {
    let total = 0;

    if (gastoFiltros.criados) {
      total += data.gastos.criados_por_mim;
    }

    if (gastoFiltros.participando) {
      total += data.gastos.participando;
    }

    if (gastoFiltros.concluidos) {
      total += data.gastos.concluidos;
    }

    return total;
  }

  const pedidosCriados = data.atividade_recente.filter(
    (pedido) => pedido.foi_criado_por_mim && pedido.status === 'ativo'
  );

  const pedidosParticipando = data.atividade_recente.filter(
    (pedido) => pedido.estou_participando && pedido.status === 'ativo'
  );

  const pedidosConcluidos = data.atividade_recente.filter(
    (pedido) => pedido.status === 'finalizado'
  );

  const stats = [
    {
      title: 'Criados por Mim',
      value: data.pedidos_criados_por_mim,
      icon: Clock,
      color: 'text-yellow-600 dark:text-yellow-300',
      background: 'bg-yellow-50 dark:bg-yellow-950/40',
    },
    {
      title: 'Participando',
      value: data.participando,
      icon: Users,
      color: 'text-blue-600 dark:text-blue-300',
      background: 'bg-blue-50 dark:bg-blue-950/40',
    },
    {
      title: 'Concluídos',
      value: data.concluidos,
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-300',
      background: 'bg-green-50 dark:bg-green-950/40',
    },
    {
      title: 'Total de Pedidos',
      value: data.total_pedidos,
      icon: ShoppingCart,
      color: 'text-purple-600 dark:text-purple-300',
      background: 'bg-purple-50 dark:bg-purple-950/40',
    },
    {
      title: 'Gasto Total',
      value: formatCurrency(data.gasto_total),
      icon: DollarSign,
      color: 'text-emerald-600 dark:text-emerald-300',
      background: 'bg-emerald-50 dark:bg-emerald-950/40',
    },
  ];

  function renderPedidos(items: PedidoResumo[], emptyText: string) {
    if (!items.length) {
      return (
        <p className="py-10 text-center text-gray-500 dark:text-gray-400">
          {emptyText}
        </p>
      );
    }

    return (
      <div className="space-y-3">
        {items.map((pedido) => (
          <div
            key={pedido.id}
            className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-gray-900 dark:text-white">
                {pedido.produto_nome || pedido.titulo}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {pedido.fornecedor_nome || 'Fornecedor'}
                {pedido.criado_em ? ` • ${formatDate(pedido.criado_em)}` : ''}
              </p>
            </div>

            <div className="text-right">
              <p className="font-semibold text-gray-900 dark:text-white">
                {pedido.quantidade} un.
              </p>
              <p className="text-sm text-green-600 dark:text-green-300">
                {formatCurrency(pedido.valor)}
              </p>
              <p className="text-xs capitalize text-gray-400">
                {pedido.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  function renderContent() {
    if (activeCard === 'Criados por Mim') {
      return renderPedidos(
        pedidosCriados,
        'Nenhum pedido criado por você está ativo.'
      );
    }

    if (activeCard === 'Participando') {
      return renderPedidos(
        pedidosParticipando,
        'Você ainda não participa de pedidos ativos.'
      );
    }

    if (activeCard === 'Concluídos') {
      return renderPedidos(
        pedidosConcluidos,
        'Nenhum pedido concluído encontrado.'
      );
    }

    if (activeCard === 'Total de Pedidos') {
      return renderPedidos(
        data.atividade_recente,
        'Nenhum pedido encontrado.'
      );
    }

    if (activeCard === 'Gasto Total') {
      return (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950/20">
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            Total filtrado
          </p>
          <p className="mt-2 text-4xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(gastoFiltrado())}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {[
              ['criados', 'Criados por mim'],
              ['participando', 'Participando'],
              ['concluidos', 'Concluídos'],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() =>
                  toggleGastoFiltro(
                    key as 'criados' | 'participando' | 'concluidos'
                  )
                }
                className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                  gastoFiltros[
                    key as 'criados' | 'participando' | 'concluidos'
                  ]
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-gray-200 bg-white text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            Atividade Recente
          </h2>
          {renderPedidos(
            data.atividade_recente,
            'Nenhum pedido encontrado ainda.'
          )}
        </div>

        <div>
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            Fornecedores Mais Usados
          </h2>

          {!data.fornecedores_mais_usados.length ? (
            <p className="py-10 text-center text-gray-500 dark:text-gray-400">
              Nenhum fornecedor encontrado.
            </p>
          ) : (
            <div className="space-y-3">
              {data.fornecedores_mais_usados.map((fornecedor, index) => (
                <div
                  key={fornecedor.nome}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-200 font-bold dark:bg-gray-800">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{fornecedor.nome}</p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(fornecedor.valor)}
                    </p>
                  </div>
                  <Package className="h-5 w-5 text-gray-400" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50 transition-colors dark:bg-black">
      <div className="min-h-screen p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Visão geral das compras e pedidos do seu mercado
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400">
            Carregando dashboard...
          </div>
        ) : (
          <>
            <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
              {stats.map((stat, index) => (
                <motion.button
                  key={stat.title}
                  type="button"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  onClick={() =>
                    setActiveCard(
                      activeCard === stat.title ? '' : stat.title
                    )
                  }
                  className={`rounded-xl border-2 bg-white p-5 text-left shadow-sm transition hover:shadow-md dark:bg-gray-950 ${
                    activeCard === stat.title
                      ? 'border-yellow-500'
                      : 'border-gray-100 dark:border-gray-800'
                  }`}
                >
                  <div className={`mb-4 inline-flex rounded-lg p-3 ${stat.background}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </motion.button>
              ))}
            </div>

            <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
              {renderContent()}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
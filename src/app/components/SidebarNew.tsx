import { motion } from 'motion/react';

import {
  LayoutDashboard,
  MessageSquare,
  ShoppingCart,
  Package,
  CreditCard,
  User,
  Settings,
  Building2,
  LogOut,
} from 'lucide-react';

interface SidebarNewProps {
  userType: 'mercado' | 'fornecedor';
  activePage?: string;
  companyName?: string;
  onNavigate?: (page: string) => void;

  /* NOVO */
  onLogout?: () => void;
}

export default function SidebarNew({
  userType,
  activePage,
  onNavigate,
  onLogout,
}: SidebarNewProps) {

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },

    {
      id: 'feed',
      label: 'Gerenciar Pedidos',
      icon: MessageSquare,
    },

    {
      id: 'pedidos',
      label: 'Pedidos',
      icon: ShoppingCart,
    },

    {
      id: 'produtos',
      label: 'Produtos',
      icon: Package,
    },

    {
      id: 'pagamentos',
      label: 'Pagamentos',
      icon: CreditCard,
    },

    {
      id: 'perfil',
      label: 'Perfil',
      icon: User,
    },

    {
      id: 'configuracoes',
      label: 'Configurações',
      icon: Settings,
    },
  ];

  function handleLogout() {

    localStorage.removeItem('companyName');

    localStorage.removeItem('userType');

    window.location.reload();
  }

  return (

    <div className="w-72 bg-white border-r border-gray-200 flex flex-col">

      {/* TOPO */}
      <div className="p-6 border-b border-gray-200">

        <div className="flex items-center gap-3 mb-4">

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-lg">

            <Building2 className="w-6 h-6 text-white" />

          </div>

          <div>

            <h3 className="font-bold text-gray-900">
              {localStorage.getItem('companyName') || 'Amalgama'}
            </h3>

            <p className="text-xs text-gray-500 capitalize">
              {userType}
            </p>

          </div>

        </div>
      </div>

      {/* MENU */}
      <nav className="flex-1 p-4">

        <div className="space-y-1">

          {menuItems.map((item) => {

            const isActive = activePage === item.id;

            return (

              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => onNavigate?.(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >

                <item.icon className="w-5 h-5" />

                <span className="font-semibold">
                  {item.label}
                </span>

              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* RODAPÉ */}
      <div className="p-4 border-t border-gray-200">

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"

          /* BOTÃO SAIR FUNCIONANDO */
          onClick={() => {
            if (onLogout) {
              onLogout();
            } else {
              handleLogout();
            }
          }}

          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition"
        >

          <LogOut className="w-5 h-5" />

          <span className="font-semibold">
            Sair
          </span>

        </motion.button>

      </div>
    </div>
  );
}
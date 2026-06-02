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

/*
  TROQUE ESTES CAMINHOS PELOS NOMES REAIS DAS SUAS LOGOS.

  Exemplo:
  import logoLight from '../../assets/Subalterno.png';
  import logoDark from '../../assets/SubalternoDark.png';

  Se você ainda não colocou a logo escura na pasta assets,
  coloque primeiro e ajuste o nome abaixo.
*/

import logoLight from '../../assets/Subalterno.png';
import logoDark from '../../assets/SubalternoDark.png';

interface SidebarNewProps {
  userType: 'mercado' | 'fornecedor';
  activePage?: string;
  companyName?: string;
  onNavigate?: (page: string) => void;
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

    if (onLogout) {
      onLogout();
      return;
    }

    window.location.reload();
  }

  const company =
    localStorage.getItem('companyName') ||
    'Amalgama';

  return (

    <div
      className="
        w-72
        bg-white
        dark:bg-black
        border-r
        border-gray-200
        dark:border-gray-800
        flex
        flex-col
        transition-colors
        duration-300
      "
    >

      {/* TOPO */}

      <div
        className="
          p-6
          border-b
          border-gray-200
          dark:border-gray-800
          transition-colors
          duration-300
        "
      >

        <div className="flex items-center gap-3 mb-4">

          {/* LOGO / ÍCONE */}

          <div
            className="
              w-12
              h-12
              rounded-2xl
              bg-gradient-to-br
              from-yellow-400
              to-yellow-500
              dark:from-blue-800
              dark:to-blue-950
              flex
              items-center
              justify-center
              shadow-lg
              overflow-hidden
              transition-colors
              duration-300
            "
          >

            {/* LOGO CLARA */}
            <img
              src={logoLight}
              alt="Logo"
              className="
                w-full
                h-full
                object-contain
                block
                dark:hidden
              "
            />

            {/* LOGO ESCURA */}
            <img
              src={logoDark}
              alt="Logo modo escuro"
              className="
                w-full
                h-full
                object-contain
                hidden
                dark:block
              "
            />

            {/* Caso alguma logo não carregue, o ícone abaixo pode ser usado no lugar.
                Se não quiser, pode apagar este Building2. */}
            <Building2 className="hidden w-6 h-6 text-white" />

          </div>

          <div>

            <h3
              className="
                font-bold
                text-gray-900
                dark:text-white
                transition-colors
                duration-300
              "
            >
              {company}
            </h3>

            <p
              className="
                text-xs
                text-gray-500
                dark:text-gray-400
                capitalize
                transition-colors
                duration-300
              "
            >
              {userType}
            </p>

          </div>

        </div>

      </div>

      {/* MENU */}

      <nav className="flex-1 p-4">

        <div className="space-y-1">

          {menuItems.map((item) => {

            const isActive =
              activePage === item.id;

            return (

              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() =>
                  onNavigate?.(item.id)
                }
                className={`
                  w-full
                  flex
                  items-center
                  gap-3
                  px-4
                  py-3
                  rounded-xl
                  transition
                  duration-300

                  ${
                    isActive
                      ? `
                        bg-gradient-to-r
                        from-yellow-400
                        to-yellow-500
                        dark:from-blue-800
                        dark:to-blue-950
                        text-white
                        shadow-lg
                      `
                      : `
                        text-gray-700
                        dark:text-gray-300
                        hover:bg-gray-50
                        dark:hover:bg-gray-900
                      `
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

      <div
        className="
          p-4
          border-t
          border-gray-200
          dark:border-gray-800
          transition-colors
          duration-300
        "
      >

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={handleLogout}
          className="
            w-full
            flex
            items-center
            gap-3
            px-4
            py-3
            rounded-xl
            text-red-600
            hover:bg-red-50
            dark:hover:bg-red-950/30
            transition
            duration-300
          "
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
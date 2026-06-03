import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingCart,
  Users,
  CheckCircle,
  Clock,
} from 'lucide-react';

import { AppProvider } from './contexts/AppContext';

import LoginFormNew from './components/LoginFormNew';
import RegisterFormNew from './components/RegisterFormNew';
import TypeSelection from './components/TypeSelection';
import ChatPageNew from './components/ChatPageNew';
import OrdersPage from './components/OrdersPage';
import SupplierDashboard from './components/SupplierDashboard';
import SupplierProductsPage from './components/SupplierProductsPage';
import ProductsPage from './components/ProductsPage';
import CompanyProfile from './components/CompanyProfile';
import SocialFeed from './components/SocialFeed';
import PaymentsPage from './components/PaymentsPage';
import SettingsPage from './components/SettingsPage';
import SidebarNew from './components/SidebarNew';

type Screen =
  | 'login'
  | 'register'
  | 'type-selection'
  | 'main';

type UserType = 'mercado' | 'fornecedor';

interface RegisterData {
  companyName: string;
  cnpj: string;
  email: string;
  password: string;
}

export default function App() {
  const [screen, setScreen] =
    useState<Screen>('login');

  const [userType, setUserType] =
    useState<UserType | null>(null);

  const [companyName, setCompanyName] =
    useState('');

  const [currentPage, setCurrentPage] =
    useState<string>('dashboard');

  const [selectedGroupId, setSelectedGroupId] =
    useState<string | null>(null);

  const [pendingRegisterData, setPendingRegisterData] =
    useState<RegisterData | null>(null);

  useEffect(() => {
    const savedTheme =
      localStorage.getItem('darkMode') === 'true';

    document.documentElement.classList.toggle(
      'dark',
      savedTheme
    );
  }, []);

  const handleLogin = (loginResponse: any) => {
    const user = loginResponse?.user || loginResponse;

    if (!user) {
      alert('Erro ao fazer login.');
      return;
    }

    if (!user.tipo_definido) {
      setScreen('type-selection');
      return;
    }

    const tipo = user.tipo as UserType;

    const nome =
      user?.perfil?.nome ||
      localStorage.getItem('companyName') ||
      'Amalgama';

    localStorage.setItem('companyName', nome);
    localStorage.setItem('userType', tipo);

    setCompanyName(nome);
    setUserType(tipo);
    setCurrentPage('dashboard');
    setScreen('main');
  };

  const handleRegister = (data: RegisterData) => {
    setPendingRegisterData(data);

    localStorage.setItem(
      'pendingCompanyName',
      data.companyName
    );

    localStorage.setItem(
      'pendingCnpj',
      data.cnpj
    );

    localStorage.setItem(
      'pendingEmail',
      data.email
    );

    setScreen('type-selection');
  };

  const handleTypeSelection = async (
    type: UserType
  ) => {
    const company =
      pendingRegisterData?.companyName ||
      localStorage.getItem('pendingCompanyName') ||
      '';

    const cnpj =
      pendingRegisterData?.cnpj ||
      localStorage.getItem('pendingCnpj') ||
      '';

    if (!company || !cnpj) {
      alert(
        'Dados do cadastro não encontrados. Faça o cadastro novamente.'
      );
      setScreen('register');
      return;
    }

    try {
      const response = await fetch(
        '/api/select-type',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
         body: JSON.stringify({
  tipo: type,
  companyName: company,
  cnpj,

  telefone:
    localStorage.getItem(
      'pendingTelefone'
    ),

  endereco:
    localStorage.getItem(
      'pendingEndereco'
    ),

  cidade:
    localStorage.getItem(
      'pendingCidade'
    ),

  estado:
    localStorage.getItem(
      'pendingEstado'
    ),
}),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            data.details ||
            'Erro ao escolher o tipo da conta'
        );
        return;
      }

      localStorage.removeItem('pendingCompanyName');
      localStorage.removeItem('pendingCnpj');
      localStorage.removeItem('pendingEmail');

      localStorage.removeItem('userType');
      localStorage.removeItem('companyName');

      setPendingRegisterData(null);
      setUserType(null);
      setCompanyName('');
      setCurrentPage('dashboard');

      alert(
        'Conta criada com sucesso! Agora faça login.'
      );

      setScreen('login');
    } catch (error) {
      alert(
        'Não foi possível conectar ao backend. Verifique se o Flask está rodando na porta 5001.'
      );
    }
  };

  const handleNavigate = (
    page: string,
    groupId?: string
  ) => {
    setCurrentPage(page);

    if (groupId) {
      setSelectedGroupId(groupId);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(
        '/api/logout',
        {
          method: 'POST',
          credentials: 'include',
        }
      );
    } catch (error) {
      console.log('Logout local');
    }

    localStorage.removeItem('companyName');
    localStorage.removeItem('userType');

    setCompanyName('');
    setUserType(null);
    setCurrentPage('dashboard');
    setScreen('login');
  };

  if (screen === 'login') {
    return (
      <LoginFormNew
        onLogin={handleLogin}
        onSwitchToRegister={() =>
          setScreen('register')
        }
      />
    );
  }

  if (screen === 'register') {
    return (
      <RegisterFormNew
        onRegister={handleRegister}
        onBack={() =>
          setScreen('login')
        }
      />
    );
  }

  if (screen === 'type-selection') {
    return (
      <TypeSelection
        onSelectType={
          handleTypeSelection
        }
      />
    );
  }

  if (screen === 'main' && userType) {
    return (
      <AppProvider>
        <div className="flex h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
          <SidebarNew
            userType={userType}
            activePage={currentPage}
            onNavigate={handleNavigate}
            companyName={companyName}
            onLogout={handleLogout}
          />

          <AnimatePresence mode="wait">
            {currentPage === 'dashboard' &&
              userType === 'fornecedor' && (
                <div
                  key="supplier-dashboard"
                  className="flex-1 bg-gray-50 dark:bg-black transition-colors duration-300"
                >
                  <SupplierDashboard
                    userType={userType}
                  />
                </div>
              )}

            {currentPage === 'dashboard' &&
              userType === 'mercado' && (
                <div
                  key="dashboard"
                  className="flex-1 overflow-auto bg-gray-50 dark:bg-black transition-colors duration-300"
                >
                  <div className="p-8 min-h-screen">
                    <div className="mb-8">
                      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Dashboard
                      </h1>

                      <p className="text-gray-600 dark:text-gray-400">
                        Visão geral da sua conta
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      {[
                        {
                          title: 'Pedidos Ativos',
                          value: '8',
                          icon: Clock,
                          bgColor:
                            'bg-yellow-50 dark:bg-blue-950',
                          textColor:
                            'text-yellow-600 dark:text-blue-300',
                        },
                        {
                          title: 'Participando',
                          value: '12',
                          icon: Users,
                          bgColor:
                            'bg-blue-50 dark:bg-blue-950',
                          textColor:
                            'text-blue-600 dark:text-blue-300',
                        },
                        {
                          title: 'Concluídos',
                          value: '45',
                          icon: CheckCircle,
                          bgColor:
                            'bg-green-50 dark:bg-green-950/40',
                          textColor:
                            'text-green-600 dark:text-green-300',
                        },
                        {
                          title: 'Total de Pedidos',
                          value: '65',
                          icon: ShoppingCart,
                          bgColor:
                            'bg-purple-50 dark:bg-purple-950/40',
                          textColor:
                            'text-purple-600 dark:text-purple-300',
                        },
                      ].map((stat, index) => (
                        <motion.div
                          key={stat.title}
                          initial={{
                            opacity: 0,
                            y: 20,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          transition={{
                            delay: index * 0.1,
                          }}
                          className="bg-white dark:bg-gray-950 rounded-2xl p-6 shadow-sm hover:shadow-md transition border border-gray-100 dark:border-gray-800"
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
                        </motion.div>
                      ))}
                    </div>

                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 20,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: 0.4,
                      }}
                      className="bg-white dark:bg-gray-950 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-800 transition-colors duration-300"
                    >
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Atividade Recente
                      </h2>

                      <div className="space-y-4">
                        {[1, 2, 3, 4].map((item) => (
                          <div
                            key={item}
                            className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition"
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 dark:from-blue-800 dark:to-blue-950 flex items-center justify-center">
                              <ShoppingCart className="w-5 h-5 text-white" />
                            </div>

                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 dark:text-white">
                                Pedido de Arroz Tipo 1
                              </p>

                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Supermercados Zona Sul • Há 2 horas
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="font-semibold text-gray-900 dark:text-white">
                                150 un.
                              </p>

                              <p className="text-sm text-green-600 dark:text-green-300">
                                Ativo
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>
              )}

            {currentPage === 'feed' && (
              <div
                key="feed"
                className="flex-1 bg-gray-50 dark:bg-black transition-colors duration-300"
              >
                <SocialFeed
                  userType={userType}
                  onNavigate={handleNavigate}
                />
              </div>
            )}

            {currentPage === 'chat' && (
              <div
                key="chat-wrapper"
                className="flex-1 bg-gray-50 dark:bg-black transition-colors duration-300"
              >
                <ChatPageNew
                  key="chat"
                  userType={userType}
                  groupId={selectedGroupId || '1'}
                />
              </div>
            )}

            {currentPage === 'pedidos' && (
              <div
                key="pedidos"
                className="flex-1 bg-gray-50 dark:bg-black transition-colors duration-300"
              >
                <OrdersPage
                  userType={userType}
                />
              </div>
            )}

            {currentPage === 'produtos' && (
              <div
                key="produtos"
                className="flex-1 bg-gray-50 dark:bg-black transition-colors duration-300"
              >
                {userType === 'fornecedor' ? (
                  <SupplierProductsPage
                    userType={userType}
                  />
                ) : (
                  <ProductsPage
                    userType={userType}
                  />
                )}
              </div>
            )}

            {currentPage === 'pagamentos' && (
              <div
                key="pagamentos"
                className="flex-1 bg-gray-50 dark:bg-black transition-colors duration-300"
              >
                <PaymentsPage
                  userType={userType}
                />
              </div>
            )}

            {currentPage === 'perfil' && (
              <div
                key="perfil"
                className="flex-1 bg-gray-50 dark:bg-black transition-colors duration-300"
              >
                <CompanyProfile
                  userType={userType}
                />
              </div>
            )}

            {currentPage === 'configuracoes' && (
              <div
                key="configuracoes"
                className="flex-1 bg-gray-50 dark:bg-black transition-colors duration-300"
              >
                <SettingsPage
                  userType={userType}
                />
              </div>
            )}
          </AnimatePresence>
        </div>
      </AppProvider>
    );
  }

  return null;
}
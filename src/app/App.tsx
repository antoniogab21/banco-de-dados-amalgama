import { useState } from 'react';
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

export default function App() {

  const [screen, setScreen] = useState<
    'login' |
    'register' |
    'type-selection' |
    'main'
  >('login');

  const [userType, setUserType] = useState<
    'mercado' | 'fornecedor' | null
  >(null);

  const [companyName, setCompanyName] =
    useState('');

  const [currentPage, setCurrentPage] =
    useState<string>('dashboard');

  const [selectedGroupId, setSelectedGroupId] =
    useState<string | null>(null);

  /* LOGIN */
  const handleLogin = (
    companyNameInput: string
  ) => {

    localStorage.setItem(
      'companyName',
      companyNameInput
    );

    setCompanyName(companyNameInput);

    setScreen('type-selection');
  };

  /* REGISTRO */
  const handleRegister = (data: any) => {

    console.log('Register:', data);

    setScreen('type-selection');
  };

  /* ESCOLHA TIPO */
  const handleTypeSelection = (
    type: 'mercado' | 'fornecedor'
  ) => {

    setUserType(type);

    setScreen('main');
  };

  /* NAVEGAÇÃO */
  const handleNavigate = (
    page: string,
    groupId?: string
  ) => {

    setCurrentPage(page);

    if (groupId) {

      setSelectedGroupId(groupId);
    }
  };

  /* LOGOUT */
  const handleLogout = () => {

    localStorage.removeItem('companyName');

    setCompanyName('');

    setUserType(null);

    setCurrentPage('dashboard');

    setScreen('login');
  };

  /* LOGIN */
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

  /* REGISTRO */
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

  /* ESCOLHA DE TIPO */
  if (screen === 'type-selection') {

    return (
      <TypeSelection
        onSelectType={
          handleTypeSelection
        }
      />
    );
  }

  /* APP PRINCIPAL */
  if (screen === 'main' && userType) {

    return (

      <AppProvider>

        <div className="flex h-screen bg-gray-50">

          {/* SIDEBAR */}
          <SidebarNew
            userType={userType}
            activePage={currentPage}
            onNavigate={handleNavigate}
            companyName={companyName}
            onLogout={handleLogout}
          />

          {/* PÁGINAS */}
          <AnimatePresence mode="wait">

            {/* DASHBOARD FORNECEDOR */}
            {currentPage === 'dashboard' &&
              userType === 'fornecedor' && (

              <div
                key="supplier-dashboard"
                className="flex-1"
              >

                <SupplierDashboard
                  userType={userType}
                />

              </div>
            )}

            {/* DASHBOARD MERCADO */}
            {currentPage === 'dashboard' &&
              userType === 'mercado' && (

              <div
                key="dashboard"
                className="flex-1 overflow-auto"
              >

                <div className="p-8">

                  <div className="mb-8">

                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                      Dashboard
                    </h1>

                    <p className="text-gray-600">
                      Visão geral da sua conta
                    </p>

                  </div>

                  {/* CARDS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

                    {[
                      {
                        title: 'Pedidos Ativos',
                        value: '8',
                        icon: Clock,
                        bgColor: 'bg-yellow-50',
                        textColor: 'text-yellow-600',
                      },
                      {
                        title: 'Participando',
                        value: '12',
                        icon: Users,
                        bgColor: 'bg-blue-50',
                        textColor: 'text-blue-600',
                      },
                      {
                        title: 'Concluídos',
                        value: '45',
                        icon: CheckCircle,
                        bgColor: 'bg-green-50',
                        textColor: 'text-green-600',
                      },
                      {
                        title: 'Total de Pedidos',
                        value: '65',
                        icon: ShoppingCart,
                        bgColor: 'bg-purple-50',
                        textColor: 'text-purple-600',
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
                        className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition"
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

                        <h3 className="text-gray-600 text-sm mb-1">
                          {stat.title}
                        </h3>

                        <p className="text-3xl font-bold text-gray-900">
                          {stat.value}
                        </p>

                      </motion.div>
                    ))}

                  </div>

                  {/* ATIVIDADE */}
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
                    className="bg-white rounded-2xl shadow-sm p-6"
                  >

                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      Atividade Recente
                    </h2>

                    <div className="space-y-4">

                      {[1, 2, 3, 4].map((item) => (

                        <div
                          key={item}
                          className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition"
                        >

                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center">

                            <ShoppingCart className="w-5 h-5 text-white" />

                          </div>

                          <div className="flex-1">

                            <p className="font-semibold text-gray-900">
                              Pedido de Arroz Tipo 1
                            </p>

                            <p className="text-sm text-gray-500">
                              Supermercados Zona Sul • Há 2 horas
                            </p>

                          </div>

                          <div className="text-right">

                            <p className="font-semibold text-gray-900">
                              150 un.
                            </p>

                            <p className="text-sm text-green-600">
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

            {/* FEED */}
            {currentPage === 'feed' && (

              <div
                key="feed"
                className="flex-1"
              >

                <SocialFeed
                  userType={userType}
                  onNavigate={handleNavigate}
                />

              </div>
            )}

            {/* CHAT */}
            {currentPage === 'chat' && (

              <ChatPageNew
                key="chat"
                userType={userType}
                groupId={selectedGroupId || '1'}
              />
            )}

            {/* PEDIDOS */}
            {currentPage === 'pedidos' && (

              <div
                key="pedidos"
                className="flex-1"
              >

                <OrdersPage
                  userType={userType}
                />

              </div>
            )}

            {/* PRODUTOS */}
            {currentPage === 'produtos' && (

              <div
                key="produtos"
                className="flex-1"
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

            {/* PAGAMENTOS */}
            {currentPage === 'pagamentos' && (

              <div
                key="pagamentos"
                className="flex-1"
              >

                <PaymentsPage
                  userType={userType}
                />

              </div>
            )}

            {/* PERFIL */}
            {currentPage === 'perfil' && (

              <div
                key="perfil"
                className="flex-1"
              >

                <CompanyProfile
                  userType={userType}
                />

              </div>
            )}

            {/* CONFIGURAÇÕES */}
            {currentPage === 'configuracoes' && (

              <div
                key="configuracoes"
                className="flex-1"
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
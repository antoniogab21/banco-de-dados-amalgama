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
import DashboardNew from './components/DashboardNew';

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
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
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

  localStorage.setItem(
    'pendingTelefone',
    data.telefone || ''
  );

  localStorage.setItem(
    'pendingEndereco',
    data.endereco || ''
  );

  localStorage.setItem(
    'pendingCidade',
    data.cidade || ''
  );

  localStorage.setItem(
    'pendingEstado',
    data.estado || ''
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
  pendingRegisterData?.telefone ||
  localStorage.getItem('pendingTelefone') ||
  '',
endereco:
  pendingRegisterData?.endereco ||
  localStorage.getItem('pendingEndereco') ||
  '',
cidade:
  pendingRegisterData?.cidade ||
  localStorage.getItem('pendingCidade') ||
  '',
estado:
  pendingRegisterData?.estado ||
  localStorage.getItem('pendingEstado') ||
  '',
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
    localStorage.removeItem('pendingTelefone');
    localStorage.removeItem('pendingEndereco');
    localStorage.removeItem('pendingCidade');
    localStorage.removeItem('pendingEstado');

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
      className="flex-1 bg-gray-50 dark:bg-black transition-colors duration-300"
    >
      <DashboardNew userType={userType} />
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
        onNavigate={handleNavigate}
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
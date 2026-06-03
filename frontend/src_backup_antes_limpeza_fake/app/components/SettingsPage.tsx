import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Lock,
  Bell,
  Shield,
  HelpCircle,
  Moon,
  Sun
} from 'lucide-react';

interface SettingsPageProps {
  userType: 'mercado' | 'fornecedor';
}

export default function SettingsPage({
  userType,
}: SettingsPageProps) {

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {

    const savedTheme =
      localStorage.getItem('darkMode');

    const isDark =
      savedTheme === 'true';

    setDarkMode(isDark);

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

  }, []);

  const toggleDarkMode = () => {

    const newTheme = !darkMode;

    setDarkMode(newTheme);

    localStorage.setItem(
      'darkMode',
      String(newTheme)
    );

    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (

    <div className="flex-1 overflow-auto bg-background text-foreground">

      <div className="p-8">

        <div className="mb-8 flex justify-between items-center">

          <div>

            <h1 className="text-4xl font-bold mb-2">
              Configurações
            </h1>

            <p className="text-muted-foreground">
              Personalize suas preferências e segurança
            </p>

          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleDarkMode}
            className="
              flex items-center gap-2
              px-5 py-3
              rounded-xl
              font-semibold
              bg-primary
              text-primary-foreground
            "
          >

            {darkMode ? (
              <>
                <Sun size={20} />
                Modo Claro
              </>
            ) : (
              <>
                <Moon size={20} />
                Modo Escuro
              </>
            )}

          </motion.button>

        </div>

        <div className="max-w-3xl space-y-6">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl shadow-sm p-6"
          >

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="p-3 rounded-xl bg-red-50">

                  <Lock className="w-6 h-6 text-red-600" />

                </div>

                <div>

                  <h3 className="font-bold">
                    Alterar Senha
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    Última alteração há 30 dias
                  </p>

                </div>

              </div>

              <button
                className="
                  bg-secondary
                  text-secondary-foreground
                  px-6 py-3
                  rounded-xl
                  font-semibold
                "
              >
                Alterar
              </button>

            </div>

          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl shadow-sm p-6"
          >

            <div className="flex items-center gap-4 mb-6">

              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900">

                <Bell className="w-6 h-6 text-blue-600" />

              </div>

              <div>

                <h3 className="font-bold">
                  Notificações
                </h3>

                <p className="text-sm text-muted-foreground">
                  Gerencie como você recebe notificações
                </p>

              </div>

            </div>

            <div className="space-y-4">

              {[
                'Novos pedidos',
                'Mensagens do chat',
                'Atualizações'
              ].map((item) => (

                <div
                  key={item}
                  className="
                    flex items-center justify-between
                    p-4 rounded-xl
                    bg-secondary
                  "
                >

                  <p className="font-semibold">
                    {item}
                  </p>

                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-5 h-5 accent-blue-700"
                  />

                </div>

              ))}

            </div>

          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl shadow-sm p-6"
          >

            <div className="flex items-center gap-4 mb-4">

              <div className="p-3 rounded-xl bg-green-50">

                <Shield className="w-6 h-6 text-green-600" />

              </div>

              <div>

                <h3 className="font-bold">
                  Segurança
                </h3>

                <p className="text-sm text-muted-foreground">
                  Configurações de segurança da conta
                </p>

              </div>

            </div>

            <p className="
              text-sm
              p-4
              rounded-xl
              bg-secondary
            ">
              Sua conta está protegida.
            </p>

          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-2xl shadow-sm p-6"
          >

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="p-3 rounded-xl bg-purple-50">

                  <HelpCircle className="w-6 h-6 text-purple-600" />

                </div>

                <div>

                  <h3 className="font-bold">
                    Central de Ajuda
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    Dúvidas e suporte
                  </p>

                </div>

              </div>

              <button
                className="
                  bg-secondary
                  text-secondary-foreground
                  px-6 py-3
                  rounded-xl
                  font-semibold
                "
              >
                Acessar
              </button>

            </div>

          </motion.div>

        </div>

      </div>

    </div>
  );
}
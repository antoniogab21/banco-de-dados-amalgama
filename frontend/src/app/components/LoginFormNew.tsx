import { useState } from 'react';
import { motion } from 'motion/react';
import { Building2, Lock } from 'lucide-react';
import logo from '../../assets/Subalterno.png';

interface LoginFormNewProps {
  onLogin: (companyId: string) => void;
  onSwitchToRegister: () => void;
}

export default function LoginFormNew({
  onLogin,
  onSwitchToRegister,
}: LoginFormNewProps) {

  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {

    e.preventDefault();

    if (companyName.trim() && password.trim()) {

      // SALVA O NOME DA EMPRESA
      localStorage.setItem('companyName', companyName);

      // LOGIN
      onLogin(companyName);
    }
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >

        {/* LOGO */}
        <div className="text-center mb-1">

          {/* NOVA LOGO */}
          <div className="w-100 h-100 mx-auto mb-1 overflow-hidden flex items-center justify-center">

  <img
    src={logo}
    alt="Logo"
    className="w-full h-full object-contain"
  />

</div>

        </div>

        {/* CARD */}
        <div className="bg-white rounded-2xl shadow-lg p-8">

          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Entrar na conta
          </h2>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* EMPRESA */}
            <div>

              <label
                htmlFor="companyName"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Nome da Empresa
              </label>

              <div className="relative">

                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">

                  <Building2 className="h-5 w-5 text-gray-400" />

                </div>

                <input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) =>
                    setCompanyName(e.target.value)
                  }
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 outline-none transition text-gray-900"
                  placeholder="Digite o nome da empresa"
                  required
                />

              </div>
            </div>

            {/* SENHA */}
            <div>

              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Senha
              </label>

              <div className="relative">

                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">

                  <Lock className="h-5 w-5 text-gray-400" />

                </div>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 outline-none transition text-gray-900"
                  placeholder="Digite sua senha"
                  required
                />

              </div>
            </div>

            {/* BOTÃO */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-bold py-4 rounded-xl transition shadow-lg hover:shadow-xl"
            >
              Entrar
            </motion.button>

          </form>

          {/* REGISTRO */}
          <div className="mt-6 text-center">

            <button
              onClick={onSwitchToRegister}
              className="text-gray-600 hover:text-yellow-600 font-semibold transition"
            >
              Criar conta
            </button>

          </div>

        </div>
      </motion.div>
    </div>
  );
}
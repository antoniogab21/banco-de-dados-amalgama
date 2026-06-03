import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock } from 'lucide-react';

import logoLight from '../../assets/Subalterno.png';
import logoDark from '../../assets/SubalternoDark.png';

interface LoginFormNewProps {
  onLogin: (data: any) => void;
  onSwitchToRegister: () => void;
}

export default function LoginFormNew({
  onLogin,
  onSwitchToRegister,
}: LoginFormNewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const response = await fetch(
        '/api/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            data.details ||
            'Erro ao fazer login'
        );

        setLoading(false);
        return;
      }

      onLogin(data);
    } catch (err) {
      setError(
        'Não foi possível conectar ao backend. Verifique se o Flask está rodando na porta 5001.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 transition-colors duration-300">
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="w-full max-w-md"
      >
        {/* LOGO */}
        <div className="text-center mb-1">
          <div className="w-100 h-100 mx-auto mb-1 overflow-hidden flex items-center justify-center">
            <img
              src={logoLight}
              alt="Logo Amalgama"
              className="w-full h-full object-contain block dark:hidden"
            />

            <img
              src={logoDark}
              alt="Logo Amalgama modo escuro"
              className="w-full h-full object-contain hidden dark:block"
            />
          </div>
        </div>

        {/* CARD */}
        <div className="bg-card border border-border rounded-2xl shadow-lg p-8 transition-colors duration-300">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Entrar na conta
          </h2>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 p-4 text-sm font-semibold text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* EMAIL */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-foreground mb-2"
              >
                Email
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  className="
                    w-full
                    pl-12
                    pr-4
                    py-3.5
                    rounded-xl
                    border-2
                    border-border
                    bg-background
                    text-foreground
                    focus:border-primary
                    focus:ring-4
                    focus:ring-primary/20
                    outline-none
                    transition
                    placeholder:text-muted-foreground
                  "
                  placeholder="Digite seu email"
                  required
                />
              </div>
            </div>

            {/* SENHA */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-foreground mb-2"
              >
                Senha
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  className="
                    w-full
                    pl-12
                    pr-4
                    py-3.5
                    rounded-xl
                    border-2
                    border-border
                    bg-background
                    text-foreground
                    focus:border-primary
                    focus:ring-4
                    focus:ring-primary/20
                    outline-none
                    transition
                    placeholder:text-muted-foreground
                  "
                  placeholder="Digite sua senha"
                  required
                />
              </div>
            </div>

            {/* BOTÃO */}
            <motion.button
              whileHover={{
                scale: loading ? 1 : 1.02,
              }}
              whileTap={{
                scale: loading ? 1 : 0.98,
              }}
              type="submit"
              disabled={loading}
              className="
                w-full
                bg-primary
                hover:opacity-90
                text-primary-foreground
                font-bold
                py-4
                rounded-xl
                transition
                shadow-lg
                disabled:opacity-60
                disabled:cursor-not-allowed
              "
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </motion.button>
          </form>

          {/* REGISTRO */}
          <div className="mt-6 text-center">
            <button
              onClick={onSwitchToRegister}
              type="button"
              className="
                text-muted-foreground
                hover:text-primary
                font-semibold
                transition
              "
            >
              Criar conta
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
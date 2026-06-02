import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Building2,
  Mail,
  Lock,
  FileText,
  ArrowLeft,
} from 'lucide-react';

interface RegisterFormNewProps {
  onRegister: (data: {
    companyName: string;
    cnpj: string;
    email: string;
    password: string;
  }) => void;
  onBack: () => void;
}

export default function RegisterFormNew({
  onRegister,
  onBack,
}: RegisterFormNewProps) {
  const [companyName, setCompanyName] =
    useState('');

  const [cnpj, setCnpj] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const limparCnpj = (value: string) => {
    return value.replace(/\D/g, '');
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    const cnpjLimpo = limparCnpj(cnpj);

    try {
      const response = await fetch(
        'http://127.0.0.1:5001/api/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            companyName,
            cnpj: cnpjLimpo,
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
            'Erro ao criar conta'
        );

        setLoading(false);
        return;
      }

      localStorage.setItem(
        'pendingCompanyName',
        companyName
      );

      localStorage.setItem(
        'pendingCnpj',
        cnpjLimpo
      );

      localStorage.setItem(
        'pendingEmail',
        email
      );

      onRegister({
        companyName,
        cnpj: cnpjLimpo,
        email,
        password,
      });
    } catch (err) {
      setError(
        'Não foi possível conectar ao backend. Verifique se o Flask está rodando na porta 5001.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
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
        {/* TOPO */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-3xl mb-4 shadow-lg">
            <Building2 className="w-10 h-10 text-primary-foreground" />
          </div>

          <h1 className="text-4xl font-bold text-foreground mb-2">
            Amalgama
          </h1>

          <p className="text-muted-foreground">
            Criar nova conta
          </p>
        </div>

        {/* CARD */}
        <div className="bg-card border border-border rounded-2xl shadow-lg p-8">
          <button
            onClick={onBack}
            type="button"
            className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>

          <h2 className="text-2xl font-bold text-foreground mb-6">
            Dados da empresa
          </h2>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 p-4 text-sm font-semibold text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* EMPRESA */}
            <div>
              <label
                htmlFor="companyName"
                className="block text-sm font-semibold text-foreground mb-2"
              >
                Nome da Empresa
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                </div>

                <input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) =>
                    setCompanyName(e.target.value)
                  }
                  className="
                    w-full
                    pl-12
                    pr-4
                    py-3
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
                  placeholder="Nome da sua empresa"
                  required
                />
              </div>
            </div>

            {/* CNPJ */}
            <div>
              <label
                htmlFor="cnpj"
                className="block text-sm font-semibold text-foreground mb-2"
              >
                CNPJ
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>

                <input
                  id="cnpj"
                  type="text"
                  value={cnpj}
                  onChange={(e) =>
                    setCnpj(e.target.value)
                  }
                  className="
                    w-full
                    pl-12
                    pr-4
                    py-3
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
                  placeholder="00.000.000/0000-00"
                  required
                />
              </div>
            </div>

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
                    py-3
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
                  placeholder="seu@email.com"
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
                    py-3
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
                  placeholder="Crie uma senha segura"
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
                text-primary-foreground
                font-bold
                py-4
                rounded-xl
                transition
                shadow-lg
                hover:opacity-90
                mt-6
                disabled:opacity-60
                disabled:cursor-not-allowed
              "
            >
              {loading
                ? 'Criando conta...'
                : 'Criar conta'}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
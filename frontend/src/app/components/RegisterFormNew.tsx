import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Building2,
  Mail,
  Lock,
  FileText,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

interface RegisterFormNewProps {
  onRegister: (data: {
    companyName: string;
    cnpj: string;
    email: string;
    password: string;
    telefone?: string;
    endereco?: string;
    cidade?: string;
    estado?: string;
  }) => void;
  onBack: () => void;
}

export default function RegisterFormNew({
  onRegister,
  onBack,
}: RegisterFormNewProps) {
  const [companyName, setCompanyName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [consultandoCnpj, setConsultandoCnpj] =
  useState(false);

const [enderecoEmpresa, setEnderecoEmpresa] =
  useState('');

const [telefoneEmpresa, setTelefoneEmpresa] =
  useState('');

const [cidadeEmpresa, setCidadeEmpresa] =
  useState('');

const [estadoEmpresa, setEstadoEmpresa] =
  useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [verificationCode, setVerificationCode] = useState('');
  const [devCode, setDevCode] = useState('');
  const [step, setStep] = useState<'register' | 'verify'>('register');

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');

  const limparCnpj = (value: string) => {
    return value.replace(/\D/g, '');
  };

const buscarCnpj = async (
  valorCnpj: string
) => {
  const cnpjLimpo =
    valorCnpj.replace(/\D/g, '');

  if (cnpjLimpo.length !== 14) {
    return;
  }

  try {
    setConsultandoCnpj(true);

    const response = await fetch(
      `/api/cnpj/${cnpjLimpo}`
    );

    const data = await response.json();

    if (!response.ok) {
      return;
    }

    if (data.nome) {
      setCompanyName(data.nome);
    }

    if (data.telefone) {
      setTelefoneEmpresa(
        data.telefone
      );
    }

    if (data.cidade) {
      setCidadeEmpresa(
        data.cidade
      );
    }

    if (data.estado) {
      setEstadoEmpresa(
        data.estado
      );
    }

const enderecoCompleto = [
  data.logradouro,
  data.numero,
  data.bairro,
]
  .filter(Boolean)
  .join(' - ');

if (enderecoCompleto) {
  setEnderecoEmpresa(enderecoCompleto);
}

  } catch (error) {
    console.error(error);
  } finally {
    setConsultandoCnpj(false);
  }
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
        '/api/register',
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
  telefone: telefoneEmpresa,
  endereco: enderecoEmpresa,
  cidade: cidadeEmpresa,
  estado: estadoEmpresa,
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

localStorage.setItem(
  'pendingTelefone',
  telefoneEmpresa
);

localStorage.setItem(
  'pendingEndereco',
  enderecoEmpresa
);

localStorage.setItem(
  'pendingCidade',
  cidadeEmpresa
);

localStorage.setItem(
  'pendingEstado',
  estadoEmpresa
);

      if (data.verification_code_dev) {
        setDevCode(data.verification_code_dev);
      }

      if (data.pending_email_verification) {
        setStep('verify');
        return;
      }

     onRegister({
  companyName,
  cnpj: cnpjLimpo,
  email,
  password,
  telefone: telefoneEmpresa,
  endereco: enderecoEmpresa,
  cidade: cidadeEmpresa,
  estado: estadoEmpresa,
});
    } catch (err) {
      setError(
        'Não foi possível conectar ao backend. Verifique se o Flask está rodando na porta 5001.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError('');
    setVerifying(true);

    const cnpjLimpo = limparCnpj(cnpj);

    try {
      const response = await fetch(
        '/api/verify-email',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            codigo: verificationCode,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            data.details ||
            'Código inválido'
        );

        return;
      }

      onRegister({
  companyName,
  cnpj: cnpjLimpo,
  email,
  password,
  telefone: telefoneEmpresa,
  endereco: enderecoEmpresa,
  cidade: cidadeEmpresa,
  estado: estadoEmpresa,
});
    } catch (err) {
      setError(
        'Não foi possível verificar o e-mail. Tente novamente.'
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setResending(true);

    try {
      const response = await fetch(
        '/api/resend-verification-code',
        {
          method: 'POST',
          credentials: 'include',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            data.details ||
            'Erro ao reenviar código'
        );

        return;
      }

      if (data.verification_code_dev) {
        setDevCode(data.verification_code_dev);
      }
    } catch (err) {
      setError(
        'Não foi possível reenviar o código.'
      );
    } finally {
      setResending(false);
    }
  };

  if (step === 'verify') {
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
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-3xl mb-4 shadow-lg">
              <ShieldCheck className="w-10 h-10 text-primary-foreground" />
            </div>

            <h1 className="text-4xl font-bold text-foreground mb-2">
              Verificar e-mail
            </h1>

            <p className="text-muted-foreground">
              Digite o código enviado para {email}
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl shadow-lg p-8">
            <button
              onClick={() => setStep('register')}
              type="button"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>

            <h2 className="text-2xl font-bold text-foreground mb-4">
              Código de verificação
            </h2>

            <p className="text-sm text-muted-foreground mb-6">
              Enviamos um código de 6 dígitos para o e-mail informado.
            </p>

            {devCode && (
              <div className="mb-5 rounded-xl border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/30 dark:border-yellow-900 p-4 text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                Código para teste: {devCode}
              </div>
            )}

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 p-4 text-sm font-semibold text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            <form
              onSubmit={handleVerifyEmail}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="verificationCode"
                  className="block text-sm font-semibold text-foreground mb-2"
                >
                  Código
                </label>

                <input
                  id="verificationCode"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) =>
                    setVerificationCode(
                      e.target.value.replace(/\D/g, '')
                    )
                  }
                  className="
                    w-full
                    px-4
                    py-4
                    rounded-xl
                    border-2
                    border-border
                    bg-background
                    text-foreground
                    text-center
                    text-2xl
                    tracking-[0.4em]
                    font-bold
                    focus:border-primary
                    focus:ring-4
                    focus:ring-primary/20
                    outline-none
                    transition
                    placeholder:text-muted-foreground
                  "
                  placeholder="000000"
                  required
                />
              </div>

              <motion.button
                whileHover={{
                  scale: verifying ? 1 : 1.02,
                }}
                whileTap={{
                  scale: verifying ? 1 : 0.98,
                }}
                type="submit"
                disabled={verifying || verificationCode.length !== 6}
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
                  disabled:opacity-60
                  disabled:cursor-not-allowed
                "
              >
                {verifying
                  ? 'Verificando...'
                  : 'Verificar e-mail'}
              </motion.button>

              <button
                type="button"
                onClick={handleResendCode}
                disabled={resending}
                className="
                  w-full
                  text-sm
                  font-semibold
                  text-primary
                  hover:underline
                  disabled:opacity-60
                "
              >
                {resending
                  ? 'Reenviando...'
                  : 'Reenviar código'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

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
      onChange={(e) => {
        setCnpj(e.target.value);

        const limpo =
          e.target.value.replace(/\D/g, '');

        if (limpo.length === 14) {
          buscarCnpj(limpo);
        }
      }}
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

  {consultandoCnpj && (
    <p className="text-sm text-primary mt-2">
      Consultando Receita Federal...
    </p>
  )}

  {telefoneEmpresa && (
    <p className="text-sm text-muted-foreground mt-2">
      <strong>Telefone:</strong> {telefoneEmpresa}
    </p>
  )}

  {cidadeEmpresa && (
    <p className="text-sm text-muted-foreground">
      <strong>Cidade:</strong> {cidadeEmpresa}
    </p>
  )}

  {estadoEmpresa && (
    <p className="text-sm text-muted-foreground">
      <strong>Estado:</strong> {estadoEmpresa}
    </p>
  )}

{enderecoEmpresa && (
  <p className="text-sm text-muted-foreground">
    <strong>Endereço:</strong> {enderecoEmpresa}
  </p>
)}

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
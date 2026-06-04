import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Building2,
  Mail,
  FileText,
  Edit2,
  Upload,
  Save,
  Phone,
  MapPin,
} from 'lucide-react';

interface CompanyProfileProps {
  userType: 'mercado' | 'fornecedor';
}

interface CompanyData {
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  descricao: string;
  logo: string;
}

export default function CompanyProfile({
  userType,
}: CompanyProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [companyData, setCompanyData] = useState<CompanyData>({
    nome: '',
    cnpj: '',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
    descricao: '',
    logo: '',
  });

  async function loadProfile() {
    try {
      setLoading(true);

      const response = await fetch('/api/me', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            data.details ||
            'Erro ao carregar perfil'
        );
        return;
      }

      const user = data.user || data;
      const perfil = user.perfil || {};

      setCompanyData({
        nome: perfil.nome || '',
        cnpj: perfil.cnpj || '',
        email: user.email || '',
        telefone: perfil.telefone || '',
        endereco: perfil.endereco || '',
        cidade: perfil.cidade || '',
        estado: perfil.estado || '',
        descricao: perfil.descricao || '',
        logo: perfil.foto_perfil || '',
      });
    } catch (error) {
      alert('Não foi possível carregar o perfil.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setCompanyData({
      ...companyData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogoUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setCompanyData((prev) => ({
        ...prev,
        logo: reader.result as string,
      }));
    };

    reader.readAsDataURL(file);
  };

  async function handleSave() {
    try {
      setSaving(true);

      const meResponse = await fetch('/api/me', {
        method: 'GET',
        credentials: 'include',
      });

      const meData = await meResponse.json();

      if (!meResponse.ok) {
        alert('Não foi possível identificar o perfil.');
        return;
      }

      const user = meData.user || meData;
      const perfilId = user.perfil?.id;

      if (!perfilId) {
        alert('Perfil não encontrado.');
        return;
      }

      const response = await fetch(`/api/empresas/${perfilId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          nome: companyData.nome,
          telefone: companyData.telefone,
          endereco: companyData.endereco,
          cidade: companyData.cidade,
          estado: companyData.estado,
          descricao: companyData.descricao,
          foto_perfil: companyData.logo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            data.details ||
            'Erro ao salvar perfil'
        );
        return;
      }

      localStorage.setItem('companyName', companyData.nome);

      alert('Perfil atualizado com sucesso!');
      setIsEditing(false);
      await loadProfile();
    } catch (error) {
      alert('Não foi possível salvar o perfil.');
    } finally {
      setSaving(false);
    }
  }

  function formatCnpj(value: string) {
    const clean = value.replace(/\D/g, '');

    if (clean.length !== 14) return value;

    return clean.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5'
    );
  }

  const enderecoCompleto = [
    companyData.endereco,
    companyData.cidade,
    companyData.estado,
  ]
    .filter(Boolean)
    .join(' - ');

  if (loading) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-black text-gray-900 dark:text-white p-8">
        <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl p-8">
          Carregando perfil...
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Perfil da Empresa
          </h1>

          <p className="text-gray-600 dark:text-gray-400">
            Gerencie as informações da sua empresa
          </p>
        </div>

        <div className="max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm p-8 mb-6 transition-colors duration-300"
          >
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="relative">
                <div className="w-36 h-36 rounded-3xl overflow-hidden bg-gradient-to-br from-yellow-400 to-yellow-500 dark:from-blue-800 dark:to-blue-950 flex items-center justify-center shadow-lg transition-colors duration-300">
                  {companyData.logo ? (
                    <img
                      src={companyData.logo}
                      alt="Logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-16 h-16 text-white" />
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  id="logoUpload"
                  className="hidden"
                  onChange={handleLogoUpload}
                />

                {isEditing && (
                  <label
                    htmlFor="logoUpload"
                    className="absolute bottom-0 right-0 w-11 h-11 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full shadow-md flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                  >
                    <Upload className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                  </label>
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {companyData.nome || 'Empresa'}
                    </h2>

                    <div className="mt-3 inline-flex px-4 py-2 rounded-full bg-yellow-100 dark:bg-blue-950 text-yellow-700 dark:text-blue-300 font-semibold text-sm">
                      {userType === 'mercado' ? 'Mercado' : 'Fornecedor'}
                    </div>
                  </div>

                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 bg-yellow-500 dark:bg-blue-900 hover:bg-yellow-600 dark:hover:bg-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition"
                    >
                      <Edit2 className="w-4 h-4" />
                      Editar Perfil
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Salvando...' : 'Salvar'}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <div className="bg-gray-100 dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-2xl p-5">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Desde
                    </p>

                    <p className="font-bold text-gray-900 dark:text-white">
                      Cadastro ativo
                    </p>
                  </div>

                  <div className="bg-gray-100 dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-2xl p-5">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Tipo
                    </p>

                    <p className="font-bold text-gray-900 dark:text-white">
                      {userType === 'mercado' ? 'Mercado' : 'Fornecedor'}
                    </p>
                  </div>

                  <div className="bg-gray-100 dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-2xl p-5">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      CNPJ
                    </p>

                    <p className="font-bold text-gray-900 dark:text-white">
                      {formatCnpj(companyData.cnpj)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm p-8 transition-colors duration-300"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              Informações da Empresa
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                  Nome da Empresa
                </label>

                <div className="mt-2 flex items-center gap-3 bg-gray-50 dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-xl px-4 py-4">
                  <Building2 className="w-5 h-5 text-gray-400 dark:text-gray-500" />

                  <input
                    type="text"
                    name="nome"
                    value={companyData.nome}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="bg-transparent w-full outline-none font-semibold text-gray-900 dark:text-white disabled:cursor-default"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                  CNPJ
                </label>

                <div className="mt-2 flex items-center gap-3 bg-gray-50 dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-xl px-4 py-4">
                  <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500" />

                  <input
                    type="text"
                    name="cnpj"
                    value={formatCnpj(companyData.cnpj)}
                    disabled
                    className="bg-transparent w-full outline-none font-semibold text-gray-900 dark:text-white disabled:cursor-default"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                  Email
                </label>

                <div className="mt-2 flex items-center gap-3 bg-gray-50 dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-xl px-4 py-4">
                  <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500" />

                  <input
                    type="email"
                    name="email"
                    value={companyData.email}
                    disabled
                    className="bg-transparent w-full outline-none font-semibold text-gray-900 dark:text-white disabled:cursor-default"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                  Telefone
                </label>

                <div className="mt-2 flex items-center gap-3 bg-gray-50 dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-xl px-4 py-4">
                  <Phone className="w-5 h-5 text-gray-400 dark:text-gray-500" />

                  <input
                    type="text"
                    name="telefone"
                    value={companyData.telefone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Telefone não informado"
                    className="bg-transparent w-full outline-none font-semibold text-gray-900 dark:text-white disabled:cursor-default placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                  Endereço
                </label>

                <div className="mt-2 flex items-center gap-3 bg-gray-50 dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-xl px-4 py-4">
                  <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500" />

                  <input
                    type="text"
                    name="endereco"
                    value={
                      isEditing
                        ? companyData.endereco
                        : enderecoCompleto
                    }
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Endereço não informado"
                    className="bg-transparent w-full outline-none font-semibold text-gray-900 dark:text-white disabled:cursor-default placeholder:text-gray-400"
                  />
                </div>
              </div>

              {isEditing && (
                <>
                  <div>
                    <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                      Cidade
                    </label>

                    <div className="mt-2 flex items-center gap-3 bg-gray-50 dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-xl px-4 py-4">
                      <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500" />

                      <input
                        type="text"
                        name="cidade"
                        value={companyData.cidade}
                        onChange={handleChange}
                        placeholder="Cidade"
                        className="bg-transparent w-full outline-none font-semibold text-gray-900 dark:text-white placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                      Estado
                    </label>

                    <div className="mt-2 flex items-center gap-3 bg-gray-50 dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-xl px-4 py-4">
                      <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500" />

                      <input
                        type="text"
                        name="estado"
                        value={companyData.estado}
                        onChange={handleChange}
                        placeholder="Estado"
                        className="bg-transparent w-full outline-none font-semibold text-gray-900 dark:text-white placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                  Descrição da Empresa
                </label>

                <div className="mt-2 bg-gray-50 dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-xl px-4 py-4">
                  <textarea
                    name="descricao"
                    value={companyData.descricao}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={5}
                    placeholder="Fale sobre sua empresa..."
                    className="bg-transparent w-full outline-none resize-none font-semibold text-gray-900 dark:text-white disabled:cursor-default placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
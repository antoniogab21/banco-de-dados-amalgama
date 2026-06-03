import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Building2,
  Mail,
  FileText,
  Edit2,
  Upload,
  Users,
  Save,
  Phone,
  MapPin,
} from 'lucide-react';

interface CompanyProfileProps {
  userType: 'mercado' | 'fornecedor';
}

export default function CompanyProfile({
  userType,
}: CompanyProfileProps) {
  const [isEditing, setIsEditing] = useState(false);

  const [companyData, setCompanyData] = useState({
    nome: localStorage.getItem('companyName') || 'Empresa',
    cnpj: localStorage.getItem('companyCnpj') || '',
    email: localStorage.getItem('companyEmail') || '',
    telefone: localStorage.getItem('companyPhone') || '',
    endereco: localStorage.getItem('companyAddress') || '',
    descricao: localStorage.getItem('companyDescription') || '',
    logo: localStorage.getItem('companyLogo') || '',
  });

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

  const handleSave = () => {
    localStorage.setItem('companyName', companyData.nome);
    localStorage.setItem('companyCnpj', companyData.cnpj);
    localStorage.setItem('companyEmail', companyData.email);
    localStorage.setItem('companyPhone', companyData.telefone);
    localStorage.setItem('companyAddress', companyData.endereco);
    localStorage.setItem('companyDescription', companyData.descricao);
    localStorage.setItem('companyLogo', companyData.logo);

    alert('Perfil atualizado com sucesso!');
    setIsEditing(false);
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      <div className="p-8">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Perfil da Empresa
          </h1>

          <p className="text-gray-600 dark:text-gray-400">
            Gerencie as informações da sua empresa
          </p>
        </div>

        <div className="max-w-5xl">
          {/* CARD PRINCIPAL */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm p-8 mb-6 transition-colors duration-300"
          >
            <div className="flex flex-col lg:flex-row gap-8">
              {/* LOGO */}
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

              {/* DADOS */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {companyData.nome}
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
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition"
                    >
                      <Save className="w-4 h-4" />
                      Salvar
                    </button>
                  )}
                </div>

                {/* ESTATÍSTICAS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <div className="bg-gray-100 dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-2xl p-5">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Desde
                    </p>

                    <p className="font-bold text-gray-900 dark:text-white">
                      Janeiro 2026
                    </p>
                  </div>

                  <div className="bg-gray-100 dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-2xl p-5">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {userType === 'mercado'
                        ? 'Pedidos Feitos'
                        : 'Pedidos Recebidos'}
                    </p>

                    <p className="font-bold text-gray-900 dark:text-white">
                      65
                    </p>
                  </div>

                  <div className="bg-gray-100 dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-2xl p-5">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Grupos
                    </p>

                    <p className="font-bold text-gray-900 dark:text-white">
                      12
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* INFORMAÇÕES */}
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
              {/* NOME */}
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

              {/* CNPJ */}
              <div>
                <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                  CNPJ
                </label>

                <div className="mt-2 flex items-center gap-3 bg-gray-50 dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-xl px-4 py-4">
                  <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500" />

                  <input
                    type="text"
                    name="cnpj"
                    value={companyData.cnpj}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="bg-transparent w-full outline-none font-semibold text-gray-900 dark:text-white disabled:cursor-default"
                  />
                </div>
              </div>

              {/* EMAIL */}
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
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="bg-transparent w-full outline-none font-semibold text-gray-900 dark:text-white disabled:cursor-default"
                  />
                </div>
              </div>

              {/* TELEFONE */}
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
                    className="bg-transparent w-full outline-none font-semibold text-gray-900 dark:text-white disabled:cursor-default"
                  />
                </div>
              </div>

              {/* ENDEREÇO */}
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                  Endereço
                </label>

                <div className="mt-2 flex items-center gap-3 bg-gray-50 dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-xl px-4 py-4">
                  <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500" />

                  <input
                    type="text"
                    name="endereco"
                    value={companyData.endereco}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="bg-transparent w-full outline-none font-semibold text-gray-900 dark:text-white disabled:cursor-default"
                  />
                </div>
              </div>

              {/* DESCRIÇÃO */}
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
                    placeholder="Fale sobre sua empresa..."
                    className="bg-transparent w-full outline-none font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 min-h-[120px] resize-none disabled:cursor-default"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* EMPRESAS */}
          {userType === 'fornecedor' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm p-8 mt-6 transition-colors duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-yellow-600 dark:text-blue-300" />

                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Empresas Vinculadas
                  </h3>
                </div>

                <span className="bg-yellow-100 dark:bg-blue-950 text-yellow-700 dark:text-blue-300 px-4 py-2 rounded-full font-bold">
                  24 empresas
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Mercado Central',
                  'Supermercado União',
                  'Mercadinho Bom Preço',
                  'Atacado Popular',
                ].map((company, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-2xl p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-blue-950 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-yellow-600 dark:text-blue-300" />
                    </div>

                    <span className="font-semibold text-gray-900 dark:text-white">
                      {company}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
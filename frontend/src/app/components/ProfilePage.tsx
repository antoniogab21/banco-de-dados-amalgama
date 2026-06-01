import { motion } from 'motion/react';
import { Building2, Mail, FileText, Edit2 } from 'lucide-react';
import SidebarNew from './SidebarNew';

interface ProfilePageProps {
  userType: 'mercado' | 'fornecedor';
}

export default function ProfilePage({ userType }: ProfilePageProps) {
  return (
    <>
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Perfil da Empresa</h1>
            <p className="text-gray-600">Gerencie as informações da sua empresa</p>
          </div>

          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm p-8"
            >
              {/* Avatar */}
              <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-lg">
                  <Building2 className="w-12 h-12 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Minha Empresa</h2>
                  <p className="text-gray-500 capitalize">{userType}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl transition"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </motion.button>
              </div>

              {/* Info Fields */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-500 mb-2">
                    Nome da Empresa
                  </label>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                    <Building2 className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 font-semibold">Minha Empresa LTDA</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-500 mb-2">
                    CNPJ
                  </label>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 font-semibold">00.000.000/0000-00</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-500 mb-2">
                    Email
                  </label>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 font-semibold">contato@minhaempresa.com</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-500 mb-2">
                    Tipo de Conta
                  </label>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-50 border-2 border-yellow-200">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-yellow-700 font-bold capitalize">{userType}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}

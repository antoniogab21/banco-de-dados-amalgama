import { Building2, MessageSquare, ShoppingCart, FileText, Plus } from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: 'home' | 'chat' | 'orders' | 'receipts') => void;
  onGroupClick: (groupName: string) => void;
  onCreateOrder: () => void;
}

export default function Sidebar({ activeView, setActiveView, onGroupClick, onCreateOrder }: SidebarProps) {
  const groups = [
    { id: 1, name: 'Supermercados Zona Sul', members: 12, unread: 3 },
    { id: 2, name: 'Padarias Centro', members: 8, unread: 0 },
    { id: 3, name: 'Mercearias Atacado', members: 15, unread: 5 },
  ];

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Company Profile */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Minha Empresa</h3>
            <p className="text-sm text-gray-500">CNPJ: 00.000.000/0000-00</p>
          </div>
        </div>
      </div>

      {/* Create Order Button */}
      <div className="p-4 border-b border-gray-200">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCreateOrder}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Criar Pedido
        </motion.button>
      </div>

      {/* Groups Section */}
      <div className="flex-1 overflow-auto">
        <div className="p-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Meus Grupos
          </h4>
          <div className="space-y-2">
            {groups.map((group) => (
              <motion.button
                key={group.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onGroupClick(group.name)}
                className="w-full p-3 rounded-lg hover:bg-gray-50 transition text-left group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {group.name}
                      </p>
                      {group.unread > 0 && (
                        <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 ml-2">
                          {group.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{group.members} membros</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-4 border-t border-gray-200">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Menu
          </h4>
          <div className="space-y-1">
            <button
              onClick={() => setActiveView('orders')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                activeView === 'orders'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="font-medium text-sm">Histórico de Pedidos</span>
            </button>

            <button
              onClick={() => setActiveView('receipts')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                activeView === 'receipts'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="font-medium text-sm">Recibos</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

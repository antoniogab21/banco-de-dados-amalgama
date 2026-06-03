import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Plus,
  MessageSquare,
  Users,
  Package,
  TrendingUp,
} from 'lucide-react';

import { useApp } from '../contexts/AppContext';
import CreateOrderModalNew from './CreateOrderModalNew';

interface SocialFeedProps {
  userType: 'mercado' | 'fornecedor';
  onNavigate?: (page: string, groupId?: string) => void;
}

export default function SocialFeed({
  userType,
  onNavigate,
}: SocialFeedProps) {
  const {
    orders,
    createOrder,
    joinOrder,
    cancelOrder,
  } = useApp();

  const [isCreateOrderOpen, setIsCreateOrderOpen] =
    useState(false);

  const [joiningOrderId, setJoiningOrderId] =
    useState<string | null>(null);

  const [joinQuantity, setJoinQuantity] =
    useState('');

  const groups = [
    {
      id: '1',
      name: 'Supermercados Zona Sul',
      members: 12,
    },
    {
      id: '2',
      name: 'Padarias Centro',
      members: 8,
    },
    {
      id: '3',
      name: 'Mercearias Atacado',
      members: 15,
    },
  ];

  const companyName =
    localStorage.getItem('companyName') ||
    'Minha Empresa';

  function handleCreateOrder(orderData: {
    productName: string;
    supplier: string;
    quantity: number;
  }) {
    createOrder({
      productName: orderData.productName,
      supplier: orderData.supplier,
      quantity: orderData.quantity,
      groupId: '1',
      groupName: 'Supermercados Zona Sul',
      creator: companyName,
    });

    setIsCreateOrderOpen(false);
  }

  function handleJoinOrder(orderId: string) {
    const quantity = parseInt(joinQuantity);

    if (quantity > 0) {
      joinOrder(
        orderId,
        quantity,
        companyName
      );

      setJoiningOrderId(null);
      setJoinQuantity('');
    }
  }

  function handleCancelParticipation(orderId: string) {
    cancelOrder(orderId, companyName);
  }

  return (
    <>
      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
        <div className="p-8">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Feed de Grupos
              </h1>

              <p className="text-gray-600 dark:text-gray-400">
                Acompanhe pedidos coletivos e participe
              </p>
            </div>

            {userType === 'mercado' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  setIsCreateOrderOpen(true)
                }
                className="
                  flex items-center gap-2
                  bg-gradient-to-r from-yellow-400 to-yellow-500
                  dark:from-blue-800 dark:to-blue-950
                  hover:from-yellow-500 hover:to-yellow-600
                  dark:hover:from-blue-700 dark:hover:to-blue-900
                  text-white font-bold px-6 py-3 rounded-xl shadow-lg
                  transition
                "
              >
                <Plus className="w-5 h-5" />
                Criar Pedido
              </motion.button>
            )}
          </div>

          {/* GRUPOS */}
          <div className="space-y-6">
            {groups.map((group, index) => {
              const groupOrders =
                orders.filter(
                  (o) => o.groupId === group.id
                );

              return (
                <motion.div
                  key={group.id}
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.1,
                  }}
                  className="
                    bg-white dark:bg-gray-950
                    border border-gray-200 dark:border-gray-800
                    rounded-2xl shadow-sm overflow-hidden
                    transition-colors duration-300
                  "
                >
                  {/* TOPO DO GRUPO */}
                  <div
                    className="
                      bg-gradient-to-r from-yellow-400 to-yellow-500
                      dark:from-blue-800 dark:to-blue-950
                      p-6 transition-colors duration-300
                    "
                  >
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                          <Users className="w-8 h-8" />
                        </div>

                        <div>
                          <h2 className="text-2xl font-bold">
                            {group.name}
                          </h2>

                          <div className="flex items-center gap-4 text-sm opacity-90 mt-1">
                            <span>
                              {group.members} membros
                            </span>

                            <span>•</span>

                            <span>
                              {groupOrders.length} pedidos ativos
                            </span>
                          </div>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{
                          scale: 1.05,
                        }}
                        whileTap={{
                          scale: 0.95,
                        }}
                        onClick={() =>
                          onNavigate?.(
                            'chat',
                            group.id
                          )
                        }
                        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold px-6 py-3 rounded-xl transition"
                      >
                        <MessageSquare className="w-5 h-5" />
                        Chat
                      </motion.button>
                    </div>
                  </div>

                  {/* PEDIDOS */}
                  <div className="p-6 space-y-4">
                    {groupOrders.map((order) => {
                      const isParticipating =
                        order.participants.some(
                          (p) =>
                            p.company ===
                            companyName
                        );

                      const pricePerUnit =
                        22.90;

                      const totalValue =
                        order.quantity *
                        pricePerUnit;

                      return (
                        <div
                          key={order.id}
                          className="
                            border-2 border-yellow-200 dark:border-blue-900
                            bg-white dark:bg-gray-950
                            rounded-xl p-5
                            hover:border-yellow-400 dark:hover:border-blue-700
                            transition
                          "
                        >
                          {/* TOPO */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div
                                  className="
                                    w-10 h-10 rounded-full
                                    bg-yellow-100 dark:bg-blue-950
                                    flex items-center justify-center
                                  "
                                >
                                  <Package className="w-5 h-5 text-yellow-600 dark:text-blue-300" />
                                </div>

                                <div>
                                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                                    {order.productName}
                                  </h3>

                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Criado por {order.creator}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 bg-yellow-50 dark:bg-blue-950 px-4 py-2 rounded-full">
                              <TrendingUp className="w-4 h-4 text-yellow-600 dark:text-blue-300" />

                              <span className="font-semibold text-yellow-700 dark:text-blue-300">
                                {order.quantity} un.
                              </span>
                            </div>
                          </div>

                          {/* INFORMAÇÕES */}
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Participantes
                              </p>

                              <p className="font-bold text-gray-900 dark:text-white">
                                {order.participants.length}
                              </p>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Quantidade Atual
                              </p>

                              <p className="font-bold text-gray-900 dark:text-white">
                                {order.quantity}
                              </p>
                            </div>

                            <div className="bg-yellow-50 dark:bg-blue-950 rounded-lg p-3">
                              <p className="text-xs text-yellow-700 dark:text-blue-300 mb-1">
                                Valor Total
                              </p>

                              <p className="font-bold text-yellow-700 dark:text-blue-300">
                                R$ {totalValue.toFixed(2)}
                              </p>
                            </div>
                          </div>

                          {/* BARRA */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Progresso do pedido
                              </span>

                              <span className="text-xs font-semibold text-yellow-600 dark:text-blue-300">
                                {order.participants.length} empresas participando
                              </span>
                            </div>

                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                              <div
                                className="
                                  bg-gradient-to-r from-yellow-400 to-yellow-500
                                  dark:from-blue-700 dark:to-blue-950
                                  h-2 rounded-full
                                "
                                style={{
                                  width: `${
                                    (
                                      order.participants.length /
                                      group.members
                                    ) * 100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>

                          {/* PARTICIPANTES */}
                          {order.participants.length > 0 && (
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-4">
                              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3">
                                Participantes:
                              </p>

                              <div className="space-y-2">
                                {order.participants.map(
                                  (
                                    participant,
                                    idx
                                  ) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between"
                                    >
                                      <span className="text-sm text-gray-700 dark:text-gray-300">
                                        {participant.company}
                                      </span>

                                      <span className="font-bold text-yellow-600 dark:text-blue-300">
                                        {participant.quantity} un.
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          {/* ENTRAR */}
                          {userType ===
                            'mercado' &&
                            !isParticipating && (
                              joiningOrderId ===
                              order.id ? (
                                <div className="flex gap-2">
                                  <input
                                    type="number"
                                    min="1"
                                    value={
                                      joinQuantity
                                    }
                                    onChange={(e) =>
                                      setJoinQuantity(
                                        e.target.value
                                      )
                                    }
                                    placeholder="Quantidade"
                                    className="
                                      flex-1 px-4 py-3 rounded-xl
                                      border-2 border-gray-200 dark:border-gray-700
                                      bg-white dark:bg-gray-900
                                      text-gray-900 dark:text-white
                                      placeholder:text-gray-400
                                      focus:border-yellow-500 dark:focus:border-blue-700
                                      focus:ring-4 focus:ring-yellow-100 dark:focus:ring-blue-950
                                      outline-none
                                    "
                                  />

                                  <button
                                    onClick={() =>
                                      handleJoinOrder(
                                        order.id
                                      )
                                    }
                                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl"
                                  >
                                    Confirmar
                                  </button>

                                  <button
                                    onClick={() =>
                                      setJoiningOrderId(
                                        null
                                      )
                                    }
                                    className="
                                      px-6 py-3
                                      bg-gray-200 dark:bg-gray-800
                                      hover:bg-gray-300 dark:hover:bg-gray-700
                                      text-gray-700 dark:text-gray-200
                                      font-bold rounded-xl
                                    "
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              ) : (
                                <motion.button
                                  whileHover={{
                                    scale: 1.02,
                                  }}
                                  whileTap={{
                                    scale: 0.98,
                                  }}
                                  onClick={() =>
                                    setJoiningOrderId(
                                      order.id
                                    )
                                  }
                                  className="
                                    w-full
                                    bg-gradient-to-r from-yellow-400 to-yellow-500
                                    dark:from-blue-800 dark:to-blue-950
                                    hover:from-yellow-500 hover:to-yellow-600
                                    dark:hover:from-blue-700 dark:hover:to-blue-900
                                    text-white font-bold py-3 rounded-xl shadow-lg
                                  "
                                >
                                  Participar do Pedido
                                </motion.button>
                              )
                            )}

                          {/* PARTICIPANDO */}
                          {userType ===
                            'mercado' &&
                            isParticipating && (
                              <button
                                onClick={() =>
                                  handleCancelParticipation(
                                    order.id
                                  )
                                }
                                className="
                                  w-full
                                  bg-green-100 dark:bg-green-950/40
                                  hover:bg-red-100 dark:hover:bg-red-950/40
                                  text-green-700 dark:text-green-300
                                  hover:text-red-700 dark:hover:text-red-300
                                  font-bold py-3 rounded-xl transition
                                "
                              >
                                ✓ Você está participando
                                (clique para sair)
                              </button>
                            )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <CreateOrderModalNew
        isOpen={isCreateOrderOpen}
        onClose={() =>
          setIsCreateOrderOpen(false)
        }
        onCreateOrder={handleCreateOrder}
      />
    </>
  );
}
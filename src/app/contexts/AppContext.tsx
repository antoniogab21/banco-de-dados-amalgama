import { createContext, useContext, useState, ReactNode } from 'react';

interface Participant {
  company: string;
  quantity: number;
}

interface Order {
  id: string;
  productName: string;
  supplier: string;
  quantity: number;
  groupId: string;
  groupName: string;
  creator: string;
  participants: Participant[];
  createdAt: string;
  status: 'active' | 'completed';
}

interface Message {
  id: string;
  groupId: string;
  user: string;
  company: string;
  message: string;
  time: string;
  isOwn: boolean;
}

interface AppContextType {
  orders: Order[];
  messages: Message[];
  createOrder: (order: Omit<Order, 'id' | 'createdAt' | 'participants' | 'status'>) => void;
  joinOrder: (orderId: string, quantity: number, company: string) => void;
  sendMessage: (groupId: string, message: string) => void;
  getOrdersByGroup: (groupId: string) => Order[];
  getMessagesByGroup: (groupId: string) => Message[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      productName: 'Arroz Tipo 1 - 5kg',
      supplier: 'Distribuidora São Paulo',
      quantity: 150,
      groupId: '1',
      groupName: 'Supermercados Zona Sul',
      creator: 'Mercado Central',
      participants: [
        { company: 'Mercado Central', quantity: 50 },
        { company: 'Empório São José', quantity: 100 },
      ],
      createdAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: 'active',
    },
    {
      id: '2',
      productName: 'Feijão Preto - 1kg',
      supplier: 'Atacado Premium',
      quantity: 200,
      groupId: '1',
      groupName: 'Supermercados Zona Sul',
      creator: 'Empório São José',
      participants: [
        { company: 'Empório São José', quantity: 80 },
        { company: 'Mercado Central', quantity: 70 },
        { company: 'Supermercado Bom Preço', quantity: 50 },
      ],
      createdAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: 'active',
    },
    {
      id: '3',
      productName: 'Farinha de Trigo - 1kg',
      supplier: 'Moinho São Paulo',
      quantity: 100,
      groupId: '2',
      groupName: 'Padarias Centro',
      creator: 'Padaria Pão Quente',
      participants: [
        { company: 'Padaria Pão Quente', quantity: 40 },
        { company: 'Padaria Central', quantity: 30 },
        { company: 'Padaria Doce Lar', quantity: 30 },
      ],
      createdAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: 'active',
    },
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      groupId: '1',
      user: 'João Silva',
      company: 'Mercado Central',
      message: 'Pessoal, alguém está precisando de arroz? Podemos fazer um pedido conjunto!',
      time: '10:30',
      isOwn: false,
    },
    {
      id: '2',
      groupId: '1',
      user: 'Maria Santos',
      company: 'Empório São José',
      message: 'Eu preciso! Quanto fica o saco de 5kg?',
      time: '10:32',
      isOwn: false,
    },
  ]);

  const createOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'participants' | 'status'>) => {
    const newOrder: Order = {
      ...orderData,
      id: Date.now().toString(),
      participants: [{ company: 'Minha Empresa', quantity: orderData.quantity }],
      createdAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: 'active',
    };
    setOrders([...orders, newOrder]);
  };

  const joinOrder = (orderId: string, quantity: number, company: string) => {
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        const existingParticipant = order.participants.find(p => p.company === company);
        if (existingParticipant) {
          return order;
        }
        return {
          ...order,
          quantity: order.quantity + quantity,
          participants: [...order.participants, { company, quantity }],
        };
      }
      return order;
    }));
  };

  const sendMessage = (groupId: string, messageText: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      groupId,
      user: 'Você',
      company: 'Minha Empresa',
      message: messageText,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
    };
    setMessages([...messages, newMessage]);
  };

  const getOrdersByGroup = (groupId: string) => {
    return orders.filter(order => order.groupId === groupId);
  };

  const getMessagesByGroup = (groupId: string) => {
    return messages.filter(message => message.groupId === groupId);
  };

  return (
    <AppContext.Provider value={{
      orders,
      messages,
      createOrder,
      joinOrder,
      sendMessage,
      getOrdersByGroup,
      getMessagesByGroup,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

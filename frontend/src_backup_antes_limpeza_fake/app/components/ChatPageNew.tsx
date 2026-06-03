import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { io, Socket } from 'socket.io-client';
import {
  Send,
  Paperclip,
  Users,
  MessageSquare,
  Wifi,
} from 'lucide-react';

interface ChatPageNewProps {
  userType: 'mercado' | 'fornecedor';
  groupId?: string;
}

interface ChatMessage {
  id: number;
  mensagem: string;
  enviada_em: string;
  empresa_id?: number | null;
  fornecedor_id?: number | null;
  autor_nome?: string;
  autor_tipo?: 'mercado' | 'fornecedor' | 'membro';
  isOwn?: boolean;
}

interface SocketMessagePayload {
  grupo_id: number | string;
  mensagem: ChatMessage;
}

export default function ChatPageNew({
  userType,
  groupId = '1',
}: ChatPageNewProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const currentGroup = {
    id: groupId,
    name: `Grupo ${groupId}`,
  };

  async function loadMessages() {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        `/api/chat/${groupId}/mensagens`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            data.details ||
            'Erro ao carregar mensagens'
        );
        return;
      }

      setMessages(data);
    } catch (err) {
      setError('Não foi possível carregar as mensagens.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMessages();
  }, [groupId]);

  useEffect(() => {
    const socket = io('/', {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);

      socket.emit('entrar_grupo', {
        grupo_id: groupId,
      });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('nova_mensagem', (payload: SocketMessagePayload) => {
      if (String(payload.grupo_id) !== String(groupId)) {
        return;
      }

      setMessages((prev) => {
        const alreadyExists = prev.some(
          (msg) => msg.id === payload.mensagem.id
        );

        if (alreadyExists) {
          return prev;
        }

        return [...prev, payload.mensagem];
      });
    });

    return () => {
      socket.emit('sair_grupo', {
        grupo_id: groupId,
      });

      socket.off('connect');
      socket.off('disconnect');
      socket.off('nova_mensagem');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [groupId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages]);

  function formatTime(value: string) {
    if (!value) return '';

    try {
      return new Date(value).toLocaleTimeString(
        'pt-BR',
        {
          hour: '2-digit',
          minute: '2-digit',
        }
      );
    } catch {
      return value;
    }
  }

  async function handleSendMessage() {
    if (!message.trim()) return;

    const textToSend = message.trim();

    try {
      setSending(true);

      const response = await fetch(
        `/api/chat/${groupId}/mensagens`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            mensagem: textToSend,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            data.details ||
            'Erro ao enviar mensagem'
        );
        return;
      }

      setMessages((prev) => {
        const alreadyExists = prev.some(
          (msg) => msg.id === data.mensagem.id
        );

        if (alreadyExists) {
          return prev;
        }

        return [...prev, data.mensagem];
      });

      setMessage('');
    } catch (err) {
      alert('Não foi possível conectar ao backend.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      {/* HEADER */}
      <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 p-6 transition-colors duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {currentGroup.name}
            </h1>

            <p className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Users className="w-4 h-4" />
              Chat coletivo em tempo real
            </p>
          </div>

          <div
            className={`hidden md:flex items-center gap-2 text-sm ${
              isConnected
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <Wifi className="w-4 h-4" />
            {isConnected ? 'Tempo real ativo' : 'Conectando...'}
          </div>
        </div>
      </div>

      {/* MENSAGENS */}
      <div className="flex-1 overflow-auto p-6 space-y-4 bg-gray-50 dark:bg-black transition-colors duration-300">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 p-4 text-sm font-semibold text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {loading && (
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center text-gray-600 dark:text-gray-400">
            Carregando mensagens...
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />

            <p className="font-bold text-gray-900 dark:text-white">
              Nenhuma mensagem ainda
            </p>

            <p className="text-gray-500 dark:text-gray-400">
              Envie a primeira mensagem deste grupo.
            </p>
          </div>
        )}

        {!loading &&
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.isOwn
                  ? 'justify-end'
                  : 'justify-start'
              }`}
            >
              <div className="max-w-lg">
                {!msg.isOwn && (
                  <div className="mb-1">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {msg.autor_nome || 'Usuário'}
                    </span>

                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 capitalize">
                      {msg.autor_tipo || 'membro'}
                    </span>
                  </div>
                )}

                <div
                  className={`rounded-2xl px-4 py-3 shadow-sm border ${
                    msg.isOwn
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 dark:from-blue-800 dark:to-blue-950 text-white rounded-tr-sm border-transparent'
                      : 'bg-white dark:bg-gray-950 text-gray-900 dark:text-white rounded-tl-sm border-gray-200 dark:border-gray-800'
                  }`}
                >
                  <p>{msg.mensagem}</p>
                </div>

                <span
                  className={`text-xs text-gray-400 mt-1 block ${
                    msg.isOwn
                      ? 'text-right'
                      : 'text-left'
                  }`}
                >
                  {formatTime(msg.enviada_em)}
                </span>
              </div>
            </div>
          ))}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 p-4 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl transition"
          >
            <Paperclip className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>

          <input
            type="text"
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !sending) {
                handleSendMessage();
              }
            }}
            placeholder="Digite sua mensagem..."
            className="
              flex-1
              px-4
              py-3
              rounded-xl
              border-2
              border-gray-200 dark:border-gray-800
              bg-white dark:bg-gray-950
              text-gray-900 dark:text-white
              placeholder:text-gray-400 dark:placeholder:text-gray-500
              focus:border-yellow-500 dark:focus:border-blue-700
              focus:ring-4 focus:ring-yellow-100 dark:focus:ring-blue-950
              outline-none
              transition
            "
          />

          <motion.button
            whileHover={{
              scale: sending ? 1 : 1.05,
            }}
            whileTap={{
              scale: sending ? 1 : 0.95,
            }}
            onClick={handleSendMessage}
            disabled={sending}
            type="button"
            className="
              p-3
              bg-gradient-to-r from-yellow-400 to-yellow-500
              dark:from-blue-800 dark:to-blue-950
              hover:from-yellow-500 hover:to-yellow-600
              dark:hover:from-blue-700 dark:hover:to-blue-900
              text-white rounded-xl shadow-lg
              disabled:opacity-60 disabled:cursor-not-allowed
              transition
            "
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
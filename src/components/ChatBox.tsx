import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { formatRelative } from 'date-fns';

interface Message {
  id: string;
  order_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  users: {
    full_name: string;
  } | null;
}

interface ChatBoxProps {
  orderId: string;
}

export function ChatBox({ orderId }: ChatBoxProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = useCallback(async () => {
    if (!orderId) return;
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`*, users!chat_messages_sender_id_fkey(full_name)`)
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      fetchMessages();

      const channel = supabase
        .channel(`chat-${orderId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `order_id=eq.${orderId}`,
          },
          (payload) => {
            console.log('Realtime change received!', payload);
            fetchMessages();
          }
        )
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            console.log(`Successfully subscribed to chat for order ${orderId}`);
          }
           if (status === 'CHANNEL_ERROR') {
            console.error(`Subscription error for order ${orderId}:`, err);
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [orderId, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      const { error } = await supabase.from('chat_messages').insert({
        order_id: orderId,
        sender_id: user.id,
        content: newMessage.trim(),
      });
      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="border rounded-lg p-4 space-y-4 bg-background/50 backdrop-blur-sm">
        <h4 className="font-semibold text-center text-sm text-muted-foreground">Order Chat</h4>
      <div className="h-64 overflow-y-auto space-y-4 p-2 pr-4 border-b">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender_id === user.id ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`rounded-lg px-3 py-2 max-w-xs lg:max-w-md shadow-sm ${
                msg.sender_id === user.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
            </div>
            <div className="text-xs text-muted-foreground mt-1 px-1">
                <span>{msg.users?.full_name?.split(' ')[0] || 'User'}</span>
                <span className="mx-1">•</span>
                <span>{formatRelative(new Date(msg.created_at), new Date())}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          autoComplete="off"
        />
        <Button type="submit" size="icon" disabled={!newMessage.trim()}>
          <Send className="h-4 w-4" />
          <span className="sr-only">Send message</span>
        </Button>
      </form>
    </div>
  );
}

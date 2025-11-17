'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';
import { apiClient } from '@/lib/api-client';

export interface ChatMessage {
  id: string;
  userId: string;
  walletAddress: string;
  username: string | null;
  message: string;
  createdAt: string;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const { isAuthenticated, user } = useAuth();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !apiClient.getStoredUser()) {
      // Disconnect if not authenticated
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
      setMessages([]);
      return;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const WS_URL = API_URL.replace('/api', '');
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    if (!token) {
      return;
    }

    // Create socket connection
    const socket = io(`${WS_URL}/chat`, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    socket.on('chat:history', (history: ChatMessage[]) => {
      setMessages(history);
    });

    socket.on('chat:newMessage', (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('chat:userJoined', (data: { walletAddress: string; timestamp: string }) => {
      console.log('User joined:', data.walletAddress);
    });

    socket.on('chat:userLeft', (data: { walletAddress: string; timestamp: string }) => {
      console.log('User left:', data.walletAddress);
    });

    socket.on('chat:userTyping', (data: { walletAddress: string }) => {
      setIsTyping((prev) => {
        if (!prev.includes(data.walletAddress)) {
          return [...prev, data.walletAddress];
        }
        return prev;
      });

      // Remove typing indicator after 3 seconds
      setTimeout(() => {
        setIsTyping((prev) => prev.filter((addr) => addr !== data.walletAddress));
      }, 3000);
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated]);

  const sendMessage = useCallback((message: string) => {
    if (!socketRef.current || !isConnected) {
      return;
    }

    socketRef.current.emit('chat:sendMessage', { message }, (response: any) => {
      if (response?.error) {
        console.error('Failed to send message:', response.error);
      }
    });
  }, [isConnected]);

  const sendTypingIndicator = useCallback(() => {
    if (!socketRef.current || !isConnected) {
      return;
    }

    // Throttle typing indicator
    if (typingTimeoutRef.current) {
      return;
    }

    socketRef.current.emit('chat:typing');

    typingTimeoutRef.current = setTimeout(() => {
      typingTimeoutRef.current = null;
    }, 1000);
  }, [isConnected]);

  return {
    messages,
    isConnected,
    isTyping,
    sendMessage,
    sendTypingIndicator,
  };
}

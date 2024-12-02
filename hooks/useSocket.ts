import { useEffect, useRef, useState } from 'react';

import io, { Socket } from 'socket.io-client';

import { useSessionToken } from '@/common/sessionToken';

export const useSocket = (url: string, options: any) => {
  const [sessionToken] = useSessionToken();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!sessionToken) {
      return;
    }

    const socket = io(url, {
      ...options,
      auth: {
        token: sessionToken,
      },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [url, sessionToken, options]);

  return isConnected ? socketRef.current : null;
};

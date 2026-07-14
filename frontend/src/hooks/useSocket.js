import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

let socket;

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export const useSocket = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!socket) {
      socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    }
    socketRef.current = socket;
    return () => {};
  }, []);

  return socketRef.current;
};

export const getSocket = () => {
  if (!socket) socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
  return socket;
};

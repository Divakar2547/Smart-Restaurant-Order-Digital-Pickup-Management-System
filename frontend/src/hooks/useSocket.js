import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

let socket;

export const useSocket = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!socket) {
      socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
    }
    socketRef.current = socket;
    return () => {};
  }, []);

  return socketRef.current;
};

export const getSocket = () => {
  if (!socket) socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
  return socket;
};

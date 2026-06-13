import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const socket = io(API_URL, {
  autoConnect: true,
});

socket.on('connect', () => {
  console.log('Connected to WebSocket');
  socket.emit('join-team', 'global');
});

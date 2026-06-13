import { io } from 'socket.io-client';

export const socket = io('http://localhost:3000', {
  autoConnect: true,
});

socket.on('connect', () => {
  console.log('Connected to WebSocket');
  socket.emit('join-team', 'global');
});

import { API_BASE } from './api.js';
import { handleNewMessage, handleSystemMessage } from './messages.js';

export let socket = null;

export function initSocket() {
    socket = io(API_BASE);
    socket.on('newMessage', handleNewMessage);
    socket.on('systemMessage', handleSystemMessage);
}
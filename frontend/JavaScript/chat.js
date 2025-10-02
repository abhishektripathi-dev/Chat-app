// frontend/js/
//     chat.js           // Main entry, imports and initializes everything
//     api.js            // All API/AJAX calls (groups, messages, members, auth)
//     socket.js         // Socket.IO connection and event handlers
//     ui.js             // DOM manipulation, rendering, modal handling
//     members.js        // Member management (load, add, remove, change role)
//     messages.js       // Message loading, sending, rendering, media helpers
//     groups.js         // Group loading, creation, switching
//     auth.js           // Auth/logout helpers

import { initSocket } from './socket.js';
import { initUI } from './ui.js';
import { checkAuth } from './auth.js';

checkAuth();
initSocket();
initUI();
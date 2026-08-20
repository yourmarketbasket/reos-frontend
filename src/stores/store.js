import { defineStore } from 'pinia';
import authActions from './modules/auth';
import propertiesActions from './modules/properties';
import ticketsActions from './modules/tickets';
import financialsActions from './modules/financials';
import systemActions from './modules/system';

export const useAppStore = defineStore('app', {
  state: () => ({
    user: null,
    token: '',
    properties: [],
    units: {},
    leases: [],
    ledger: [],
    maintenance: [],
    disputes: [],
    invitations: [],
    systemUsers: [],
    smsLogs: [],
    dashboardStats: null,
    listings: [],
    bookings: [],
    team: [],
    leads: [],
    commissions: [],
    tiers: [],
    regions: [],
    commissionRules: [],
    jurisdictions: [],
    commissionSettings: null,
    notifications: [],
    applications: [],
    inspections: [],
    deductions: [],
    viewings: [],
    redis_status: 'disconnected',
    active_ws_connections: 0,
    socket: null,
    error: null,
    success: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role || ''
  },

  actions: {
    // Core Helper to send HTTP requests with Authorization Header
    async apiRequest(url, method = 'GET', body = null, idempotencyKey = null) {
      this.error = null;
      this.success = null;
      
      // Block non-public requests if we are logged out (no token) to prevent 401 errors during routing/transitions
      const publicRoutes = ['/api/auth/', '/api/invitations/detail', '/api/listings/list', '/api/regions'];
      const isPublic = publicRoutes.some(p => url.startsWith(p));
      if (!isPublic && !this.token) {
        return null;
      }

      const isDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.port === '5173');
      const apiBase = isDev ? '' : (typeof __API_BASE_URL__ !== 'undefined' ? __API_BASE_URL__ : '');
      const fullUrl = url.startsWith('http') ? url : `${apiBase}${url}`;

      const headers = {
        'Content-Type': 'application/json'
      };
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }
      if (idempotencyKey) {
        headers['X-Idempotency-Key'] = idempotencyKey;
      }

      const options = { method, headers };
      if (body) {
        options.body = JSON.stringify(body);
      }

      try {
        const response = await fetch(fullUrl, options);
        if (!response.ok) {
          const errMsg = await response.text();
          throw new Error(errMsg || `Request failed with status ${response.status}`);
        }
        if (response.status === 204) return null;
        return await response.json();
      } catch (err) {
        this.error = err.message;
        throw err;
      }
    },

    // WebSocket Initialization
    initWebSocket() {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        return;
      }
      if (!this.token) {
        return;
      }

      // Use configured API base URL for WebSocket connection
      const apiBase = typeof __API_BASE_URL__ !== 'undefined' && __API_BASE_URL__ ? __API_BASE_URL__ : '';
      const wsBase = apiBase
        ? apiBase.replace('https://', 'wss://').replace('http://', 'ws://')
        : `ws://${window.location.hostname}:8080`;
      const wsUrl = `${wsBase}/api/ws?token=${this.token}`;
      console.log(`Connecting to WebSocket at: ${wsUrl}...`);

      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('WebSocket connection established!');
        this.redis_status = 'connected';
        this.socket = socket;
        this.error = null;
      };

      socket.onmessage = (event) => {
        try {
          const wsMsg = JSON.parse(event.data);
          if (wsMsg.type === 'system_health') {
            this.redis_status = wsMsg.payload?.status || 'connected';
          } else if (wsMsg.type === 'notification') {
            this.notifications.unshift({
              id: Date.now().toString(),
              title: wsMsg.payload?.title || 'Notification',
              body: wsMsg.payload?.body || '',
              timestamp: new Date()
            });
            this.success = `${wsMsg.payload?.title}: ${wsMsg.payload?.body}`;
          } else if (wsMsg.type === 'dispute_chat') {
            const payloadMsg = wsMsg.payload;
            if (payloadMsg && payloadMsg.dispute_id) {
              const disp = this.disputes.find(d => d.id === payloadMsg.dispute_id);
              if (disp) {
                if (!disp.messages) disp.messages = [];
                const exists = disp.messages.some(m => m.sent_at === payloadMsg.sent_at && m.sender_id === payloadMsg.sender_id);
                if (!exists) {
                  disp.messages.push(payloadMsg);
                }
              }
            }
          } else if (wsMsg.type === 'property_sync') {
            console.log('Received property sync request, reloading lists...');
            this.fetchProperties();
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message payload:', err);
        }
      };

      socket.onclose = () => {
        console.warn('WebSocket connection closed. Reconnecting in 3s...');
        this.redis_status = 'disconnected';
        this.socket = null;
        setTimeout(() => this.initWebSocket(), 3000);
      };

      socket.onerror = (err) => {
        console.error('WebSocket encountered an error:', err);
        socket.close();
      };
    },

    // Core Image Upload Action
    async uploadImage(file) {
      try {
        this.error = null;
        this.success = null;
        const formData = new FormData();
        formData.append('file', file);

        const isDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.port === '5173');
        const apiBase = isDev ? '' : (typeof __API_BASE_URL__ !== 'undefined' ? __API_BASE_URL__ : '');
        const fullUrl = `${apiBase}/api/uploads/image`;

        const response = await fetch(fullUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`
          },
          body: formData
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || 'Upload to Nisoko Object Storage failed');
        }

        const data = await response.json();
        if (data && data.url) {
          return data.url;
        } else {
          throw new Error('Nisoko upload returned invalid download URL');
        }
      } catch (err) {
        this.error = err.message || 'Image upload failed';
        console.error('Upload image to Nisoko failed:', err);
        throw err;
      }
    },

    // Import spread action modules
    ...authActions,
    ...propertiesActions,
    ...ticketsActions,
    ...financialsActions,
    ...systemActions
  }
});

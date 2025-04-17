// Get the current hostname and protocol
const protocol = window.location.protocol;
const hostname = window.location.hostname;

// Default API URL
const DEFAULT_API_URL = `${protocol}//${hostname}:8000`;

// Configuration object
const config = {
    // API Configuration
    api: {
        baseUrl: process.env.REACT_APP_API_URL || DEFAULT_API_URL,
        // List of available API endpoints
        endpoints: {
            auth: '/token',
            users: '/users',
            firewallRules: '/firewall-rules',
            viewPreferences: '/view-preferences',
            paloAlto: '/paloalto/info',
            fortigate: '/fortigate/info',
            unifi: '/unifi/info',
            websocket: '/ws'  // WebSocket endpoint
        },
        // Timeout for API requests (in milliseconds)
        timeout: 30000,
        // Retry configuration
        retry: {
            maxAttempts: 3,
            delay: 1000
        }
    },
    
    // WebSocket Configuration
    websocket: {
        url: process.env.REACT_APP_WS_URL || `ws://${hostname}:8000/ws`,
        reconnectInterval: 5000,
        maxReconnectAttempts: 5
    },
    
    // Dashboard Configuration
    dashboard: {
        defaultRefreshInterval: 5000,  // 5 seconds
        maxWidgets: 20,
        defaultLayout: {
            columns: 12,
            rowHeight: 30,
            margin: [10, 10],
            containerPadding: [10, 10]
        }
    },
    
    // Security Configuration
    security: {
        tokenKey: 'auth_token',
        tokenExpiryKey: 'token_expiry',
        refreshTokenKey: 'refresh_token'
    }
};

export default config; 
import { create } from 'zustand';


interface WebsocketState {
  loading: boolean;
  serverUrl: string;
  role: string;
  setRole: (role: string, id: string) => void;
  isConnected: boolean;
  messageListeners: ((data: string) => void)[];
  connectWebSocket: () => void;
  closeConnection: () => void;
  sendMessage: (data: string) => void;
  addMessageListener: (cb: (data: string) => void) => void;
  removeMessageListener: (cb: (data: string) => void) => void;
}

export const useWebsocket = create<WebsocketState>((set, get) => {
  let ws: WebSocket | null = null;
  let reconnectOnClose = true;
  let isConnected = false;

  const start = () => {
    const { serverUrl } = get();
    ws = new WebSocket(serverUrl);

    const realClose = ws.close.bind(ws);
    ws.close = () => {
      reconnectOnClose = false;
      realClose();
    };

    ws.onopen = () => {
      isConnected = true;
      set({ isConnected: true, loading: false });
    };

    ws.onclose = () => {
      isConnected = false;
      set({ isConnected: false, loading: true });
      
      if (!reconnectOnClose) {
        console.log('WebSocket closed, attempting reconnect...');
        setTimeout(start, 1000);
      } else {
        console.log('WebSocket closed manually');
      }
    };

    ws.onmessage = (event) => {
      get().messageListeners.forEach(fn => fn(event.data));
    };

    ws.onerror = (e) => {
      console.error('WebSocket error:', e);
    };
  };

  return {
    loading: false,
    role: 'user',
    serverUrl: '',
    setRole: (role: string, id: string) => {
      const url = `ws://localhost:8080/ws/${role}/user-${id}`;
      set({ role, serverUrl: url });
    },
    isConnected: false,
    messageListeners: [],
    connectWebSocket: start,
    closeConnection: () => {
      reconnectOnClose = false;
      ws?.close();
    },
    sendMessage: (data) => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    },
    addMessageListener: (cb) => {
      set((state) => ({
        messageListeners: [...state.messageListeners, cb],
      }));
    },
    removeMessageListener: (cb) => {
      set((state) => ({
        messageListeners: state.messageListeners.filter((fn) => fn !== cb),
      }));
    },
  };
});

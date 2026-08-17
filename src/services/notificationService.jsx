import { HubConnectionBuilder, LogLevel, HttpTransportType } from '@microsoft/signalr';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:64677';

let connection = null;

export const startConnection = async () => {
  if (connection && connection.state === 'Connected') {
    return connection;
  }

  const token = localStorage.getItem('token');
  if (!token) return null;

  if (connection) {
    try {
      await connection.stop();
    } catch (_) {}
    connection = null;
  }

  connection = new HubConnectionBuilder()
    .withUrl(`${BASE_URL}/notificationHub`, {
      accessTokenFactory: () => localStorage.getItem('token'),
      transport: HttpTransportType.WebSockets | HttpTransportType.LongPolling,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(LogLevel.Warning)
    .build();

  try {
    await connection.start();
    return connection;
  } catch (err) {
    console.error('SignalR connection failed:', err);
    return null;
  }
};

export const stopConnection = async () => {
  if (connection) {
    try {
      await connection.stop();
    } catch (err) {
      console.error('SignalR stop failed:', err);
    }
    connection = null;
  }
};

export const onReceiveNotification = (callback) => {
  if (!connection) return;
  connection.off('ReceiveNotification');
  connection.on('ReceiveNotification', callback);
};

export const getConnectionState = () => {
  return connection?.state || 'Disconnected';
};

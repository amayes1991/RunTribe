import * as signalR from '@microsoft/signalr';

class SignalRService {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.messageHandlers = new Map();
    this.typingHandlers = new Map();
    this.deleteHandlers = new Map();
  }

  async connect() {
    if (this.connection && this.isConnected) {
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${apiUrl}/chathub`)
        .withAutomaticReconnect()
        .build();

      // Set up message handlers
      this.connection.on('ReceiveMessage', (message) => {
        this.messageHandlers.forEach(handler => handler(message));
      });

      this.connection.on('UserTyping', (userEmail) => {
        this.typingHandlers.forEach(handler => handler(userEmail, true));
      });

      this.connection.on('UserStoppedTyping', (userEmail) => {
        this.typingHandlers.forEach(handler => handler(userEmail, false));
      });

      this.connection.on('MessageDeleted', (messageId) => {
        this.deleteHandlers.forEach(handler => handler(messageId));
      });

      await this.connection.start();
      this.isConnected = true;
      console.log('SignalR Connected');
    } catch (error) {
      console.error('SignalR Connection Error:', error);
      this.isConnected = false;
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      this.isConnected = false;
      console.log('SignalR Disconnected');
    }
  }

  async joinGroup(groupId) {
    if (this.connection && this.isConnected) {
      try {
        await this.connection.invoke('JoinGroup', groupId);
        console.log(`Joined group: ${groupId}`);
      } catch (error) {
        console.error('Error joining group:', error);
      }
    }
  }

  async leaveGroup(groupId) {
    if (this.connection && this.isConnected) {
      try {
        await this.connection.invoke('LeaveGroup', groupId);
        console.log(`Left group: ${groupId}`);
      } catch (error) {
        console.error('Error leaving group:', error);
      }
    }
  }

  async sendMessage(groupId, message) {
    if (this.connection && this.isConnected) {
      try {
        await this.connection.invoke('SendMessage', groupId, message);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  }

  async userTyping(groupId, userEmail) {
    if (this.connection && this.isConnected) {
      try {
        await this.connection.invoke('UserTyping', groupId, userEmail);
      } catch (error) {
        console.error('Error sending typing indicator:', error);
      }
    }
  }

  async userStoppedTyping(groupId, userEmail) {
    if (this.connection && this.isConnected) {
      try {
        await this.connection.invoke('UserStoppedTyping', groupId, userEmail);
      } catch (error) {
        console.error('Error sending stop typing indicator:', error);
      }
    }
  }

  // Register handlers for different events
  onMessage(handler) {
    this.messageHandlers.set(handler, handler);
  }

  onTyping(handler) {
    this.typingHandlers.set(handler, handler);
  }

  onMessageDeleted(handler) {
    this.deleteHandlers.set(handler, handler);
  }

  // Remove handlers
  offMessage(handler) {
    this.messageHandlers.delete(handler);
  }

  offTyping(handler) {
    this.typingHandlers.delete(handler);
  }

  offMessageDeleted(handler) {
    this.deleteHandlers.delete(handler);
  }

  getConnectionState() {
    return this.connection?.state || 'Disconnected';
  }
}

// Create a singleton instance
const signalRService = new SignalRService();

export default signalRService;


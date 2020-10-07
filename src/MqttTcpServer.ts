import {createServer, Server} from 'net';
import {MqttTcpConnection, MqttTcpConnectionBehavior} from './MqttTcpConnection';

export interface MqttTcpServerBehavior {
  onStart: () => void;
  onConnection: (connection: MqttTcpConnection) => MqttTcpConnectionBehavior;
  onError: (error: Error) => void;
  onClose: () => void;
}

export class MqttTcpServer {
  protected server: Server;
  protected onConnection: (connection: MqttTcpConnection) => void;
  protected onError: (error: Error) => void;
  protected onClose: () => void;

  constructor(private readonly params: MqttTcpServerBehavior) {
    this.server = createServer();
    this.onConnection = params.onConnection;
    this.onError = params.onError;
    this.onClose = params.onClose;
  }

  public async start(port = 1883): Promise<void> {
    return new Promise((resolve) => {
      const {server, params} = this;

      server.addListener('connection', (socket) => {
        const connection = new MqttTcpConnection(socket);
        connection.behavior = this.params.onConnection(connection);
        this.onConnection(connection);
      });

      server.addListener('error', (error) => {
        this.onError(error);
      });
      
      server.addListener('close', () => {
        this.onClose();
      });
      
      server.listen(port, () => {
        this.params.onStart();
        resolve();
      });
    });
  }
}

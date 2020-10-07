import {MqttTcpServer} from './MqttTcpServer';
import {PacketAuth, PacketConnack, PacketConnect, PacketDisconnect, PacketPuback, PacketPubcomp, PacketPublish, PacketPubrec, PacketPubrel, PacketSuback, PacketSubscribe, PacketUnsubscribe} from './packets';
import {EventEmitter} from 'events';

const ee = new EventEmitter();

const server = new MqttTcpServer({
  onClose: () => {},
  onConnection: (connection) => new (class {
    private readonly subs = new Map<string, (payload: any) => void>();

    // onTcpConnect: (conn) => {
    //   console.log('connection established');
    // },
    onAuth(packet: PacketAuth) {}
    onConnect(packet: PacketConnect) {
      const connack = PacketConnack.create(0, {});
      connection.send(connack);
    }
    onDisconnect(packet: PacketDisconnect) {}
    onPuback(packet: PacketPuback) {}
    onPubcomp(packet: PacketPubcomp) {}
    onPublish(packet: PacketPublish) {
      // ee.emit(packet.t, packet.d);
    }
    onPubrec(packet: PacketPubrec) {}
    onPubrel(packet: PacketPubrel) {}
    onSubscribe(packet: PacketSubscribe) {
      const suback = PacketSuback.create(packet.i, {}, [0]);
      for (const sub of packet.s) {
        const listener = (payload: Buffer) => {
          const publish = PacketPublish.create(sub.t, 0, {}, payload);
          connection.send(publish);
        };
        ee.on(sub.t, listener);
        this.subs.set(sub.t, listener);
      }
      connection.send(suback);
    }
    onUnsubscribe(packet: PacketUnsubscribe) {}
  }),
  onError: () => {},
  onStart: () => {
    console.log('server started');
  },
});

server.start();

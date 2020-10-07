import {Socket} from 'net';
import {PACKET_TYPE} from './enums';
import {MqttDecoder} from './MqttDecoder';
import {
  PacketAuth,
  PacketConnect,
  PacketDisconnect,
  PacketPuback,
  PacketPubcomp,
  PacketPublish,
  PacketPubrec,
  PacketPubrel,
  PacketSubscribe,
  PacketUnsubscribe,
  PINGRESP,
} from './packets';
import {SomePacket} from './types';

export interface MqttTcpConnectionBehavior {
  onAuth(packet: PacketAuth): void;
  onConnect(packet: PacketConnect): void;
  onDisconnect(packet: PacketDisconnect): void;
  onPuback(packet: PacketPuback): void;
  onPubcomp(packet: PacketPubcomp): void;
  onPublish(packet: PacketPublish): void;
  onPubrec(packet: PacketPubrec): void;
  onPubrel(packet: PacketPubrel): void;
  onSubscribe(packet: PacketSubscribe): void;
  onUnsubscribe(packet: PacketUnsubscribe): void;
}

export class MqttTcpConnection {
  protected readonly mqtt: MqttDecoder;
  public behavior!: MqttTcpConnectionBehavior

  constructor(protected readonly socket: Socket) {
    const mqtt = this.mqtt = new MqttDecoder();
    socket.addListener('data', (data) => {
      mqtt.push(data);
      let packet: SomePacket | undefined;
      // tslint:disable-next-line no-conditional-assignment
      while (packet = mqtt.parse()) this.onPacket(packet);
    });
  }

  protected onPacket(packet: SomePacket) {
    const behavior = this.behavior;
    const type = packet.type();
    switch (type) {
      case PACKET_TYPE.AUTH:
        behavior.onAuth(packet as PacketAuth);
        break;
      case PACKET_TYPE.CONNECT:
        behavior.onConnect(packet as PacketConnect);
        break;
      case PACKET_TYPE.DISCONNECT:
        behavior.onDisconnect(packet as PacketDisconnect);
        break;
      case PACKET_TYPE.PINGREQ:
        this.socket.write(PINGRESP);
        break;
      case PACKET_TYPE.PUBACK:
        behavior.onPuback(packet as PacketPuback);
        break;
      case PACKET_TYPE.PUBCOMP:
        behavior.onPubcomp(packet as PacketPubcomp);
        break;
      case PACKET_TYPE.PUBLISH:
        behavior.onPublish(packet as PacketPublish);
        break;
      case PACKET_TYPE.PUBREC:
        behavior.onPubrec(packet as PacketPubrec);
        break;
      case PACKET_TYPE.PUBREL:
        behavior.onPubrel(packet as PacketPubrel);
        break;
      case PACKET_TYPE.SUBSCRIBE:
        behavior.onSubscribe(packet as PacketSubscribe);
        break;
      case PACKET_TYPE.UNSUBSCRIBE:
        behavior.onUnsubscribe(packet as PacketUnsubscribe);
        break;
      default:
        this.socket.end();
        break;
    }
  }

  public send(packet: SomePacket) {
    const buf = packet.toBuffer(this.mqtt.version);
    this.socket.write(buf);
  }

  public async close(buf?: Buffer): Promise<void> {
    return new Promise((resolve) => {
      if (buf) {
        this.socket.end(buf, () => {
          resolve();
        });
      } else {
        this.socket.end(() => {
          resolve();
        });
      }
    });
  }
}

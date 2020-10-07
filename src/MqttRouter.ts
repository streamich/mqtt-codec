import type {
  PacketAuth,
  PacketConnack,
  PacketConnect,
  PacketDisconnect,
  PacketPuback,
  PacketPubcomp,
  PacketPublish,
  PacketPubrec,
  PacketPubrel,
  PacketSuback,
  PacketSubscribe,
  PacketUnsuback,
  PacketUnsubscribe
} from './packets';

export interface MqttRouter {
  onAuth(packet: PacketAuth): void;
  onConnack(packet: PacketConnack): void;
  onConnect(packet: PacketConnect): void;
  onDisconnect(packet: PacketDisconnect): void;
  onPingreq(): void;
  onPingresp(): void;
  onPuback(packet: PacketPuback): void;
  onPubcomp(packet: PacketPubcomp): void;
  onPublish(packet: PacketPublish): void;
  onPubrec(packet: PacketPubrec): void;
  onPubrel(packet: PacketPubrel): void;
  onSuback(packet: PacketSuback): void;
  onSubscribe(packet: PacketSubscribe): void;
  onUnsuback(packet: PacketUnsuback): void;
  onUnsubscribe(packet: PacketUnsubscribe): void;
}

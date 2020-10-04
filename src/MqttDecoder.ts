import BufferList from 'bl';
import {DECODER_STATE, ERROR, PACKET_TYPE} from './enums';
import {PacketConnack, parseConnack} from './packets/connack';
import {PacketConnect, parseConnect} from './packets/connect';
import {PacketPublish, parsePublish} from './packets/publish';
import {PacketPuback, parsePuback} from './packets/puback';
import {PacketPubrec, parsePubrec} from './packets/pubrec';
import {PacketPubrel, parsePubrel} from './packets/pubrel';
import {PacketPubcomp, parsePubcomp} from './packets/pubcomp';
import {PacketSubscribe, parseSubscribe} from './packets/subscribe';
import {PacketSuback, parseSuback} from './packets/suback';
import {PacketUnsubscribe, parseUnsubscribe} from './packets/unsubscribe';
import {PacketUnsuback, parseUnsuback} from './packets/unsuback';
import {PacketPingreq} from './packets/pingreq';
import {PacketPingresp} from './packets/pingresp';
import {PacketDisconnect, parseDisconnect} from './packets/disconnect';
import {PacketAuth, parseAuth} from './packets/auth';

export class MqttDecoder {
  /** Keeps track of which part message framing are we in. */
  public state: DECODER_STATE = DECODER_STATE.HEADER;

  /** Buffer which contains all unparsed buffered data. */
  public list = new BufferList();

  /** Current packet first byte. */
  public b: number = 0;

  /** Current packet length. */
  public l: number = 0;

  /**
   * MQTT protocol version. Defaults to 4 as that is most popular version now.
   * This version is automatically set to the version received in CONNECT packet.
   */
  public version: number = 4;

  /**
   * Use this method to push into decoder all new bytes that arrive over the
   * socket. Each time you push a chunk it can result in zero or more packets
   * returned by `.parse()` method.
   * 
   * @param buf Raw data bytes chunk as received from socket.
   */
  public push(buf: Buffer) {
    this.list.append(buf);
  }

  /**
   * Back-pressure of unparsed data.
   * 
   * @returns Returns number of bytes of data that has been buffered but not
   *          parsed yet.
   */
  public bufferSize() {
    return this.list.length;
  }

  /**
   * @returns Returns a single parsed packet. If there is not enough data in
   *          the buffer to parse a packet, returns `null`.
   */
  public parse():
  | null
  | PacketConnect
  | PacketConnack
  | PacketPublish
  | PacketPuback
  | PacketPubrec
  | PacketPubrel
  | PacketPubcomp
  | PacketSubscribe
  | PacketSuback
  | PacketUnsubscribe
  | PacketUnsuback
  | PacketPingreq
  | PacketPingresp
  | PacketDisconnect
  | PacketAuth {
    try {
      this.parseFixedHeader();
      const data = this.parseVariableData();
      if (!data) return null;
      const {b, l} = this;
      const type: PACKET_TYPE = (b >> 4) as PACKET_TYPE;
      switch (type) {
        case PACKET_TYPE.CONNECT: {
          const packet = parseConnect(b, l, data);
          this.version = packet.v;
          return packet;
        }
        case PACKET_TYPE.CONNACK: return parseConnack(b, l, data, this.version);
        case PACKET_TYPE.PUBLISH: return parsePublish(b, l, data, this.version);
        case PACKET_TYPE.PUBACK: return parsePuback(b, l, data, this.version);
        case PACKET_TYPE.PUBREC: return parsePubrec(b, l, data, this.version);
        case PACKET_TYPE.PUBREL: return parsePubrel(b, l, data, this.version);
        case PACKET_TYPE.PUBCOMP: return parsePubcomp(b, l, data, this.version);
        case PACKET_TYPE.SUBSCRIBE: return parseSubscribe(b, l, data, this.version);
        case PACKET_TYPE.SUBACK: return parseSuback(b, l, data, this.version);
        case PACKET_TYPE.UNSUBSCRIBE: return parseUnsubscribe(b, l, data, this.version);
        case PACKET_TYPE.UNSUBACK: return parseUnsuback(b, l, data, this.version);
        case PACKET_TYPE.PINGREQ: return new PacketPingreq(b, l);
        case PACKET_TYPE.PINGRESP: return new PacketPingresp(b, l);
        case PACKET_TYPE.DISCONNECT: return parseDisconnect(b, l, data, this.version);
        case PACKET_TYPE.AUTH: return parseAuth(b, l, data, this.version);
        default: throw ERROR.MALFORMED_PACKET;
      }
    } catch (error) {
      throw ERROR.MALFORMED_PACKET;
    }
  }

  /**
   * Parse a single packet fixed header from the buffer. And advance state to
   * payload parsing. This method is idempotent, you can call it many times. If
   * there is not enough data to parse the header, this method will do nothing.
   * Also, if the decoder currently is not in fixed header parsing state, it
   * will do nothing.
   */
  private parseFixedHeader(): void {
    if (this.state !== DECODER_STATE.HEADER) return;
    const list = this.list;
    const length = list.length;
    if (length < 2) return;
    this.b = list.readUInt8(0);
    const b1 = list.readUInt8(1);
    if (!(b1 & 0b10000000)) {
      list.consume(2);
      this.l = b1 & 0b01111111;
      this.state = DECODER_STATE.DATA;
      return;
    }
    if (length < 3) return;
    const b2 = list.readUInt8(2);
    if (!(b2 & 0b10000000)) {
      list.consume(3);
      this.l = ((b2 & 0b01111111) << 7) + (b1 & 0b01111111);
      this.state = DECODER_STATE.DATA;
      return;
    }
    if (length < 4) return;
    const b3 = list.readUInt8(3);
    if (!(b3 & 0b10000000)) {
      list.consume(4);
      this.l = ((b3 & 0b01111111) << 14) + ((b2 & 0b01111111) << 7) + (b1 & 0b01111111);
      this.state = DECODER_STATE.DATA;
      return;
    }
    if (length < 5) return;
    const b4 = list.readUInt8(4);
    list.consume(5);
    this.l = ((b4 & 0b01111111) << 21) + ((b3 & 0b01111111) << 14) + ((b2 & 0b01111111) << 7) + (b1 & 0b01111111);
    this.state = DECODER_STATE.DATA;
  }

  /**
   * Parse a single packet variable data and advance the parsing step.
   * This method is idempotent, you can call it many times. If
   * there is not enough data to parse the variable payload, this method will
   * do nothing. Also, if the decoder currently is not in the variable data
   * parsing state, it will do nothing.
   */
  private parseVariableData(): null | BufferList {
    if (this.state !== DECODER_STATE.DATA) return null;
    const {list, l: length} = this;
    if (list.length < length) return null;
    const slice = list.shallowSlice(0, length);
    list.consume(length);
    this.state = DECODER_STATE.HEADER;
    return slice;
  }
}

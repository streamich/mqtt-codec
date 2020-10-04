import {BufferList} from '../BufferList';
import {ERROR, PROPERTY} from '../enums';
import {Properties} from '../types';

export const parseVarInt = (data: BufferList, offset: number): [int: number, size: number] => {
  const b1 = data.readUInt8(offset);
  if (!(b1 & 0b10000000)) return [b1 & 0b01111111, 1];
  const b2 = data.readUInt8(offset + 1);
  if (!(b2 & 0b10000000)) return [((b2 & 0b01111111) << 7) + (b1 & 0b01111111), 2];
  const b3 = data.readUInt8(offset + 2);
  if (!(b3 & 0b10000000)) return [((b3 & 0b01111111) << 14) + ((b2 & 0b01111111) << 7) + (b1 & 0b01111111), 3];
  const b4 = data.readUInt8(offset + 3);
  return [((b4 & 0b01111111) << 21) + ((b3 & 0b01111111) << 14) + ((b2 & 0b01111111) << 7) + (b1 & 0b01111111), 4];
};

export const parseVarIntBuf = (buf: Buffer, offset: number): [int: number, size: number] => {
  const b1 = buf.readUInt8(offset);
  if (!(b1 & 0b10000000)) return [b1 & 0b01111111, 1];
  const b2 = buf.readUInt8(offset + 1);
  if (!(b2 & 0b10000000)) return [((b2 & 0b01111111) << 7) + (b1 & 0b01111111), 2];
  const b3 = buf.readUInt8(offset + 2);
  if (!(b3 & 0b10000000)) return [((b3 & 0b01111111) << 14) + ((b2 & 0b01111111) << 7) + (b1 & 0b01111111), 3];
  const b4 = buf.readUInt8(offset + 3);
  return [((b4 & 0b01111111) << 21) + ((b3 & 0b01111111) << 14) + ((b2 & 0b01111111) << 7) + (b1 & 0b01111111), 4];
};

export const parseBinary = (list: BufferList, offset: number): Buffer => {
  const stringOffset = offset + 2;
  const dataLength = list.readUInt16BE(offset);
  return list.slice(stringOffset, stringOffset + dataLength);
};

export const parseBinaryBuf = (buf: Buffer, offset: number): Buffer => {
  const stringOffset = offset + 2;
  const dataLength = buf.readUInt16BE(offset);
  return buf.slice(stringOffset, stringOffset + dataLength);
};

export const parseProps = (data: BufferList, offset: number): [props: Properties, size: number] => {
  const [int, size] = parseVarInt(data, offset);
  offset += size;
  const buf = data.slice(offset, offset + int);
  const props: Properties = {};
  offset = 0;
  while (offset < int) {
    const byte = buf.readUInt8(offset++);
    switch (byte) {
      case PROPERTY.PayloadFormatIndicator:
      case PROPERTY.RequestProblemInformation:
      case PROPERTY.RequestResponseInformation:
      case PROPERTY.MaximumQoS:
      case PROPERTY.RetainAvailable:
      case PROPERTY.WildcardSubscriptionAvailable:
      case PROPERTY.SubscriptionIdentifierAvailable:
      case PROPERTY.SharedSubscriptionAvailable: {
        props[byte] = buf.readUInt8(offset);
        offset += 1;
        break;
      }
      case PROPERTY.ServerKeepAlive:
      case PROPERTY.ReceiveMaximum:
      case PROPERTY.TopicAliasMaximum:
      case PROPERTY.TopicAlias: {
        props[byte] = buf.readUInt16BE(offset);
        offset += 2;
        break;
      }
      case PROPERTY.MessageExpiryInterval:
      case PROPERTY.WillDelayInterval:
      case PROPERTY.SessionExpiryInterval:
      case PROPERTY.MaximumPacketSize: {
        props[byte] = buf.readUInt32BE(offset);
        offset += 4;
        break;
      }
      case PROPERTY.SubscriptionIdentifier: {
        const [value, size] = parseVarIntBuf(buf, offset);
        props[byte] = value;
        offset += size;
        break;
      }
      case PROPERTY.CorrelationData:
      case PROPERTY.AuthenticationData: {
        const {byteLength} = (props[byte] = parseBinaryBuf(buf, offset));
        offset += 2 + byteLength;
        break;
      }
      case PROPERTY.ContentType:
      case PROPERTY.ResponseTopic:
      case PROPERTY.AssignedClientIdentifier:
      case PROPERTY.AuthenticationMethod:
      case PROPERTY.ResponseInformation:
      case PROPERTY.ServerReference:
      case PROPERTY.ReasonString: {
        const binary = parseBinaryBuf(buf, offset);
        props[byte] = binary.toString('utf8');
        offset += 2 + binary.byteLength;
        break;
      }
      case PROPERTY.UserProperty: {
        if (!props[PROPERTY.UserProperty]) props[PROPERTY.UserProperty] = [];
        const key = parseBinaryBuf(buf, offset);
        offset += 2 + key.byteLength;
        const value = parseBinaryBuf(buf, offset);
        offset += 2 + value.byteLength;
        props[PROPERTY.UserProperty]!.push([key.toString('utf8'), value.toString('utf8')]);
        break;
      }
      default: {
        throw ERROR.MALFORMED_PACKET;
      }
    }
  }
  return [props, int + size];
};
